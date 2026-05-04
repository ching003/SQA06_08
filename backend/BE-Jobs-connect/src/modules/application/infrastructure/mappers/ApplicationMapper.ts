import { Application } from '../../domain/entities/Application.js';
import { ApplicationStatus } from '../../domain/enums/index.js';

export class ApplicationMapper {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  static toDomain(raw: any): Application {
    return new Application({
      id: raw.id,
      userId: raw.userId,
      jobId: raw.jobId,
      cvId: raw.cvId,
      coverLetter: raw.coverLetter,
      status: raw.status as ApplicationStatus,
      notes: raw.notes,
      createdAt: raw.createdAt,
      updatedAt: raw.updatedAt,
    });
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  static toDomainWithRelations(raw: any): Application {
    return new Application({
      id: raw.id,
      userId: raw.userId,
      jobId: raw.jobId,
      cvId: raw.cvId,
      coverLetter: raw.coverLetter,
      status: raw.status as ApplicationStatus,
      notes: raw.notes,
      createdAt: raw.createdAt,
      updatedAt: raw.updatedAt,
      user: raw.user
        ? {
            id: raw.user.id,
            email: raw.user.email,
            fullName: raw.user.fullName,
            avatarUrl: raw.user.avatarUrl,
          }
        : undefined,
      job: raw.job
        ? {
            id: raw.job.id,
            title: raw.job.title,
            companyId: raw.job.companyId,
            company: raw.job.company
              ? {
                  id: raw.job.company.id,
                  name: raw.job.company.name,
                }
              : undefined,
          }
        : undefined,
      cv: raw.cv
        ? {
            id: raw.cv.id,
            title: raw.cv.title,
          }
        : undefined,
    });
  }

  static toPersistence(application: Application): Record<string, unknown> {
    return {
      userId: application.userId,
      jobId: application.jobId,
      cvId: application.cvId,
      coverLetter: application.coverLetter,
      status: application.status,
      notes: application.notes,
    };
  }
}
