import type { ICompanyRepository } from '../../domain/repositories/ICompanyRepository.js';
import type { ICompanyMemberRepository } from '../../domain/repositories/ICompanyMemberRepository.js';
import { NotFoundError, AuthorizationError, BusinessRuleError } from '@shared/domain/errors/index.js';
import { CompanyRole } from '../../domain/enums/CompanyRole.js';
import type { UpdateMemberRoleInputDTO, UpdateMemberRoleOutputDTO } from '../dtos/index.js';

interface Dependencies {
  companyRepository: ICompanyRepository;
  companyMemberRepository: ICompanyMemberRepository;
}

export class UpdateMemberRoleUseCase {
  private readonly companyRepository: ICompanyRepository;
  private readonly companyMemberRepository: ICompanyMemberRepository;

  constructor({ companyRepository, companyMemberRepository }: Dependencies) {
    this.companyRepository = companyRepository;
    this.companyMemberRepository = companyMemberRepository;
  }

  async execute(input: UpdateMemberRoleInputDTO): Promise<UpdateMemberRoleOutputDTO> {
    // Check if company exists
    const company = await this.companyRepository.findByIdWithoutMembers(input.companyId);
    if (!company) {
      throw new NotFoundError('Không tìm thấy công ty');
    }

    // Find target member
    const targetMember = await this.companyMemberRepository.findById(input.memberId, { user: true });
    if (!targetMember || targetMember.companyId !== input.companyId) {
      throw new NotFoundError('Không tìm thấy thành viên trong công ty này');
    }

    // Check updater permission (must be OWNER or MANAGER)
    const updater = await this.companyMemberRepository.findByCompanyAndUser(input.companyId, input.userId);
    if (!updater) {
      throw new AuthorizationError('Bạn không phải là thành viên của công ty này');
    }

    const isOwner = updater.companyRole === CompanyRole.OWNER;
    const isManager = updater.companyRole === CompanyRole.MANAGER;

    if (!isOwner && !isManager) {
      throw new AuthorizationError('Chỉ có chủ sở hữu và quản lý mới có thể cập nhật vai trò thành viên');
    }

    // Cannot change OWNER role unless you are the owner
    if (targetMember.companyRole === CompanyRole.OWNER && !isOwner) {
      throw new AuthorizationError('Chỉ có chủ sở hữu mới có thể thay đổi vai trò chủ sở hữu');
    }

    // MANAGER can only update RECRUITER roles
    if (updater.companyRole === CompanyRole.MANAGER) {
      const managerCanModify: CompanyRole[] = [CompanyRole.RECRUITER];
      if (!managerCanModify.includes(targetMember.companyRole)) {
        throw new AuthorizationError('Quản lý chỉ có thể cập nhật vai trò RECRUITER');
      }

      const managerCanAssign: CompanyRole[] = [CompanyRole.RECRUITER];
      if (!managerCanAssign.includes(input.newRole)) {
        throw new AuthorizationError('Quản lý chỉ có thể chỉ định vai trò RECRUITER');
      }
    }

    // Cannot have more than one OWNER
    if (input.newRole === CompanyRole.OWNER && targetMember.companyRole !== CompanyRole.OWNER) {
      throw new BusinessRuleError('Không thể chỉ định vai trò chủ sở hữu. Mỗi công ty chỉ có thể có một chủ sở hữu.');
    }

    // Update member role
    const updatedMember = await this.companyMemberRepository.update(input.memberId, {
      companyRole: input.newRole,
    } as any);

    // Fetch updated member with user details
    const memberWithUser = await this.companyMemberRepository.findById(input.memberId, { user: true });

    return {
      id: memberWithUser!.id!,
      userId: memberWithUser!.userId,
      companyId: memberWithUser!.companyId,
      companyRole: memberWithUser!.companyRole,
      createdAt: memberWithUser!.createdAt!,
      updatedAt: memberWithUser!.updatedAt!,
      user: memberWithUser!.user
        ? {
          id: memberWithUser!.user.id,
          email: memberWithUser!.user.email,
          fullName: memberWithUser!.user.fullName,
          avatarUrl: memberWithUser!.user.avatarUrl,
          status: memberWithUser!.user.status,
        }
        : undefined,
    };
  }
}
