import { describe, it, expect, vi, beforeEach } from 'vitest';
import { DuplicateCVUseCase } from '../../src/modules/cv/application/use-cases/DuplicateCVUseCase.js';
import { NotFoundError, AuthorizationError } from '../../src/shared/domain/errors/index.js';

describe('DuplicateCVUseCase', () => {
  let useCase: DuplicateCVUseCase;

  const mockCvRepository = {
    findByIdWithRelations: vi.fn(),
    save: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    useCase = new DuplicateCVUseCase({
      cvRepository: mockCvRepository as any,
    });
  });

  it('TC_CV_DUPLICATE_01: should duplicate CV successfully and reset pdfUrl to null and isMain to false', async () => {
    // Arrange
    const input = {
      cvId: 'cv-10',
      userId: 'user-1',
      newTitle: 'CV ReactJS (Bản sao)',
    };

    const originalCV = {
      id: 'cv-10',
      userId: 'user-1',
      templateId: 'temp-123',
      title: 'CV ReactJS',
      isMain: true,
      pdfUrl: 'https://storage.com/old-pdf.pdf',
      skills: [{ skillName: 'React', level: 'Senior' }],
    };

    mockCvRepository.findByIdWithRelations
      .mockResolvedValueOnce(originalCV) // For original fetching
      .mockResolvedValueOnce({ // For full CV fetching after duplicate save
        id: 'cv-10-copy',
        userId: 'user-1',
        templateId: 'temp-123',
        title: 'CV ReactJS (Bản sao)',
        isMain: false,
        pdfUrl: null,
        skills: [{ skillName: 'React', level: 'Senior' }],
      });

    mockCvRepository.save.mockResolvedValue({ id: 'cv-10-copy' });

    // Act
    const result = await useCase.execute(input);

    // Assert
    expect(result).toBeDefined();
    expect(result.id).toBe('cv-10-copy');
    expect(result.isMain).toBe(false);
    expect(result.pdfUrl).toBeNull();
    expect(mockCvRepository.save).toHaveBeenCalledWith(expect.objectContaining({
      isMain: false,
      title: 'CV ReactJS (Bản sao)',
    }));
  });

  it('TC_CV_DUPLICATE_02: should throw NotFoundError when original CV does not exist', async () => {
    // Arrange
    const input = {
      cvId: 'cv-999',
      userId: 'user-1',
    };

    mockCvRepository.findByIdWithRelations.mockResolvedValue(null);

    // Act & Assert
    await expect(useCase.execute(input)).rejects.toThrow(NotFoundError);
    expect(mockCvRepository.save).not.toHaveBeenCalled();
  });
});
