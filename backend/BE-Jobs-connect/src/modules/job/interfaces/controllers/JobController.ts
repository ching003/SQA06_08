import type { Request, Response, NextFunction } from 'express';
import type { GetAllJobsUseCase } from '../../application/use-cases/GetAllJobsUseCase.js';
import type { GetJobByIdUseCase } from '../../application/use-cases/GetJobByIdUseCase.js';
import type { GetJobsByCompanyUseCase } from '../../application/use-cases/GetJobsByCompanyUseCase.js';
import type { SearchJobsUseCase } from '../../application/use-cases/SearchJobsUseCase.js';
import type { GetSimilarJobsUseCase } from '../../application/use-cases/GetSimilarJobsUseCase.js';
import type { GetRecommendedJobsUseCase } from '../../application/use-cases/GetRecommendedJobsUseCase.js';
import type { CreateJobUseCase } from '../../application/use-cases/CreateJobUseCase.js';
import type { UpdateJobUseCase } from '../../application/use-cases/UpdateJobUseCase.js';
import type { DeleteJobUseCase } from '../../application/use-cases/DeleteJobUseCase.js';
import type { CloseJobUseCase } from '../../application/use-cases/CloseJobUseCase.js';
import type { RepostJobUseCase } from '../../application/use-cases/RepostJobUseCase.js';
import type { ApproveJobUseCase } from '../../application/use-cases/ApproveJobUseCase.js';
import type { RejectJobUseCase } from '../../application/use-cases/RejectJobUseCase.js';
import type { LockJobUseCase } from '../../application/use-cases/LockJobUseCase.js';
import type { UnlockJobUseCase } from '../../application/use-cases/UnlockJobUseCase.js';
import type { SaveJobUseCase } from '../../application/use-cases/SaveJobUseCase.js';
import type { UnsaveJobUseCase } from '../../application/use-cases/UnsaveJobUseCase.js';
import type { GetSavedJobsUseCase } from '../../application/use-cases/GetSavedJobsUseCase.js';
import type { CheckJobSavedUseCase } from '../../application/use-cases/CheckJobSavedUseCase.js';
import { HttpStatus } from '@shared/constants/index.js';
import {
  getAllJobsSchema,
  searchJobsSchema,
  createJobSchema,
  updateJobSchema,
  repostJobSchema,
  rejectJobSchema,
  getSimilarJobsSchema,
  getJobsByCompanySchema,
  paginationSchema,
} from '../validators/jobValidators.js';
import { ZodError } from 'zod';

// Optional CV use case interface (will be properly typed once CV module is migrated)
interface GetRecommendedCVsForJobUseCase {
  execute(input: { jobId: string; userId: string; userRole?: string; limit?: number }): Promise<{ data: unknown[] }>;
}

interface Dependencies {
  getAllJobsUseCase: GetAllJobsUseCase;
  getJobByIdUseCase: GetJobByIdUseCase;
  getJobsByCompanyUseCase: GetJobsByCompanyUseCase;
  searchJobsUseCase: SearchJobsUseCase;
  getSimilarJobsUseCase: GetSimilarJobsUseCase;
  getRecommendedJobsUseCase: GetRecommendedJobsUseCase;
  createJobUseCase: CreateJobUseCase;
  updateJobUseCase: UpdateJobUseCase;
  deleteJobUseCase: DeleteJobUseCase;
  closeJobUseCase: CloseJobUseCase;
  repostJobUseCase: RepostJobUseCase;
  approveJobUseCase: ApproveJobUseCase;
  rejectJobUseCase: RejectJobUseCase;
  lockJobUseCase: LockJobUseCase;
  unlockJobUseCase: UnlockJobUseCase;
  saveJobUseCase: SaveJobUseCase;
  unsaveJobUseCase: UnsaveJobUseCase;
  getSavedJobsUseCase: GetSavedJobsUseCase;
  checkJobSavedUseCase: CheckJobSavedUseCase;
  getRecommendedCVsForJobUseCase?: GetRecommendedCVsForJobUseCase;
}

