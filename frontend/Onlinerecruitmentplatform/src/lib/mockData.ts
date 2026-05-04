import {
  User, Company, Job, CV, Application, SavedJob, CVTemplate, CompanyMember,
  UserRole, Gender, Status, JobStatus, CompanyStatus, CompanySize, ExperienceLevel,
  JobType, AppStatus, SkillLevel, LanguageLevel,
  Salary, JobBenefit, JobRequirement, CompanyRole, CVSkill, Education,
  WorkExperience,
} from './types';

// ===========================================
// USERS
// ===========================================

export const mockUsers: User[] = [
  // ADMINS
  { id: 'admin-1', email: 'admin@jobsconnect.com', passwordHash: 'hash', fullName: 'Admin User', phoneNumber: '0901234567', gender: Gender.MALE, role: UserRole.ADMIN, dateOfBirth: new Date('1985-01-15'), status: Status.ACTIVE, lastLoginAt: new Date(), avatarUrl: null, location: null, bio: null, openForOpportunities: false, createdAt: new Date(), updatedAt: new Date() },
  
  // RECRUITERS
  { id: 'recruiter-1', email: 'recruiter1@techcorp.vn', passwordHash: 'hash', fullName: 'Nguyen Van A', phoneNumber: '0912345678', gender: Gender.MALE, role: UserRole.RECRUITER, dateOfBirth: new Date('1988-03-10'), status: Status.ACTIVE, lastLoginAt: new Date(), avatarUrl: null, location: 'Ho Chi Minh City', bio: 'HR Manager', openForOpportunities: false, createdAt: new Date(), updatedAt: new Date() },
  { id: 'recruiter-2', email: 'recruiter2@startuphub.com', passwordHash: 'hash', fullName: 'Tran Thi B', phoneNumber: '0912345679', gender: Gender.FEMALE, role: UserRole.RECRUITER, dateOfBirth: new Date('1992-07-25'), status: Status.ACTIVE, lastLoginAt: new Date(), avatarUrl: null, location: 'Ho Chi Minh City', bio: 'HR Lead', openForOpportunities: false, createdAt: new Date(), updatedAt: new Date() },
  
  // CANDIDATES (7 open for opportunities)
  { id: 'candidate-1', email: 'candidate1@example.com', passwordHash: 'hash', fullName: 'Pham Van D', phoneNumber: '0923456789', gender: Gender.MALE, role: UserRole.CANDIDATE, dateOfBirth: new Date('1995-02-15'), status: Status.ACTIVE, lastLoginAt: new Date(), avatarUrl: null, location: 'Ho Chi Minh City', bio: 'Senior Software Engineer', openForOpportunities: true, createdAt: new Date(), updatedAt: new Date() },
  { id: 'candidate-2', email: 'candidate2@example.com', passwordHash: 'hash', fullName: 'Hoang Thi E', phoneNumber: '0923456790', gender: Gender.FEMALE, role: UserRole.CANDIDATE, dateOfBirth: new Date('1998-06-20'), status: Status.ACTIVE, lastLoginAt: new Date(), avatarUrl: null, location: 'Ho Chi Minh City', bio: 'Frontend Developer', openForOpportunities: true, createdAt: new Date(), updatedAt: new Date() },
  { id: 'candidate-3', email: 'candidate3@example.com', passwordHash: 'hash', fullName: 'Vu Van F', phoneNumber: '0923456791', gender: Gender.MALE, role: UserRole.CANDIDATE, dateOfBirth: new Date('1993-09-10'), status: Status.ACTIVE, lastLoginAt: new Date(), avatarUrl: null, location: 'Hanoi', bio: 'Backend Developer', openForOpportunities: true, createdAt: new Date(), updatedAt: new Date() },
  { id: 'candidate-4', email: 'candidate4@example.com', passwordHash: 'hash', fullName: 'Dao Thi G', phoneNumber: '0923456792', gender: Gender.FEMALE, role: UserRole.CANDIDATE, dateOfBirth: new Date('1996-12-05'), status: Status.ACTIVE, lastLoginAt: new Date(), avatarUrl: null, location: 'Ho Chi Minh City', bio: 'Full-stack Developer', openForOpportunities: true, createdAt: new Date(), updatedAt: new Date() },
  { id: 'candidate-5', email: 'candidate5@example.com', passwordHash: 'hash', fullName: 'Bui Van H', phoneNumber: '0923456793', gender: Gender.MALE, role: UserRole.CANDIDATE, dateOfBirth: new Date('1994-04-18'), status: Status.ACTIVE, lastLoginAt: new Date(), avatarUrl: null, location: 'Da Nang', bio: 'DevOps Engineer', openForOpportunities: true, createdAt: new Date(), updatedAt: new Date() },
  { id: 'candidate-6', email: 'candidate6@example.com', passwordHash: 'hash', fullName: 'Dang Thi I', phoneNumber: '0923456794', gender: Gender.FEMALE, role: UserRole.CANDIDATE, dateOfBirth: new Date('1997-08-22'), status: Status.ACTIVE, lastLoginAt: new Date(), avatarUrl: null, location: 'Hanoi', bio: 'Data Engineer', openForOpportunities: true, createdAt: new Date(), updatedAt: new Date() },
  { id: 'candidate-7', email: 'candidate7@example.com', passwordHash: 'hash', fullName: 'Ngo Van K', phoneNumber: '0923456795', gender: Gender.MALE, role: UserRole.CANDIDATE, dateOfBirth: new Date('1992-01-30'), status: Status.ACTIVE, lastLoginAt: new Date(), avatarUrl: null, location: 'Ho Chi Minh City', bio: 'Mobile Developer', openForOpportunities: true, createdAt: new Date(), updatedAt: new Date() },
  // 1 candidate NOT open
  { id: 'candidate-8', email: 'candidate8@example.com', passwordHash: 'hash', fullName: 'Ly Thi L', phoneNumber: '0923456796', gender: Gender.FEMALE, role: UserRole.CANDIDATE, dateOfBirth: new Date('1999-03-12'), status: Status.ACTIVE, lastLoginAt: new Date(), avatarUrl: null, location: 'Ho Chi Minh City', bio: 'UI/UX Designer', openForOpportunities: false, createdAt: new Date(), updatedAt: new Date() },
];

