import type { ICVRepository } from '../../domain/repositories/ICVRepository.js';
import type { ICVTemplateRepository } from '../../domain/repositories/ICVTemplateRepository.js';
import type { IFileStorageService } from '@shared/domain/services/IFileStorageService.js';
import type { IPDFService } from '@shared/domain/services/IPDFService.js';
import { NotFoundError, AuthorizationError, ValidationError } from '@shared/domain/errors/index.js';
import { UserRole } from '@modules/user/domain/enums/index.js';
import type { UpdateCVInputDTO, UpdateCVOutputDTO } from '../dtos/index.js';
import { mapCVToOutput } from '../helpers/index.js';

interface Dependencies {
  cvRepository: ICVRepository;
  cvTemplateRepository: ICVTemplateRepository;
  fileStorageService: IFileStorageService;
  pdfService: IPDFService;
}

export class UpdateCVUseCase {
  private readonly cvRepository: ICVRepository;
  private readonly cvTemplateRepository: ICVTemplateRepository;
  private readonly fileStorageService: IFileStorageService;
  private readonly pdfService: IPDFService;

  constructor({ cvRepository, cvTemplateRepository, fileStorageService, pdfService }: Dependencies) {
    this.cvRepository = cvRepository;
    this.cvTemplateRepository = cvTemplateRepository;
    this.fileStorageService = fileStorageService;
    this.pdfService = pdfService;
  }

  async execute(input: UpdateCVInputDTO): Promise<UpdateCVOutputDTO> {
    // Find existing CV
    const existingCV = await this.cvRepository.findById(input.cvId);
    if (!existingCV) {
      throw new NotFoundError('Không tìm thấy CV');
    }

    // Check permission
    const isOwner = input.userId === (existingCV as any).userId;
    const isAdmin = input.userRole === UserRole.ADMIN;

    if (!isOwner && !isAdmin) {
      throw new AuthorizationError('Bạn không có quyền cập nhật CV này');
    }

    // Validate email format if provided
    if (input.email && !this.isValidEmail(input.email)) {
      throw new ValidationError('Định dạng email không hợp lệ');
    }

    // Validate template if provided
    if (input.templateId) {
      const template = await this.cvTemplateRepository.findById(input.templateId);
      if (!template) {
        throw new NotFoundError('Không tìm thấy mẫu CV');
      }
      if (!template.isActive) {
        throw new ValidationError('Mẫu CV không còn hoạt động');
      }
    }

    // If setting as main, unset other main CVs
    if (input.isMain && !(existingCV as any).isMain) {
      await this.cvRepository.unsetMainForUser((existingCV as any).userId);
    }

    // Build update data
    const updateData: any = {};
    if (input.templateId !== undefined) updateData.templateId = input.templateId;
    if (input.title !== undefined) updateData.title = input.title;
    if (input.fullName !== undefined) updateData.fullName = input.fullName;
    if (input.email !== undefined) updateData.email = input.email;
    if (input.phoneNumber !== undefined) updateData.phoneNumber = input.phoneNumber;
    if (input.dateOfBirth !== undefined) updateData.dateOfBirth = input.dateOfBirth;
    if (input.gender !== undefined) updateData.gender = input.gender;
    if (input.address !== undefined) updateData.address = input.address;
    if (input.currentPosition !== undefined) updateData.currentPosition = input.currentPosition;
    if (input.summary !== undefined) updateData.summary = input.summary;
    if (input.objective !== undefined) updateData.objective = input.objective;
    if (input.isMain !== undefined) updateData.isMain = input.isMain;
    if (input.isOpenForJob !== undefined) updateData.isOpenForJob = input.isOpenForJob;
    if (input.skills !== undefined) updateData.skills = input.skills;
    if (input.educations !== undefined) updateData.educations = input.educations;
    if (input.certifications !== undefined) updateData.certifications = input.certifications;
    if (input.workExperiences !== undefined) updateData.workExperiences = input.workExperiences;
    if (input.projects !== undefined) updateData.projects = input.projects;
    if (input.languages !== undefined) updateData.languages = input.languages;
    if (input.achievements !== undefined) updateData.achievements = input.achievements;
    if (input.activities !== undefined) updateData.activities = input.activities;
    if (input.references !== undefined) updateData.references = input.references;

    // Check if CV content has changed (not just isMain or isOpenForJob)
    const hasContentChange = Object.keys(updateData).some(
      key => key !== 'isMain' && key !== 'isOpenForJob'
    );

    await this.cvRepository.update(input.cvId, updateData);

    // Fetch updated CV with relations
    let updatedCV = await this.cvRepository.findByIdWithRelations(input.cvId);

    // Auto-regenerate PDF if content changed and CV has a template
    const finalTemplateId = input.templateId !== undefined ? input.templateId : (existingCV as any).templateId;
    if (hasContentChange && finalTemplateId) {
      try {
        await this.generateAndSavePDF(input.cvId, finalTemplateId, updatedCV);
        // Fetch again to get updated pdfUrl
        updatedCV = await this.cvRepository.findByIdWithRelations(input.cvId);
      } catch (error) {
        // Log error but don't fail the CV update
        console.error('Failed to generate PDF during CV update:', error);
      }
    }

    return mapCVToOutput(updatedCV!);
  }

  private async generateAndSavePDF(cvId: string, templateId: string, cvData: any): Promise<void> {
    // Find template
    const template = await this.cvTemplateRepository.findById(templateId);
    if (!template || !template.isActive) {
      return; // Skip PDF generation if template is not available
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
      return; // Skip PDF generation if template fetch fails
    }

    // Prepare CV data for template
    const preparedData = this.prepareCVData(cvData);

    // Render template with CV data
    const renderedHtml = this.pdfService.renderTemplate(templateHtml, preparedData);

    // Generate PDF
    const pdfBuffer = await this.pdfService.generatePDF(renderedHtml);

    // Upload PDF to Firebase Storage
    const pdfFilename = `cv-${cvId}-${Date.now()}.pdf`;
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

    // Update CV with pdfUrl
    await this.cvRepository.update(cvId, { pdfUrl });
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

  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }
}
