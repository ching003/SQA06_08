import type { IJobRepository } from '../../domain/repositories/IJobRepository.js';
import type { ICompanyMemberRepository } from '@modules/company/domain/repositories/ICompanyMemberRepository.js';
import type { DeleteJobInputDTO, DeleteJobOutputDTO } from '../dtos/index.js';
import { UserRole } from '@modules/user/domain/enums/UserRole.js';
import { CompanyRole } from '@modules/company/domain/enums/CompanyRole.js';
import { JobStatus } from '../../domain/enums/JobStatus.js';
import { NotFoundError, AuthorizationError, BusinessRuleError } from '@shared/domain/errors/index.js';

interface Dependencies {
  jobRepository: IJobRepository;
  companyMemberRepository: ICompanyMemberRepository;
}

export class DeleteJobUseCase {
  private readonly jobRepository: IJobRepository;
  private readonly companyMemberRepository: ICompanyMemberRepository;

  constructor({ jobRepository, companyMemberRepository }: Dependencies) {
    this.jobRepository = jobRepository;
    this.companyMemberRepository = companyMemberRepository;
  }

  async execute(input: DeleteJobInputDTO): Promise<DeleteJobOutputDTO> {
    // Find job
    const job = await this.jobRepository.findById(input.jobId);
    if (!job) {
      throw new NotFoundError('Job not found');
    }

    // Check if job is active - cannot delete active jobs, must close them first
    if (job.status === JobStatus.ACTIVE) {
      throw new BusinessRuleError('Không thể xóa tin tuyển dụng đang hoạt động. Vui lòng đóng tin trước.');
    }

    // Check authorization - admin can delete any job
    if (input.userRole !== UserRole.ADMIN) {
      const member = await this.companyMemberRepository.findByCompanyAndUser(
        job.companyId,
        input.userId
      );

      if (!member) {
        throw new AuthorizationError('You are not a member of this company');
      }

      const allowedRoles: string[] = [CompanyRole.OWNER, CompanyRole.MANAGER];
      if (!allowedRoles.includes(member.companyRole)) {
        throw new AuthorizationError('You do not have permission to delete jobs');
      }
    }

    // Delete job
    await this.jobRepository.delete(input.jobId);

    return {
      success: true,
      message: 'Xóa tin tuyển dụng thành công',
    };
  }
}
