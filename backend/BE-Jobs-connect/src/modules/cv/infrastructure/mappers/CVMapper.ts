import { CV } from '../../domain/entities/CV.js';
import { CVSkill } from '../../domain/entities/CVSkill.js';
import { Education } from '../../domain/entities/Education.js';
import { Certification } from '../../domain/entities/Certification.js';
import { WorkExperience } from '../../domain/entities/WorkExperience.js';
import { Project } from '../../domain/entities/Project.js';
import { Language } from '../../domain/entities/Language.js';
import { Achievement } from '../../domain/entities/Achievement.js';
import { Activity } from '../../domain/entities/Activity.js';
import { Reference } from '../../domain/entities/Reference.js';
import { CVTemplate } from '../../domain/entities/CVTemplate.js';
import { User } from '@modules/user/domain/entities/User.js';
import type { Gender } from '../../domain/enums/Gender.js';
import type { SkillLevel, LanguageLevel } from '../../domain/enums/index.js';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyRaw = any;

export class CVMapper {
  static toDomain(raw: AnyRaw): CV {
    return new CV({
      id: raw.id,
      userId: raw.userId,
      templateId: raw.templateId,
      title: raw.title,
      fullName: raw.fullName,
      email: raw.email,
      phoneNumber: raw.phoneNumber,
      dateOfBirth: raw.dateOfBirth,
      gender: raw.gender as Gender | null,
      address: raw.address,
      currentPosition: raw.currentPosition,
      summary: raw.summary,
      objective: raw.objective,
      lastGeneratedAt: raw.lastGeneratedAt,
      isMain: raw.isMain,
      isOpenForJob: raw.isOpenForJob,
      pdfUrl: raw.pdfUrl,
      createdAt: raw.createdAt,
      updatedAt: raw.updatedAt,
    });
  }

  static toDomainWithRelations(raw: AnyRaw): CV {
    return new CV({
      id: raw.id,
      userId: raw.userId,
      templateId: raw.templateId,
      title: raw.title,
      fullName: raw.fullName,
      email: raw.email,
      phoneNumber: raw.phoneNumber,
      dateOfBirth: raw.dateOfBirth,
      gender: raw.gender as Gender | null,
      address: raw.address,
      currentPosition: raw.currentPosition,
      summary: raw.summary,
      objective: raw.objective,
      lastGeneratedAt: raw.lastGeneratedAt,
      isMain: raw.isMain,
      isOpenForJob: raw.isOpenForJob,
      pdfUrl: raw.pdfUrl,
      createdAt: raw.createdAt,
      updatedAt: raw.updatedAt,
      user: raw.user ? CVMapper.mapUser(raw.user) : undefined,
      template: raw.template ? CVMapper.mapTemplate(raw.template) : undefined,
      skills: raw.skills?.map((s: AnyRaw) => CVMapper.mapSkill(s)) ?? [],
      educations: raw.educations?.map((e: AnyRaw) => CVMapper.mapEducation(e)) ?? [],
      certifications: raw.certifications?.map((c: AnyRaw) => CVMapper.mapCertification(c)) ?? [],
      workExperiences: raw.workExperiences?.map((w: AnyRaw) => CVMapper.mapWorkExperience(w)) ?? [],
      projects: raw.projects?.map((p: AnyRaw) => CVMapper.mapProject(p)) ?? [],
      languages: raw.languages?.map((l: AnyRaw) => CVMapper.mapLanguage(l)) ?? [],
      achievements: raw.achievements?.map((a: AnyRaw) => CVMapper.mapAchievement(a)) ?? [],
      activities: raw.activities?.map((a: AnyRaw) => CVMapper.mapActivity(a)) ?? [],
      references: raw.references?.map((r: AnyRaw) => CVMapper.mapReference(r)) ?? [],
    });
  }

