import type { ApplicationOutputDTO } from '../dtos/ApplicationDTO.js';

export function mapApplicationToOutput(application: any): ApplicationOutputDTO {
  return {
    id: application.id,
    userId: application.userId,
    jobId: application.jobId,
    cvId: application.cvId,
    coverLetter: application.coverLetter,
    status: application.status,
    notes: application.notes,
    createdAt: application.createdAt,
    updatedAt: application.updatedAt,
    user: application.user
      ? {
          id: application.user.id,
          email: application.user.email,
          fullName: application.user.fullName,
          avatarUrl: application.user.avatarUrl,
        }
      : undefined,
    job: application.job
      ? {
          id: application.job.id,
          title: application.job.title,
          companyId: application.job.companyId,
          companyName: application.job.company?.name,
        }
      : undefined,
    cv: application.cv
      ? {
          id: application.cv.id,
          title: application.cv.title,
        }
      : undefined,
  };
}
