import { SavedJob } from '../../domain/entities/SavedJob.js';
import { JobMapper } from './JobMapper.js';

export class SavedJobMapper {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  static toDomain(raw: any): SavedJob {
    return new SavedJob({
      id: raw.id,
      userId: raw.userId,
      jobId: raw.jobId,
      createdAt: raw.createdAt,
    });
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  static toDomainWithRelations(raw: any): any {
    return {
      id: raw.id,
      userId: raw.userId,
      jobId: raw.jobId,
      createdAt: raw.createdAt,
      job: raw.job ? JobMapper.toDomainWithRelations(raw.job) : undefined,
    };
  }

  static toPersistence(savedJob: SavedJob): Record<string, unknown> {
    return {
      userId: savedJob.userId,
      jobId: savedJob.jobId,
    };
  }
}
