import type { PrismaClient, Gender as PrismaGender, SkillLevel as PrismaSkillLevel, LanguageLevel as PrismaLanguageLevel } from '@prisma/client';
import type { ICVRepository, FindAllCVsOptions, SearchCVsOptions, FindRecommendedForJobOptions, PaginatedResult } from '../../domain/repositories/ICVRepository.js';
import { CV } from '../../domain/entities/CV.js';
import { CVMapper } from '../mappers/CVMapper.js';

interface Dependencies {
  prisma: PrismaClient;
}

const cvIncludeAll = {
  user: {
    select: {
      id: true,
      email: true,
      fullName: true,
      phoneNumber: true,
      avatarUrl: true,
      dateOfBirth: true,
      gender: true,
      status: true,
      role: true,
      lastLoginAt: true,
      createdAt: true,
      updatedAt: true,
    },
  },
  template: true,
  skills: true,
  educations: true,
  certifications: true,
  workExperiences: true,
  projects: true,
  languages: true,
  achievements: true,
  activities: true,
  references: true,
};

export class PrismaCVRepository implements ICVRepository {
  private readonly prisma: PrismaClient;

  constructor({ prisma }: Dependencies) {
    this.prisma = prisma;
  }

  async findById(id: string, include?: Record<string, unknown>): Promise<CV | null> {
    const cv = await this.prisma.cV.findUnique({
      where: { id },
      include: include as any,
    });

    if (!cv) return null;
    return CVMapper.toDomain(cv);
  }

  async findByIdWithRelations(id: string): Promise<CV | null> {
    const cv = await this.prisma.cV.findUnique({
      where: { id },
      include: cvIncludeAll,
    });

    if (!cv) return null;
    return CVMapper.toDomainWithRelations(cv);
  }

  async findByUserId(userId: string, options?: FindAllCVsOptions): Promise<CV[]> {
    const cvs = await this.prisma.cV.findMany({
      where: { userId },
      include: cvIncludeAll,
      orderBy: options?.orderBy || { createdAt: 'desc' },
    });

    return cvs.map((cv) => CVMapper.toDomainWithRelations(cv));
  }

  async findMainCVByUserId(userId: string): Promise<CV | null> {
    const cv = await this.prisma.cV.findFirst({
      where: { userId, isMain: true },
      include: cvIncludeAll,
    });

    if (!cv) return null;
    return CVMapper.toDomainWithRelations(cv);
  }