// ===========================================
// COMPANIES
// ===========================================

export const mockCompanies: Company[] = [
  { id: 'company-1', name: 'TechCorp Vietnam', website: 'https://techcorp.vn', description: 'Leading technology company', industry: 'Technology', companySize: CompanySize.LARGE, foundedYear: 2010, address: '123 Nguyen Hue, District 1, Ho Chi Minh City', phone: '0281234567', email: 'contact@techcorp.vn', logoUrl: 'https://api.dicebear.com/7.x/shapes/svg?seed=techcorp', bannerUrl: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=800', status: CompanyStatus.APPROVED, documentUrl: null, createdAt: new Date(), updatedAt: new Date() },
  { id: 'company-2', name: 'StartupHub', website: 'https://startuphub.com', description: 'Innovative startup incubator', industry: 'Technology', companySize: CompanySize.SMALL, foundedYear: 2018, address: '456 Le Loi, District 3, Ho Chi Minh City', phone: '0287654321', email: 'hello@startuphub.com', logoUrl: 'https://api.dicebear.com/7.x/shapes/svg?seed=startuphub', bannerUrl: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800', status: CompanyStatus.APPROVED, documentUrl: null, createdAt: new Date(), updatedAt: new Date() },
  { id: 'company-3', name: 'FinancePro', website: 'https://financepro.vn', description: 'Financial services company', industry: 'Finance', companySize: CompanySize.MEDIUM, foundedYear: 2015, address: '789 Dong Khoi, District 1, Ho Chi Minh City', phone: '0289876543', email: 'info@financepro.vn', logoUrl: 'https://api.dicebear.com/7.x/shapes/svg?seed=financepro', bannerUrl: 'https://images.unsplash.com/photo-1560179707-f14e90ef3623?w=800', status: CompanyStatus.APPROVED, documentUrl: null, createdAt: new Date(), updatedAt: new Date() },
];

export const mockCompanyMembers: CompanyMember[] = [
  { id: 'member-1', userId: 'recruiter-1', companyId: 'company-1', companyRole: CompanyRole.OWNER, createdAt: new Date(), updatedAt: new Date() },
  { id: 'member-2', userId: 'recruiter-2', companyId: 'company-2', companyRole: CompanyRole.MANAGER, createdAt: new Date(), updatedAt: new Date() },
];

// ===========================================
// CVS WITH NESTED DATA
// ===========================================

export const mockCVs: CV[] = [
  { id: 'cv-1', userId: 'candidate-1', title: 'Senior Software Engineer CV', isMain: true, fullName: 'Pham Van D', email: 'candidate1@example.com', phoneNumber: '0923456789', dateOfBirth: new Date('1995-02-15'), gender: Gender.MALE, address: '123 Nguyen Hue, HCM', currentPosition: 'Senior Software Engineer', summary: 'Experienced software engineer with 5+ years in full-stack development.', objective: 'Seeking senior position', lastGeneratedAt: null, embedding: null, isOpenForJob: true, templateId: 'template-1', createdAt: new Date(), updatedAt: new Date() },
  { id: 'cv-2', userId: 'candidate-2', title: 'Frontend Developer CV', isMain: true, fullName: 'Hoang Thi E', email: 'candidate2@example.com', phoneNumber: '0923456790', dateOfBirth: new Date('1998-06-20'), gender: Gender.FEMALE, address: '456 Le Loi, HCM', currentPosition: 'Frontend Developer', summary: 'Creative frontend developer with 3+ years experience.', objective: 'Looking for frontend opportunities', lastGeneratedAt: null, embedding: null, isOpenForJob: true, templateId: 'template-2', createdAt: new Date(), updatedAt: new Date() },
  { id: 'cv-3', userId: 'candidate-3', title: 'Backend Developer CV', isMain: true, fullName: 'Vu Van F', email: 'candidate3@example.com', phoneNumber: '0923456791', dateOfBirth: new Date('1993-09-10'), gender: Gender.MALE, address: '789 Hanoi', currentPosition: 'Backend Developer', summary: 'Backend developer specialized in APIs and microservices.', objective: 'Seeking backend role', lastGeneratedAt: null, embedding: null, isOpenForJob: true, templateId: 'template-1', createdAt: new Date(), updatedAt: new Date() },
  { id: 'cv-4', userId: 'candidate-4', title: 'Full-stack Developer CV', isMain: true, fullName: 'Dao Thi G', email: 'candidate4@example.com', phoneNumber: '0923456792', dateOfBirth: new Date('1996-12-05'), gender: Gender.FEMALE, address: 'HCM', currentPosition: 'Full-stack Developer', summary: 'Full-stack developer with both frontend and backend expertise.', objective: 'Looking for full-stack opportunities', lastGeneratedAt: null, embedding: null, isOpenForJob: true, templateId: 'template-2', createdAt: new Date(), updatedAt: new Date() },
  { id: 'cv-5', userId: 'candidate-5', title: 'DevOps Engineer CV', isMain: true, fullName: 'Bui Van H', email: 'candidate5@example.com', phoneNumber: '0923456793', dateOfBirth: new Date('1994-04-18'), gender: Gender.MALE, address: 'Da Nang', currentPosition: 'DevOps Engineer', summary: 'DevOps engineer with expertise in CI/CD and cloud infrastructure.', objective: 'Seeking DevOps position', lastGeneratedAt: null, embedding: null, isOpenForJob: true, templateId: 'template-1', createdAt: new Date(), updatedAt: new Date() },
  { id: 'cv-6', userId: 'candidate-6', title: 'Data Engineer CV', isMain: true, fullName: 'Dang Thi I', email: 'candidate6@example.com', phoneNumber: '0923456794', dateOfBirth: new Date('1997-08-22'), gender: Gender.FEMALE, address: 'Hanoi', currentPosition: 'Data Engineer', summary: 'Data engineer specialized in building data pipelines.', objective: 'Seeking data engineer role', lastGeneratedAt: null, embedding: null, isOpenForJob: true, templateId: 'template-1', createdAt: new Date(), updatedAt: new Date() },
  { id: 'cv-7', userId: 'candidate-7', title: 'Mobile Developer CV', isMain: true, fullName: 'Ngo Van K', email: 'candidate7@example.com', phoneNumber: '0923456795', dateOfBirth: new Date('1992-01-30'), gender: Gender.MALE, address: 'HCM', currentPosition: 'Mobile Developer', summary: 'Mobile developer with React Native and Flutter expertise.', objective: 'Looking for mobile dev opportunities', lastGeneratedAt: null, embedding: null, isOpenForJob: true, templateId: 'template-1', createdAt: new Date(), updatedAt: new Date() },
  { id: 'cv-8', userId: 'candidate-8', title: 'UI/UX Designer CV', isMain: true, fullName: 'Ly Thi L', email: 'candidate8@example.com', phoneNumber: '0923456796', dateOfBirth: new Date('1999-03-12'), gender: Gender.FEMALE, address: 'HCM', currentPosition: 'UI/UX Designer', summary: 'Creative UI/UX designer', objective: null, lastGeneratedAt: null, embedding: null, isOpenForJob: false, templateId: 'template-2', createdAt: new Date(), updatedAt: new Date() },
];

export const mockCVSkills: CVSkill[] = [
  // CV 1 skills
  { id: 'skill-1-1', cvId: 'cv-1', skillName: 'JavaScript', level: SkillLevel.EXPERT, yearsOfExperience: 5, createdAt: new Date(), updatedAt: new Date() },
  { id: 'skill-1-2', cvId: 'cv-1', skillName: 'Node.js', level: SkillLevel.EXPERT, yearsOfExperience: 4, createdAt: new Date(), updatedAt: new Date() },
  { id: 'skill-1-3', cvId: 'cv-1', skillName: 'React', level: SkillLevel.ADVANCED, yearsOfExperience: 3, createdAt: new Date(), updatedAt: new Date() },
  { id: 'skill-1-4', cvId: 'cv-1', skillName: 'TypeScript', level: SkillLevel.ADVANCED, yearsOfExperience: 2, createdAt: new Date(), updatedAt: new Date() },
  { id: 'skill-1-5', cvId: 'cv-1', skillName: 'PostgreSQL', level: SkillLevel.ADVANCED, yearsOfExperience: 3, createdAt: new Date(), updatedAt: new Date() },
  { id: 'skill-1-6', cvId: 'cv-1', skillName: 'AWS', level: SkillLevel.INTERMEDIATE, yearsOfExperience: 2, createdAt: new Date(), updatedAt: new Date() },
  
  // CV 2 skills
  { id: 'skill-2-1', cvId: 'cv-2', skillName: 'React', level: SkillLevel.ADVANCED, yearsOfExperience: 3, createdAt: new Date(), updatedAt: new Date() },
  { id: 'skill-2-2', cvId: 'cv-2', skillName: 'Vue.js', level: SkillLevel.ADVANCED, yearsOfExperience: 2, createdAt: new Date(), updatedAt: new Date() },
  { id: 'skill-2-3', cvId: 'cv-2', skillName: 'JavaScript', level: SkillLevel.ADVANCED, yearsOfExperience: 3, createdAt: new Date(), updatedAt: new Date() },
  { id: 'skill-2-4', cvId: 'cv-2', skillName: 'CSS/SCSS', level: SkillLevel.EXPERT, yearsOfExperience: 4, createdAt: new Date(), updatedAt: new Date() },
  
  // CV 3 skills
  { id: 'skill-3-1', cvId: 'cv-3', skillName: 'Node.js', level: SkillLevel.ADVANCED, yearsOfExperience: 4, createdAt: new Date(), updatedAt: new Date() },
  { id: 'skill-3-2', cvId: 'cv-3', skillName: 'Python', level: SkillLevel.ADVANCED, yearsOfExperience: 3, createdAt: new Date(), updatedAt: new Date() },
  { id: 'skill-3-3', cvId: 'cv-3', skillName: 'PostgreSQL', level: SkillLevel.EXPERT, yearsOfExperience: 4, createdAt: new Date(), updatedAt: new Date() },
  { id: 'skill-3-4', cvId: 'cv-3', skillName: 'MongoDB', level: SkillLevel.ADVANCED, yearsOfExperience: 3, createdAt: new Date(), updatedAt: new Date() },
  
  // CV 4 skills
  { id: 'skill-4-1', cvId: 'cv-4', skillName: 'JavaScript', level: SkillLevel.EXPERT, yearsOfExperience: 4, createdAt: new Date(), updatedAt: new Date() },
  { id: 'skill-4-2', cvId: 'cv-4', skillName: 'Node.js', level: SkillLevel.ADVANCED, yearsOfExperience: 3, createdAt: new Date(), updatedAt: new Date() },
  { id: 'skill-4-3', cvId: 'cv-4', skillName: 'React', level: SkillLevel.ADVANCED, yearsOfExperience: 3, createdAt: new Date(), updatedAt: new Date() },
  
  // CV 5 skills
  { id: 'skill-5-1', cvId: 'cv-5', skillName: 'Docker', level: SkillLevel.EXPERT, yearsOfExperience: 3, createdAt: new Date(), updatedAt: new Date() },
  { id: 'skill-5-2', cvId: 'cv-5', skillName: 'Kubernetes', level: SkillLevel.ADVANCED, yearsOfExperience: 2, createdAt: new Date(), updatedAt: new Date() },
  { id: 'skill-5-3', cvId: 'cv-5', skillName: 'AWS', level: SkillLevel.ADVANCED, yearsOfExperience: 3, createdAt: new Date(), updatedAt: new Date() },
  
  // CV 6 skills
  { id: 'skill-6-1', cvId: 'cv-6', skillName: 'Python', level: SkillLevel.EXPERT, yearsOfExperience: 4, createdAt: new Date(), updatedAt: new Date() },
  { id: 'skill-6-2', cvId: 'cv-6', skillName: 'Apache Spark', level: SkillLevel.ADVANCED, yearsOfExperience: 2, createdAt: new Date(), updatedAt: new Date() },
  { id: 'skill-6-3', cvId: 'cv-6', skillName: 'SQL', level: SkillLevel.EXPERT, yearsOfExperience: 5, createdAt: new Date(), updatedAt: new Date() },
  
  // CV 7 skills
  { id: 'skill-7-1', cvId: 'cv-7', skillName: 'React Native', level: SkillLevel.ADVANCED, yearsOfExperience: 3, createdAt: new Date(), updatedAt: new Date() },
  { id: 'skill-7-2', cvId: 'cv-7', skillName: 'Flutter', level: SkillLevel.ADVANCED, yearsOfExperience: 2, createdAt: new Date(), updatedAt: new Date() },
  { id: 'skill-7-3', cvId: 'cv-7', skillName: 'JavaScript', level: SkillLevel.ADVANCED, yearsOfExperience: 3, createdAt: new Date(), updatedAt: new Date() },
  
  // CV 8 skills
  { id: 'skill-8-1', cvId: 'cv-8', skillName: 'Figma', level: SkillLevel.EXPERT, yearsOfExperience: 3, createdAt: new Date(), updatedAt: new Date() },
  { id: 'skill-8-2', cvId: 'cv-8', skillName: 'Adobe XD', level: SkillLevel.ADVANCED, yearsOfExperience: 2, createdAt: new Date(), updatedAt: new Date() },
];

export const mockEducations: Education[] = [
  { id: 'edu-1', cvId: 'cv-1', institution: 'Ho Chi Minh University of Technology', degree: 'Bachelor of Computer Science', startDate: new Date('2012-09-01'), endDate: new Date('2016-06-30'), description: 'GPA: 3.8/4.0', createdAt: new Date(), updatedAt: new Date() },
  { id: 'edu-2', cvId: 'cv-2', institution: 'Ho Chi Minh University of Science', degree: 'Bachelor of Information Technology', startDate: new Date('2014-09-01'), endDate: new Date('2018-06-30'), description: 'Focus on web development', createdAt: new Date(), updatedAt: new Date() },
  { id: 'edu-3', cvId: 'cv-3', institution: 'Can Tho University', degree: 'Bachelor of Software Engineering', startDate: new Date('2011-09-01'), endDate: new Date('2015-06-30'), description: 'Database specialization', createdAt: new Date(), updatedAt: new Date() },
  { id: 'edu-4', cvId: 'cv-4', institution: 'HCMC University of Technology', degree: 'Bachelor of Computer Science', startDate: new Date('2013-09-01'), endDate: new Date('2017-06-30'), description: 'Full-stack focus', createdAt: new Date(), updatedAt: new Date() },
  { id: 'edu-5', cvId: 'cv-5', institution: 'HCMC University of Technology', degree: 'Bachelor of Information Systems', startDate: new Date('2012-09-01'), endDate: new Date('2016-06-30'), description: 'Cloud computing', createdAt: new Date(), updatedAt: new Date() },
  { id: 'edu-6', cvId: 'cv-6', institution: 'HCMC University of Science', degree: 'Bachelor of Data Science', startDate: new Date('2014-09-01'), endDate: new Date('2018-06-30'), description: 'Data engineering', createdAt: new Date(), updatedAt: new Date() },
  { id: 'edu-7', cvId: 'cv-7', institution: 'HCMC University of Technology', degree: 'Bachelor of Computer Science', startDate: new Date('2011-09-01'), endDate: new Date('2015-06-30'), description: 'Mobile development', createdAt: new Date(), updatedAt: new Date() },
  { id: 'edu-8', cvId: 'cv-8', institution: 'HCMC University of Architecture', degree: 'Bachelor of Design', startDate: new Date('2015-09-01'), endDate: new Date('2019-06-30'), description: 'UI/UX design', createdAt: new Date(), updatedAt: new Date() },
];

export const mockWorkExperiences: WorkExperience[] = [
  { id: 'exp-1-1', cvId: 'cv-1', title: 'Senior Software Engineer', company: 'TechCorp Vietnam', startDate: new Date('2019-01-01'), endDate: null, description: 'Lead development of microservices', createdAt: new Date(), updatedAt: new Date() },
  { id: 'exp-1-2', cvId: 'cv-1', title: 'Software Engineer', company: 'StartupXYZ', startDate: new Date('2016-07-01'), endDate: new Date('2018-12-31'), description: 'Developed RESTful APIs', createdAt: new Date(), updatedAt: new Date() },
  
  { id: 'exp-2-1', cvId: 'cv-2', title: 'Frontend Developer', company: 'Digital Agency ABC', startDate: new Date('2019-07-01'), endDate: null, description: 'Build responsive web apps', createdAt: new Date(), updatedAt: new Date() },
  
  { id: 'exp-3-1', cvId: 'cv-3', title: 'Backend Developer', company: 'FinTech Solutions', startDate: new Date('2017-01-01'), endDate: null, description: 'Design and develop APIs', createdAt: new Date(), updatedAt: new Date() },
  
  { id: 'exp-4-1', cvId: 'cv-4', title: 'Full-stack Developer', company: 'Innovation Labs', startDate: new Date('2018-01-01'), endDate: null, description: 'Full-stack development', createdAt: new Date(), updatedAt: new Date() },
  
  { id: 'exp-5-1', cvId: 'cv-5', title: 'DevOps Engineer', company: 'Cloud Solutions Inc', startDate: new Date('2018-01-01'), endDate: null, description: 'CI/CD and infrastructure', createdAt: new Date(), updatedAt: new Date() },
  
  { id: 'exp-6-1', cvId: 'cv-6', title: 'Data Engineer', company: 'Data Analytics Corp', startDate: new Date('2019-01-01'), endDate: null, description: 'Build data pipelines', createdAt: new Date(), updatedAt: new Date() },
  
  { id: 'exp-7-1', cvId: 'cv-7', title: 'Mobile Developer', company: 'Mobile Apps Studio', startDate: new Date('2017-01-01'), endDate: null, description: 'Cross-platform mobile apps', createdAt: new Date(), updatedAt: new Date() },
];

// ===========================================
// JOBS
// ===========================================

export const mockSalaries: Salary[] = [
  { id: 'salary-1', minAmount: 25000000, maxAmount: 40000000, currency: 'VND', isNegotiable: true, hideAmount: false, createdAt: new Date(), updatedAt: new Date() },
  { id: 'salary-2', minAmount: 20000000, maxAmount: 30000000, currency: 'VND', isNegotiable: true, hideAmount: false, createdAt: new Date(), updatedAt: new Date() },
  { id: 'salary-3', minAmount: 25000000, maxAmount: 40000000, currency: 'VND', isNegotiable: true, hideAmount: false, createdAt: new Date(), updatedAt: new Date() },
  { id: 'salary-4', minAmount: 20000000, maxAmount: 35000000, currency: 'VND', isNegotiable: true, hideAmount: false, createdAt: new Date(), updatedAt: new Date() },
  { id: 'salary-5', minAmount: 20000000, maxAmount: 30000000, currency: 'VND', isNegotiable: true, hideAmount: false, createdAt: new Date(), updatedAt: new Date() },
  { id: 'salary-6', minAmount: 10000000, maxAmount: 15000000, currency: 'VND', isNegotiable: false, hideAmount: false, createdAt: new Date(), updatedAt: new Date() },
];

export const mockJobs: Job[] = [
  { id: 'job-1', companyId: 'company-1', salaryId: 'salary-1', title: 'Senior Software Engineer', description: 'Looking for experienced engineer', location: 'Ho Chi Minh City', industry: 'Technology', experienceLevel: ExperienceLevel.SENIOR, type: JobType.FULL_TIME, embedding: null, urgent: false, status: JobStatus.ACTIVE, expiresAt: new Date('2025-01-31'), applicationCount: 2, createdAt: new Date(), updatedAt: new Date() },
  { id: 'job-2', companyId: 'company-2', salaryId: 'salary-2', title: 'Full-stack Developer', description: 'Join our fast-growing startup', location: 'Ho Chi Minh City', industry: 'Technology', experienceLevel: ExperienceLevel.MIDDLE, type: JobType.FULL_TIME, embedding: null, urgent: true, status: JobStatus.ACTIVE, expiresAt: new Date('2024-12-13'), applicationCount: 2, createdAt: new Date(), updatedAt: new Date() },
  { id: 'job-3', companyId: 'company-1', salaryId: 'salary-3', title: 'DevOps Engineer', description: 'Build and maintain cloud infrastructure', location: 'Ho Chi Minh City', industry: 'Technology', experienceLevel: ExperienceLevel.SENIOR, type: JobType.FULL_TIME, embedding: null, urgent: false, status: JobStatus.ACTIVE, expiresAt: new Date('2025-01-07'), applicationCount: 1, createdAt: new Date(), updatedAt: new Date() },
  { id: 'job-4', companyId: 'company-3', salaryId: 'salary-4', title: 'Data Engineer', description: 'Build data pipelines', location: 'Ho Chi Minh City', industry: 'Finance', experienceLevel: ExperienceLevel.MIDDLE, type: JobType.FULL_TIME, embedding: null, urgent: false, status: JobStatus.ACTIVE, expiresAt: new Date('2024-12-28'), applicationCount: 1, createdAt: new Date(), updatedAt: new Date() },
  { id: 'job-5', companyId: 'company-2', salaryId: 'salary-5', title: 'Mobile Developer (React Native)', description: 'Build mobile apps', location: 'Ho Chi Minh City', industry: 'Technology', experienceLevel: ExperienceLevel.MIDDLE, type: JobType.CONTRACT, embedding: null, urgent: true, status: JobStatus.ACTIVE, expiresAt: new Date('2024-12-08'), applicationCount: 1, createdAt: new Date(), updatedAt: new Date() },
  { id: 'job-6', companyId: 'company-1', salaryId: 'salary-6', title: 'Junior Software Engineer', description: 'Great opportunity for fresh graduates', location: 'Ho Chi Minh City', industry: 'Technology', experienceLevel: ExperienceLevel.JUNIOR, type: JobType.FULL_TIME, embedding: null, urgent: false, status: JobStatus.PENDING, expiresAt: new Date('2025-01-22'), applicationCount: 0, createdAt: new Date(), updatedAt: new Date() },
];

export const mockJobBenefits: JobBenefit[] = [
  { id: 'benefit-1-1', jobId: 'job-1', title: 'Competitive Salary', description: 'Lương cạnh tranh với thưởng hấp dẫn', createdAt: new Date(), updatedAt: new Date() },
  { id: 'benefit-1-2', jobId: 'job-1', title: 'Health Insurance', description: 'Bảo hiểm sức khỏe toàn diện', createdAt: new Date(), updatedAt: new Date() },
  { id: 'benefit-1-3', jobId: 'job-1', title: 'Learning Budget', description: 'Ngân sách học tập và phát triển', createdAt: new Date(), updatedAt: new Date() },
  
  { id: 'benefit-2-1', jobId: 'job-2', title: 'Stock Options', description: 'Cổ phần công ty', createdAt: new Date(), updatedAt: new Date() },
  { id: 'benefit-2-2', jobId: 'job-2', title: 'Remote Work', description: 'Làm việc từ xa linh hoạt', createdAt: new Date(), updatedAt: new Date() },
  { id: 'benefit-2-3', jobId: 'job-2', title: 'Team Building', description: 'Hoạt động team building thường xuyên', createdAt: new Date(), updatedAt: new Date() },
  
  { id: 'benefit-3-1', jobId: 'job-3', title: 'Performance Bonus', description: 'Thưởng hiệu suất hàng quý', createdAt: new Date(), updatedAt: new Date() },
  { id: 'benefit-3-2', jobId: 'job-3', title: 'Flexible Hours', description: 'Giờ làm việc linh hoạt', createdAt: new Date(), updatedAt: new Date() },
  
  { id: 'benefit-4-1', jobId: 'job-4', title: 'Training Programs', description: 'Chương trình đào tạo chuyên sâu', createdAt: new Date(), updatedAt: new Date() },
  { id: 'benefit-4-2', jobId: 'job-4', title: 'Modern Office', description: 'Văn phòng hiện đại, đầy đủ tiện nghi', createdAt: new Date(), updatedAt: new Date() },
  
  { id: 'benefit-5-1', jobId: 'job-5', title: 'International Team', description: 'Làm việc với đội ngũ quốc tế', createdAt: new Date(), updatedAt: new Date() },
  { id: 'benefit-5-2', jobId: 'job-5', title: 'Latest Technology', description: 'Công nghệ và thiết bị mới nhất', createdAt: new Date(), updatedAt: new Date() },
];

export const mockJobRequirements: JobRequirement[] = [
  { id: 'req-1-1', jobId: 'job-1', title: 'Experience', description: '5+ năm kinh nghiệm phát triển phần mềm', createdAt: new Date(), updatedAt: new Date() },
  { id: 'req-1-2', jobId: 'job-1', title: 'Technical Skills', description: 'JavaScript, Node.js, React, PostgreSQL', createdAt: new Date(), updatedAt: new Date() },
  { id: 'req-1-3', jobId: 'job-1', title: 'Soft Skills', description: 'Kỹ năng làm việc nhóm và giao tiếp tốt', createdAt: new Date(), updatedAt: new Date() },
  
  { id: 'req-2-1', jobId: 'job-2', title: 'Experience', description: '2-4 năm kinh nghiệm full-stack development', createdAt: new Date(), updatedAt: new Date() },
  { id: 'req-2-2', jobId: 'job-2', title: 'Skills', description: 'React, Node.js, MongoDB', createdAt: new Date(), updatedAt: new Date() },
  { id: 'req-2-3', jobId: 'job-2', title: 'Startup Mindset', description: 'Linh hoạt, chủ động và ham học hỏi', createdAt: new Date(), updatedAt: new Date() },
  
  { id: 'req-3-1', jobId: 'job-3', title: 'Experience', description: '3+ năm kinh nghiệm DevOps', createdAt: new Date(), updatedAt: new Date() },
  { id: 'req-3-2', jobId: 'job-3', title: 'Cloud Skills', description: 'AWS, Docker, Kubernetes', createdAt: new Date(), updatedAt: new Date() },
  { id: 'req-3-3', jobId: 'job-3', title: 'CI/CD', description: 'Kinh nghiệm với Jenkins, GitLab CI', createdAt: new Date(), updatedAt: new Date() },
  
  { id: 'req-4-1', jobId: 'job-4', title: 'Experience', description: '2+ năm kinh nghiệm Data Engineering', createdAt: new Date(), updatedAt: new Date() },
  { id: 'req-4-2', jobId: 'job-4', title: 'Technical Skills', description: 'Python, SQL, Apache Spark', createdAt: new Date(), updatedAt: new Date() },
  { id: 'req-4-3', jobId: 'job-4', title: 'Data Modeling', description: 'Kinh nghiệm thiết kế data pipeline', createdAt: new Date(), updatedAt: new Date() },
  
  { id: 'req-5-1', jobId: 'job-5', title: 'Experience', description: '2+ năm phát triển mobile apps', createdAt: new Date(), updatedAt: new Date() },
  { id: 'req-5-2', jobId: 'job-5', title: 'Skills', description: 'React Native hoặc Flutter', createdAt: new Date(), updatedAt: new Date() },
  { id: 'req-5-3', jobId: 'job-5', title: 'Mobile Expertise', description: 'Hiểu biết về iOS và Android platforms', createdAt: new Date(), updatedAt: new Date() },
  
  { id: 'req-6-1', jobId: 'job-6', title: 'Education', description: 'Tốt nghiệp đại học chuyên ngành IT', createdAt: new Date(), updatedAt: new Date() },
  { id: 'req-6-2', jobId: 'job-6', title: 'Basic Skills', description: 'Nắm vững một ngôn ngữ lập trình', createdAt: new Date(), updatedAt: new Date() },
  { id: 'req-6-3', jobId: 'job-6', title: 'Attitude', description: 'Nhiệt huyết, ham học hỏi', createdAt: new Date(), updatedAt: new Date() },
];

// ===========================================
// APPLICATIONS
// ===========================================

export const mockApplications: Application[] = [
  { id: 'app-1', userId: 'candidate-1', cvId: 'cv-1', jobId: 'job-1', status: AppStatus.PENDING, coverLetter: 'Very interested in this position', notes: null, createdAt: new Date('2024-11-20'), updatedAt: new Date('2024-11-20') },
  { id: 'app-2', userId: 'candidate-2', cvId: 'cv-2', jobId: 'job-1', status: AppStatus.REVIEWING, coverLetter: 'Excited about this opportunity', notes: 'Good candidate', createdAt: new Date('2024-11-19'), updatedAt: new Date('2024-11-21') },
  { id: 'app-3', userId: 'candidate-3', cvId: 'cv-3', jobId: 'job-2', status: AppStatus.PENDING, coverLetter: 'Interested in joining startup', notes: null, createdAt: new Date('2024-11-21'), updatedAt: new Date('2024-11-21') },
  { id: 'app-4', userId: 'candidate-4', cvId: 'cv-4', jobId: 'job-2', status: AppStatus.ACCEPTED, coverLetter: 'Thrilled about opportunity', notes: 'Send offer', createdAt: new Date('2024-11-18'), updatedAt: new Date('2024-11-22') },
  { id: 'app-5', userId: 'candidate-5', cvId: 'cv-5', jobId: 'job-3', status: AppStatus.REVIEWING, coverLetter: 'Interested in DevOps position', notes: 'Strong background', createdAt: new Date('2024-11-20'), updatedAt: new Date('2024-11-21') },
  { id: 'app-6', userId: 'candidate-6', cvId: 'cv-6', jobId: 'job-4', status: AppStatus.PENDING, coverLetter: 'Excited about data engineer role', notes: null, createdAt: new Date('2024-11-22'), updatedAt: new Date('2024-11-22') },
  { id: 'app-7', userId: 'candidate-1', cvId: 'cv-1', jobId: 'job-2', status: AppStatus.REJECTED, coverLetter: 'Open to new challenges', notes: 'Overqualified', createdAt: new Date('2024-11-17'), updatedAt: new Date('2024-11-20') },
  { id: 'app-8', userId: 'candidate-7', cvId: 'cv-7', jobId: 'job-5', status: AppStatus.PENDING, coverLetter: 'Interested in mobile role', notes: null, createdAt: new Date('2024-11-22'), updatedAt: new Date('2024-11-22') },
];

export const mockSavedJobs: SavedJob[] = [
  { id: 'saved-1', userId: 'candidate-1', jobId: 'job-3', createdAt: new Date(), updatedAt: new Date() },
  { id: 'saved-2', userId: 'candidate-2', jobId: 'job-4', createdAt: new Date(), updatedAt: new Date() },
];

export const mockCVTemplates: CVTemplate[] = [
  { id: 'template-1', name: 'Default Template', description: 'Modern and clean CV template', thumbnail: 'https://images.unsplash.com/photo-1586281380349-632531db7ed4?w=400', config: {}, isActive: true, createdAt: new Date(), updatedAt: new Date() },
  { id: 'template-2', name: 'Harvard Template', description: 'Professional classic design', thumbnail: 'https://images.unsplash.com/photo-1586281380117-5a60ae2050cc?w=400', config: {}, isActive: true, createdAt: new Date(), updatedAt: new Date() },
];

// ===========================================
// HELPER FUNCTIONS
// ===========================================

export const getCVWithNested = (cvId: string) => {
  const cv = mockCVs.find(c => c.id === cvId);
  if (!cv) return null;
  return {
    ...cv,
    skills: mockCVSkills.filter(s => s.cvId === cvId),
    educations: mockEducations.filter(e => e.cvId === cvId),
    workExperiences: mockWorkExperiences.filter(w => w.cvId === cvId),
  };
};

export const getJobWithDetails = (jobId: string) => {
  const job = mockJobs.find(j => j.id === jobId);
  if (!job) return null;
  return {
    ...job,
    company: mockCompanies.find(c => c.id === job.companyId),
    salary: mockSalaries.find(s => s.id === job.salaryId),
    benefits: mockJobBenefits.filter(b => b.jobId === jobId),
    requirements: mockJobRequirements.filter(r => r.jobId === jobId),
    applications: mockApplications.filter(a => a.jobId === jobId),
  };
};

// Extended CV data for backward compatibility
export const getCVExtendedData = (cvId: string) => {
  const cv = mockCVs.find(c => c.id === cvId);
  if (!cv) return null;
  
  return {
    cvId: cvId,
    template: 'modern',
    skills: mockCVSkills.filter(s => s.cvId === cvId).map(skill => ({
      id: skill.id,
      name: skill.skillName,
      level: skill.level,
      yearsOfExperience: skill.yearsOfExperience,
    })),
    education: mockEducations.filter(e => e.cvId === cvId).map(edu => ({
      id: edu.id,
      institution: edu.institution,
      degree: edu.degree,
      fieldOfStudy: '',
      startDate: edu.startDate,
      endDate: edu.endDate,
      description: edu.description,
    })),
    workExperience: mockWorkExperiences.filter(w => w.cvId === cvId).map(exp => ({
      id: exp.id,
      jobTitle: exp.title,
      companyName: exp.company,
      location: '',
      startDate: exp.startDate,
      endDate: exp.endDate,
      isCurrent: exp.endDate === null,
      description: exp.description,
    })),
    projects: [],
    certifications: [],
    languages: [
      { id: 'lang-1', name: 'Vietnamese', proficiency: 'NATIVE', description: 'Native speaker' },
      { id: 'lang-2', name: 'English', proficiency: 'ADVANCED', description: 'Fluent' },
    ],
  };
};

// Extended job data for backward compatibility
export const getJobExtendedData = (jobId: string) => {
  const job = mockJobs.find(j => j.id === jobId);
  if (!job) return null;
  
  const salary = mockSalaries.find(s => s.id === job.salaryId);
  const benefits = mockJobBenefits.filter(b => b.jobId === jobId);
  const requirements = mockJobRequirements.filter(r => r.jobId === jobId);
  
  return {
    jobId: jobId,
    salaryMin: salary?.minAmount || 0,
    salaryMax: salary?.maxAmount || 0,
    salaryCurrency: salary?.currency || 'VND',
    skills: [], // Can be populated if needed
    requirements: requirements.map(r => ({
      id: r.id,
      title: r.title,
      description: r.description
    })),
    benefits: benefits.map(b => ({
      id: b.id,
      title: b.title,
      description: b.description
    })),
  };
};

// Get user's applications
export const getUserApplications = (userId: string): Application[] => {
  const userApps = mockApplications.filter(app => app.userId === userId);
  
  // If user has no applications, check if they have CVs and create mock data
  if (userApps.length === 0) {
    const userCVs = mockCVs.filter(cv => cv.userId === userId);
    
    if (userCVs.length > 0) {
      return [
        {
          id: `app-${userId}-1`,
          userId: userId,
          cvId: userCVs[0].id,
          jobId: 'job-1',
          status: AppStatus.REVIEWING,
          coverLetter: 'Tôi rất quan tâm đến vị trí này và tin rằng có thể đóng góp tích cực cho công ty.',
          notes: null,
          createdAt: new Date('2024-11-15T10:00:00Z'),
          updatedAt: new Date('2024-11-16T14:30:00Z'),
        },
        {
          id: `app-${userId}-2`,
          userId: userId,
          cvId: userCVs[0].id,
          jobId: 'job-2',
          status: AppStatus.PENDING,
          coverLetter: 'Xin ứng tuyển vị trí này. Tôi có kinh nghiệm phù hợp với yêu cầu công việc.',
          notes: null,
          createdAt: new Date('2024-11-18T09:00:00Z'),
          updatedAt: new Date('2024-11-18T09:00:00Z'),
        },
      ];
    }
  }
  
  return userApps;
};

// Get user's CVs
export const getUserCVs = (userId: string): CV[] => {
  const userCVs = mockCVs.filter(cv => cv.userId === userId);
  
  // If user has no CVs, create a default CV for them
  if (userCVs.length === 0) {
    const user = mockUsers.find(u => u.id === userId);
    if (user && user.role === UserRole.CANDIDATE) {
      return [
        {
          id: `cv-${userId}-default`,
          userId: userId,
          title: 'CV của tôi',
          isMain: true,
          fullName: user.fullName,
          email: user.email,
          phoneNumber: user.phoneNumber,
          dateOfBirth: user.dateOfBirth,
          gender: user.gender,
          address: 'Việt Nam',
          currentPosition: 'Ứng viên',
          summary: 'Mô tả ngắn gọn về bản thân và kinh nghiệm làm việc.',
          objective: 'Tìm kiếm cơ hội phát triển sự nghiệp.',
          lastGeneratedAt: null,
          embedding: null,
          isOpenForJob: true,
          templateId: 'template-1',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];
    }
  }
  
  return userCVs;
};