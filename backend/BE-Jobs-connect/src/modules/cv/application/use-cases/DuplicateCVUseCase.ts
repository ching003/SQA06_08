import type { ICVRepository } from '../../domain/repositories/ICVRepository.js';
import { NotFoundError, AuthorizationError } from '@shared/domain/errors/index.js';
import type { DuplicateCVInputDTO, DuplicateCVOutputDTO } from '../dtos/index.js';
import { mapCVToOutput } from '../helpers/index.js';

interface Dependencies {
  cvRepository: ICVRepository;
}

export class DuplicateCVUseCase {
  private readonly cvRepository: ICVRepository;

  constructor({ cvRepository }: Dependencies) {
    this.cvRepository = cvRepository;
  }

  async execute(input: DuplicateCVInputDTO): Promise<DuplicateCVOutputDTO> {
    // Get the original CV with all relations
    const originalCV = await this.cvRepository.findByIdWithRelations(input.cvId);
    if (!originalCV) {
      throw new NotFoundError('Không tìm thấy CV');
    }

    // Check permission: user can only duplicate their own CVs
    if (originalCV.userId !== input.userId) {
      throw new AuthorizationError('Bạn chỉ có thể nhân bản CV của mình');
    }

    // Create duplicate CV data (exclude id, pdfUrl, createdAt, updatedAt)
    const duplicateData = {
      userId: input.userId,
      templateId: originalCV.templateId,
      title: input.newTitle || `${originalCV.title} (Copy)`,
      fullName: originalCV.fullName,
      email: originalCV.email,
      phoneNumber: originalCV.phoneNumber,
      dateOfBirth: originalCV.dateOfBirth,
      gender: originalCV.gender,
      address: originalCV.address,
      currentPosition: originalCV.currentPosition,
      summary: originalCV.summary,
      objective: originalCV.objective,
      isMain: false, // Duplicated CV should not be main by default
      isOpenForJob: input.isOpenForJob !== undefined ? input.isOpenForJob : originalCV.isOpenForJob,
      skills: originalCV.skills?.map((s) => ({
        skillName: s.skillName,
        level: s.level,
        yearsOfExperience: s.yearsOfExperience,
      })) || [],
      educations: originalCV.educations?.map((e) => ({
        institution: e.institution,
        degree: e.degree,
        startDate: e.startDate,
        endDate: e.endDate,
        description: e.description,
      })) || [],
      certifications: originalCV.certifications?.map((c) => ({
        name: c.name,
        issuer: c.issuer,
        acquiredAt: c.acquiredAt,
        description: c.description,
      })) || [],
      workExperiences: originalCV.workExperiences?.map((w) => ({
        title: w.title,
        company: w.company,
        startDate: w.startDate,
        endDate: w.endDate,
        description: w.description,
      })) || [],
      projects: originalCV.projects?.map((p) => ({
        name: p.name,
        description: p.description,
        startDate: p.startDate,
        endDate: p.endDate,
        url: p.url,
        role: p.role,
      })) || [],
      languages: originalCV.languages?.map((l) => ({
        name: l.name,
        level: l.level,
        description: l.description,
      })) || [],
      achievements: originalCV.achievements?.map((a) => ({
        title: a.title,
        description: a.description,
        acquiredAt: a.acquiredAt,
      })) || [],
      activities: originalCV.activities?.map((a) => ({
        title: a.title,
        organization: a.organization,
        startDate: a.startDate,
        endDate: a.endDate,
        description: a.description,
      })) || [],
      references: originalCV.references?.map((r) => ({
        name: r.name,
        position: r.position,
        company: r.company,
        description: r.description,
      })) || [],
    };

    // Save the duplicated CV
    const duplicatedCV = await this.cvRepository.save(duplicateData as any);

    // Fetch full CV with relations
    const fullCV = await this.cvRepository.findByIdWithRelations(duplicatedCV.id!);

    return mapCVToOutput(fullCV!);
  }
}

