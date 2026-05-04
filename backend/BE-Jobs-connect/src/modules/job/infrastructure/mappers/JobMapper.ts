import { Job } from '../../domain/entities/Job.js';
import { Salary } from '../../domain/entities/Salary.js';
import { JobBenefit } from '../../domain/entities/JobBenefit.js';
import { JobRequirement } from '../../domain/entities/JobRequirement.js';
import { JobSkill } from '../../domain/entities/JobSkill.js';
import { SimilarJob } from '../../domain/entities/SimilarJob.js';
import { Company } from '@modules/company/domain/entities/Company.js';
import type { JobType } from '../../domain/enums/JobType.js';
import type { JobStatus } from '../../domain/enums/JobStatus.js';
import type { ExperienceLevel } from '../../domain/enums/ExperienceLevel.js';
import type { SkillLevel } from '@modules/cv/domain/enums/SkillLevel.js';

export class JobMapper {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  static toDomain(raw: any): Job {
    return new Job({
      id: raw.id,
      companyId: raw.companyId,
      title: raw.title,
      description: raw.description,
      location: raw.location,
      industry: raw.industry,
      jobType: raw.type as JobType,
      experienceLevel: raw.experienceLevel as ExperienceLevel,
      urgent: raw.urgent ?? false,
      status: raw.status as JobStatus,
      applicationCount: raw.applicationCount ?? 0,
      expiresAt: raw.expiresAt,
      createdAt: raw.createdAt,
      updatedAt: raw.updatedAt,
      skills: raw.skills ? raw.skills.map(JobMapper.mapSkill) : [],
      benefits: raw.benefits ? raw.benefits.map(JobMapper.mapBenefit) : [],
      requirements: raw.requirements ? raw.requirements.map(JobMapper.mapRequirement) : [],
      salary: raw.salary ? JobMapper.mapSalary(raw.salary) : null,
    });
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  static toDomainWithRelations(raw: any): Job {
    return new Job({
      id: raw.id,
      companyId: raw.companyId,
      title: raw.title,
      description: raw.description,
      location: raw.location,
      industry: raw.industry,
      jobType: raw.type as JobType,
      experienceLevel: raw.experienceLevel as ExperienceLevel,
      urgent: raw.urgent ?? false,
      status: raw.status as JobStatus,
      applicationCount: raw.applicationCount ?? 0,
      expiresAt: raw.expiresAt,
      createdAt: raw.createdAt,
      updatedAt: raw.updatedAt,
      company: raw.company ? JobMapper.mapCompany(raw.company) : undefined,
      salary: raw.salary ? JobMapper.mapSalary(raw.salary) : null,
      skills: raw.skills ? raw.skills.map(JobMapper.mapSkill) : [],
      benefits: raw.benefits ? raw.benefits.map(JobMapper.mapBenefit) : [],
      requirements: raw.requirements ? raw.requirements.map(JobMapper.mapRequirement) : [],
    });
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  static mapCompany(raw: any): Company {
    return new Company({
      id: raw.id,
      name: raw.name,
      website: raw.website,
      description: raw.description,
      industry: raw.industry,
      companySize: raw.companySize,
      foundedYear: raw.foundedYear,
      address: raw.address,
      phone: raw.phone,
      email: raw.email,
      logoUrl: raw.logoUrl,
      bannerUrl: raw.bannerUrl,
      documentUrl: raw.documentUrl,
      status: raw.status,
      createdAt: raw.createdAt,
      updatedAt: raw.updatedAt,
    });
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  static mapSalary(raw: any): Salary {
    return new Salary({
      id: raw.id,
      jobId: raw.jobId,
      minAmount: raw.minAmount ? Number(raw.minAmount) : null,
      maxAmount: raw.maxAmount ? Number(raw.maxAmount) : null,
      currency: raw.currency,
      isNegotiable: raw.isNegotiable ?? false,
      hideAmount: raw.hideAmount ?? false,
      createdAt: raw.createdAt,
      updatedAt: raw.updatedAt,
    });
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  static mapBenefit(raw: any): JobBenefit {
    return new JobBenefit({
      id: raw.id,
      jobId: raw.jobId,
      title: raw.title,
      description: raw.description,
      createdAt: raw.createdAt,
      updatedAt: raw.updatedAt,
    });
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  static mapSkill(raw: any): JobSkill {
    return new JobSkill({
      id: raw.id,
      jobId: raw.jobId,
      skillName: raw.skillName,
      level: raw.level as SkillLevel,
      yearsOfExperience: raw.yearsOfExperience,
      createdAt: raw.createdAt,
      updatedAt: raw.updatedAt,
    });
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  static mapRequirement(raw: any): JobRequirement {
    return new JobRequirement({
      id: raw.id,
      jobId: raw.jobId,
      title: raw.title,
      description: raw.description,
      createdAt: raw.createdAt,
      updatedAt: raw.updatedAt,
    });
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  static mapSimilarJob(raw: any): SimilarJob {
    return new SimilarJob({
      id: raw.id,
      jobId: raw.jobId,
      similarJobId: raw.similarJobId,
      similarity: raw.similarity,
      createdAt: raw.createdAt,
      updatedAt: raw.updatedAt,
      similarJob: raw.similarJob ? JobMapper.toDomainWithRelations(raw.similarJob) : undefined,
    });
  }

  static toPersistence(job: Job): Record<string, unknown> {
    return {
      companyId: job.companyId,
      title: job.title,
      description: job.description,
      location: job.location,
      industry: job.industry,
      type: job.jobType,
      experienceLevel: job.experienceLevel,
      urgent: job.urgent,
      status: job.status,
      applicationCount: job.applicationCount,
      expiresAt: job.expiresAt,
    };
  }
}
