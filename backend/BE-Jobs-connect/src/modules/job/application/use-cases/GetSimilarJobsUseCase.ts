import type { IJobRepository } from '../../domain/repositories/IJobRepository.js';
import type { GetSimilarJobsInputDTO, GetSimilarJobsOutputDTO, SimilarJobOutputDTO } from '../dtos/index.js';
import type { SimilarJob } from '../../domain/entities/SimilarJob.js';
import { NotFoundError } from '@shared/domain/errors/index.js';

interface Dependencies {
  jobRepository: IJobRepository;
}

export class GetSimilarJobsUseCase {
  private readonly jobRepository: IJobRepository;

  constructor({ jobRepository }: Dependencies) {
    this.jobRepository = jobRepository;
  }

  async execute(input: GetSimilarJobsInputDTO): Promise<GetSimilarJobsOutputDTO> {
    // Check if job exists
    const originalJob = await this.jobRepository.findById(input.jobId);
    if (!originalJob) {
      throw new NotFoundError('Job not found');
    }

    const limit = input.limit || 10;
    const minSimilarity = input.minSimilarity || 0;

    // Get similar jobs from SimilarJob table only
    const similarJobsFromTable = await this.jobRepository.findSimilarJobsFromTable(
      input.jobId,
      limit,
      minSimilarity
    );

    return {
      data: similarJobsFromTable.map((sj) => this.mapSimilarJobToOutput(sj)),
    };
  }

  private mapSimilarJobToOutput(similarJob: SimilarJob): SimilarJobOutputDTO {
    const job = similarJob.similarJob;
    if (!job) {
      throw new Error('Similar job data not found');
    }

    return {
      id: job.id!,
      companyId: job.companyId,
      title: job.title,
      description: job.description,
      location: job.location,
      industry: job.industry,
      jobType: job.jobType,
      experienceLevel: job.experienceLevel,
      urgent: job.urgent || false,
      status: job.status,
      expiresAt: job.expiresAt,
      applicationCount: job.applicationCount || 0,
      createdAt: job.createdAt!,
      updatedAt: job.updatedAt!,
      similarity: similarJob.similarity,
      company: job.company
        ? {
            id: job.company.id!,
            name: job.company.name,
            logoUrl: job.company.logoUrl,
            industry: job.company.industry,
            companySize: job.company.companySize,
            status: job.company.status,
          }
        : undefined,
      salary: job.salary
        ? {
            id: job.salary.id!,
            minAmount: job.salary.minAmount,
            maxAmount: job.salary.maxAmount,
            currency: job.salary.currency || 'VND',
            isNegotiable: job.salary.isNegotiable ?? false,
            hideAmount: job.salary.hideAmount ?? false,
          }
        : undefined,
      benefits: job.benefits
        ? job.benefits.map((b) => ({
            id: b.id!,
            title: b.title,
            description: b.description,
          }))
        : [],
      requirements: job.requirements
        ? job.requirements.map((r) => ({
            id: r.id!,
            title: r.title,
            description: r.description,
          }))
        : [],
    };
  }
}
