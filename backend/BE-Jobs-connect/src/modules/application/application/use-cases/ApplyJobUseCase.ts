import type { IApplicationRepository } from '../../domain/repositories/IApplicationRepository.js';
import type { IJobRepository } from '@modules/job/domain/repositories/IJobRepository.js';
import type { ICVRepository } from '@modules/cv/domain/repositories/ICVRepository.js';
import type { ICompanyRepository } from '@modules/company/domain/repositories/ICompanyRepository.js';
import type { INotificationService } from '@shared/domain/services/INotificationService.js';
import type { ApplyJobInputDTO, ApplyJobOutputDTO } from '../dtos/ApplicationDTO.js';
import { mapApplicationToOutput } from '../helpers/index.js';
import { Application } from '../../domain/entities/Application.js';
import { ApplicationStatus } from '../../domain/enums/index.js';
import { UserRole } from '@modules/user/domain/enums/index.js';
import { UserStatus } from '@modules/user/domain/enums/UserStatus.js';
import { AuthorizationError } from '@shared/domain/errors/index.js';

interface Dependencies {
  applicationRepository: IApplicationRepository;
  jobRepository: IJobRepository;
  cvRepository: ICVRepository;
  companyRepository: ICompanyRepository;
  notificationService: INotificationService;
}

export class ApplyJobUseCase {
  private readonly applicationRepository: IApplicationRepository;
  private readonly jobRepository: IJobRepository;
  private readonly cvRepository: ICVRepository;
  private readonly companyRepository: ICompanyRepository;
  private readonly notificationService: INotificationService;

  constructor({
    applicationRepository,
    jobRepository,
    cvRepository,
    companyRepository,
    notificationService,
  }: Dependencies) {
    this.applicationRepository = applicationRepository;
    this.jobRepository = jobRepository;
    this.cvRepository = cvRepository;
    this.companyRepository = companyRepository;
    this.notificationService = notificationService;
  }

  async execute(input: ApplyJobInputDTO): Promise<ApplyJobOutputDTO> {
    const { userId, userRole, jobId, cvId, coverLetter } = input;

    // Only CANDIDATE can apply for jobs
    if (userRole !== UserRole.CANDIDATE) {
      throw new AuthorizationError('Chỉ ứng viên mới có thể ứng tuyển');
    }

    // Check if job exists and can accept applications
    const job = await this.jobRepository.findById(jobId);
    if (!job) {
      throw new Error('Không tìm thấy tin tuyển dụng');
    }

    // Check if job is locked
    if (job.isLocked()) {
      throw new Error('Tin tuyển dụng đã bị khóa và không thể nhận đơn ứng tuyển');
    }

    // Check if company is locked
    const company = await this.companyRepository.findById(job.companyId);
    if (company && company.status === UserStatus.LOCKED) {
      throw new Error('Công ty đã bị khóa và không thể nhận đơn ứng tuyển');
    }

    // Check if job is inactive (closed by recruiter)
    if (job.status === 'INACTIVE') {
      throw new Error('Tin tuyển dụng đã đóng');
    }

    // Check if job is expired
    if (job.isExpired()) {
      throw new Error('Tin tuyển dụng đã hết hạn, không thể ứng tuyển');
    }

    // Check if job is not active (other statuses: DRAFT, PENDING, CLOSED, SUSPENDED, REJECTED)
    if (!job.isActive()) {
      throw new Error('Tin tuyển dụng không ở trạng thái có thể nhận đơn ứng tuyển');
    }

    // Check if CV exists and belongs to user
    const cv = await this.cvRepository.findById(cvId);
    if (!cv) {
      throw new Error('Không tìm thấy CV');
    }

    if (cv.userId !== userId) {
      throw new Error('CV không thuộc về người dùng này');
    }

    // Check if user already applied to this job
    const existingApplication = await this.applicationRepository.findActiveByUserAndJob(userId, jobId);
    if (existingApplication) {
      throw new Error('Bạn đã ứng tuyển cho tin tuyển dụng này');
    }

    // Create application
    const application = new Application({
      userId,
      jobId,
      cvId,
      coverLetter,
      status: ApplicationStatus.PENDING,
    });

    const savedApplication = await this.applicationRepository.save(application);

    // Increment application count for the job
    await this.jobRepository.incrementApplicationCount(jobId);

    // Notify company members (owners, managers, recruiters) about the new application
    // This is done asynchronously and errors are handled within the service
    this.notificationService.notifyNewApplication(savedApplication.id!).catch((error) => {
      console.error('Error sending notification for new application:', error);
      // Don't throw error - notification failure shouldn't prevent application creation
    });

    // Get application with relations
    const applicationWithRelations = await this.applicationRepository.findByIdWithRelations(savedApplication.id!);

    return mapApplicationToOutput(applicationWithRelations);
  }
}