  async findAll(options: FindAllCVsOptions): Promise<PaginatedResult<CV>> {
    const { page = 1, limit = 10, userId, isMain, isOpenForJob, orderBy } = options;
    const skip = (page - 1) * limit;

    const where: Record<string, unknown> = {};
    if (userId) where.userId = userId;
    if (isMain !== undefined) where.isMain = isMain;
    if (isOpenForJob !== undefined) where.isOpenForJob = isOpenForJob;

    const [cvs, total] = await Promise.all([
      this.prisma.cV.findMany({
        where,
        skip,
        take: limit,
        orderBy: orderBy || { createdAt: 'desc' },
        include: cvIncludeAll,
      }),
      this.prisma.cV.count({ where }),
    ]);

    return {
      data: cvs.map((cv) => CVMapper.toDomainWithRelations(cv)),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async searchCVs(options: SearchCVsOptions): Promise<PaginatedResult<CV>> {
    const { skills, location, educationLevel, search, page = 1, limit = 10 } = options;
    const skip = (page - 1) * limit;

    const where: any = {
      isOpenForJob: true,
    };

    const orConditions: any[] = [];

    if (search) {
      orConditions.push(
        { fullName: { contains: search, mode: 'insensitive' } },
        { currentPosition: { contains: search, mode: 'insensitive' } },
        { summary: { contains: search, mode: 'insensitive' } },
        { objective: { contains: search, mode: 'insensitive' } },
        { skills: { some: { skillName: { contains: search, mode: 'insensitive' } } } },
        { workExperiences: { some: { title: { contains: search, mode: 'insensitive' } } } },
        { workExperiences: { some: { company: { contains: search, mode: 'insensitive' } } } },
        { educations: { some: { degree: { contains: search, mode: 'insensitive' } } } },
        { educations: { some: { institution: { contains: search, mode: 'insensitive' } } } }
      );
    }

    if (orConditions.length > 0) {
      where.OR = orConditions;
    }

    if (skills && skills.length > 0) {
      where.skills = {
        some: {
          skillName: {
            in: skills,
            mode: 'insensitive',
          },
        },
      };
    }

    if (location) {
      where.address = { contains: location, mode: 'insensitive' };
    }

    if (educationLevel) {
      where.educations = {
        some: {
          degree: { contains: educationLevel, mode: 'insensitive' },
        },
      };
    }

    const [cvs, total] = await Promise.all([
      this.prisma.cV.findMany({
        where,
        skip,
        take: limit,
        orderBy: { updatedAt: 'desc' },
        include: cvIncludeAll,
      }),
      this.prisma.cV.count({ where }),
    ]);

    return {
      data: cvs.map((cv) => CVMapper.toDomainWithRelations(cv)),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async save(cv: any): Promise<CV> {
    const created = await this.prisma.cV.create({
      data: {
        userId: cv.userId,
        templateId: cv.templateId,
        title: cv.title,
        fullName: cv.fullName,
        email: cv.email,
        phoneNumber: cv.phoneNumber,
        dateOfBirth: cv.dateOfBirth,
        gender: cv.gender as PrismaGender | null,
        address: cv.address,
        currentPosition: cv.currentPosition,
        summary: cv.summary,
        objective: cv.objective,
        isMain: cv.isMain,
        isOpenForJob: cv.isOpenForJob,
        skills: cv.skills?.length
          ? {
              create: cv.skills.map((s: any) => ({
                skillName: s.skillName,
                level: s.level as PrismaSkillLevel | null,
                yearsOfExperience: s.yearsOfExperience,
              })),
            }
          : undefined,
        educations: cv.educations?.length
          ? {
              create: cv.educations.map((e: any) => ({
                institution: e.institution,
                degree: e.degree,
                startDate: e.startDate,
                endDate: e.endDate,
                description: e.description,
              })),
            }
          : undefined,
        certifications: cv.certifications?.length
          ? {
              create: cv.certifications.map((c: any) => ({
                name: c.name,
                issuer: c.issuer,
                acquiredAt: c.acquiredAt,
                description: c.description,
              })),
            }
          : undefined,
        workExperiences: cv.workExperiences?.length
          ? {
              create: cv.workExperiences.map((w: any) => ({
                title: w.title,
                company: w.company,
                startDate: w.startDate,
                endDate: w.endDate,
                description: w.description,
              })),
            }
          : undefined,
        projects: cv.projects?.length
          ? {
              create: cv.projects.map((p: any) => ({
                name: p.name,
                description: p.description,
                startDate: p.startDate,
                endDate: p.endDate,
                url: p.url,
                role: p.role,
              })),
            }
          : undefined,
        languages: cv.languages?.length
          ? {
              create: cv.languages.map((l: any) => ({
                name: l.name,
                level: l.level as PrismaLanguageLevel | null,
                description: l.description,
              })),
            }
          : undefined,
        achievements: cv.achievements?.length
          ? {
              create: cv.achievements.map((a: any) => ({
                title: a.title,
                description: a.description,
                acquiredAt: a.acquiredAt,
              })),
            }
          : undefined,
        activities: cv.activities?.length
          ? {
              create: cv.activities.map((a: any) => ({
                title: a.title,
                organization: a.organization,
                startDate: a.startDate,
                endDate: a.endDate,
                description: a.description,
              })),
            }
          : undefined,
        references: cv.references?.length
          ? {
              create: cv.references.map((r: any) => ({
                name: r.name,
                position: r.position,
                company: r.company,
                description: r.description,
              })),
            }
          : undefined,
      },
      include: cvIncludeAll,
    });

    return CVMapper.toDomainWithRelations(created);
  }

  async update(id: string, data: any): Promise<CV> {
    const updated = await this.prisma.$transaction(async (tx) => {
      const mainData: any = {};
      if (data.templateId !== undefined) mainData.templateId = data.templateId;
      if (data.title !== undefined) mainData.title = data.title;
      if (data.fullName !== undefined) mainData.fullName = data.fullName;
      if (data.email !== undefined) mainData.email = data.email;
      if (data.phoneNumber !== undefined) mainData.phoneNumber = data.phoneNumber;
      if (data.dateOfBirth !== undefined) mainData.dateOfBirth = data.dateOfBirth;
      if (data.gender !== undefined) mainData.gender = data.gender as PrismaGender | null;
      if (data.address !== undefined) mainData.address = data.address;
      if (data.currentPosition !== undefined) mainData.currentPosition = data.currentPosition;
      if (data.summary !== undefined) mainData.summary = data.summary;
      if (data.objective !== undefined) mainData.objective = data.objective;
      if (data.isMain !== undefined) mainData.isMain = data.isMain;
      if (data.isOpenForJob !== undefined) mainData.isOpenForJob = data.isOpenForJob;
      if (data.pdfUrl !== undefined) mainData.pdfUrl = data.pdfUrl;
      if (data.lastGeneratedAt !== undefined) mainData.lastGeneratedAt = data.lastGeneratedAt;

      await tx.cV.update({
        where: { id },
        data: mainData,
      });

      if (data.skills !== undefined) {
        await tx.cVSkill.deleteMany({ where: { cvId: id } });
        if (data.skills.length > 0) {
          await tx.cVSkill.createMany({
            data: data.skills.map((s: any) => ({
              cvId: id,
              skillName: s.skillName,
              level: s.level as PrismaSkillLevel | null,
              yearsOfExperience: s.yearsOfExperience,
            })),
          });
        }
      }

      if (data.educations !== undefined) {
        await tx.education.deleteMany({ where: { cvId: id } });
        if (data.educations.length > 0) {
          await tx.education.createMany({
            data: data.educations.map((e: any) => ({
              cvId: id,
              institution: e.institution,
              degree: e.degree,
              startDate: e.startDate,
              endDate: e.endDate,
              description: e.description,
            })),
          });
        }
      }

      if (data.certifications !== undefined) {
        await tx.certification.deleteMany({ where: { cvId: id } });
        if (data.certifications.length > 0) {
          await tx.certification.createMany({
            data: data.certifications.map((c: any) => ({
              cvId: id,
              name: c.name,
              issuer: c.issuer,
              acquiredAt: c.acquiredAt,
              description: c.description,
            })),
          });
        }
      }

      if (data.workExperiences !== undefined) {
        await tx.workExperience.deleteMany({ where: { cvId: id } });
        if (data.workExperiences.length > 0) {
          await tx.workExperience.createMany({
            data: data.workExperiences.map((w: any) => ({
              cvId: id,
              title: w.title,
              company: w.company,
              startDate: w.startDate,
              endDate: w.endDate,
              description: w.description,
            })),
          });
        }
      }

      if (data.projects !== undefined) {
        await tx.project.deleteMany({ where: { cvId: id } });
        if (data.projects.length > 0) {
          await tx.project.createMany({
            data: data.projects.map((p: any) => ({
              cvId: id,
              name: p.name,
              description: p.description,
              startDate: p.startDate,
              endDate: p.endDate,
              url: p.url,
              role: p.role,
            })),
          });
        }
      }

      if (data.languages !== undefined) {
        await tx.language.deleteMany({ where: { cvId: id } });
        if (data.languages.length > 0) {
          await tx.language.createMany({
            data: data.languages.map((l: any) => ({
              cvId: id,
              name: l.name,
              level: l.level as PrismaLanguageLevel | null,
              description: l.description,
            })),
          });
        }
      }

      if (data.achievements !== undefined) {
        await tx.achievement.deleteMany({ where: { cvId: id } });
        if (data.achievements.length > 0) {
          await tx.achievement.createMany({
            data: data.achievements.map((a: any) => ({
              cvId: id,
              title: a.title,
              description: a.description,
              acquiredAt: a.acquiredAt,
            })),
          });
        }
      }

      if (data.activities !== undefined) {
        await tx.activity.deleteMany({ where: { cvId: id } });
        if (data.activities.length > 0) {
          await tx.activity.createMany({
            data: data.activities.map((a: any) => ({
              cvId: id,
              title: a.title,
              organization: a.organization,
              startDate: a.startDate,
              endDate: a.endDate,
              description: a.description,
            })),
          });
        }
      }

      if (data.references !== undefined) {
        await tx.reference.deleteMany({ where: { cvId: id } });
        if (data.references.length > 0) {
          await tx.reference.createMany({
            data: data.references.map((r: any) => ({
              cvId: id,
              name: r.name,
              position: r.position,
              company: r.company,
              description: r.description,
            })),
          });
        }
      }

      return tx.cV.findUnique({
        where: { id },
        include: cvIncludeAll,
      });
    });

    return CVMapper.toDomainWithRelations(updated!);
  }

  async delete(id: string): Promise<CV> {
    const deleted = await this.prisma.cV.delete({
      where: { id },
    });

    return CVMapper.toDomain(deleted);
  }

  async unsetMainForUser(userId: string): Promise<void> {
    await this.prisma.cV.updateMany({
      where: { userId, isMain: true },
      data: { isMain: false },
    });
  }

  async hasApplications(cvId: string): Promise<boolean> {
    const count = await this.prisma.application.count({
      where: { cvId },
    });
    return count > 0;
  }

  async countByUserId(userId: string): Promise<number> {
    return this.prisma.cV.count({
      where: { userId },
    });
  }

  async findRecommendedForJob(options: FindRecommendedForJobOptions): Promise<CV[]> {
    const { limit = 10 } = options;

    const cvs = await this.prisma.cV.findMany({
      where: {
        isOpenForJob: true,
      },
      take: limit,
      orderBy: { updatedAt: 'desc' },
      include: cvIncludeAll,
    });

    return cvs.map((cv) => CVMapper.toDomainWithRelations(cv));
  }

  async findRecommendedJobsForCV(cvId: string, limit: number): Promise<any[]> {
    const recommendations = await this.prisma.recommendJobforCV.findMany({
      where: {
        cvId,
      },
      take: limit,
      orderBy: {
        similarity: 'desc',
      },
      include: {
        job: {
          include: {
            salary: true,
            company: {
              select: {
                id: true,
                name: true,
                logoUrl: true,
              },
            },
          },
        },
      },
    });

    return recommendations;
  }
}
