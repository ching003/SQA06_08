import type { Request, Response, NextFunction } from 'express';
import type { CreateCVUseCase } from '../../application/use-cases/CreateCVUseCase.js';
import type { GetCVByIdUseCase } from '../../application/use-cases/GetCVByIdUseCase.js';
import type { GetAllCVsUseCase } from '../../application/use-cases/GetAllCVsUseCase.js';
import type { GetCVsByUserUseCase } from '../../application/use-cases/GetCVsByUserUseCase.js';
import type { UpdateCVUseCase } from '../../application/use-cases/UpdateCVUseCase.js';
import type { DeleteCVUseCase } from '../../application/use-cases/DeleteCVUseCase.js';
import type { DuplicateCVUseCase } from '../../application/use-cases/DuplicateCVUseCase.js';
import type { SetMainCVUseCase } from '../../application/use-cases/SetMainCVUseCase.js';
import type { SearchCVsUseCase } from '../../application/use-cases/SearchCVsUseCase.js';
import type { SaveCVUseCase } from '../../application/use-cases/SaveCVUseCase.js';
import type { UnsaveCVUseCase } from '../../application/use-cases/UnsaveCVUseCase.js';
import type { GetSavedCVsUseCase } from '../../application/use-cases/GetSavedCVsUseCase.js';
import type { UpdateSavedCVNotesUseCase } from '../../application/use-cases/UpdateSavedCVNotesUseCase.js';
import type { CheckCVSavedUseCase } from '../../application/use-cases/CheckCVSavedUseCase.js';
import type { ExportCVUseCase } from '../../application/use-cases/ExportCVUseCase.js';
import type { GetRecommendedJobsForCVUseCase } from '../../application/use-cases/GetRecommendedJobsForCVUseCase.js';
import { HttpStatus } from '@shared/constants/httpStatus.js';
import {
  createCVSchema,
  updateCVSchema,
  searchCVsSchema,
  saveCVSchema,
  updateSavedCVNotesSchema,
  paginationSchema,
  getAllCVsSchema,
  exportCVSchema,
  duplicateCVSchema,
} from '../validators/cvValidators.js';
import { ZodError } from 'zod';

interface Dependencies {
  createCVUseCase: CreateCVUseCase;
  getCVByIdUseCase: GetCVByIdUseCase;
  getAllCVsUseCase: GetAllCVsUseCase;
  getCVsByUserUseCase: GetCVsByUserUseCase;
  updateCVUseCase: UpdateCVUseCase;
  deleteCVUseCase: DeleteCVUseCase;
  duplicateCVUseCase: DuplicateCVUseCase;
  setMainCVUseCase: SetMainCVUseCase;
  searchCVsUseCase: SearchCVsUseCase;
  saveCVUseCase: SaveCVUseCase;
  unsaveCVUseCase: UnsaveCVUseCase;
  getSavedCVsUseCase: GetSavedCVsUseCase;
  updateSavedCVNotesUseCase: UpdateSavedCVNotesUseCase;
  checkCVSavedUseCase: CheckCVSavedUseCase;
  exportCVUseCase: ExportCVUseCase;
  getRecommendedJobsForCVUseCase: GetRecommendedJobsForCVUseCase;
}

export class CVController {
  private readonly createCVUseCase: CreateCVUseCase;
  private readonly getCVByIdUseCase: GetCVByIdUseCase;
  private readonly getAllCVsUseCase: GetAllCVsUseCase;
  private readonly getCVsByUserUseCase: GetCVsByUserUseCase;
  private readonly updateCVUseCase: UpdateCVUseCase;
  private readonly deleteCVUseCase: DeleteCVUseCase;
  private readonly duplicateCVUseCase: DuplicateCVUseCase;
  private readonly setMainCVUseCase: SetMainCVUseCase;
  private readonly searchCVsUseCase: SearchCVsUseCase;
  private readonly saveCVUseCase: SaveCVUseCase;
  private readonly unsaveCVUseCase: UnsaveCVUseCase;
  private readonly getSavedCVsUseCase: GetSavedCVsUseCase;
  private readonly updateSavedCVNotesUseCase: UpdateSavedCVNotesUseCase;
  private readonly checkCVSavedUseCase: CheckCVSavedUseCase;
  private readonly exportCVUseCase: ExportCVUseCase;
  private readonly getRecommendedJobsForCVUseCase: GetRecommendedJobsForCVUseCase;

  constructor(deps: Dependencies) {
    this.createCVUseCase = deps.createCVUseCase;
    this.getCVByIdUseCase = deps.getCVByIdUseCase;
    this.getAllCVsUseCase = deps.getAllCVsUseCase;
    this.getCVsByUserUseCase = deps.getCVsByUserUseCase;
    this.updateCVUseCase = deps.updateCVUseCase;
    this.deleteCVUseCase = deps.deleteCVUseCase;
    this.duplicateCVUseCase = deps.duplicateCVUseCase;
    this.setMainCVUseCase = deps.setMainCVUseCase;
    this.searchCVsUseCase = deps.searchCVsUseCase;
    this.saveCVUseCase = deps.saveCVUseCase;
    this.unsaveCVUseCase = deps.unsaveCVUseCase;
    this.getSavedCVsUseCase = deps.getSavedCVsUseCase;
    this.updateSavedCVNotesUseCase = deps.updateSavedCVNotesUseCase;
    this.checkCVSavedUseCase = deps.checkCVSavedUseCase;
    this.exportCVUseCase = deps.exportCVUseCase;
    this.getRecommendedJobsForCVUseCase = deps.getRecommendedJobsForCVUseCase;
  }

