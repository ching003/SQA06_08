import { describe, it, expect, vi, beforeEach } from 'vitest';
import { GetCVByIdUseCase } from '../../src/modules/cv/application/use-cases/GetCVByIdUseCase.js';
import { NotFoundError, AuthorizationError } from '../../src/shared/domain/errors/index.js';
import { UserRole } from '../../src/modules/user/domain/enums/index.js';

describe('GetCVByIdUseCase', () => {
  let useCase: GetCVByIdUseCase;

  const mockCvRepository = {
    findByIdWithRelations: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    useCase = new GetCVByIdUseCase({
      cvRepository: mockCvRepository as any,
    });
  });

  it('TC_CV_GETBYID_01: should fetch CV details successfully by owner', async () => {
    // Arrange
    const input = {
      cvId: 'cv-10',
      userId: 'user-1',
      userRole: UserRole.CANDIDATE,
    };

    const cv = {
      id: 'cv-10',
      userId: 'user-1',
      title: 'CV ReactJS',
      isMain: true,
    };

    mockCvRepository.findByIdWithRelations.mockResolvedValue(cv);

    // Act
    const result = await useCase.execute(input);

    // Assert
    expect(result).toBeDefined();
    expect(result.id).toBe('cv-10');
    expect(mockCvRepository.findByIdWithRelations).toHaveBeenCalledWith('cv-10');
  });

  it('TC_CV_GETBYID_02: should throw AuthorizationError when another candidate tries to view CV', async () => {
    // Arrange
    const input = {
      cvId: 'cv-10',
      userId: 'user-2', // different user
      userRole: UserRole.CANDIDATE,
    };

    const cv = {
      id: 'cv-10',
      userId: 'user-1', // owned by user-1
      isOpenForJob: false,
    };

    mockCvRepository.findByIdWithRelations.mockResolvedValue(cv);

    // Act & Assert
    await expect(useCase.execute(input)).rejects.toThrow(AuthorizationError);
  });
});
