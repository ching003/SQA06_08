import type { ICompanyRepository } from '../../domain/repositories/ICompanyRepository.js';
import type { GetAllCompaniesInputDTO, GetAllCompaniesOutputDTO } from '../dtos/index.js';
import { UserStatus } from '@modules/user/domain/enums/UserStatus.js';
import { UserRole } from '@modules/user/domain/enums/UserRole.js';

interface Dependencies {
  companyRepository: ICompanyRepository;
}

export class GetAllCompaniesUseCase {
  private readonly companyRepository: ICompanyRepository;

  constructor({ companyRepository }: Dependencies) {
    this.companyRepository = companyRepository;
  }

  async execute(input: GetAllCompaniesInputDTO): Promise<GetAllCompaniesOutputDTO> {
    const page = input.page || 1;
    const limit = input.limit || 10;

    // If user explicitly requests LOCKED status, only admin can see it
    if (input.status === UserStatus.LOCKED && input.userRole !== UserRole.ADMIN) {
      // Non-admin users cannot filter by LOCKED status
      return {
        data: [],
        pagination: {
          page,
          limit,
          total: 0,
          totalPages: 0,
        },
      };
    }

    // Parse orderBy string (e.g., "createdAt:desc")
    let orderBy: Record<string, 'asc' | 'desc'> = { createdAt: 'desc' };
    if (input.orderBy) {
      const [field, direction] = input.orderBy.split(':');
      orderBy = { [field]: (direction as 'asc' | 'desc') || 'desc' };
    }

    const result = await this.companyRepository.findAll({
      page,
      limit,
      status: input.status,
      companySize: input.size,
      industry: input.industry,
      search: input.search,
      orderBy,
    });

    // Filter out LOCKED companies ONLY for non-admin users when viewing "all" companies (no status filter)
    // Admin users should ALWAYS see locked companies
    let filteredData = result.data;

    const isAdmin = input.userRole === UserRole.ADMIN;
    const hasStatusFilter = !!input.status;

    // DEBUG: Check userRole and filtering decision
    console.log('🎯 GetAllCompaniesUseCase - Filter decision:', {
      userRole: input.userRole,
      isAdmin,
      hasStatusFilter,
      willFilter: !isAdmin && !hasStatusFilter,
      dataBeforeFilter: result.data.length,
    });

    // Only filter if: user is NOT admin AND no specific status filter is applied
    if (!isAdmin && !hasStatusFilter) {
      filteredData = result.data.filter((company) => company.status !== UserStatus.LOCKED);
      console.log('🔧 Filtered out LOCKED companies. Result:', filteredData.length);
    }

    console.log('✅ Final data count:', filteredData.length);

    return {
      data: filteredData.map((company) => ({
        id: company.id!,
        name: company.name,
        website: company.website || null,
        description: company.description || null,
        industry: company.industry || null,
        companySize: company.companySize || null,
        foundedYear: company.foundedYear || null,
        address: company.address || null,
        phone: company.phone || null,
        email: company.email || null,
        logoUrl: company.logoUrl || null,
        bannerUrl: company.bannerUrl || null,
        // Only include documentUrl for admin users
        ...(isAdmin && { documentUrl: company.documentUrl || null }),
        status: company.status,
        createdAt: company.createdAt!,
        updatedAt: company.updatedAt!,
      })),
      pagination: result.pagination, // Keep original pagination from DB
    };
  }
}
