import type { CVOutputDTO } from '../dtos/CVDTO.js';

export function mapCVToOutput(cv: any): CVOutputDTO {
  return {
    id: cv.id,
    userId: cv.userId,
    templateId: cv.templateId,
    title: cv.title,
    fullName: cv.fullName,
    email: cv.email,
    phoneNumber: cv.phoneNumber,
    dateOfBirth: cv.dateOfBirth,
    gender: cv.gender,
    address: cv.address,
    currentPosition: cv.currentPosition,
    summary: cv.summary,
    objective: cv.objective,
    isMain: cv.isMain,
    isOpenForJob: cv.isOpenForJob,
    pdfUrl: cv.pdfUrl,
    lastGeneratedAt: cv.lastGeneratedAt,
    createdAt: cv.createdAt,
    updatedAt: cv.updatedAt,
    user: cv.user
      ? {
          id: cv.user.id,
          email: cv.user.email,
          fullName: cv.user.fullName,
          avatarUrl: cv.user.avatarUrl,
          status: cv.user.status,
        }
      : undefined,
    template: cv.template
      ? {
          id: cv.template.id,
          name: cv.template.name,
          htmlUrl: cv.template.htmlUrl,
          previewUrl: cv.template.previewUrl,
          isActive: cv.template.isActive,
        }
      : undefined,
    skills: cv.skills?.map((s: any) => ({
      id: s.id,
      skillName: s.skillName,
      level: s.level,
      yearsOfExperience: s.yearsOfExperience,
    })),
    educations: cv.educations?.map((e: any) => ({
      id: e.id,
      institution: e.institution,
      degree: e.degree,
      startDate: e.startDate,
      endDate: e.endDate,
      description: e.description,
    })),
    certifications: cv.certifications?.map((c: any) => ({
      id: c.id,
      name: c.name,
      issuer: c.issuer,
      acquiredAt: c.acquiredAt,
      description: c.description,
    })),
    workExperiences: cv.workExperiences?.map((w: any) => ({
      id: w.id,
      title: w.title,
      company: w.company,
      startDate: w.startDate,
      endDate: w.endDate,
      description: w.description,
    })),
    projects: cv.projects?.map((p: any) => ({
      id: p.id,
      name: p.name,
      description: p.description,
      startDate: p.startDate,
      endDate: p.endDate,
      url: p.url,
      role: p.role,
    })),
    languages: cv.languages?.map((l: any) => ({
      id: l.id,
      name: l.name,
      level: l.level,
      description: l.description,
    })),
    achievements: cv.achievements?.map((a: any) => ({
      id: a.id,
      title: a.title,
      description: a.description,
      acquiredAt: a.acquiredAt,
    })),
    activities: cv.activities?.map((a: any) => ({
      id: a.id,
      title: a.title,
      organization: a.organization,
      startDate: a.startDate,
      endDate: a.endDate,
      description: a.description,
    })),
    references: cv.references?.map((r: any) => ({
      id: r.id,
      name: r.name,
      position: r.position,
      company: r.company,
      description: r.description,
    })),
  };
}