export class JobController {
  private readonly getAllJobsUseCase: GetAllJobsUseCase;
  private readonly getJobByIdUseCase: GetJobByIdUseCase;
  private readonly getJobsByCompanyUseCase: GetJobsByCompanyUseCase;
  private readonly searchJobsUseCase: SearchJobsUseCase;
  private readonly getSimilarJobsUseCase: GetSimilarJobsUseCase;
  private readonly getRecommendedJobsUseCase: GetRecommendedJobsUseCase;
  private readonly createJobUseCase: CreateJobUseCase;
  private readonly updateJobUseCase: UpdateJobUseCase;
  private readonly deleteJobUseCase: DeleteJobUseCase;
  private readonly closeJobUseCase: CloseJobUseCase;
  private readonly repostJobUseCase: RepostJobUseCase;
  private readonly approveJobUseCase: ApproveJobUseCase;
  private readonly rejectJobUseCase: RejectJobUseCase;
  private readonly lockJobUseCase: LockJobUseCase;
  private readonly unlockJobUseCase: UnlockJobUseCase;
  private readonly saveJobUseCase: SaveJobUseCase;
  private readonly unsaveJobUseCase: UnsaveJobUseCase;
  private readonly getSavedJobsUseCase: GetSavedJobsUseCase;
  private readonly checkJobSavedUseCase: CheckJobSavedUseCase;
  private readonly getRecommendedCVsForJobUseCase?: GetRecommendedCVsForJobUseCase;

  constructor(deps: Dependencies) {
    this.getAllJobsUseCase = deps.getAllJobsUseCase;
    this.getJobByIdUseCase = deps.getJobByIdUseCase;
    this.getJobsByCompanyUseCase = deps.getJobsByCompanyUseCase;
    this.searchJobsUseCase = deps.searchJobsUseCase;
    this.getSimilarJobsUseCase = deps.getSimilarJobsUseCase;
    this.getRecommendedJobsUseCase = deps.getRecommendedJobsUseCase;
    this.createJobUseCase = deps.createJobUseCase;
    this.updateJobUseCase = deps.updateJobUseCase;
    this.deleteJobUseCase = deps.deleteJobUseCase;
    this.closeJobUseCase = deps.closeJobUseCase;
    this.repostJobUseCase = deps.repostJobUseCase;
    this.approveJobUseCase = deps.approveJobUseCase;
    this.rejectJobUseCase = deps.rejectJobUseCase;
    this.lockJobUseCase = deps.lockJobUseCase;
    this.unlockJobUseCase = deps.unlockJobUseCase;
    this.saveJobUseCase = deps.saveJobUseCase;
    this.unsaveJobUseCase = deps.unsaveJobUseCase;
    this.getSavedJobsUseCase = deps.getSavedJobsUseCase;
    this.checkJobSavedUseCase = deps.checkJobSavedUseCase;
    this.getRecommendedCVsForJobUseCase = deps.getRecommendedCVsForJobUseCase;
  }

  getAllJobs = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const query = getAllJobsSchema.parse(req.query);
      const result = await this.getAllJobsUseCase.execute({
        userId: req.user?.id,
        userRole: req.user?.role,
        ...query,
      });