  createCV = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const validatedData = createCVSchema.parse(req.body);
      const result = await this.createCVUseCase.execute({
        userId: req.user!.id,
        userRole: req.user!.role,
        ...validatedData,
      });

      res.status(HttpStatus.CREATED).json({
        success: true,
        message: 'Tạo CV thành công',
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

  getCVById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const result = await this.getCVByIdUseCase.execute({
        cvId: req.params.id,
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

  getAllCVs = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const query = getAllCVsSchema.parse(req.query);

      // Parse orderBy string (format: "field:direction")
      let orderBy: string | undefined;
      let orderDirection: 'asc' | 'desc' | undefined;
      if (query.orderBy) {
        const [field, direction] = query.orderBy.split(':');
        orderBy = field;
        orderDirection = direction === 'asc' ? 'asc' : 'desc';
      }

      const result = await this.getAllCVsUseCase.execute({
        userId: query.userId || req.user!.id,
        userRole: req.user!.role,
        page: query.page,
        limit: query.limit,
        isOpenForJob: query.isOpenForJob,
        orderBy,
        orderDirection,
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

  getCVsByUser = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const result = await this.getCVsByUserUseCase.execute({
        targetUserId: req.params.userId,
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

  updateCV = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const validatedData = updateCVSchema.parse(req.body);
      const result = await this.updateCVUseCase.execute({
        cvId: req.params.id,
        userId: req.user!.id,
        userRole: req.user!.role,
        ...validatedData,
      });

      res.status(HttpStatus.OK).json({
        success: true,
        message: 'Cập nhật CV thành công',
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

  deleteCV = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      await this.deleteCVUseCase.execute({
        cvId: req.params.id,
        userId: req.user!.id,
        userRole: req.user!.role,
      });

      res.status(HttpStatus.OK).json({
        success: true,
        message: 'Xóa CV thành công',
      });
    } catch (error) {
      next(error);
    }
  };

  duplicateCV = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const validatedData = duplicateCVSchema.parse(req.body);
      const result = await this.duplicateCVUseCase.execute({
        cvId: req.params.id,
        userId: req.user!.id,
        newTitle: validatedData.newTitle,
        isOpenForJob: validatedData.isOpenForJob,
      });

      res.status(HttpStatus.CREATED).json({
        success: true,
        message: 'Sao chép CV thành công',
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

  setAsMain = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const result = await this.setMainCVUseCase.execute({
        cvId: req.params.id,
        userId: req.user!.id,
        userRole: req.user!.role,
      });

      res.status(HttpStatus.OK).json({
        success: true,
        message: 'Đặt CV làm CV chính thành công',
        data: result,
      });
    } catch (error) {
      next(error);
    }
  };

  searchCVs = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const validatedQuery = searchCVsSchema.parse(req.query);
      const result = await this.searchCVsUseCase.execute({
        userId: req.user!.id,
        userRole: req.user!.role,
        search: validatedQuery.query,
        skills: Array.isArray(validatedQuery.skills) ? validatedQuery.skills : validatedQuery.skills ? [validatedQuery.skills] : undefined,
        location: validatedQuery.location,
        educationLevel: validatedQuery.educationLevel,
        page: validatedQuery.page,
        limit: validatedQuery.limit,
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

  saveCV = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const validatedData = saveCVSchema.parse(req.body);
      const result = await this.saveCVUseCase.execute({
        cvId: req.params.id,
        userId: req.user!.id,
        userRole: req.user!.role,
        notes: validatedData.notes,
      });

      res.status(HttpStatus.CREATED).json({
        success: true,
        message: 'Lưu CV thành công',
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

  unsaveCV = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      await this.unsaveCVUseCase.execute({
        cvId: req.params.id,
        userId: req.user!.id,
        userRole: req.user!.role,
      });

      res.status(HttpStatus.OK).json({
        success: true,
        message: 'Bỏ lưu CV thành công',
      });
    } catch (error) {
      next(error);
    }
  };

  getSavedCVs = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const query = paginationSchema.parse(req.query);
      const result = await this.getSavedCVsUseCase.execute({
        userId: req.user!.id,
        userRole: req.user!.role,
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

  updateSavedCVNotes = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const validatedData = updateSavedCVNotesSchema.parse(req.body);
      const result = await this.updateSavedCVNotesUseCase.execute({
        cvId: req.params.id,
        userId: req.user!.id,
        userRole: req.user!.role,
        notes: validatedData.notes,
      });

      res.status(HttpStatus.OK).json({
        success: true,
        message: 'Cập nhật ghi chú thành công',
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

  checkCVSaved = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const result = await this.checkCVSavedUseCase.execute({
        cvId: req.params.id,
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

  exportCV = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const validatedData = exportCVSchema.parse(req.body);
      const result = await this.exportCVUseCase.execute({
        cvId: req.params.id,
        userId: req.user!.id,
        userRole: req.user!.role,
        templateId: validatedData.templateId,
        forceRegenerate: validatedData.forceRegenerate,
      });

      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename="${result.filename}"`);
      res.setHeader('Content-Length', result.pdfBuffer.length);
      res.status(HttpStatus.OK).send(result.pdfBuffer);
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

  getRecommendedJobsForCV = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const query = paginationSchema.parse(req.query);
      const result = await this.getRecommendedJobsForCVUseCase.execute({
        cvId: req.params.cvId,
        userId: req.user!.id,
        userRole: req.user!.role,
        limit: query.limit,
      });

      res.status(HttpStatus.OK).json({
        success: true,
        data: result.data,
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
}
