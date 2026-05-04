import type { Request, Response, NextFunction } from 'express';
import type { GetAllTemplatesUseCase } from '../../application/use-cases/GetAllTemplatesUseCase.js';
import type { GetActiveTemplatesUseCase } from '../../application/use-cases/GetActiveTemplatesUseCase.js';
import type { GetTemplateByIdUseCase } from '../../application/use-cases/GetTemplateByIdUseCase.js';
import type { CreateTemplateUseCase } from '../../application/use-cases/CreateTemplateUseCase.js';
import type { UpdateTemplateUseCase } from '../../application/use-cases/UpdateTemplateUseCase.js';
import type { DeleteTemplateUseCase } from '../../application/use-cases/DeleteTemplateUseCase.js';
import type { ActivateTemplateUseCase } from '../../application/use-cases/ActivateTemplateUseCase.js';
import type { DeactivateTemplateUseCase } from '../../application/use-cases/DeactivateTemplateUseCase.js';
import { HttpStatus } from '@shared/constants/httpStatus.js';
import {
  createTemplateSchema,
  updateTemplateSchema,
  templatePaginationSchema,
} from '../validators/cvTemplateValidators.js';
import { ZodError } from 'zod';

interface Dependencies {
  getAllTemplatesUseCase: GetAllTemplatesUseCase;
  getActiveTemplatesUseCase: GetActiveTemplatesUseCase;
  getTemplateByIdUseCase: GetTemplateByIdUseCase;
  createTemplateUseCase: CreateTemplateUseCase;
  updateTemplateUseCase: UpdateTemplateUseCase;
  deleteTemplateUseCase: DeleteTemplateUseCase;
  activateTemplateUseCase: ActivateTemplateUseCase;
  deactivateTemplateUseCase: DeactivateTemplateUseCase;
}

export class CVTemplateController {
  private readonly getAllTemplatesUseCase: GetAllTemplatesUseCase;
  private readonly getActiveTemplatesUseCase: GetActiveTemplatesUseCase;
  private readonly getTemplateByIdUseCase: GetTemplateByIdUseCase;
  private readonly createTemplateUseCase: CreateTemplateUseCase;
  private readonly updateTemplateUseCase: UpdateTemplateUseCase;
  private readonly deleteTemplateUseCase: DeleteTemplateUseCase;
  private readonly activateTemplateUseCase: ActivateTemplateUseCase;
  private readonly deactivateTemplateUseCase: DeactivateTemplateUseCase;

  constructor(deps: Dependencies) {
    this.getAllTemplatesUseCase = deps.getAllTemplatesUseCase;
    this.getActiveTemplatesUseCase = deps.getActiveTemplatesUseCase;
    this.getTemplateByIdUseCase = deps.getTemplateByIdUseCase;
    this.createTemplateUseCase = deps.createTemplateUseCase;
    this.updateTemplateUseCase = deps.updateTemplateUseCase;
    this.deleteTemplateUseCase = deps.deleteTemplateUseCase;
    this.activateTemplateUseCase = deps.activateTemplateUseCase;
    this.deactivateTemplateUseCase = deps.deactivateTemplateUseCase;
  }

  getActiveTemplates = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const query = templatePaginationSchema.parse(req.query);
      const result = await this.getActiveTemplatesUseCase.execute({
        page: query.page,
        limit: query.limit,
      });

      res.status(HttpStatus.OK).json({
        success: true,
        data: result.data,
        pagination: result.pagination,
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

  getAllTemplates = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const query = templatePaginationSchema.parse(req.query);
      const result = await this.getAllTemplatesUseCase.execute({
        userId: req.user?.id,
        userRole: req.user?.role,
        page: query.page,
        limit: query.limit,
        isActive: query.isActive,
      });

      res.status(HttpStatus.OK).json({
        success: true,
        data: result.data,
        pagination: result.pagination,
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

  getTemplateById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const result = await this.getTemplateByIdUseCase.execute({
        templateId: req.params.id,
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

  createTemplate = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const validatedData = createTemplateSchema.parse(req.body);

      // Extract files from request (set by multer middleware)
      const files = req.files as { [fieldname: string]: Express.Multer.File[] } | undefined;
      const templateFile = files?.template?.[0];
      const previewFile = files?.preview?.[0];

      const result = await this.createTemplateUseCase.execute({
        userId: req.user!.id,
        userRole: req.user!.role,
        ...validatedData,
        templateFile: templateFile
          ? {
              buffer: templateFile.buffer,
              originalname: templateFile.originalname,
              mimetype: templateFile.mimetype,
              size: templateFile.size,
            }
          : undefined,
        previewFile: previewFile
          ? {
              buffer: previewFile.buffer,
              originalname: previewFile.originalname,
              mimetype: previewFile.mimetype,
              size: previewFile.size,
            }
          : undefined,
      });

      res.status(HttpStatus.CREATED).json({
        success: true,
        message: 'Tạo mẫu CV thành công',
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

  updateTemplate = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const validatedData = updateTemplateSchema.parse(req.body);

      // Extract files from request (set by multer middleware)
      const files = req.files as { [fieldname: string]: Express.Multer.File[] } | undefined;
      const templateFile = files?.template?.[0];
      const previewFile = files?.preview?.[0];

      const result = await this.updateTemplateUseCase.execute({
        templateId: req.params.id,
        userId: req.user!.id,
        userRole: req.user!.role,
        ...validatedData,
        templateFile: templateFile
          ? {
              buffer: templateFile.buffer,
              originalname: templateFile.originalname,
              mimetype: templateFile.mimetype,
              size: templateFile.size,
            }
          : undefined,
        previewFile: previewFile
          ? {
              buffer: previewFile.buffer,
              originalname: previewFile.originalname,
              mimetype: previewFile.mimetype,
              size: previewFile.size,
            }
          : undefined,
      });

      res.status(HttpStatus.OK).json({
        success: true,
        message: 'Cập nhật mẫu CV thành công',
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

  deleteTemplate = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const result = await this.deleteTemplateUseCase.execute({
        templateId: req.params.id,
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

  activateTemplate = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const result = await this.activateTemplateUseCase.execute({
        templateId: req.params.id,
        userId: req.user!.id,
        userRole: req.user!.role,
      });

      res.status(HttpStatus.OK).json({
        success: true,
        message: 'Kích hoạt mẫu CV thành công',
        data: result,
      });
    } catch (error) {
      next(error);
    }
  };

  deactivateTemplate = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const result = await this.deactivateTemplateUseCase.execute({
        templateId: req.params.id,
        userId: req.user!.id,
        userRole: req.user!.role,
      });

      res.status(HttpStatus.OK).json({
        success: true,
        message: 'Vô hiệu hóa mẫu CV thành công',
        data: result,
      });
    } catch (error) {
      next(error);
    }
  };
}
