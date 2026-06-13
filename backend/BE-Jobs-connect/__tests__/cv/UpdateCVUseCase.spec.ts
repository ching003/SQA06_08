import { describe, it, expect, vi, beforeEach } from 'vitest';
import { UpdateCVUseCase } from '../../src/modules/cv/application/use-cases/UpdateCVUseCase.js';
import { NotFoundError, AuthorizationError, ValidationError } from '../../src/shared/domain/errors/index.js';
import { UserRole } from '../../src/modules/user/domain/enums/index.js';

describe('UpdateCVUseCase', () => {
  let useCase: UpdateCVUseCase;

  const mockCvRepository = {
    findById: vi.fn(),
    update: vi.fn(),
    findByIdWithRelations: vi.fn(),
    unsetMainForUser: vi.fn(),
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
    useCase = new UpdateCVUseCase({
      cvRepository: mockCvRepository as any,
      cvTemplateRepository: mockCvTemplateRepository as any,
      fileStorageService: mockFileStorageService as any,
      pdfService: mockPdfService as any,
    });
  });

  it('TC_CV_UPDATE_01: should update CV successfully by owner', async () => {
    // Arrange
    const input = {
      cvId: 'cv-123',
      userId: 'user-1',
      userRole: UserRole.CANDIDATE,
      title: 'CV ReactJS',
      skills: ['React', 'TypeScript'],
      templateId: 'temp-123',
    };

    const existingCV = {
      id: 'cv-123',
      userId: 'user-1',
      isMain: false,
      templateId: 'temp-123',
    };

    mockCvRepository.findById.mockResolvedValue(existingCV);
    mockCvTemplateRepository.findById.mockResolvedValue({ id: 'temp-123', isActive: true, htmlUrl: 'http://template-url' });
    mockCvRepository.update.mockResolvedValue({ id: 'cv-123', ...existingCV, ...input });
    mockCvRepository.findByIdWithRelations.mockResolvedValue({ id: 'cv-123', ...existingCV, ...input });

    // Mock global fetch
    const mockResponse = {
      ok: true,
      text: async () => '<html>{{cv.fullName}}</html>',
    };
    global.fetch = vi.fn().mockResolvedValue(mockResponse);

    mockPdfService.renderTemplate.mockReturnValue('rendered-html');
    mockPdfService.generatePDF.mockResolvedValue(Buffer.from('pdf-buffer'));
    mockFileStorageService.uploadFile.mockResolvedValue('https://storage.com/cv-123-new.pdf');

    // Act
    const result = await useCase.execute(input);

    // Assert
    expect(result).toBeDefined();
    expect(mockCvRepository.update).toHaveBeenCalledWith('cv-123', expect.any(Object));
  });

  it('TC_CV_UPDATE_02: should throw AuthorizationError when non-owner tries to update CV', async () => {
    // Arrange
    const input = {
      cvId: 'cv-123',
      userId: 'user-2', // Different user
      userRole: UserRole.CANDIDATE,
      title: 'CV Hack',
    };

    const existingCV = {
      id: 'cv-123',
      userId: 'user-1',
    };

    mockCvRepository.findById.mockResolvedValue(existingCV);

    // Act & Assert
    await expect(useCase.execute(input)).rejects.toThrow(AuthorizationError);
    expect(mockCvRepository.update).not.toHaveBeenCalled();
  });

  it('TC_CV_UPDATE_03: should throw NotFoundError when CV does not exist', async () => {
    // Arrange
    const input = {
      cvId: 'cv-999',
      userId: 'user-1',
      userRole: UserRole.CANDIDATE,
      title: 'CV ReactJS',
    };

    mockCvRepository.findById.mockResolvedValue(null);

    // Act & Assert
    await expect(useCase.execute(input)).rejects.toThrow(NotFoundError);
  });
});