      res.status(HttpStatus.OK).json({
        success: true,
        data: {
          jobs: result.data,
          pagination: result.pagination,
        },
      });
    } catch (error) {
      if (error instanceof ZodError) {
        res.status(HttpStatus.BAD_REQUEST).json({
          success: false,
          message: 'Xác thực thất bại',
          errors: error.issues,
        });
        return;
      }
      next(error);
    }
  };

  getJobById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const result = await this.getJobByIdUseCase.execute({
        jobId: req.params.id,
        userId: req.user?.id,
        userRole: req.user?.role,
      });

      res.status(HttpStatus.OK).json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  };

  getJobsByCompany = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const query = getJobsByCompanySchema.parse(req.query);
      const result = await this.getJobsByCompanyUseCase.execute({
        companyId: req.params.companyId,
        userId: req.user?.id,
        userRole: req.user?.role,
        ...query,
      });

      res.status(HttpStatus.OK).json({
        success: true,
        data: {
          jobs: result.data,
          pagination: result.pagination,
        },
      });
    } catch (error) {
      if (error instanceof ZodError) {
        res.status(HttpStatus.BAD_REQUEST).json({
          success: false,
          message: 'Xác thực thất bại',
          errors: error.issues,
        });
        return;
      }
      next(error);
    }
  };

  searchJobs = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const query = searchJobsSchema.parse(req.query);
      const result = await this.searchJobsUseCase.execute({
        ...query,
        userRole: req.user?.role,
      });

      res.status(HttpStatus.OK).json({
        success: true,
        data: {
          jobs: result.data,
          pagination: result.pagination,
        },
      });
    } catch (error) {
      if (error instanceof ZodError) {
        res.status(HttpStatus.BAD_REQUEST).json({
          success: false,
          message: 'Xác thực thất bại',
          errors: error.issues,
        });
        return;
      }
      next(error);
    }
  };

  getSimilarJobs = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const query = getSimilarJobsSchema.parse(req.query);
      const result = await this.getSimilarJobsUseCase.execute({
        jobId: req.params.id,
        limit: query.limit,
        minSimilarity: query.minSimilarity,
      });

      res.status(HttpStatus.OK).json({
        success: true,
        data: {
          jobs: result.data,
        },
      });
    } catch (error) {
      if (error instanceof ZodError) {
        res.status(HttpStatus.BAD_REQUEST).json({
          success: false,
          message: 'Xác thực thất bại',
          errors: error.issues,
        });
        return;
      }
      next(error);
    }
  };

  createJob = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const validatedData = createJobSchema.parse(req.body);
      const result = await this.createJobUseCase.execute({
        userId: req.user!.id,
        userRole: req.user!.role,
        ...validatedData,
      });

      res.status(HttpStatus.CREATED).json({
        success: true,
        message: 'Tạo tin tuyển dụng thành công',
        data: result,
      });
    } catch (error) {
      if (error instanceof ZodError) {
        res.status(HttpStatus.BAD_REQUEST).json({
          success: false,
          message: error.issues[0]?.message || 'Xác thực thất bại',
          errors: error.issues,
        });
        return;
      }
      next(error);
    }
  };

  updateJob = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const validatedData = updateJobSchema.parse(req.body);
      const result = await this.updateJobUseCase.execute({
        jobId: req.params.id,
        userId: req.user!.id,
        userRole: req.user!.role,
        ...validatedData,
      });

      res.status(HttpStatus.OK).json({
        success: true,
        message: 'Cập nhật tin tuyển dụng thành công',
        data: result,
      });
    } catch (error) {
      if (error instanceof ZodError) {
        res.status(HttpStatus.BAD_REQUEST).json({
          success: false,
          message: error.issues[0]?.message || 'Xác thực thất bại',
          errors: error.issues,
        });
        return;
      }
      next(error);
    }
  };

  deleteJob = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const result = await this.deleteJobUseCase.execute({
        jobId: req.params.id,
        userId: req.user!.id,
        userRole: req.user!.role,
      });

      res.status(HttpStatus.OK).json({
        success: true,
        message: result.message,
      });
    } catch (error) {
      next(error);
    }
  };

  closeJob = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const result = await this.closeJobUseCase.execute({
        jobId: req.params.id,
        userId: req.user!.id,
        userRole: req.user!.role,
      });

      res.status(HttpStatus.OK).json({
        success: true,
        message: 'Đóng tin tuyển dụng thành công',
        data: result,
      });
    } catch (error) {
      next(error);
    }
  };

  repostJob = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const validatedData = repostJobSchema.parse(req.body);
      const result = await this.repostJobUseCase.execute({
        jobId: req.params.id,
        userId: req.user!.id,
        userRole: req.user!.role,
        ...validatedData,
      });

      res.status(HttpStatus.CREATED).json({
        success: true,
        message: 'Đăng lại tin tuyển dụng thành công. Tin tuyển dụng mới đã được tạo.',
        data: result,
      });
    } catch (error) {
      if (error instanceof ZodError) {
        res.status(HttpStatus.BAD_REQUEST).json({
          success: false,
          message: 'Xác thực thất bại',
          errors: error.issues,
        });
        return;
      }
      next(error);
    }
  };

  approveJob = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const result = await this.approveJobUseCase.execute({
        jobId: req.params.id,
        userId: req.user!.id,
        userRole: req.user!.role,
      });

      res.status(HttpStatus.OK).json({
        success: true,
        message: 'Duyệt tin tuyển dụng thành công',
        data: result,
      });
    } catch (error) {
      next(error);
    }
  };

  rejectJob = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const validatedData = rejectJobSchema.parse(req.body);
      const result = await this.rejectJobUseCase.execute({
        jobId: req.params.id,
        userId: req.user!.id,
        userRole: req.user!.role,
        reason: validatedData.reason,
      });

      res.status(HttpStatus.OK).json({
        success: true,
        message: 'Từ chối tin tuyển dụng thành công',
        data: result,
      });
    } catch (error) {
      if (error instanceof ZodError) {
        res.status(HttpStatus.BAD_REQUEST).json({
          success: false,
          message: 'Xác thực thất bại',
          errors: error.issues,
        });
        return;
      }
      next(error);
    }
  };

  lockJob = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const result = await this.lockJobUseCase.execute({
        jobId: req.params.id,
        userId: req.user!.id,
        userRole: req.user!.role,
      });

      res.status(HttpStatus.OK).json({
        success: true,
        message: 'Khóa tin tuyển dụng thành công',
        data: result,
      });
    } catch (error) {
      next(error);
    }
  };

  unlockJob = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const result = await this.unlockJobUseCase.execute({
        jobId: req.params.id,
        userId: req.user!.id,
        userRole: req.user!.role,
      });

      res.status(HttpStatus.OK).json({
        success: true,
        message: 'Mở khóa tin tuyển dụng thành công',
        data: result,
      });
    } catch (error) {
      next(error);
    }
  };

  saveJob = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const result = await this.saveJobUseCase.execute({
        jobId: req.params.id,
        userId: req.user!.id,
        userRole: req.user!.role,
      });

      res.status(HttpStatus.CREATED).json({
        success: true,
        message: 'Lưu tin tuyển dụng thành công',
        data: result,
      });
    } catch (error) {
      next(error);
    }
  };

  unsaveJob = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const result = await this.unsaveJobUseCase.execute({
        jobId: req.params.id,
        userId: req.user!.id,
        userRole: req.user!.role,
      });

      res.status(HttpStatus.OK).json({
        success: true,
        message: result.message,
      });
    } catch (error) {
      next(error);
    }
  };

  getSavedJobs = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const query = paginationSchema.parse(req.query);
      const result = await this.getSavedJobsUseCase.execute({
        userId: req.user!.id,
        userRole: req.user!.role,
        ...query,
      });

      res.status(HttpStatus.OK).json({
        success: true,
        data: {
          savedJobs: result.data,
          pagination: result.pagination,
        },
      });
    } catch (error) {
      if (error instanceof ZodError) {
        res.status(HttpStatus.BAD_REQUEST).json({
          success: false,
          message: 'Xác thực thất bại',
          errors: error.issues,
        });
        return;
      }
      next(error);
    }
  };

  checkJobSaved = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const result = await this.checkJobSavedUseCase.execute({
        jobId: req.params.id,
        userId: req.user!.id,
        userRole: req.user!.role,
      });

      res.status(HttpStatus.OK).json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  };

  getRecommendedJobs = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 10;

      if (limit < 1 || limit > 100) {
        res.status(HttpStatus.BAD_REQUEST).json({
          success: false,
          message: 'Limit must be a number between 1 and 100',
        });
        return;
      }

      const result = await this.getRecommendedJobsUseCase.execute({
        userId: req.user!.id,
        userRole: req.user!.role,
        limit,
      });

      res.status(HttpStatus.OK).json({
        success: true,
        data: {
          jobs: result.data,
        },
      });
    } catch (error) {
      next(error);
    }
  };

  getRecommendedCVsForJob = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!this.getRecommendedCVsForJobUseCase) {
        res.status(501).json({
          success: false,
          message: 'This feature is not available',
        });
        return;
      }

      const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 10;

      if (limit < 1 || limit > 100) {
        res.status(HttpStatus.BAD_REQUEST).json({
          success: false,
          message: 'Limit must be a number between 1 and 100',
        });
        return;
      }

      const result = await this.getRecommendedCVsForJobUseCase.execute({
        jobId: req.params.jobId,
        userId: req.user!.id,
        userRole: req.user!.role,
        limit,
      });

      res.status(HttpStatus.OK).json({
        success: true,
        data: result.data,
      });
    } catch (error) {
      next(error);
    }
  };
}
