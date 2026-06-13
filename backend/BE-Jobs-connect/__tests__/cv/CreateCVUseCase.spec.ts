import { describe, it, expect, vi, beforeEach } from 'vitest';
import { CreateCVUseCase } from '../../src/modules/cv/application/use-cases/CreateCVUseCase.js';
import { NotFoundError, ValidationError, ConflictError } from '../../src/shared/domain/errors/index.js';

describe('CreateCVUseCase', () => {
  let useCase: CreateCVUseCase;

  const mockCvRepository = {
    save: vi.fn(),
    findById: vi.fn(),
    findByIdWithRelations: vi.fn(),
    update: vi.fn(),
    countByUserId: vi.fn(),
    unsetMainForUser: vi.fn(),
    delete: vi.fn(),
  };

  const mockUserRepository = {
    findById: vi.fn(),
  };

  const mockCvTemplateRepository = {
    findById: vi.fn(),
  };

  const mockFileStorageService = {
    uploadFile: vi.fn(),
    deleteFile: vi.fn(),
  };

  const mockPdfService = {
    renderTemplate: vi.fn(),
    generatePDF: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    useCase = new CreateCVUseCase({
      cvRepository: mockCvRepository as any,
      userRepository: mockUserRepository as any,
      cvTemplateRepository: mockCvTemplateRepository as any,
      fileStorageService: mockFileStorageService as any,
      pdfService: mockPdfService as any,
    });
  });

  it('TC_CV_CREATE_01: should create CV successfully with valid data', async () => {
    // Arrange
    const input = {
      userId: '1',
      title: 'CV Node.js',
      fullName: 'Nguyen Van A',
      phoneNumber: '0912345678',
      email: 'an@gmail.com',
      skills: ['Node.js', 'SQL'],
      templateId: 'temp-123',
    };

    mockUserRepository.findById.mockResolvedValue({ id: '1', role: 'CANDIDATE' });
    mockCvTemplateRepository.findById.mockResolvedValue({ id: 'temp-123', isActive: true, htmlUrl: 'http://template-url' });
    mockCvRepository.countByUserId.mockResolvedValue(0);
    mockCvRepository.save.mockResolvedValue({ id: 'cv-123', ...input });
    mockCvRepository.findByIdWithRelations.mockResolvedValue({ id: 'cv-123', ...input });
    
    // Mock global fetch
    const mockResponse = {
      ok: true,
      text: async () => '<html>{{cv.fullName}}</html>',
    };
    global.fetch = vi.fn().mockResolvedValue(mockResponse);

    mockPdfService.renderTemplate.mockReturnValue('rendered-html');
    mockPdfService.generatePDF.mockResolvedValue(Buffer.from('pdf-buffer'));
    mockFileStorageService.uploadFile.mockResolvedValue('https://storage.com/cv-123.pdf');

    // Act
    const result = await useCase.execute(input);

    // Assert
    expect(result).toBeDefined();
    expect(mockUserRepository.findById).toHaveBeenCalledWith('1');
    expect(mockCvRepository.save).toHaveBeenCalled();
    expect(mockPdfService.generatePDF).toHaveBeenCalled();
    expect(mockFileStorageService.uploadFile).toHaveBeenCalled();
  });

  it('TC_CV_CREATE_02: should throw ValidationError when email format is invalid', async () => {
    // Arrange
    const input = {
      userId: '1',
      title: 'CV Node.js',
      fullName: 'Nguyen Van A',
      email: 'invalid-email-format',
    };

    mockUserRepository.findById.mockResolvedValue({ id: '1', role: 'CANDIDATE' });

    // Act & Assert
    await expect(useCase.execute(input)).rejects.toThrow(ValidationError);
    expect(mockCvRepository.save).not.toHaveBeenCalled();
  });

  it('TC_CV_CREATE_03: should throw ConflictError when CV title is duplicated for the same user', async () => {
    // Arrange
    const input = {
      userId: '1',
      title: 'CV Node.js',
      fullName: 'Nguyen Van A',
    };

    mockUserRepository.findById.mockResolvedValue({ id: '1', role: 'CANDIDATE' });
    // Simulate repository throwing ConflictError due to unique constraint on title for the user
    mockCvRepository.save.mockRejectedValue(new ConflictError('CV title already exists'));

    // Act & Assert
    await expect(useCase.execute(input)).rejects.toThrow(ConflictError);
  });
});
