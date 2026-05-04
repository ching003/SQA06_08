import type { IJobRepository } from '../../domain/repositories/IJobRepository.js';
import type { GetRecommendedJobsInputDTO, GetRecommendedJobsOutputDTO } from '../dtos/index.js';
import { UserRole } from '@modules/user/domain/enums/UserRole.js';
import { JobStatus } from '../../domain/enums/JobStatus.js';
import { AuthorizationError } from '@shared/domain/errors/index.js';
import { mapJobToOutput } from './mappers/JobOutputMapper.js';

// CV Repository interface (will be properly imported once CV module is migrated)
interface ICVRepository {
  findMainCVByUserId(userId: string): Promise<{ id: string } | null>;
  findByIdWithRelations(id: string): Promise<unknown>;
}

interface Dependencies {
  jobRepository: IJobRepository;
  cvRepository: ICVRepository;
}

export class GetRecommendedJobsUseCase {
  private readonly jobRepository: IJobRepository;
  private readonly cvRepository: ICVRepository;

  constructor({ jobRepository, cvRepository }: Dependencies) {
    this.jobRepository = jobRepository;
    this.cvRepository = cvRepository;
  }

  async execute(input: GetRecommendedJobsInputDTO): Promise<GetRecommendedJobsOutputDTO> {
    // Check if user is CANDIDATE
    if (input.userRole !== UserRole.CANDIDATE) {
      throw new AuthorizationError('Only candidates can view recommended jobs');
    }

    const limit = input.limit || 10;

    // Get user's main CV with skills and work experiences
    const mainCV = await this.cvRepository.findMainCVByUserId(input.userId);

    if (!mainCV) {
      // If no CV, return latest active jobs
      const jobs = await this.jobRepository.findAll({
        page: 1,
        limit,
        status: JobStatus.ACTIVE,
        orderBy: { createdAt: 'desc' },
      });
      return {
        data: jobs.data.map((job) => mapJobToOutput(job)),
        pagination: jobs.pagination,
      };
    }

    // Get CV with full relations for skills and work experiences
    const cvWithRelations = await this.cvRepository.findByIdWithRelations(mainCV.id);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const cvData = cvWithRelations as any;

    // Get skills from CV (if available)
    const userExperienceLevel = cvData?.workExperiences?.[0]?.title || null;

    // Build filters for recommendation
    const filters: Record<string, unknown> = {
      status: JobStatus.ACTIVE,
    };

    if (userExperienceLevel) {
      filters.experienceLevel = this.mapCVExperienceToJobLevel(userExperienceLevel);
    }

    // Search jobs based on filters
    const jobs = await this.jobRepository.findAll({
      page: input.page || 1,
      limit,
      ...filters,
      orderBy: { createdAt: 'desc' },
    });

    return {
      data: jobs.data.map((job) => mapJobToOutput(job)),
      pagination: jobs.pagination,
    };
  }

  private mapCVExperienceToJobLevel(cvExperience: string): string | null {
    const title = cvExperience.toLowerCase();
    if (title.includes('senior') || title.includes('lead') || title.includes('manager')) {
      return 'SENIOR';
    }
    if (title.includes('middle') || title.includes('mid')) {
      return 'MIDDLE';
    }
    if (title.includes('junior')) {
      return 'JUNIOR';
    }
    if (title.includes('fresher') || title.includes('intern')) {
      return 'FRESHER';
    }
    return null;
  }
}
