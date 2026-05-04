import type { ICVRepository } from '../../domain/repositories/ICVRepository.js';
import type { ICVTemplateRepository } from '../../domain/repositories/ICVTemplateRepository.js';
import type { IFileStorageService } from '@shared/domain/services/IFileStorageService.js';
import type { IPDFService } from '@shared/domain/services/IPDFService.js';
import type { ExportCVInputDTO, ExportCVOutputDTO } from '../dtos/index.js';
import { NotFoundError, AuthorizationError, ValidationError } from '@shared/domain/errors/index.js';
import { UserRole } from '@modules/user/domain/enums/index.js';

interface Dependencies {
  cvRepository: ICVRepository;
  cvTemplateRepository: ICVTemplateRepository;
  fileStorageService: IFileStorageService;
  pdfService: IPDFService;
}

export class ExportCVUseCase {
  private readonly cvRepository: ICVRepository;
  private readonly cvTemplateRepository: ICVTemplateRepository;
  private readonly fileStorageService: IFileStorageService;
  private readonly pdfService: IPDFService;

  constructor(deps: Dependencies) {
    this.cvRepository = deps.cvRepository;
    this.cvTemplateRepository = deps.cvTemplateRepository;
    this.fileStorageService = deps.fileStorageService;
    this.pdfService = deps.pdfService;
  }

  async execute(input: ExportCVInputDTO): Promise<ExportCVOutputDTO> {
    // Find CV with all relations
    const cv = await this.cvRepository.findByIdWithRelations(input.cvId);
    if (!cv) {
      throw new NotFoundError('Không tìm thấy CV');
    }

    // Check permission:
    // - Owner can export their own CV
    // - Admin can export any CV
    // - Recruiter can export CV if isOpenForJob is true
    const isAdmin = input.userRole === UserRole.ADMIN;
    const isRecruiter = input.userRole === UserRole.RECRUITER;
    const isOwner = (cv as any).userId === input.userId;
    const isOpenForJob = (cv as any).isOpenForJob === true;

    if (!isAdmin && !isOwner && !(isRecruiter && isOpenForJob)) {
      throw new AuthorizationError('Bạn không có quyền xuất CV này');
    }

    // Determine which template to use
    const templateId = input.templateId || (cv as any).templateId;
    if (!templateId) {
      throw new ValidationError('Cần chọn mẫu CV để xuất PDF');
    }

    // Find template
    const template = await this.cvTemplateRepository.findById(templateId);
    if (!template) {
      throw new NotFoundError('Không tìm thấy mẫu CV');
    }

    if (!template.isActive) {
      throw new ValidationError('Mẫu CV không còn hoạt động');
    }

    // Check if we can use cached PDF
    if (!input.forceRegenerate && (cv as any).pdfUrl && (cv as any).templateId === templateId) {
      try {
        // Download existing PDF from Firebase
        const response = await fetch((cv as any).pdfUrl);
        if (response.ok) {
          const arrayBuffer = await response.arrayBuffer();
          return {
            pdfBuffer: Buffer.from(arrayBuffer),
            filename: `cv-${input.cvId}.pdf`,
          };
        }
      } catch {
        // If download fails, regenerate PDF
      }
    }

    // Fetch template HTML
    let templateHtml: string;
    try {
      const response = await fetch(template.htmlUrl);
      if (!response.ok) {
        throw new Error('Failed to fetch template');
      }
      templateHtml = await response.text();
    } catch {
      throw new ValidationError('Không thể tải mẫu CV');
    }

    // Prepare CV data for template
    const cvData = this.prepareCVData(cv);

    // Render template with CV data
    const renderedHtml = this.pdfService.renderTemplate(templateHtml, cvData);

    // Generate PDF
    const pdfBuffer = await this.pdfService.generatePDF(renderedHtml);

    // Upload PDF to Firebase Storage
    const pdfFilename = `cv-${input.cvId}-${Date.now()}.pdf`;
    const pdfUrl = await this.fileStorageService.uploadFile(
      {
        buffer: pdfBuffer,
        originalname: pdfFilename,
        mimetype: 'application/pdf',
        size: pdfBuffer.length,
      },
      'cv-exports',
      pdfFilename
    );

    // Update CV with new pdfUrl and templateId
    await this.cvRepository.update(input.cvId, {
      pdfUrl,
      templateId,
    });

    return {
      pdfBuffer,
      filename: `cv-${input.cvId}.pdf`,
    };
  }

  private prepareCVData(cv: any): Record<string, any> {
    return {
      cv: {
        title: cv.title,
        fullName: cv.fullName,
        email: cv.email,
        phoneNumber: cv.phoneNumber,
        dateOfBirth: cv.dateOfBirth,
        gender: cv.gender,
        address: cv.address,
        nationality: cv.nationality,
        avatarUrl: cv.avatarUrl,
        currentPosition: cv.currentPosition,
        summary: cv.summary,
        objective: cv.objective,
      },
      skills: cv.skills || [],
      education: cv.educations || [],
      workExperience: cv.workExperiences || [],
      certifications: cv.certifications || [],
      projects: cv.projects || [],
      languages: cv.languages || [],
      achievements: cv.achievements || [],
      activities: cv.activities || [],
      references: cv.references || [],
    };
  }
}
