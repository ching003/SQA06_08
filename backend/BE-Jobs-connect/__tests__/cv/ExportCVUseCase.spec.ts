import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ExportCVUseCase } from '../../src/modules/cv/application/use-cases/ExportCVUseCase.js';
import { NotFoundError, AuthorizationError, ValidationError } from '../../src/shared/domain/errors/index.js';
import { UserRole } from '../../src/modules/user/domain/enums/index.js';

describe('ExportCVUseCase', () => {
  let useCase: ExportCVUseCase;

  const mockCvRepository = {
    findByIdWithRelations: vi.fn(),
    update: vi.fn(),
  };

  const mockCvTemplateRepository = {
    findById: vi.fn(),
  };

  const mockFileStorageService = {
    uploadFile: vi.fn(),
  };

  const mockPdfService = {
    renderTemplate: vi.fn(),
    generatePDF: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    useCase = new ExportCVUseCase({
      cvRepository: mockCvRepository as any,
      cvTemplateRepository: mockCvTemplateRepository as any,
      fileStorageService: mockFileStorageService as any,
      pdfService: mockPdfService as any,
    });
  });

  it('TC_CV_EXPORT_01: should export CV successfully and upload PDF to Firebase Storage', async () => {
    // Arrange
    const input = {
      cvId: 'cv-10',
      userId: 'user-1',
      userRole: UserRole.CANDIDATE,
      templateId: 'temp-123',
      forceRegenerate: true,
    };

    const cv = {
      id: 'cv-10',
      userId: 'user-1',
      templateId: 'temp-123',
      isOpenForJob: true,
    };

    mockCvRepository.findByIdWithRelations.mockResolvedValue(cv);
    mockCvTemplateRepository.findById.mockResolvedValue({ id: 'temp-123', isActive: true, htmlUrl: 'http://template-url' });
    
    // Mock global fetch for template HTML
    const mockResponse = {
      ok: true,
      text: async () => '<html>{{cv.fullName}}</html>',
    };
    global.fetch = vi.fn().mockResolvedValue(mockResponse);

    mockPdfService.renderTemplate.mockReturnValue('rendered-html');
    mockPdfService.generatePDF.mockResolvedValue(Buffer.from('pdf-buffer'));
    mockFileStorageService.uploadFile.mockResolvedValue('https://storage.com/cv-10.pdf');
    mockCvRepository.update.mockResolvedValue(undefined);

    // Act
    const result = await useCase.execute(input);

    // Assert
    expect(result).toBeDefined();
    expect(result.filename).toBe('cv-cv-10.pdf');
    expect(mockFileStorageService.uploadFile).toHaveBeenCalled();
    expect(mockCvRepository.update).toHaveBeenCalledWith('cv-10', {
      pdfUrl: 'https://storage.com/cv-10.pdf',
      templateId: 'temp-123',
    });
  });

  it('TC_CV_EXPORT_02: should update CV with new pdfUrl on duplicate export or republish', async () => {
    // Arrange
    const input = {
      cvId: 'cv-10',
      userId: 'user-1',
      userRole: UserRole.CANDIDATE,
      templateId: 'temp-123',
      forceRegenerate: true, // Force to trigger upload and update
    };

    const cv = {
      id: 'cv-10',
      userId: 'user-1',
      templateId: 'temp-123',
      pdfUrl: 'https://storage.com/old-cv-10.pdf',
      isOpenForJob: true,
    };

    mockCvRepository.findByIdWithRelations.mockResolvedValue(cv);
    mockCvTemplateRepository.findById.mockResolvedValue({ id: 'temp-123', isActive: true, htmlUrl: 'http://template-url' });
    
    const mockResponse = {
      ok: true,
      text: async () => '<html>{{cv.fullName}}</html>',
    };
    global.fetch = vi.fn().mockResolvedValue(mockResponse);

    mockPdfService.renderTemplate.mockReturnValue('rendered-html');
    mockPdfService.generatePDF.mockResolvedValue(Buffer.from('pdf-buffer'));
    mockFileStorageService.uploadFile.mockResolvedValue('https://storage.com/new-cv-10.pdf');
    mockCvRepository.update.mockResolvedValue(undefined);

    // Act
    await useCase.execute(input);

    // Assert
    expect(mockCvRepository.update).toHaveBeenCalledWith('cv-10', {
      pdfUrl: 'https://storage.com/new-cv-10.pdf',
      templateId: 'temp-123',
    });
  });

  it('TC_CV_EXPORT_03: should throw error when external PDF service fails', async () => {
    // Arrange
    const input = {
      cvId: 'cv-10',
      userId: 'user-1',
      userRole: UserRole.CANDIDATE,
      templateId: 'temp-123',
      forceRegenerate: true,
    };

    const cv = {
      id: 'cv-10',
      userId: 'user-1',
      templateId: 'temp-123',
    };

    mockCvRepository.findByIdWithRelations.mockResolvedValue(cv);
    mockCvTemplateRepository.findById.mockResolvedValue({ id: 'temp-123', isActive: true, htmlUrl: 'http://template-url' });
    
    const mockResponse = {
      ok: true,
      text: async () => '<html>{{cv.fullName}}</html>',
    };
    global.fetch = vi.fn().mockResolvedValue(mockResponse);

    mockPdfService.renderTemplate.mockReturnValue('rendered-html');
    // PDF Generation throws an error
    mockPdfService.generatePDF.mockRejectedValue(new Error('PDF generation timed out'));

    // Act & Assert
    await expect(useCase.execute(input)).rejects.toThrow('PDF generation timed out');
    expect(mockFileStorageService.uploadFile).not.toHaveBeenCalled();
    expect(mockCvRepository.update).not.toHaveBeenCalled();
  });
});
