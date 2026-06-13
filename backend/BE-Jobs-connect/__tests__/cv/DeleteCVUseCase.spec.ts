import { describe, it, expect, vi, beforeEach } from 'vitest';
import { DeleteCVUseCase } from '../../src/modules/cv/application/use-cases/DeleteCVUseCase.js';
import { NotFoundError, AuthorizationError, ConflictError } from '../../src/shared/domain/errors/index.js';
import { UserRole } from '../../src/modules/user/domain/enums/index.js';

describe('DeleteCVUseCase', () => {
  let useCase: DeleteCVUseCase;

  const mockCvRepository = {
    findById: vi.fn(),
    hasApplications: vi.fn(),
    findByUserId: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    useCase = new DeleteCVUseCase({
      cvRepository: mockCvRepository as any,
    });
  });

  it('TC_CV_DELETE_01: should delete secondary CV successfully', async () => {
    // Arrange
    const input = {
      cvId: 'cv-11',
      userId: 'user-1',
      userRole: UserRole.CANDIDATE,
    };

    const existingCV = {
      id: 'cv-11',
      userId: 'user-1',
      isMain: false,
    };

    mockCvRepository.findById.mockResolvedValue(existingCV);
    mockCvRepository.hasApplications.mockResolvedValue(false);
    mockCvRepository.delete.mockResolvedValue(undefined);

    // Act
    const result = await useCase.execute(input);

    // Assert
    expect(result.success).toBe(true);
    expect(mockCvRepository.delete).toHaveBeenCalledWith('cv-11');
  });

  it('TC_CV_DELETE_02: should block deletion and throw ConflictError when CV has active applications', async () => {
    // Arrange
    const input = {
      cvId: 'cv-12',
      userId: 'user-1',
      userRole: UserRole.CANDIDATE,
    };

    const existingCV = {
      id: 'cv-12',
      userId: 'user-1',
      isMain: false,
    };

    mockCvRepository.findById.mockResolvedValue(existingCV);
    mockCvRepository.hasApplications.mockResolvedValue(true); // CV has active applications

    // Act & Assert
    await expect(useCase.execute(input)).rejects.toThrow(ConflictError);
    expect(mockCvRepository.delete).not.toHaveBeenCalled();
  });

  it('TC_CV_DELETE_03: should auto-promote another CV to main when deleted CV is the main CV', async () => {
    // Arrange
    const input = {
      cvId: 'cv-10',
      userId: 'user-1',
      userRole: UserRole.CANDIDATE,
    };

    const existingCV = {
      id: 'cv-10',
      userId: 'user-1',
      isMain: true, // It is the main CV
    };

    const userCVs = [
      { id: 'cv-10', userId: 'user-1', createdAt: '2026-06-13T00:00:00.000Z' },
      { id: 'cv-20', userId: 'user-1', createdAt: '2026-06-13T01:00:00.000Z' },
    ];

    mockCvRepository.findById.mockResolvedValue(existingCV);
    mockCvRepository.hasApplications.mockResolvedValue(false);
    mockCvRepository.findByUserId.mockResolvedValue(userCVs);
    mockCvRepository.update.mockResolvedValue(undefined);
    mockCvRepository.delete.mockResolvedValue(undefined);

    // Act
    const result = await useCase.execute(input);

    // Assert
    expect(result.success).toBe(true);
    expect(mockCvRepository.update).toHaveBeenCalledWith('cv-20', { isMain: true });
    expect(mockCvRepository.delete).toHaveBeenCalledWith('cv-10');
  });
});
