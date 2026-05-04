import type { IUserRepository } from '../../domain/repositories/IUserRepository.js';
import { NotFoundError } from '@shared/domain/errors/index.js';
import { UserRole } from '../../domain/enums/index.js';
import { CompanyRole } from '@modules/company/domain/enums/index.js';
import type { GetUserByIdInputDTO, GetUserOutputDTO } from '../dtos/index.js';

interface Dependencies {
  userRepository: IUserRepository;
}

export class GetUserByIdUseCase {
  private readonly userRepository: IUserRepository;

  constructor({ userRepository }: Dependencies) {
    this.userRepository = userRepository;
  }

  async execute(input: GetUserByIdInputDTO): Promise<GetUserOutputDTO> {
    // Find user with company member info
    const userWithMember = await this.userRepository.findByIdWithCompanyMember(input.id);
    if (!userWithMember) {
      throw new NotFoundError('User not found');
    }

    // Build response with role-based filtering for companyMember
    const response: GetUserOutputDTO = {
      id: userWithMember.id,
      email: userWithMember.email,
      fullName: userWithMember.fullName,
      phoneNumber: userWithMember.phoneNumber,
      gender: userWithMember.gender,
      role: userWithMember.role,
      dateOfBirth: userWithMember.dateOfBirth,
      status: userWithMember.status,
      lastLoginAt: userWithMember.lastLoginAt,
      avatarUrl: userWithMember.avatarUrl,
      createdAt: userWithMember.createdAt,
      updatedAt: userWithMember.updatedAt,
    };

    // Role-based filtering for companyMember
    // Show companyMember if:
    // 1. Viewer is viewing their own profile
    // 2. Viewer is ADMIN
    // 3. Viewer is RECRUITER
    if (userWithMember.companyMember) {
      const canViewCompanyMember =
        input.viewerRole === UserRole.ADMIN ||
        input.viewerUserId === userWithMember.id ||
        input.viewerRole === UserRole.RECRUITER;

      if (canViewCompanyMember) {
        response.companyMember = {
          id: userWithMember.companyMember.id,
          role: userWithMember.companyMember.role as CompanyRole,
          joinedAt: userWithMember.companyMember.joinedAt,
          company: userWithMember.companyMember.company
            ? {
                id: userWithMember.companyMember.company.id,
                name: userWithMember.companyMember.company.name,
                logoUrl: userWithMember.companyMember.company.logoUrl,
              }
            : undefined,
        };
      } else {
        response.companyMember = null;
      }
    } else {
      response.companyMember = null;
    }

    return response;
  }
}
