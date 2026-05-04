import type { IJobRepository } from '../../domain/repositories/IJobRepository.js';
import type { SearchJobsInputDTO, SearchJobsOutputDTO } from '../dtos/index.js';
import { JobStatus } from '../../domain/enums/JobStatus.js';
import { UserRole } from '@modules/user/domain/enums/UserRole.js';
import { mapJobToOutput } from './mappers/JobOutputMapper.js';

interface Dependencies {
  jobRepository: IJobRepository;
}

export class SearchJobsUseCase {
  private readonly jobRepository: IJobRepository;

  constructor({ jobRepository }: Dependencies) {
    this.jobRepository = jobRepository;
  }

  async execute(input: SearchJobsInputDTO & { userRole?: string }): Promise<SearchJobsOutputDTO> {
    // Non-admin users can only search ACTIVE jobs
    let statusFilter = input.status;

    if (input.userRole !== UserRole.ADMIN) {
      // Force status to ACTIVE for non-admin users
      // This ensures candidates/recruiters only see active jobs
      if (!statusFilter || statusFilter !== JobStatus.ACTIVE) {
        statusFilter = JobStatus.ACTIVE;
      }
    }
    // Admin can search jobs with any status

    const result = await this.jobRepository.searchJobs({
      keyword: input.query,
      location: input.location,
      jobType: input.jobType,
      experienceLevel: input.experienceLevel,
      salaryMin: input.salaryMin,
      salaryMax: input.salaryMax,
      status: statusFilter,
      page: input.page || 1,
      limit: input.limit || 10,
    });

    return {
      data: result.data.map((job) => mapJobToOutput(job)),
      pagination: result.pagination,
    };
  }
}
