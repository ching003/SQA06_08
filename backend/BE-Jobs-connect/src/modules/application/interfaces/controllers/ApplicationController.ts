import type { Request, Response, NextFunction } from 'express';
import type { ApplyJobUseCase } from '../../application/use-cases/ApplyJobUseCase.js';
import type { GetMyApplicationsUseCase } from '../../application/use-cases/GetMyApplicationsUseCase.js';
import type { GetApplicationByIdUseCase } from '../../application/use-cases/GetApplicationByIdUseCase.js';
import type { GetApplicationsByJobUseCase } from '../../application/use-cases/GetApplicationsByJobUseCase.js';
import type { UpdateApplicationStatusUseCase } from '../../application/use-cases/UpdateApplicationStatusUseCase.js';
import type { WithdrawApplicationUseCase } from '../../application/use-cases/WithdrawApplicationUseCase.js';
import { HttpStatus } from '@shared/constants/httpStatus.js';
import {
  applyJobSchema,
  updateStatusSchema,
  paginationSchema,
} from '../validators/applicationValidators.js';
import { ZodError } from 'zod';

interface Dependencies {
  applyJobUseCase: ApplyJobUseCase;
  getMyApplicationsUseCase: GetMyApplicationsUseCase;
  getApplicationByIdUseCase: GetApplicationByIdUseCase;
  getApplicationsByJobUseCase: GetApplicationsByJobUseCase;
  updateApplicationStatusUseCase: UpdateApplicationStatusUseCase;
  withdrawApplicationUseCase: WithdrawApplicationUseCase;
}

export class ApplicationController {
  private readonly applyJobUseCase: ApplyJobUseCase;
  private readonly getMyApplicationsUseCase: GetMyApplicationsUseCase;
  private readonly getApplicationByIdUseCase: GetApplicationByIdUseCase;
  private readonly getApplicationsByJobUseCase: GetApplicationsByJobUseCase;
  private readonly updateApplicationStatusUseCase: UpdateApplicationStatusUseCase;
  private readonly withdrawApplicationUseCase: WithdrawApplicationUseCase;

  constructor(deps: Dependencies) {
    this.applyJobUseCase = deps.applyJobUseCase;
    this.getMyApplicationsUseCase = deps.getMyApplicationsUseCase;
    this.getApplicationByIdUseCase = deps.getApplicationByIdUseCase;
    this.getApplicationsByJobUseCase = deps.getApplicationsByJobUseCase;
    this.updateApplicationStatusUseCase = deps.updateApplicationStatusUseCase;
    this.withdrawApplicationUseCase = deps.withdrawApplicationUseCase;
  }

  applyJob = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const validatedData = applyJobSchema.parse(req.body);
      const result = await this.applyJobUseCase.execute({
        userId: req.user!.id,
        userRole: req.user!.role,
        ...validatedData,
      });

      res.status(HttpStatus.CREATED).json({
        success: true,
        message: 'Ứng tuyển thành công',
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

  getMyApplications = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const query = paginationSchema.parse(req.query);
      const result = await this.getMyApplicationsUseCase.execute({
        userId: req.user!.id,
        userRole: req.user!.role,
        ...query,
      });

      res.status(HttpStatus.OK).json({
        success: true,
        data: result.data,
        pagination: result.pagination,
        message: 'Lấy danh sách đơn ứng tuyển thành công',
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

  getApplicationById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const result = await this.getApplicationByIdUseCase.execute({
        applicationId: req.params.id,
        userId: req.user!.id,
        userRole: req.user!.role,
      });

      res.status(HttpStatus.OK).json({
        success: true,
        data: result,
        message: 'Lấy thông tin đơn ứng tuyển thành công',
      });
    } catch (error) {
      next(error);
    }
  };

  getApplicationsByJob = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const query = paginationSchema.parse(req.query);
      const result = await this.getApplicationsByJobUseCase.execute({
        jobId: req.params.jobId,
        userId: req.user!.id,
        userRole: req.user!.role,
        ...query,
      });

      res.status(HttpStatus.OK).json({
        success: true,
        data: result.data,
        pagination: result.pagination,
        message: 'Lấy danh sách đơn ứng tuyển thành công',
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

  updateStatus = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const validatedData = updateStatusSchema.parse(req.body);
      const result = await this.updateApplicationStatusUseCase.execute({
        applicationId: req.params.id,
        userId: req.user!.id,
        userRole: req.user!.role,
        ...validatedData,
      });

      res.status(HttpStatus.OK).json({
        success: true,
        message: 'Cập nhật trạng thái đơn ứng tuyển thành công',
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

  withdraw = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const result = await this.withdrawApplicationUseCase.execute({
        applicationId: req.params.id,
        userId: req.user!.id,
        userRole: req.user!.role,
      });

      res.status(HttpStatus.OK).json({
        success: true,
        message: 'Rút đơn ứng tuyển thành công',
        data: result,
      });
    } catch (error) {
      next(error);
    }
  };
}
