import type { IUserRepository } from '../../domain/repositories/IUserRepository.js';
import type { GetAllUsersInputDTO, GetAllUsersOutputDTO, GetUserOutputDTO } from '../dtos/index.js';
import { UserRole } from '../../domain/enums/index.js';

interface Dependencies {
  userRepository: IUserRepository;
}

export class GetAllUsersUseCase {
  private readonly userRepository: IUserRepository;

  constructor({ userRepository }: Dependencies) {
    this.userRepository = userRepository;
  }

  async execute(input: GetAllUsersInputDTO): Promise<GetAllUsersOutputDTO> {
    const page = input.page || 1;
    const limit = input.limit || 10;

    const result = await this.userRepository.findAll({
      page,
      limit,
      role: input.role,
      status: input.status,
      search: input.search,
      orderBy: input.orderBy || 'createdAt',
      orderDirection: input.orderDirection || 'desc',
    });

    // Map users to output DTOs with role-based filtering
    const data: GetUserOutputDTO[] = result.data.map((user) => {
      const response: GetUserOutputDTO = {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        phoneNumber: user.phoneNumber,
        gender: user.gender,
        role: user.role,
        dateOfBirth: user.dateOfBirth,
        status: user.status,
        lastLoginAt: user.lastLoginAt,
        avatarUrl: user.avatarUrl,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      };

      // Role-based filtering for companyMember
      if (user.companyMember) {
        const canViewCompanyMember =
          input.viewerRole === UserRole.ADMIN ||
          input.viewerUserId === user.id ||
          input.viewerRole === UserRole.RECRUITER;

        response.companyMember = canViewCompanyMember ? undefined : null;
      } else {
        response.companyMember = null;
      }

      return response;
    });

    return {
      data,
      pagination: {
        page,
        limit,
        total: result.total,
        totalPages: result.totalPages,
      },
    };
  }
}
