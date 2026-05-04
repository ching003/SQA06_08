import type { ICVRepository } from '../../domain/repositories/ICVRepository.js';
import { NotFoundError, AuthorizationError } from '@shared/domain/errors/index.js';
import type { GetRecommendedJobsForCVInputDTO, GetRecommendedJobsForCVOutputDTO } from '../dtos/index.js';

interface Dependencies {
  cvRepository: ICVRepository;
}

export class GetRecommendedJobsForCVUseCase {
  private readonly cvRepository: ICVRepository;

  constructor({ cvRepository }: Dependencies) {
    this.cvRepository = cvRepository;
  }

  async execute(input: GetRecommendedJobsForCVInputDTO): Promise<GetRecommendedJobsForCVOutputDTO> {
    // Find CV to check ownership and existence
    const cv = await this.cvRepository.findById(input.cvId);
    if (!cv) {
      throw new NotFoundError('Không tìm thấy CV');
    }

    // Check permission - user can only get recommendations for their own CV
    if ((cv as any).userId !== input.userId) {
      throw new AuthorizationError('Bạn chỉ có thể xem gợi ý việc làm cho CV của mình');
    }

    const limit = input.limit || 10;

    // Get recommended jobs from database
    const recommendedJobs = await this.cvRepository.findRecommendedJobsForCV(input.cvId, limit);

    return {
      data: recommendedJobs.map((item: any) => ({
        id: item.job.id,
        title: item.job.title,
        description: item.job.description,
        location: item.job.location,
        jobType: item.job.jobType,
        experienceLevel: item.job.experienceLevel,
        industry: item.job.industry,
        similarity: item.similarity,
        salary: item.job.salary ? {
          minAmount: item.job.salary.minAmount,
          maxAmount: item.job.salary.maxAmount,
          currency: item.job.salary.currency,
        } : null,
        company: item.job.company ? {
          id: item.job.company.id,
          name: item.job.company.name,
          logoUrl: item.job.company.logoUrl,
        } : undefined,
        createdAt: item.job.createdAt,
      })),
    };
  }
}
