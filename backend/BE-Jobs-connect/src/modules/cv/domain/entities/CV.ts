import type { User } from '@modules/user/domain/entities/User.js';
import type { CVTemplate } from './CVTemplate.js';
import type { CVSkill } from './CVSkill.js';
import type { Education } from './Education.js';
import type { Certification } from './Certification.js';
import type { WorkExperience } from './WorkExperience.js';
import type { Project } from './Project.js';
import type { Language } from './Language.js';
import type { Achievement } from './Achievement.js';
import type { Activity } from './Activity.js';
import type { Reference } from './Reference.js';
import type { Gender } from '../enums/Gender.js';

export interface CVProps {
  id?: string;
  userId: string;
  templateId?: string | null;
  title: string;
  fullName?: string | null;
  email?: string | null;
  phoneNumber?: string | null;
  dateOfBirth?: Date | null;
  gender?: Gender | null;
  address?: string | null;
  currentPosition?: string | null;
  summary?: string | null;
  objective?: string | null;
  lastGeneratedAt?: Date | null;
  isMain: boolean;
  isOpenForJob: boolean;
  pdfUrl?: string | null;
  createdAt?: Date;
  updatedAt?: Date;
  user?: User;
  template?: CVTemplate | null;
  skills?: CVSkill[];
  educations?: Education[];
  certifications?: Certification[];
  workExperiences?: WorkExperience[];
  projects?: Project[];
  languages?: Language[];
  achievements?: Achievement[];
  activities?: Activity[];
  references?: Reference[];
}

export class CV {
  readonly id?: string;
  readonly userId: string;
  readonly templateId?: string | null;
  readonly title: string;
  readonly fullName?: string | null;
  readonly email?: string | null;
  readonly phoneNumber?: string | null;
  readonly dateOfBirth?: Date | null;
  readonly gender?: Gender | null;
  readonly address?: string | null;
  readonly currentPosition?: string | null;
  readonly summary?: string | null;
  readonly objective?: string | null;
  readonly lastGeneratedAt?: Date | null;
  readonly isMain: boolean;
  readonly isOpenForJob: boolean;
  readonly pdfUrl?: string | null;
  readonly createdAt?: Date;
  readonly updatedAt?: Date;
  readonly user?: User;
  readonly template?: CVTemplate | null;
  readonly skills: CVSkill[];
  readonly educations: Education[];
  readonly certifications: Certification[];
  readonly workExperiences: WorkExperience[];
  readonly projects: Project[];
  readonly languages: Language[];
  readonly achievements: Achievement[];
  readonly activities: Activity[];
  readonly references: Reference[];

  constructor(props: CVProps) {
    this.id = props.id;
    this.userId = props.userId;
    this.templateId = props.templateId;
    this.title = props.title;
    this.fullName = props.fullName;
    this.email = props.email;
    this.phoneNumber = props.phoneNumber;
    this.dateOfBirth = props.dateOfBirth;
    this.gender = props.gender;
    this.address = props.address;
    this.currentPosition = props.currentPosition;
    this.summary = props.summary;
    this.objective = props.objective;
    this.lastGeneratedAt = props.lastGeneratedAt;
    this.isMain = props.isMain;
    this.isOpenForJob = props.isOpenForJob;
    this.pdfUrl = props.pdfUrl;
    this.createdAt = props.createdAt;
    this.updatedAt = props.updatedAt;
    this.user = props.user;
    this.template = props.template;
    this.skills = props.skills ?? [];
    this.educations = props.educations ?? [];
    this.certifications = props.certifications ?? [];
    this.workExperiences = props.workExperiences ?? [];
    this.projects = props.projects ?? [];
    this.languages = props.languages ?? [];
    this.achievements = props.achievements ?? [];
    this.activities = props.activities ?? [];
    this.references = props.references ?? [];
  }

  with(props: Partial<CVProps>): CV {
    return new CV({
      id: this.id,
      userId: props.userId ?? this.userId,
      templateId: props.templateId !== undefined ? props.templateId : this.templateId,
      title: props.title ?? this.title,
      fullName: props.fullName !== undefined ? props.fullName : this.fullName,
      email: props.email !== undefined ? props.email : this.email,
      phoneNumber: props.phoneNumber !== undefined ? props.phoneNumber : this.phoneNumber,
      dateOfBirth: props.dateOfBirth !== undefined ? props.dateOfBirth : this.dateOfBirth,
      gender: props.gender !== undefined ? props.gender : this.gender,
      address: props.address !== undefined ? props.address : this.address,
      currentPosition: props.currentPosition !== undefined ? props.currentPosition : this.currentPosition,
      summary: props.summary !== undefined ? props.summary : this.summary,
      objective: props.objective !== undefined ? props.objective : this.objective,
      lastGeneratedAt: props.lastGeneratedAt !== undefined ? props.lastGeneratedAt : this.lastGeneratedAt,
      isMain: props.isMain ?? this.isMain,
      isOpenForJob: props.isOpenForJob ?? this.isOpenForJob,
      pdfUrl: props.pdfUrl !== undefined ? props.pdfUrl : this.pdfUrl,
      createdAt: this.createdAt,
      updatedAt: new Date(),
      user: props.user !== undefined ? props.user : this.user,
      template: props.template !== undefined ? props.template : this.template,
      skills: props.skills !== undefined ? props.skills : this.skills,
      educations: props.educations !== undefined ? props.educations : this.educations,
      certifications: props.certifications !== undefined ? props.certifications : this.certifications,
      workExperiences: props.workExperiences !== undefined ? props.workExperiences : this.workExperiences,
      projects: props.projects !== undefined ? props.projects : this.projects,
      languages: props.languages !== undefined ? props.languages : this.languages,
      achievements: props.achievements !== undefined ? props.achievements : this.achievements,
      activities: props.activities !== undefined ? props.activities : this.activities,
      references: props.references !== undefined ? props.references : this.references,
    });
  }
}