  static mapUser(raw: AnyRaw): User {
    return new User({
      id: raw.id,
      email: raw.email,
      fullName: raw.fullName,
      phoneNumber: raw.phoneNumber,
      avatarUrl: raw.avatarUrl,
      dateOfBirth: raw.dateOfBirth,
      gender: raw.gender,
      status: raw.status,
      role: raw.role,
      passwordHash: raw.passwordHash,
      lastLoginAt: raw.lastLoginAt,
      createdAt: raw.createdAt,
      updatedAt: raw.updatedAt,
    });
  }

  static mapTemplate(raw: AnyRaw): CVTemplate {
    return new CVTemplate({
      id: raw.id,
      name: raw.name,
      description: raw.description,
      htmlUrl: raw.htmlUrl,
      previewUrl: raw.previewUrl,
      isActive: raw.isActive,
      createdAt: raw.createdAt,
      updatedAt: raw.updatedAt,
    });
  }

  static mapSkill(raw: AnyRaw): CVSkill {
    return new CVSkill({
      id: raw.id,
      cvId: raw.cvId,
      skillName: raw.skillName,
      level: raw.level as SkillLevel,
      yearsOfExperience: raw.yearsOfExperience,
      createdAt: raw.createdAt,
      updatedAt: raw.updatedAt,
    });
  }

  static mapEducation(raw: AnyRaw): Education {
    return new Education({
      id: raw.id,
      cvId: raw.cvId,
      institution: raw.institution,
      degree: raw.degree,
      startDate: raw.startDate,
      endDate: raw.endDate,
      description: raw.description,
      createdAt: raw.createdAt,
      updatedAt: raw.updatedAt,
    });
  }

  static mapCertification(raw: AnyRaw): Certification {
    return new Certification({
      id: raw.id,
      cvId: raw.cvId,
      name: raw.name,
      issuer: raw.issuer,
      acquiredAt: raw.acquiredAt,
      description: raw.description,
      createdAt: raw.createdAt,
      updatedAt: raw.updatedAt,
    });
  }

  static mapWorkExperience(raw: AnyRaw): WorkExperience {
    return new WorkExperience({
      id: raw.id,
      cvId: raw.cvId,
      title: raw.title,
      company: raw.company,
      startDate: raw.startDate,
      endDate: raw.endDate,
      description: raw.description,
      createdAt: raw.createdAt,
      updatedAt: raw.updatedAt,
    });
  }

  static mapProject(raw: AnyRaw): Project {
    return new Project({
      id: raw.id,
      cvId: raw.cvId,
      name: raw.name,
      description: raw.description,
      startDate: raw.startDate,
      endDate: raw.endDate,
      url: raw.url,
      role: raw.role,
      createdAt: raw.createdAt,
      updatedAt: raw.updatedAt,
    });
  }

  static mapLanguage(raw: AnyRaw): Language {
    return new Language({
      id: raw.id,
      cvId: raw.cvId,
      name: raw.name,
      level: raw.level as LanguageLevel,
      description: raw.description,
      createdAt: raw.createdAt,
      updatedAt: raw.updatedAt,
    });
  }

  static mapAchievement(raw: AnyRaw): Achievement {
    return new Achievement({
      id: raw.id,
      cvId: raw.cvId,
      title: raw.title,
      description: raw.description,
      acquiredAt: raw.acquiredAt,
      createdAt: raw.createdAt,
      updatedAt: raw.updatedAt,
    });
  }

  static mapActivity(raw: AnyRaw): Activity {
    return new Activity({
      id: raw.id,
      cvId: raw.cvId,
      title: raw.title,
      organization: raw.organization,
      startDate: raw.startDate,
      endDate: raw.endDate,
      description: raw.description,
      createdAt: raw.createdAt,
      updatedAt: raw.updatedAt,
    });
  }

  static mapReference(raw: AnyRaw): Reference {
    return new Reference({
      id: raw.id,
      cvId: raw.cvId,
      name: raw.name,
      position: raw.position,
      company: raw.company,
      description: raw.description,
      createdAt: raw.createdAt,
      updatedAt: raw.updatedAt,
    });
  }
}
