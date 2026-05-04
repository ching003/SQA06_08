import type { ICompanyRepository } from '../../domain/repositories/ICompanyRepository.js';
import type { ICompanyMemberRepository } from '../../domain/repositories/ICompanyMemberRepository.js';
import { NotFoundError, AuthorizationError } from '@shared/domain/errors/index.js';
import { UserStatus } from '@modules/user/domain/enums/UserStatus.js';
import { UserRole } from '@modules/user/domain/enums/UserRole.js';
import type { GetCompanyByIdInputDTO, GetCompanyByIdOutputDTO } from '../dtos/index.js';

interface Dependencies {
  companyRepository: ICompanyRepository;
  companyMemberRepository: ICompanyMemberRepository;
}

export class GetCompanyByIdUseCase {
  private readonly companyRepository: ICompanyRepository;
  private readonly companyMemberRepository: ICompanyMemberRepository;

  constructor({ companyRepository, companyMemberRepository }: Dependencies) {
    this.companyRepository = companyRepository;
    this.companyMemberRepository = companyMemberRepository;
  }

  async execute(input: GetCompanyByIdInputDTO): Promise<GetCompanyByIdOutputDTO> {
    // Determine if user is a company member
    let isCompanyMember = false;
    if (input.userId) {
      const member = await this.companyMemberRepository.findByCompanyAndUser(input.companyId, input.userId);
      isCompanyMember = !!member;
    }

    const isAdmin = input.userRole === UserRole.ADMIN;
    const canViewMembers = isAdmin || isCompanyMember;

    // Fetch company with or without members based on permission
    let company;
    if (canViewMembers) {
      company = await this.companyRepository.findByIdWithMembers(input.companyId);
    } else {
      company = await this.companyRepository.findByIdWithoutMembers(input.companyId);
    }

    if (!company) {
      throw new NotFoundError('Company not found');
    }

    // Non-admin users cannot view LOCKED companies
    if (company.status === UserStatus.LOCKED && !isAdmin) {
      throw new AuthorizationError('Company is locked and cannot be viewed');
    }

    return this.mapToOutput(company, isAdmin, canViewMembers);
  }

  private mapToOutput(company: any, isAdmin: boolean, canViewMembers: boolean): GetCompanyByIdOutputDTO {
    const output: GetCompanyByIdOutputDTO = {
      id: company.id,
      name: company.name,
      website: company.website,
      description: company.description,
      industry: company.industry,
      companySize: company.companySize,
      foundedYear: company.foundedYear,
      address: company.address,
      phone: company.phone,
      email: company.email,
      logoUrl: company.logoUrl,
      bannerUrl: company.bannerUrl,
      status: company.status,
      createdAt: company.createdAt,
      updatedAt: company.updatedAt,
    };

    // Admin or member can see document URL
    if (canViewMembers) {
      output.documentUrl = company.documentUrl;
    }

    // Only admin or member can see members
    if (canViewMembers && company.members) {
      output.members = company.members.map((m: any) => ({
        id: m.id,
        userId: m.userId,
        companyId: m.companyId,
        companyRole: m.companyRole,
        createdAt: m.createdAt,
        updatedAt: m.updatedAt,
        user: m.user
          ? {
              id: m.user.id,
              email: m.user.email,
              fullName: m.user.fullName,
              avatarUrl: m.user.avatarUrl,
              status: m.user.status,
            }
          : undefined,
      }));
    }

    return output;
  }
}
