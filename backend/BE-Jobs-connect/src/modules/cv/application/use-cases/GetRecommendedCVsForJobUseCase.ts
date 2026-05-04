import type { ICVRepository } from '../../domain/repositories/ICVRepository.js';
import type { IJobRepository } from '@modules/job/domain/repositories/IJobRepository.js';
import { NotFoundError, AuthorizationError } from '@shared/domain/errors/index.js';
import { UserRole } from '@modules/user/domain/enums/index.js';
import type { GetRecommendedCVsForJobInputDTO, GetRecommendedCVsForJobOutputDTO } from '../dtos/index.js';

interface Dependencies {
  cvRepository: ICVRepository;
  jobRepository: IJobRepository;
}

export class GetRecommendedCVsForJobUseCase {
  private readonly cvRepository: ICVRepository;
  private readonly jobRepository: IJobRepository;

  constructor(deps: Dependencies) {
    this.cvRepository = deps.cvRepository;
    this.jobRepository = deps.jobRepository;
  }

  async execute(input: GetRecommendedCVsForJobInputDTO): Promise<GetRecommendedCVsForJobOutputDTO> {
    // Check permission - only RECRUITER and ADMIN
    if (input.userRole !== UserRole.RECRUITER && input.userRole !== UserRole.ADMIN) {
      throw new AuthorizationError('Chỉ nhà tuyển dụng và quản trị viên mới có thể xem CV gợi ý');
    }

    // Find job
    const job = await this.jobRepository.findById(input.jobId);
    if (!job) {
      throw new NotFoundError('Không tìm thấy việc làm');
    }

    const limit = input.limit || 10;

    // Get CVs that are open for job
    const cvs = await this.cvRepository.findRecommendedForJob({
      industry: job.industry,
      experienceLevel: job.experienceLevel,
      limit,
    });

    return {
      data: cvs.map((cv: any) => ({
        id: cv.id,
        title: cv.title,
        fullName: cv.fullName,
        currentPosition: cv.currentPosition,
        skills: (cv.skills || []).map((skill: any) => ({
          id: skill.id,
          skillName: skill.skillName,
          level: skill.level,
          yearsOfExperience: skill.yearsOfExperience,
        })),
        workExperiences: (cv.workExperiences || []).map((exp: any) => ({
          id: exp.id,
          title: exp.title,
          company: exp.company,
          startDate: exp.startDate,
          endDate: exp.endDate,
          description: exp.description,
        })),
        educations: (cv.educations || []).map((edu: any) => ({
          id: edu.id,
          institution: edu.institution,
          degree: edu.degree,
          startDate: edu.startDate,
          endDate: edu.endDate,
          description: edu.description,
        })),
      })),
    };
  }
}
