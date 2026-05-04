import type { ICompanyRepository } from '../../domain/repositories/ICompanyRepository.js';
import type { ICompanyMemberRepository } from '../../domain/repositories/ICompanyMemberRepository.js';
import { NotFoundError, AuthorizationError } from '@shared/domain/errors/index.js';
import type { ListMembersInputDTO, ListMembersOutputDTO } from '../dtos/index.js';

interface Dependencies {
  companyRepository: ICompanyRepository;
  companyMemberRepository: ICompanyMemberRepository;
}

export class ListMembersUseCase {
  private readonly companyRepository: ICompanyRepository;
  private readonly companyMemberRepository: ICompanyMemberRepository;

  constructor({ companyRepository, companyMemberRepository }: Dependencies) {
    this.companyRepository = companyRepository;
    this.companyMemberRepository = companyMemberRepository;
  }

  async execute(input: ListMembersInputDTO): Promise<ListMembersOutputDTO> {
    // Check if company exists
    const company = await this.companyRepository.findByIdWithoutMembers(input.companyId);
    if (!company) {
      throw new NotFoundError('Company not found');
    }

    // Check if user is a member of the company
    const isMember = await this.companyMemberRepository.userIsMember(input.userId, input.companyId);
    if (!isMember) {
      throw new AuthorizationError('You must be a member to view company members');
    }

    // Get all members with user details
    const members = await this.companyMemberRepository.findByCompanyId(input.companyId, {
      user: true,
    });

    return {
      members: members.map((m) => ({
        id: m.id!,
        userId: m.userId,
        companyId: m.companyId,
        companyRole: m.companyRole,
        createdAt: m.createdAt!,
        updatedAt: m.updatedAt!,
        user: m.user
          ? {
              id: m.user.id,
              email: m.user.email,
              fullName: m.user.fullName,
              avatarUrl: m.user.avatarUrl,
              status: m.user.status,
            }
          : undefined,
      })),
    };
  }
}
