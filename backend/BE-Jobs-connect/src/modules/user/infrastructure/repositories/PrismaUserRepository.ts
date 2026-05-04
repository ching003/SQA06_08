import type { PrismaClient, Gender as PrismaGender, UserRole as PrismaRole, Status as PrismaStatus } from '@prisma/client';
import type {
  IUserRepository,
  FindAllOptions,
  PaginatedResult,
  UserWithCompanyMember,
  CreateUserData,
} from '../../domain/repositories/IUserRepository.js';
import { User } from '../../domain/entities/User.js';
import { UserMapper } from '../mappers/UserMapper.js';
import { Gender } from '../../domain/enums/Gender.js';
import { UserRole } from '../../domain/enums/UserRole.js';
import { UserStatus } from '../../domain/enums/UserStatus.js';

interface Dependencies {
  prisma: PrismaClient;
}

export class PrismaUserRepository implements IUserRepository {
  private readonly prisma: PrismaClient;

  constructor({ prisma }: Dependencies) {
    this.prisma = prisma;
  }

  async findById(id: string): Promise<User | null> {
    const user = await this.prisma.user.findUnique({
      where: { id },
    });

    if (!user) return null;
    return UserMapper.toDomain(user);
  }

  async findByIdWithCompanyMember(id: string): Promise<UserWithCompanyMember | null> {
    const user = await this.prisma.user.findUnique({
      where: { id },
      include: {
        companyMember: {
          include: {
            company: true,
          },
        },
      },
    });

    if (!user) return null;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const prismaUser = user as any;

    return {
      id: user.id,
      email: user.email,
      passwordHash: user.passwordHash,
      fullName: user.fullName,
      phoneNumber: user.phoneNumber,
      avatarUrl: user.avatarUrl,
      dateOfBirth: user.dateOfBirth,
      gender: user.gender as Gender | null,
      role: user.role as UserRole,
      status: user.status as UserStatus,
      lastLoginAt: user.lastLoginAt,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
      companyMember: prismaUser.companyMember
        ? {
            id: prismaUser.companyMember.id,
            role: prismaUser.companyMember.companyRole,
            joinedAt: prismaUser.companyMember.createdAt,
            company: prismaUser.companyMember.company
              ? {
                  id: prismaUser.companyMember.company.id,
                  name: prismaUser.companyMember.company.name,
                  logoUrl: prismaUser.companyMember.company.logoUrl,
                }
              : undefined,
          }
        : null,
    };
  }

  async findByEmail(email: string): Promise<User | null> {
    const user = await this.prisma.user.findUnique({
      where: { email },
    });

    if (!user) return null;
    return UserMapper.toDomain(user);
  }

  async findAll(options: FindAllOptions): Promise<PaginatedResult<User>> {
    const {
      page = 1,
      limit = 10,
      role,
      status,
      search,
      orderBy = 'createdAt',
      orderDirection = 'desc',
    } = options;
    const skip = (page - 1) * limit;

    // Build where clause
    const where: Record<string, unknown> = {};

    if (role) {
      where.role = role;
    }

    if (status) {
      where.status = status;
    }

    if (search) {
      where.OR = [
        { email: { contains: search, mode: 'insensitive' } },
        { fullName: { contains: search, mode: 'insensitive' } },
      ];
    }

    // Execute queries
    const [users, total] = await Promise.all([
      this.prisma.user.findMany({
        where,
        skip,
        take: limit,
        orderBy: { [orderBy]: orderDirection },
        include: {
          companyMember: {
            include: {
              company: true,
            },
          },
        },
      }),
      this.prisma.user.count({ where }),
    ]);

    return {
      data: users.map((user) => UserMapper.toDomain(user)),
      total,
      totalPages: Math.ceil(total / limit),
    };
  }

  async create(data: CreateUserData): Promise<User> {
    const created = await this.prisma.user.create({
      data: {
        email: data.email,
        passwordHash: data.passwordHash,
        fullName: data.fullName,
        phoneNumber: data.phoneNumber,
        gender: data.gender as PrismaGender | null | undefined,
        role: data.role as PrismaRole,
        dateOfBirth: data.dateOfBirth,
        status: data.status as PrismaStatus,
        avatarUrl: data.avatarUrl,
      },
    });
    return UserMapper.toDomain(created);
  }

  async update(id: string, data: Record<string, unknown>): Promise<User> {
    const updated = await this.prisma.user.update({
      where: { id },
      data,
    });
    return UserMapper.toDomain(updated);
  }

  async delete(id: string): Promise<User> {
    const deleted = await this.prisma.user.delete({
      where: { id },
    });
    return UserMapper.toDomain(deleted);
  }

  async emailExists(email: string, excludeId?: string): Promise<boolean> {
    const where: Record<string, unknown> = { email };
    if (excludeId) {
      where.id = { not: excludeId };
    }

    const count = await this.prisma.user.count({ where });
    return count > 0;
  }

  async updateLastLogin(id: string): Promise<User> {
    const updated = await this.prisma.user.update({
      where: { id },
      data: { lastLoginAt: new Date() },
    });
    return UserMapper.toDomain(updated);
  }

  async updateStatus(id: string, status: string): Promise<User> {
    const updated = await this.prisma.user.update({
      where: { id },
      data: { status: status as PrismaStatus },
    });
    return UserMapper.toDomain(updated);
  }
}
