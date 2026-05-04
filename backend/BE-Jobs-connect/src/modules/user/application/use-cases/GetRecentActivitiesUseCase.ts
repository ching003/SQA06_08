import type { PrismaClient } from '@prisma/client';
import type { ICompanyRepository } from '@modules/company/domain/repositories/ICompanyRepository.js';
import type { IJobRepository } from '@modules/job/domain/repositories/IJobRepository.js';
import type { IUserRepository } from '../../domain/repositories/IUserRepository.js';
import { UserRole } from '../../domain/enums/UserRole.js';
import { AuthorizationError } from '@shared/domain/errors/index.js';
import type {
    GetRecentActivitiesInputDTO,
    GetRecentActivitiesOutputDTO,
    ActivityDTO,
} from '../dtos/GetRecentActivitiesDTO.js';

interface Dependencies {
    companyRepository: ICompanyRepository;
    jobRepository: IJobRepository;
    userRepository: IUserRepository;
    prisma: PrismaClient;
}

export class GetRecentActivitiesUseCase {
    private readonly companyRepository: ICompanyRepository;
    private readonly jobRepository: IJobRepository;
    private readonly userRepository: IUserRepository;
    private readonly prisma: any;

    constructor({ companyRepository, jobRepository, userRepository, prisma }: Dependencies) {
        this.companyRepository = companyRepository;
        this.jobRepository = jobRepository;
        this.userRepository = userRepository;
        this.prisma = prisma;
    }

    async execute(input: GetRecentActivitiesInputDTO & { adminId: string }): Promise<GetRecentActivitiesOutputDTO> {
        // Verify admin permission
        const admin = await this.userRepository.findById(input.adminId);
        if (!admin || admin.role !== UserRole.ADMIN) {
            throw new AuthorizationError('Only admins can view recent activities');
        }

        const limit = input.limit || 10;
        const activities: ActivityDTO[] = [];

        // Fetch recent companies (registrations)
        const companiesResult = await this.companyRepository.findAll({
            page: 1,
            limit: 5,
            orderBy: { createdAt: 'desc' },
        });

        companiesResult.data.forEach((company: any) => {
            activities.push({
                id: `company-${company.id}`,
                type: 'company_registered',
                title: 'Công ty mới đăng ký',
                description: `${company.name} đã đăng ký tài khoản`,
                timestamp: company.createdAt,
            });
        });

        // Fetch recent jobs
        const jobsResult = await this.jobRepository.findAll({
            page: 1,
            limit: 5,
            orderBy: { createdAt: 'desc' },
        });

        jobsResult.data.forEach((job: any) => {
            activities.push({
                id: `job-${job.id}`,
                type: 'job_posted',
                title: 'Tin tuyển dụng mới',
                description: `${job.title} - ${job.company?.name || 'Unknown'}`,
                timestamp: job.createdAt,
            });
        });

        // Fetch recent applications (direct Prisma query)
        const applications = await this.prisma.application.findMany({
            take: 5,
            orderBy: { createdAt: 'desc' },
            include: {
                user: true,
                job: {
                    include: {
                        company: true,
                    },
                },
            },
        });

        applications.forEach((application: any) => {
            const userName = application.user?.fullName || application.user?.email || 'Ứng viên';
            const jobTitle = application.job?.title || 'Vị trí tuyển dụng';

            activities.push({
                id: `application-${application.id}`,
                type: 'application',
                title: 'Đơn ứng tuyển mới',
                description: `${userName} ứng tuyển ${jobTitle}`,
                timestamp: application.createdAt,
            });
        });

        // Fetch recent user registrations (candidates only)
        const usersResult = await this.userRepository.findAll({
            page: 1,
            limit: 5,
            orderBy: 'createdAt',
            orderDirection: 'desc',
        });

        usersResult.data
            .filter((user: any) => user.role === UserRole.CANDIDATE)
            .forEach((user: any) => {
                activities.push({
                    id: `user-${user.id}`,
                    type: 'user_registered',
                    title: 'Người dùng mới',
                    description: `${user.fullName || user.email} đã đăng ký tài khoản`,
                    timestamp: user.createdAt,
                });
            });

        // Sort all activities by timestamp descending and limit
        const sortedActivities = activities
            .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
            .slice(0, limit);

        return {
            activities: sortedActivities,
        };
    }
}
