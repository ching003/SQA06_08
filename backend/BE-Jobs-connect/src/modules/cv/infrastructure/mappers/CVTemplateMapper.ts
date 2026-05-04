import type { CVTemplate as PrismaCVTemplate } from '@prisma/client';
import { CVTemplate } from '../../domain/entities/CVTemplate.js';

export class CVTemplateMapper {
  static toDomain(raw: PrismaCVTemplate): CVTemplate {
    return new CVTemplate({
      id: raw.id,
      name: raw.name,
      htmlUrl: raw.htmlUrl,
      previewUrl: raw.previewUrl,
      isActive: raw.isActive,
      createdAt: raw.createdAt,
      updatedAt: raw.updatedAt,
    });
  }
}
