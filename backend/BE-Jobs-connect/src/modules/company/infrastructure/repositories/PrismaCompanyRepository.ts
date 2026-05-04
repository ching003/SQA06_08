import type { PrismaClient, CompanySize as PrismaCompanySize, Status as PrismaStatus } from '@prisma/client';
import type {
  ICompanyRepository,
  FindAllCompaniesOptions,
  PaginatedResult,
} from '../../domain/repositories/ICompanyRepository.js';
import { Company } from '../../domain/entities/Company.js';
import { CompanyMapper } from '../mappers/CompanyMapper.js';

interface Dependencies {
  prisma: PrismaClient;
}

export class PrismaCompanyRepository implements ICompanyRepository {
  private readonly prisma: PrismaClient;

  constructor({ prisma }: Dependencies) {
    this.prisma = prisma;
  }

  async findById(id: string, include?: Record<string, unknown>): Promise<Company | null> {
    const company = await this.prisma.company.findUnique({
      where: { id },
      include: include as any,
    });

    if (!company) return null;
    return CompanyMapper.toDomain(company);
  }

  async findByIdWithMembers(id: string): Promise<Company | null> {
    const company = await this.prisma.company.findUnique({
      where: { id },
      include: {
        members: {
          include: {
            user: true,
          },
        },
      },
    });

    if (!company) return null;
    return CompanyMapper.toDomainWithMembers(company);
  }

  async findByIdWithoutMembers(id: string): Promise<Company | null> {
    const company = await this.prisma.company.findUnique({
      where: { id },
    });

    if (!company) return null;
    return CompanyMapper.toDomain(company);
  }

  async findAll(options: FindAllCompaniesOptions): Promise<PaginatedResult<Company>> {
    const { page = 1, limit = 10, status, companySize, industry, search, orderBy = { createdAt: 'desc' } } = options;
    const skip = (page - 1) * limit;

    // Build where clause
    const where: Record<string, unknown> = {};

    if (status) {
      where.status = status;
    }

    if (companySize) {
      where.companySize = companySize;
    }

    if (industry) {
      where.industry = { contains: industry, mode: 'insensitive' };
    }

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { industry: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }

    // DEBUG: Log the query parameters
    console.log('🗄️  PrismaCompanyRepository.findAll - WHERE clause:', JSON.stringify(where, null, 2));
    console.log('🗄️  Pagination:', { page, limit, skip });

    // Execute queries
    const [companies, total] = await Promise.all([
      this.prisma.company.findMany({
        where,
        skip,
        take: limit,
        orderBy,
      }),
      this.prisma.company.count({ where }),
    ]);

    // DEBUG: Log results
    console.log('🗄️  DB returned:', {
      total,
      count: companies.length,
      statuses: companies.map(c => ({ id: c.id, name: c.name, status: c.status })),
    });

    return {
      data: companies.map((c) => CompanyMapper.toDomain(c)),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async save(company: Company | Record<string, unknown>): Promise<Company> {
    const data = company instanceof Company ? company : company;

    const created = await this.prisma.company.create({
      data: {
        name: data.name as string,
        website: data.website as string | null,
        description: data.description as string | null,
        industry: data.industry as string | null,
        companySize: data.companySize as PrismaCompanySize | null,
        foundedYear: data.foundedYear as number | null,
        address: data.address as string | null,
        phone: data.phone as string | null,
        email: data.email as string | null,
        logoUrl: data.logoUrl as string | null,
        bannerUrl: data.bannerUrl as string | null,
        status: data.status as PrismaStatus,
        documentUrl: data.documentUrl as string | null,
      },
    });

    return CompanyMapper.toDomain(created);
  }

  async update(id: string, data: Partial<Company> | Record<string, unknown>): Promise<Company> {
    const updateData: Record<string, unknown> = {};

    if ('name' in data && data.name !== undefined) updateData.name = data.name;
    if ('website' in data && data.website !== undefined) updateData.website = data.website;
    if ('description' in data && data.description !== undefined) updateData.description = data.description;
    if ('industry' in data && data.industry !== undefined) updateData.industry = data.industry;
    if ('companySize' in data && data.companySize !== undefined) updateData.companySize = data.companySize as PrismaCompanySize | null;
    if ('foundedYear' in data && data.foundedYear !== undefined) updateData.foundedYear = data.foundedYear;
    if ('address' in data && data.address !== undefined) updateData.address = data.address;
    if ('phone' in data && data.phone !== undefined) updateData.phone = data.phone;
    if ('email' in data && data.email !== undefined) updateData.email = data.email;
    if ('logoUrl' in data && data.logoUrl !== undefined) updateData.logoUrl = data.logoUrl;
    if ('bannerUrl' in data && data.bannerUrl !== undefined) updateData.bannerUrl = data.bannerUrl;
    if ('status' in data && data.status !== undefined) updateData.status = data.status as PrismaStatus;
    if ('documentUrl' in data && data.documentUrl !== undefined) updateData.documentUrl = data.documentUrl;

    const updated = await this.prisma.company.update({
      where: { id },
      data: updateData,
    });

    return CompanyMapper.toDomain(updated);
  }

  async updateStatus(id: string, newStatus: string, currentStatus: string): Promise<Company | null> {
    try {
      const updated = await this.prisma.company.updateMany({
        where: {
          id,
          status: currentStatus as PrismaStatus,
        },
        data: {
          status: newStatus as PrismaStatus,
        },
      });

      // If no records were updated, the status condition didn't match
      if (updated.count === 0) {
        return null;
      }

      // Fetch and return the updated company
      const company = await this.prisma.company.findUnique({
        where: { id },
      });

      if (!company) return null;
      return CompanyMapper.toDomain(company);
    } catch (error) {
      // If any error occurs, return null to indicate update failed
      return null;
    }
  }

  async delete(id: string): Promise<Company> {
    const deleted = await this.prisma.company.delete({
      where: { id },
    });

    return CompanyMapper.toDomain(deleted);
  }

  async nameExists(name: string, excludeId?: string): Promise<boolean> {
    const where: Record<string, unknown> = {
      name: { equals: name, mode: 'insensitive' },
    };

    if (excludeId) {
      where.id = { not: excludeId };
    }

    const count = await this.prisma.company.count({ where });
    return count > 0;
  }
}
