import { describe, it, expect, vi, beforeEach } from 'vitest';
import { SetMainCVUseCase } from '../../src/modules/cv/application/use-cases/SetMainCVUseCase.js';
import { NotFoundError, AuthorizationError } from '../../src/shared/domain/errors/index.js';
import { UserRole } from '../../src/modules/user/domain/enums/index.js';

describe('SetMainCVUseCase', () => {
  let useCase: SetMainCVUseCase;

  const mockCvRepository = {
    findById: vi.fn(),
    unsetMainForUser: vi.fn(),
    update: vi.fn(),
    findByIdWithRelations: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    useCase = new SetMainCVUseCase({
      cvRepository: mockCvRepository as any,
    });
  });

  it('TC_CV_SETMAIN_01: should set main CV successfully and demote other CVs', async () => {
    // Arrange
    const input = {
      cvId: 'cv-13',
      userId: 'user-1',
      userRole: UserRole.CANDIDATE,
    };

    const existingCV = {
      id: 'cv-13',
      userId: 'user-1',
      isMain: false,
    };

    mockCvRepository.findById.mockResolvedValue(existingCV);
    mockCvRepository.unsetMainForUser.mockResolvedValue(undefined);
    mockCvRepository.update.mockResolvedValue(undefined);
    mockCvRepository.findByIdWithRelations.mockResolvedValue({
      id: 'cv-13',
      userId: 'user-1',
      isMain: true,
    });

    // Act
    const result = await useCase.execute(input);

    // Assert
    expect(result).toBeDefined();
    expect(result.isMain).toBe(true);
    expect(mockCvRepository.unsetMainForUser).toHaveBeenCalledWith('user-1');
    expect(mockCvRepository.update).toHaveBeenCalledWith('cv-13', { isMain: true });
  });

  it('TC_CV_SETMAIN_02: should throw NotFoundError when CV does not exist', async () => {
    // Arrange
    const input = {
      cvId: 'cv-999',
      userId: 'user-1',
      userRole: UserRole.CANDIDATE,
    };

    mockCvRepository.findById.mockResolvedValue(null);

    // Act & Assert
    await expect(useCase.execute(input)).rejects.toThrow(NotFoundError);
    expect(mockCvRepository.update).not.toHaveBeenCalled();
  });
});
