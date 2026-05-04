import type { PrismaClient } from '@prisma/client';
import type { ICVTemplateRepository, FindAllTemplatesOptions, PaginatedResult } from '../../domain/repositories/ICVTemplateRepository.js';
import { CVTemplate } from '../../domain/entities/CVTemplate.js';
import { CVTemplateMapper } from '../mappers/CVTemplateMapper.js';

interface Dependencies {
  prisma: PrismaClient;
}

export class PrismaCVTemplateRepository implements ICVTemplateRepository {
  private readonly prisma: PrismaClient;

  constructor({ prisma }: Dependencies) {
    this.prisma = prisma;
  }

  async findById(id: string): Promise<CVTemplate | null> {
    const template = await this.prisma.cVTemplate.findUnique({
      where: { id },
    });

    if (!template) return null;
    return CVTemplateMapper.toDomain(template);
  }

  async findAll(options?: FindAllTemplatesOptions): Promise<PaginatedResult<CVTemplate>> {
    const { page = 1, limit = 10, isActive, orderBy } = options || {};
    const skip = (page - 1) * limit;

    const where: Record<string, unknown> = {};
    if (isActive !== undefined) where.isActive = isActive;

    const [templates, total] = await Promise.all([
      this.prisma.cVTemplate.findMany({
        where,
        skip,
        take: limit,
        orderBy: orderBy || { createdAt: 'desc' },
      }),
      this.prisma.cVTemplate.count({ where }),
    ]);

    return {
      data: templates.map((t) => CVTemplateMapper.toDomain(t)),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findActive(options?: FindAllTemplatesOptions): Promise<PaginatedResult<CVTemplate>> {
    const { page = 1, limit = 100, orderBy } = options || {};
    const skip = (page - 1) * limit;

    const where = { isActive: true };

    const [templates, total] = await Promise.all([
      this.prisma.cVTemplate.findMany({
        where,
        skip,
        take: limit,
        orderBy: orderBy || { createdAt: 'desc' },
      }),
      this.prisma.cVTemplate.count({ where }),
    ]);

    return {
      data: templates.map((t) => CVTemplateMapper.toDomain(t)),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async save(template: CVTemplate): Promise<CVTemplate> {
    const created = await this.prisma.cVTemplate.create({
      data: {
        name: template.name,
        htmlUrl: template.htmlUrl,
        previewUrl: template.previewUrl,
        isActive: template.isActive,
      },
    });

    return CVTemplateMapper.toDomain(created);
  }

  async update(id: string, data: Partial<CVTemplate>): Promise<CVTemplate> {
    const updateData: Record<string, unknown> = {};
    if (data.name !== undefined) updateData.name = data.name;
    if (data.htmlUrl !== undefined) updateData.htmlUrl = data.htmlUrl;
    if (data.previewUrl !== undefined) updateData.previewUrl = data.previewUrl;
    if (data.isActive !== undefined) updateData.isActive = data.isActive;

    const updated = await this.prisma.cVTemplate.update({
      where: { id },
      data: updateData,
    });

    return CVTemplateMapper.toDomain(updated);
  }

  async delete(id: string): Promise<CVTemplate> {
    const deleted = await this.prisma.cVTemplate.delete({
      where: { id },
    });

    return CVTemplateMapper.toDomain(deleted);
  }

  async nameExists(name: string, excludeId?: string): Promise<boolean> {
    const where: Record<string, unknown> = { name };
    if (excludeId) {
      where.id = { not: excludeId };
    }

    const count = await this.prisma.cVTemplate.count({ where });
    return count > 0;
  }

  async hasAssociatedCVs(templateId: string): Promise<boolean> {
    const count = await this.prisma.cV.count({
      where: { templateId },
    });
    return count > 0;
  }
}
