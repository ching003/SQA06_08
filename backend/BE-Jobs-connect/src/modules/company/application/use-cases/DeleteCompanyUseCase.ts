import type { ICompanyRepository } from '../../domain/repositories/ICompanyRepository.js';
import type { ICompanyMemberRepository } from '../../domain/repositories/ICompanyMemberRepository.js';
import type { IUserRepository } from '@modules/user/domain/repositories/IUserRepository.js';
import type { IJobRepository } from '@modules/job/domain/repositories/IJobRepository.js';
import { NotFoundError, AuthorizationError } from '@shared/domain/errors/index.js';
import { CompanyRole } from '../../domain/enums/CompanyRole.js';
import { UserRole } from '@modules/user/domain/enums/UserRole.js';
import { UserStatus } from '@modules/user/domain/enums/UserStatus.js';
import { JobStatus } from '@modules/job/domain/enums/JobStatus.js';
import type { DeleteCompanyInputDTO, DeleteCompanyOutputDTO } from '../dtos/index.js';

interface Dependencies {
  companyRepository: ICompanyRepository;
  companyMemberRepository: ICompanyMemberRepository;
  userRepository: IUserRepository;
  jobRepository: IJobRepository;
}

export class DeleteCompanyUseCase {
  private readonly companyRepository: ICompanyRepository;
  private readonly companyMemberRepository: ICompanyMemberRepository;
  private readonly userRepository: IUserRepository;
  private readonly jobRepository: IJobRepository;

  constructor({ companyRepository, companyMemberRepository, userRepository, jobRepository }: Dependencies) {
    this.companyRepository = companyRepository;
    this.companyMemberRepository = companyMemberRepository;
    this.userRepository = userRepository;
    this.jobRepository = jobRepository;
  }

  async execute(input: DeleteCompanyInputDTO): Promise<DeleteCompanyOutputDTO> {
    // Check if company exists
    const company = await this.companyRepository.findByIdWithMembers(input.companyId);
    if (!company) {
      throw new NotFoundError('Company not found');
    }

    // Check user permission
    const user = await this.userRepository.findById(input.userId);
    if (!user) {
      throw new NotFoundError('User not found');
    }

    const isAdmin = user.role === UserRole.ADMIN;

    // If not admin, check if user is OWNER
    if (!isAdmin) {
      const member = await this.companyMemberRepository.findByCompanyAndUser(input.companyId, input.userId);
      if (!member || member.companyRole !== CompanyRole.OWNER) {
        throw new AuthorizationError('Only company owners or admins can delete the company');
      }
    }

    // Soft delete: Set company status to INACTIVE
    await this.companyRepository.update(input.companyId, {
      status: UserStatus.INACTIVE
    });

    // Set all company jobs to INACTIVE
    await this.jobRepository.updateJobsByCompanyId(input.companyId, {
      status: JobStatus.INACTIVE
    });

    // Xóa toàn bộ company member và reset role user về CANDIDATE (nếu không phải ADMIN)
    const members = await this.companyMemberRepository.findByCompanyId(input.companyId);
    for (const member of members) {
      // Xóa company member
      await this.companyMemberRepository.delete(member.id);
      // Reset user role nếu không phải ADMIN
      const user = await this.userRepository.findById(member.userId);
      if (user && user.role !== UserRole.ADMIN) {
        await this.userRepository.update(member.userId, { role: UserRole.CANDIDATE });
      }
    }

    return {
      success: true,
      message: `Đã xóa công ty "${company.name}" thành công`,
    };
  }
}
