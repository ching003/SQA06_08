import type { PrismaClient } from '@prisma/client';
import type { ISavedCVRepository, FindSavedCVsOptions, PaginatedResult } from '../../domain/repositories/ISavedCVRepository.js';
import { SavedCV } from '../../domain/entities/SavedCV.js';
import { SavedCVMapper } from '../mappers/SavedCVMapper.js';

interface Dependencies {
  prisma: PrismaClient;
}

type AnyPrismaClient = any;

const savedCVInclude = {
  cv: {
    include: {
      user: {
        select: {
          id: true,
          email: true,
          fullName: true,
          avatarUrl: true,
          status: true,
        },
      },
      skills: true,
      workExperiences: {
        take: 3,
        orderBy: { startDate: 'desc' as const },
      },
      educations: {
        take: 2,
        orderBy: { startDate: 'desc' as const },
      },
    },
  },
  user: {
    select: {
      id: true,
      email: true,
      fullName: true,
      avatarUrl: true,
    },
  },
};

export class PrismaSavedCVRepository implements ISavedCVRepository {
  private readonly prisma: AnyPrismaClient;

  constructor({ prisma }: Dependencies) {
    this.prisma = prisma;
  }

  async findById(id: string): Promise<SavedCV | null> {
    const savedCV = await this.prisma.savedCV.findUnique({
      where: { id },
      include: savedCVInclude,
    });

    if (!savedCV) return null;
    return SavedCVMapper.toDomainWithRelations(savedCV);
  }

  async findByUserId(userId: string, options?: FindSavedCVsOptions): Promise<PaginatedResult<SavedCV>> {
    const { page = 1, limit = 10, orderBy } = options || {};
    const skip = (page - 1) * limit;

    const [savedCVs, total] = await Promise.all([
      this.prisma.savedCV.findMany({
        where: { userId },
        skip,
        take: limit,
        orderBy: orderBy || { createdAt: 'desc' },
        include: savedCVInclude,
      }),
      this.prisma.savedCV.count({ where: { userId } }),
    ]);

    return {
      data: savedCVs.map((s: any) => SavedCVMapper.toDomainWithRelations(s)),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findByUserAndCV(userId: string, cvId: string, include?: Record<string, unknown>): Promise<SavedCV | null> {
    const savedCV = await this.prisma.savedCV.findUnique({
      where: {
        userId_cvId: { userId, cvId },
      },
      include: include ? (include as any) : savedCVInclude,
    });

    if (!savedCV) return null;
    return SavedCVMapper.toDomainWithRelations(savedCV);
  }

  async isCVSaved(userId: string, cvId: string): Promise<boolean> {
    const count = await this.prisma.savedCV.count({
      where: { userId, cvId },
    });
    return count > 0;
  }

  async save(savedCV: SavedCV): Promise<SavedCV> {
    const created = await this.prisma.savedCV.create({
      data: {
        userId: savedCV.userId,
        cvId: savedCV.cvId,
        notes: savedCV.notes,
      },
      include: savedCVInclude,
    });

    return SavedCVMapper.toDomainWithRelations(created);
  }

  async updateNotes(id: string, notes?: string | null): Promise<SavedCV> {
    const updated = await this.prisma.savedCV.update({
      where: { id },
      data: { notes: notes ?? null },
      include: savedCVInclude,
    });

    return SavedCVMapper.toDomainWithRelations(updated);
  }

  async delete(id: string): Promise<SavedCV> {
    const deleted = await this.prisma.savedCV.delete({
      where: { id },
    });

    return SavedCVMapper.toDomain(deleted);
  }

  async deleteByUserAndCV(userId: string, cvId: string): Promise<SavedCV> {
    const deleted = await this.prisma.savedCV.delete({
      where: {
        userId_cvId: { userId, cvId },
      },
    });

    return SavedCVMapper.toDomain(deleted);
  }

  async countByUserId(userId: string): Promise<number> {
    return this.prisma.savedCV.count({
      where: { userId },
    });
  }
}
