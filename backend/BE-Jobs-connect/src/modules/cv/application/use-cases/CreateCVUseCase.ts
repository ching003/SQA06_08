import type { ICVRepository } from '../../domain/repositories/ICVRepository.js';
import type { IUserRepository } from '@modules/user/domain/repositories/IUserRepository.js';
import type { ICVTemplateRepository } from '../../domain/repositories/ICVTemplateRepository.js';
import type { IFileStorageService } from '@shared/domain/services/IFileStorageService.js';
import type { IPDFService } from '@shared/domain/services/IPDFService.js';
import { NotFoundError, ValidationError } from '@shared/domain/errors/index.js';
import type { CreateCVInputDTO, CreateCVOutputDTO } from '../dtos/index.js';
import { mapCVToOutput } from '../helpers/index.js';

interface Dependencies {
  cvRepository: ICVRepository;
  userRepository: IUserRepository;
  cvTemplateRepository: ICVTemplateRepository;
  fileStorageService: IFileStorageService;
  pdfService: IPDFService;
}

export class CreateCVUseCase {
  private readonly cvRepository: ICVRepository;
  private readonly userRepository: IUserRepository;
  private readonly cvTemplateRepository: ICVTemplateRepository;
  private readonly fileStorageService: IFileStorageService;
  private readonly pdfService: IPDFService;

  constructor({ cvRepository, userRepository, cvTemplateRepository, fileStorageService, pdfService }: Dependencies) {
    this.cvRepository = cvRepository;
    this.userRepository = userRepository;
    this.cvTemplateRepository = cvTemplateRepository;
    this.fileStorageService = fileStorageService;
    this.pdfService = pdfService;
  }

  async execute(input: CreateCVInputDTO): Promise<CreateCVOutputDTO> {
    // Validate user exists
    const user = await this.userRepository.findById(input.userId);
    if (!user) {
      throw new NotFoundError('User not found');
    }

    // Validate email format if provided
    if (input.email && !this.isValidEmail(input.email)) {
      throw new ValidationError('Invalid email format');
    }

    // Validate template if provided
    if (input.templateId) {
      const template = await this.cvTemplateRepository.findById(input.templateId);
      if (!template) {
        throw new NotFoundError('CV Template not found');
      }
      if (!template.isActive) {
        throw new ValidationError('CV Template is not active');
      }
    }

    // Check if this is the user's first CV
    const existingCVCount = await this.cvRepository.countByUserId(input.userId);
    const isFirst = existingCVCount === 0;

    // If setting as main, unset other main CVs
    if (input.isMain || isFirst) {
      await this.cvRepository.unsetMainForUser(input.userId);
    }

    // Create CV with nested data
    const cvData = {
      userId: input.userId,
      templateId: input.templateId || null,
      title: input.title,
      fullName: input.fullName || null,
      email: input.email || null,
      phoneNumber: input.phoneNumber || null,
      dateOfBirth: input.dateOfBirth || null,
      gender: input.gender || null,
      address: input.address || null,
      currentPosition: input.currentPosition || null,
      summary: input.summary || null,
      objective: input.objective || null,
      isMain: input.isMain ?? isFirst,
      isOpenForJob: input.isOpenForJob ?? false,
      skills: input.skills || [],
      educations: input.educations || [],
      certifications: input.certifications || [],
      workExperiences: input.workExperiences || [],
      projects: input.projects || [],
      languages: input.languages || [],
      achievements: input.achievements || [],
      activities: input.activities || [],
      references: input.references || [],
    };

    const cv = await this.cvRepository.save(cvData as any);

    // Fetch full CV with relations
    const fullCV = await this.cvRepository.findByIdWithRelations(cv.id!);

    // Auto-generate PDF if template is provided
    if (input.templateId) {
      try {
        await this.generateAndSavePDF(cv.id!, input.templateId, fullCV);
      } catch (error) {
        // Log error but don't fail the CV creation
        console.error('Failed to generate PDF during CV creation:', error);
      }
    }

    // Fetch updated CV with pdfUrl if generated
    const updatedCV = await this.cvRepository.findByIdWithRelations(cv.id!);

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
