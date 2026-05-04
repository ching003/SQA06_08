import { SavedCV } from '../../domain/entities/SavedCV.js';
import { CVMapper } from './CVMapper.js';

interface PrismaSavedCV {
  id: string;
  userId: string;
  cvId: string;
  notes: string | null;
  createdAt: Date;
  updatedAt: Date;
}

type PrismaSavedCVWithRelations = PrismaSavedCV & {
  cv?: any;
  user?: {
    id: string;
    email: string;
    fullName: string | null;
    avatarUrl: string | null;
  } | null;
};

export class SavedCVMapper {
  static toDomain(raw: PrismaSavedCV): SavedCV {
    return new SavedCV({
      id: raw.id,
      userId: raw.userId,
      cvId: raw.cvId,
      notes: raw.notes,
      createdAt: raw.createdAt,
      updatedAt: raw.updatedAt,
    });
  }

  static toDomainWithRelations(raw: PrismaSavedCVWithRelations): any {
    return {
      id: raw.id,
      userId: raw.userId,
      cvId: raw.cvId,
      notes: raw.notes,
      createdAt: raw.createdAt,
      updatedAt: raw.updatedAt,
      cv: raw.cv ? CVMapper.toDomainWithRelations(raw.cv) : undefined,
      user: raw.user
        ? {
            id: raw.user.id,
            email: raw.user.email,
            fullName: raw.user.fullName,
            avatarUrl: raw.user.avatarUrl,
          }
        : undefined,
    };
  }
}
