import type { JobOutputDTO, JobBenefitDTO, JobRequirementDTO, JobSkillDTO } from '../../dtos/JobDTO.js';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function mapJobToOutput(job: any): JobOutputDTO {
  return {
    id: job.id,
    companyId: job.companyId,
    title: job.title,
    description: job.description,
    location: job.location,
    industry: job.industry,
    jobType: job.jobType || job.type,
    experienceLevel: job.experienceLevel,
    urgent: job.urgent || false,
    status: job.status,
    expiresAt: job.expiresAt,
    applicationCount: job.applicationCount || 0,
    createdAt: job.createdAt,
    updatedAt: job.updatedAt,
    company: job.company
      ? {
          id: job.company.id,
          name: job.company.name,
          logoUrl: job.company.logoUrl,
          industry: job.company.industry,
          companySize: job.company.companySize,
          status: job.company.status,
        }
      : undefined,
    salary: job.salary
      ? {
          id: job.salary.id,
          minAmount: job.salary.minAmount,
          maxAmount: job.salary.maxAmount,
          currency: job.salary.currency,
          isNegotiable: job.salary.isNegotiable ?? false,
          hideAmount: job.salary.hideAmount ?? false,
        }
      : undefined,
    skills: job.skills
      ? job.skills.map(
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          (s: any): JobSkillDTO => ({
            id: s.id,
            skillName: s.skillName,
            level: s.level,
            yearsOfExperience: s.yearsOfExperience,
          })
        )
      : [],
    benefits: job.benefits
      ? job.benefits.map(
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          (b: any): JobBenefitDTO => ({
            id: b.id,
            title: b.title,
            description: b.description,
          })
        )
      : [],
    requirements: job.requirements
      ? job.requirements.map(
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          (r: any): JobRequirementDTO => ({
            id: r.id,
            title: r.title,
            description: r.description,
          })
        )
      : [],
  };
}
