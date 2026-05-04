import type { PrismaClient } from '@prisma/client';
import type { ICompanyRepository } from '../../domain/repositories/ICompanyRepository.js';
import type { ICompanyMemberRepository } from '../../domain/repositories/ICompanyMemberRepository.js';
import type { IUserRepository } from '@modules/user/domain/repositories/IUserRepository.js';
import { NotFoundError, AuthorizationError, BusinessRuleError } from '@shared/domain/errors/index.js';
import { CompanyRole } from '../../domain/enums/CompanyRole.js';
import { UserRole } from '@modules/user/domain/enums/UserRole.js';
import type { DeleteMemberInputDTO, DeleteMemberOutputDTO } from '../dtos/index.js';

interface Dependencies {
  companyRepository: ICompanyRepository;
  companyMemberRepository: ICompanyMemberRepository;
  userRepository: IUserRepository;
  prisma: PrismaClient;
}

export class DeleteMemberUseCase {
  private readonly companyRepository: ICompanyRepository;
  private readonly companyMemberRepository: ICompanyMemberRepository;
  private readonly userRepository: IUserRepository;
  private readonly prisma: PrismaClient;

  constructor({ companyRepository, companyMemberRepository, userRepository, prisma }: Dependencies) {
    this.companyRepository = companyRepository;
    this.companyMemberRepository = companyMemberRepository;
    this.userRepository = userRepository;
    this.prisma = prisma;
  }

  async execute(input: DeleteMemberInputDTO): Promise<DeleteMemberOutputDTO> {
    // Check if company exists
    const company = await this.companyRepository.findByIdWithoutMembers(input.companyId);
    if (!company) {
      throw new NotFoundError('Company not found');
    }

    // Find member to delete
    const memberToDelete = await this.companyMemberRepository.findById(input.memberId, { user: true });
    if (!memberToDelete || memberToDelete.companyId !== input.companyId) {
      throw new NotFoundError('Member not found in this company');
    }

    // Cannot delete OWNER
    if (memberToDelete.companyRole === CompanyRole.OWNER) {
      throw new BusinessRuleError('Cannot remove company owner');
    }

    // Check deleter permission (must be OWNER or MANAGER)
    const deleter = await this.companyMemberRepository.findByCompanyAndUser(input.companyId, input.userId);
    if (!deleter) {
      throw new AuthorizationError('You are not a member of this company');
    }

    const isOwner = deleter.companyRole === CompanyRole.OWNER;
    const isManager = deleter.companyRole === CompanyRole.MANAGER;

    if (!isOwner && !isManager) {
      throw new AuthorizationError('Only owners and managers can remove members');
    }

    // MANAGER cannot delete MANAGER
    if (isManager && !isOwner && memberToDelete.companyRole === CompanyRole.MANAGER) {
      throw new AuthorizationError('Managers cannot remove other managers');
    }

    // Use transaction to ensure atomic operation
    await this.prisma.$transaction(async (tx) => {
      // Delete company member
      await tx.companyMember.delete({
        where: { id: input.memberId },
      });

      // Reset user role to CANDIDATE (if not ADMIN)
      const user = await tx.user.findUnique({
        where: { id: memberToDelete.userId },
      });

      if (user && user.role !== 'ADMIN') {
        await tx.user.update({
          where: { id: memberToDelete.userId },
          data: { role: 'CANDIDATE' },
        });
      }
    });

    return {
      success: true,
      message: 'Xóa thành viên khỏi công ty thành công',
    };
  }
}
