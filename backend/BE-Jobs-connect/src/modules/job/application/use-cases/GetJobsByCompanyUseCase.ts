import type { IJobRepository } from '../../domain/repositories/IJobRepository.js';
import type { ICompanyRepository } from '@modules/company/domain/repositories/ICompanyRepository.js';
import type { ICompanyMemberRepository } from '@modules/company/domain/repositories/ICompanyMemberRepository.js';
import type { GetJobsByCompanyInputDTO, GetJobsByCompanyOutputDTO } from '../dtos/index.js';
import { NotFoundError, AuthorizationError } from '@shared/domain/errors/index.js';
import { UserRole } from '@modules/user/domain/enums/UserRole.js';
import { UserStatus } from '@modules/user/domain/enums/UserStatus.js';
import { JobStatus } from '../../domain/enums/JobStatus.js';
import { mapJobToOutput } from './mappers/JobOutputMapper.js';

interface Dependencies {
  jobRepository: IJobRepository;
  companyRepository: ICompanyRepository;
  companyMemberRepository: ICompanyMemberRepository;
}

export class GetJobsByCompanyUseCase {
  private readonly jobRepository: IJobRepository;
  private readonly companyRepository: ICompanyRepository;
  private readonly companyMemberRepository: ICompanyMemberRepository;

  constructor({ jobRepository, companyRepository, companyMemberRepository }: Dependencies) {
    this.jobRepository = jobRepository;
    this.companyRepository = companyRepository;
    this.companyMemberRepository = companyMemberRepository;
  }

  async execute(input: GetJobsByCompanyInputDTO): Promise<GetJobsByCompanyOutputDTO> {
    // 1. Check if company exists
    const company = await this.companyRepository.findById(input.companyId);
    if (!company) {
      throw new NotFoundError('Công ty không tồn tại');
    }

    // 2. Check permission to view jobs from this company
    const isAdmin = input.userRole === UserRole.ADMIN;
    let isCompanyMember = false;

    if (input.userId) {
      const member = await this.companyMemberRepository.findByCompanyAndUser(
        input.companyId,
        input.userId
      );
      isCompanyMember = !!member;
    }

    // 3. Non-admin and non-member cannot view jobs from non-ACTIVE companies
    if (!isAdmin && !isCompanyMember && company.status !== UserStatus.ACTIVE) {
      throw new AuthorizationError('Công ty chưa được kích hoạt');
    }

    // 4. Filter job status based on role
    let statusFilter = input.status;

    if (!isAdmin && !isCompanyMember) {
      // Candidates can only view ACTIVE jobs
      if (!statusFilter || statusFilter !== JobStatus.ACTIVE) {
        statusFilter = JobStatus.ACTIVE;
      }
    }
    // Admin and members can view jobs with any status

    const result = await this.jobRepository.findByCompanyId(input.companyId, {
      page: input.page || 1,
      limit: input.limit || 10,
      status: statusFilter,
      orderBy: { createdAt: 'desc' },
    });

    return {
      data: result.data.map((job) => mapJobToOutput(job)),
      pagination: result.pagination,
    };
  }
}
