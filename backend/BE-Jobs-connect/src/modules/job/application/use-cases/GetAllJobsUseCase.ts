import type { IJobRepository } from '../../domain/repositories/IJobRepository.js';
import type { GetAllJobsInputDTO, GetAllJobsOutputDTO } from '../dtos/index.js';
import { JobStatus } from '../../domain/enums/JobStatus.js';
import { UserRole } from '@modules/user/domain/enums/UserRole.js';
import { mapJobToOutput } from './mappers/JobOutputMapper.js';

interface Dependencies {
  jobRepository: IJobRepository;
}

export class GetAllJobsUseCase {
  private readonly jobRepository: IJobRepository;

  constructor({ jobRepository }: Dependencies) {
    this.jobRepository = jobRepository;
  }

  async execute(input: GetAllJobsInputDTO): Promise<GetAllJobsOutputDTO> {
    // Non-admin users can only view ACTIVE jobs
    let statusFilter = input.status;

    if (input.userRole !== UserRole.ADMIN) {
      // Force status to ACTIVE for non-admin users
      // This ensures candidates/recruiters only see active jobs
      if (!statusFilter || statusFilter !== JobStatus.ACTIVE) {
        statusFilter = JobStatus.ACTIVE;
      }
    }
    // Admin can view jobs with any status

    // Build dynamic orderBy based on sortBy parameter
    const sortBy = input.sortBy || 'createdAt';
    const order = input.order || 'desc';
    let orderBy: Record<string, unknown> = {};

    // Handle salary sorting (special case - needs to sort by salary.maxAmount)
    if (sortBy === 'salary') {
      orderBy = {
        salary: {
          maxAmount: order
        }
      };
    } else {
      // For other fields, direct sorting
      orderBy = { [sortBy]: order };
    }

    const result = await this.jobRepository.findAll({
      page: input.page || 1,
      limit: input.limit || 10,
      status: statusFilter,
      companyId: input.companyId,
      jobType: input.jobType,
      experienceLevel: input.experienceLevel,
      location: input.location,
      salaryMin: input.salaryMin,
      salaryMax: input.salaryMax,
      orderBy,
      // When sorting by salary, filter only jobs with valid salary (not null, not negotiable, not hidden)
      hasSalary: sortBy === 'salary',
    });

    return {
      data: result.data.map((job) => mapJobToOutput(job)),
      pagination: result.pagination,
    };
  }
}
