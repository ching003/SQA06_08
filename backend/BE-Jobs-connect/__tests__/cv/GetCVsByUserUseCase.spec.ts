import { describe, it, expect, vi, beforeEach } from 'vitest';
import { GetCVsByUserUseCase } from '../../src/modules/cv/application/use-cases/GetCVsByUserUseCase.js';
import { NotFoundError, AuthorizationError } from '../../src/shared/domain/errors/index.js';
import { UserRole } from '../../src/modules/user/domain/enums/index.js';

describe('GetCVsByUserUseCase', () => {
  let useCase: GetCVsByUserUseCase;

  const mockCvRepository = {
    findByUserId: vi.fn(),
  };

  const mockUserRepository = {
    findById: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    useCase = new GetCVsByUserUseCase({
      cvRepository: mockCvRepository as any,
      userRepository: mockUserRepository as any,
    });
  });

  it('TC_CV_GETBYUSER_01: should fetch CV list of a user successfully', async () => {
    // Arrange
    const input = {
      userId: 'user-1',
      targetUserId: 'user-1',
      userRole: UserRole.CANDIDATE,
    };

    mockUserRepository.findById.mockResolvedValue({ id: 'user-1', role: 'CANDIDATE' });
    mockCvRepository.findByUserId.mockResolvedValue([
      { id: 'cv-1', userId: 'user-1', title: 'CV 1', isMain: true },
      { id: 'cv-2', userId: 'user-1', title: 'CV 2', isMain: false },
    ]);

    // Act
    const result = await useCase.execute(input);

    // Assert
    expect(result).toBeDefined();
    expect(result.cvs).toHaveLength(2);
    expect(result.cvs[0].id).toBe('cv-1');
    expect(result.cvs[1].id).toBe('cv-2');
    expect(mockCvRepository.findByUserId).toHaveBeenCalledWith('user-1');
  });
});
