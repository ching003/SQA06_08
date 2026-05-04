import type { IJobRepository } from '../../domain/repositories/IJobRepository.js';
import type { ICompanyRepository } from '@modules/company/domain/repositories/ICompanyRepository.js';
import type { ICompanyMemberRepository } from '@modules/company/domain/repositories/ICompanyMemberRepository.js';
import type { CreateJobInputDTO, CreateJobOutputDTO } from '../dtos/index.js';
import { JobStatus } from '../../domain/enums/JobStatus.js';
import { UserRole } from '@modules/user/domain/enums/UserRole.js';
import { CompanyRole } from '@modules/company/domain/enums/CompanyRole.js';
import { NotFoundError, AuthorizationError } from '@shared/domain/errors/index.js';
import { mapJobToOutput } from './mappers/JobOutputMapper.js';

interface Dependencies {
  jobRepository: IJobRepository;
  companyRepository: ICompanyRepository;
  companyMemberRepository: ICompanyMemberRepository;
}

export class CreateJobUseCase {
  private readonly jobRepository: IJobRepository;
  private readonly companyRepository: ICompanyRepository;
  private readonly companyMemberRepository: ICompanyMemberRepository;

  constructor({ jobRepository, companyRepository, companyMemberRepository }: Dependencies) {
    this.jobRepository = jobRepository;
    this.companyRepository = companyRepository;
    this.companyMemberRepository = companyMemberRepository;
  }

  async execute(input: CreateJobInputDTO): Promise<CreateJobOutputDTO> {
    // Get companyId - either from input or from user's company membership
    let companyId = input.companyId;

    // If companyId not provided, get it from user's company membership
    if (!companyId) {
      const memberCompany = await this.companyMemberRepository.findByUserId(input.userId);
      if (!memberCompany) {
        throw new AuthorizationError('You must be a member of a company to create jobs');
      }
      companyId = memberCompany.companyId;
    }

    // Check if company exists
    const company = await this.companyRepository.findById(companyId);
    if (!company) {
      throw new NotFoundError('Company not found');
    }

    // Check company status is ACTIVE
    if (company.status !== 'ACTIVE') {
      throw new AuthorizationError('Company must be active to post jobs');
    }

    // Check authorization - admin can create for any company
    if (input.userRole !== UserRole.ADMIN) {
      const member = await this.companyMemberRepository.findByCompanyAndUser(companyId, input.userId);

      if (!member) {
        throw new AuthorizationError('You are not a member of this company');
      }

      const allowedRoles: string[] = [CompanyRole.OWNER, CompanyRole.MANAGER, CompanyRole.RECRUITER];
      if (!allowedRoles.includes(member.companyRole)) {
        throw new AuthorizationError('You do not have permission to create jobs');
      }
    }

    // Create job with nested data using repository create method
    const savedJob = await this.jobRepository.create({
      companyId,
      title: input.title,
      description: input.description,
      location: input.location || '',
      industry: input.industry || '',
      jobType: input.jobType || 'FULL_TIME',
      experienceLevel: input.experienceLevel || 'JUNIOR',
      urgent: input.urgent ?? false,
      status: input.status ?? JobStatus.ACTIVE,
      expiresAt: input.expiresAt ?? undefined,
      salary: input.salary
        ? {
            minAmount: input.salary.minAmount,
            maxAmount: input.salary.maxAmount,
            currency: input.salary.currency,
            isNegotiable: input.salary.isNegotiable,
            hideAmount: input.salary.hideAmount,
          }
        : undefined,
      benefits: input.benefits?.map((b) => ({
        title: b.title,
        description: b.description,
      })),
      requirements: input.requirements?.map((r) => ({
        title: r.title,
        description: r.description,
      })),
    });

    return mapJobToOutput(savedJob);
  }
}
