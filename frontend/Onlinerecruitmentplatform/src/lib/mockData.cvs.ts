import {
  CV, CVSkill, Education, Certification, WorkExperience, Project,
  Language, Achievement, Activity, Reference, SkillLevel, LanguageLevel, Gender,
} from './types';

// ============================================
// CV DATA WITH FULL NESTED RELATIONS
// ============================================

// CV 1: Senior Software Engineer (candidate-1) - OPEN FOR JOB
export const mockCV1: CV = {
  id: 'cv-1',
  userId: 'candidate-1',
  title: 'Senior Software Engineer CV',
  isMain: true,
  fullName: 'Pham Van D',
  email: 'candidate1@example.com',
  phoneNumber: '0923456789',
  dateOfBirth: new Date('1995-02-15'),
  gender: Gender.MALE,
  address: '123 Nguyen Hue, District 1, Ho Chi Minh City',
  currentPosition: 'Senior Software Engineer',
  summary: 'Experienced software engineer with 5+ years of experience in full-stack development. Specialized in Node.js, React, and cloud technologies.',
  objective: 'Seeking a challenging position as a Senior Software Engineer to contribute to innovative projects and grow professionally.',
  lastGeneratedAt: null,
  embedding: null,
  isOpenForJob: true,
  templateId: 'template-1',
  createdAt: new Date('2024-05-01T00:00:00Z'),
  updatedAt: new Date('2024-11-22T00:00:00Z'),
};

export const mockCV1Skills: CVSkill[] = [
  { id: 'skill-1-1', cvId: 'cv-1', skillName: 'JavaScript', level: SkillLevel.EXPERT, yearsOfExperience: 5, createdAt: new Date(), updatedAt: new Date() },
  { id: 'skill-1-2', cvId: 'cv-1', skillName: 'Node.js', level: SkillLevel.EXPERT, yearsOfExperience: 4, createdAt: new Date(), updatedAt: new Date() },
  { id: 'skill-1-3', cvId: 'cv-1', skillName: 'React', level: SkillLevel.ADVANCED, yearsOfExperience: 3, createdAt: new Date(), updatedAt: new Date() },
  { id: 'skill-1-4', cvId: 'cv-1', skillName: 'TypeScript', level: SkillLevel.ADVANCED, yearsOfExperience: 2, createdAt: new Date(), updatedAt: new Date() },
  { id: 'skill-1-5', cvId: 'cv-1', skillName: 'PostgreSQL', level: SkillLevel.ADVANCED, yearsOfExperience: 3, createdAt: new Date(), updatedAt: new Date() },
  { id: 'skill-1-6', cvId: 'cv-1', skillName: 'AWS', level: SkillLevel.INTERMEDIATE, yearsOfExperience: 2, createdAt: new Date(), updatedAt: new Date() },
];

export const mockCV1Education: Education[] = [
  {
    id: 'edu-1-1',
    cvId: 'cv-1',
    institution: 'Ho Chi Minh University of Technology',
    degree: 'Bachelor of Computer Science',
    startDate: new Date('2012-09-01'),
    endDate: new Date('2016-06-30'),
    description: 'Graduated with honors. GPA: 3.8/4.0',
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];

export const mockCV1Experience: WorkExperience[] = [
  {
    id: 'exp-1-1',
    cvId: 'cv-1',
    title: 'Senior Software Engineer',
    company: 'TechCorp Vietnam',
    startDate: new Date('2019-01-01'),
    endDate: null,
    description: 'Lead development of microservices architecture. Mentor junior developers. Implemented CI/CD pipelines.',
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 'exp-1-2',
    cvId: 'cv-1',
    title: 'Software Engineer',
    company: 'StartupXYZ',
    startDate: new Date('2016-07-01'),
    endDate: new Date('2018-12-31'),
    description: 'Developed RESTful APIs using Node.js. Built responsive frontend with React. Collaborated with cross-functional teams.',
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];

export const mockCV1Projects: Project[] = [
  {
    id: 'proj-1-1',
    cvId: 'cv-1',
    name: 'E-commerce Platform',
    description: 'Full-stack e-commerce application with payment integration',
    startDate: new Date('2020-01-01'),
    endDate: new Date('2020-06-30'),
    url: 'https://github.com/example/ecommerce',
    role: 'Full-stack Developer',
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];

export const mockCV1Certifications: Certification[] = [
  {
    id: 'cert-1-1',
    cvId: 'cv-1',
    name: 'AWS Certified Developer - Associate',
    issuer: 'Amazon Web Services',
    acquiredAt: new Date('2021-03-15'),
    description: 'Validated expertise in developing and maintaining applications on AWS',
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];

export const mockCV1Languages: Language[] = [
  { id: 'lang-1-1', cvId: 'cv-1', name: 'English', level: LanguageLevel.ADVANCED, description: 'Fluent in speaking and writing', createdAt: new Date(), updatedAt: new Date() },
  { id: 'lang-1-2', cvId: 'cv-1', name: 'Vietnamese', level: LanguageLevel.NATIVE, description: 'Native speaker', createdAt: new Date(), updatedAt: new Date() },
];

// CV 2: Frontend Developer (candidate-2) - OPEN FOR JOB
export const mockCV2: CV = {
  id: 'cv-2',
  userId: 'candidate-2',
  title: 'Frontend Developer CV',
  isMain: true,
  fullName: 'Hoang Thi E',
  email: 'candidate2@example.com',
  phoneNumber: '0923456790',
  dateOfBirth: new Date('1998-06-20'),
  gender: Gender.FEMALE,
  address: '456 Le Loi, District 3, Ho Chi Minh City',
  currentPosition: 'Frontend Developer',
  summary: 'Creative frontend developer with 3+ years of experience in building responsive and user-friendly web applications.',
  objective: 'Looking for opportunities to work on cutting-edge frontend technologies and create amazing user experiences.',
  lastGeneratedAt: null,
  embedding: null,
  isOpenForJob: true,
  templateId: 'template-2',
  createdAt: new Date('2024-05-15T00:00:00Z'),
  updatedAt: new Date('2024-11-21T00:00:00Z'),
};

export const mockCV2Skills: CVSkill[] = [
  { id: 'skill-2-1', cvId: 'cv-2', skillName: 'React', level: SkillLevel.ADVANCED, yearsOfExperience: 3, createdAt: new Date(), updatedAt: new Date() },
  { id: 'skill-2-2', cvId: 'cv-2', skillName: 'Vue.js', level: SkillLevel.ADVANCED, yearsOfExperience: 2, createdAt: new Date(), updatedAt: new Date() },
  { id: 'skill-2-3', cvId: 'cv-2', skillName: 'JavaScript', level: SkillLevel.ADVANCED, yearsOfExperience: 3, createdAt: new Date(), updatedAt: new Date() },
  { id: 'skill-2-4', cvId: 'cv-2', skillName: 'TypeScript', level: SkillLevel.INTERMEDIATE, yearsOfExperience: 1, createdAt: new Date(), updatedAt: new Date() },
  { id: 'skill-2-5', cvId: 'cv-2', skillName: 'CSS/SCSS', level: SkillLevel.EXPERT, yearsOfExperience: 4, createdAt: new Date(), updatedAt: new Date() },
  { id: 'skill-2-6', cvId: 'cv-2', skillName: 'UI/UX Design', level: SkillLevel.INTERMEDIATE, yearsOfExperience: 2, createdAt: new Date(), updatedAt: new Date() },
];

export const mockCV2Education: Education[] = [
  {
    id: 'edu-2-1',
    cvId: 'cv-2',
    institution: 'Ho Chi Minh University of Science',
    degree: 'Bachelor of Information Technology',
    startDate: new Date('2014-09-01'),
    endDate: new Date('2018-06-30'),
    description: 'Focus on web development and user interface design',
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];

export const mockCV2Experience: WorkExperience[] = [
  {
    id: 'exp-2-1',
    cvId: 'cv-2',
    title: 'Frontend Developer',
    company: 'Digital Agency ABC',
    startDate: new Date('2019-07-01'),
    endDate: null,
    description: 'Develop responsive web applications using React and Vue.js. Collaborate with designers to implement pixel-perfect UIs.',
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];

export const mockCV2Languages: Language[] = [
  { id: 'lang-2-1', cvId: 'cv-2', name: 'English', level: LanguageLevel.INTERMEDIATE, description: 'Good communication skills', createdAt: new Date(), updatedAt: new Date() },
  { id: 'lang-2-2', cvId: 'cv-2', name: 'Vietnamese', level: LanguageLevel.NATIVE, description: 'Native speaker', createdAt: new Date(), updatedAt: new Date() },
];

// CV 3: Backend Developer (candidate-3) - OPEN FOR JOB
export const mockCV3: CV = {
  id: 'cv-3',
  userId: 'candidate-3',
  title: 'Backend Developer CV',
  isMain: true,
  fullName: 'Vu Van F',
  email: 'candidate3@example.com',
  phoneNumber: '0923456791',
  dateOfBirth: new Date('1993-09-10'),
  gender: Gender.MALE,
  address: '789 Dong Khoi, District 1, Ho Chi Minh City',
  currentPosition: 'Backend Developer',
  summary: 'Backend developer specialized in building scalable APIs and microservices. Strong experience with Node.js, Python, and database design.',
  objective: 'Seeking a backend developer position to work on high-performance systems.',
  lastGeneratedAt: null,
  embedding: null,
  isOpenForJob: true,
  templateId: 'template-1',
  createdAt: new Date('2024-06-01T00:00:00Z'),
  updatedAt: new Date('2024-11-20T00:00:00Z'),
};

export const mockCV3Skills: CVSkill[] = [
  { id: 'skill-3-1', cvId: 'cv-3', skillName: 'Node.js', level: SkillLevel.ADVANCED, yearsOfExperience: 4, createdAt: new Date(), updatedAt: new Date() },
  { id: 'skill-3-2', cvId: 'cv-3', skillName: 'Python', level: SkillLevel.ADVANCED, yearsOfExperience: 3, createdAt: new Date(), updatedAt: new Date() },
  { id: 'skill-3-3', cvId: 'cv-3', skillName: 'PostgreSQL', level: SkillLevel.EXPERT, yearsOfExperience: 4, createdAt: new Date(), updatedAt: new Date() },
  { id: 'skill-3-4', cvId: 'cv-3', skillName: 'MongoDB', level: SkillLevel.ADVANCED, yearsOfExperience: 3, createdAt: new Date(), updatedAt: new Date() },
  { id: 'skill-3-5', cvId: 'cv-3', skillName: 'Redis', level: SkillLevel.INTERMEDIATE, yearsOfExperience: 2, createdAt: new Date(), updatedAt: new Date() },
  { id: 'skill-3-6', cvId: 'cv-3', skillName: 'Docker', level: SkillLevel.ADVANCED, yearsOfExperience: 2, createdAt: new Date(), updatedAt: new Date() },
];

export const mockCV3Education: Education[] = [
  {
    id: 'edu-3-1',
    cvId: 'cv-3',
    institution: 'Can Tho University',
    degree: 'Bachelor of Software Engineering',
    startDate: new Date('2011-09-01'),
    endDate: new Date('2015-06-30'),
    description: 'Specialized in software engineering and database systems',
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];

export const mockCV3Experience: WorkExperience[] = [
  {
    id: 'exp-3-1',
    cvId: 'cv-3',
    title: 'Backend Developer',
    company: 'FinTech Solutions',
    startDate: new Date('2017-01-01'),
    endDate: null,
    description: 'Design and develop RESTful APIs. Optimize database queries. Implement caching strategies.',
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];

export const mockCV3Languages: Language[] = [
  { id: 'lang-3-1', cvId: 'cv-3', name: 'English', level: LanguageLevel.ADVANCED, description: 'Professional working proficiency', createdAt: new Date(), updatedAt: new Date() },
  { id: 'lang-3-2', cvId: 'cv-3', name: 'Vietnamese', level: LanguageLevel.NATIVE, description: 'Native speaker', createdAt: new Date(), updatedAt: new Date() },
];

// CV 4: Full-stack Developer (candidate-4) - OPEN FOR JOB
export const mockCV4: CV = {
  id: 'cv-4',
  userId: 'candidate-4',
  title: 'Full-stack Developer CV',
  isMain: true,
  fullName: 'Dao Thi G',
  email: 'candidate4@example.com',
  phoneNumber: '0923456792',
  dateOfBirth: new Date('1996-12-05'),
  gender: Gender.FEMALE,
  address: '321 Pasteur, District 3, Ho Chi Minh City',
  currentPosition: 'Full-stack Developer',
  summary: 'Full-stack developer with expertise in both frontend and backend technologies. Passionate about building end-to-end solutions.',
  objective: 'Looking for full-stack developer opportunities to work on innovative projects.',
  lastGeneratedAt: null,
  embedding: null,
  isOpenForJob: true,
  templateId: 'template-2',
  createdAt: new Date('2024-06-15T00:00:00Z'),
  updatedAt: new Date('2024-11-19T00:00:00Z'),
};

export const mockCV4Skills: CVSkill[] = [
  { id: 'skill-4-1', cvId: 'cv-4', skillName: 'JavaScript', level: SkillLevel.EXPERT, yearsOfExperience: 4, createdAt: new Date(), updatedAt: new Date() },
  { id: 'skill-4-2', cvId: 'cv-4', skillName: 'Node.js', level: SkillLevel.ADVANCED, yearsOfExperience: 3, createdAt: new Date(), updatedAt: new Date() },
  { id: 'skill-4-3', cvId: 'cv-4', skillName: 'React', level: SkillLevel.ADVANCED, yearsOfExperience: 3, createdAt: new Date(), updatedAt: new Date() },
  { id: 'skill-4-4', cvId: 'cv-4', skillName: 'PostgreSQL', level: SkillLevel.ADVANCED, yearsOfExperience: 3, createdAt: new Date(), updatedAt: new Date() },
  { id: 'skill-4-5', cvId: 'cv-4', skillName: 'GraphQL', level: SkillLevel.INTERMEDIATE, yearsOfExperience: 1, createdAt: new Date(), updatedAt: new Date() },
];

export const mockCV4Education: Education[] = [
  {
    id: 'edu-4-1',
    cvId: 'cv-4',
    institution: 'Ho Chi Minh University of Technology',
    degree: 'Bachelor of Computer Science',
    startDate: new Date('2013-09-01'),
    endDate: new Date('2017-06-30'),
    description: 'Full-stack development focus',
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];

export const mockCV4Experience: WorkExperience[] = [
  {
    id: 'exp-4-1',
    cvId: 'cv-4',
    title: 'Full-stack Developer',
    company: 'Innovation Labs',
    startDate: new Date('2018-01-01'),
    endDate: null,
    description: 'Develop both frontend and backend components. Lead feature development from design to deployment.',
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];

export const mockCV4Languages: Language[] = [
  { id: 'lang-4-1', cvId: 'cv-4', name: 'English', level: LanguageLevel.ADVANCED, description: 'Fluent', createdAt: new Date(), updatedAt: new Date() },
  { id: 'lang-4-2', cvId: 'cv-4', name: 'Vietnamese', level: LanguageLevel.NATIVE, description: 'Native speaker', createdAt: new Date(), updatedAt: new Date() },
];

// CV 5: DevOps Engineer (candidate-5) - OPEN FOR JOB
export const mockCV5: CV = {
  id: 'cv-5',
  userId: 'candidate-5',
  title: 'DevOps Engineer CV',
  isMain: true,
  fullName: 'Bui Van H',
  email: 'candidate5@example.com',
  phoneNumber: '0923456793',
  dateOfBirth: new Date('1994-04-18'),
  gender: Gender.MALE,
  address: '654 Vo Van Tan, District 3, Ho Chi Minh City',
  currentPosition: 'DevOps Engineer',
  summary: 'DevOps engineer with expertise in CI/CD, containerization, and cloud infrastructure. Passionate about automation and infrastructure as code.',
  objective: 'Seeking DevOps engineer position to optimize development workflows and infrastructure.',
  lastGeneratedAt: null,
  embedding: null,
  isOpenForJob: true,
  templateId: 'template-1',
  createdAt: new Date('2024-07-01T00:00:00Z'),
  updatedAt: new Date('2024-11-18T00:00:00Z'),
};

export const mockCV5Skills: CVSkill[] = [
  { id: 'skill-5-1', cvId: 'cv-5', skillName: 'Docker', level: SkillLevel.EXPERT, yearsOfExperience: 3, createdAt: new Date(), updatedAt: new Date() },
  { id: 'skill-5-2', cvId: 'cv-5', skillName: 'Kubernetes', level: SkillLevel.ADVANCED, yearsOfExperience: 2, createdAt: new Date(), updatedAt: new Date() },
  { id: 'skill-5-3', cvId: 'cv-5', skillName: 'AWS', level: SkillLevel.ADVANCED, yearsOfExperience: 3, createdAt: new Date(), updatedAt: new Date() },
  { id: 'skill-5-4', cvId: 'cv-5', skillName: 'Terraform', level: SkillLevel.INTERMEDIATE, yearsOfExperience: 1, createdAt: new Date(), updatedAt: new Date() },
  { id: 'skill-5-5', cvId: 'cv-5', skillName: 'Jenkins', level: SkillLevel.ADVANCED, yearsOfExperience: 2, createdAt: new Date(), updatedAt: new Date() },
  { id: 'skill-5-6', cvId: 'cv-5', skillName: 'Linux', level: SkillLevel.EXPERT, yearsOfExperience: 5, createdAt: new Date(), updatedAt: new Date() },
];

export const mockCV5Education: Education[] = [
  {
    id: 'edu-5-1',
    cvId: 'cv-5',
    institution: 'Ho Chi Minh University of Technology',
    degree: 'Bachelor of Information Systems',
    startDate: new Date('2012-09-01'),
    endDate: new Date('2016-06-30'),
    description: 'Focus on system administration and cloud computing',
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];

export const mockCV5Experience: WorkExperience[] = [
  {
    id: 'exp-5-1',
    cvId: 'cv-5',
    title: 'DevOps Engineer',
    company: 'Cloud Solutions Inc',
    startDate: new Date('2018-01-01'),
    endDate: null,
    description: 'Design and maintain CI/CD pipelines. Manage Kubernetes clusters. Implement infrastructure as code.',
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];

export const mockCV5Certifications: Certification[] = [
  {
    id: 'cert-5-1',
    cvId: 'cv-5',
    name: 'AWS Certified Solutions Architect',
    issuer: 'Amazon Web Services',
    acquiredAt: new Date('2020-05-10'),
    description: 'Expertise in designing distributed systems on AWS',
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];

export const mockCV5Languages: Language[] = [
  { id: 'lang-5-1', cvId: 'cv-5', name: 'English', level: LanguageLevel.ADVANCED, description: 'Professional proficiency', createdAt: new Date(), updatedAt: new Date() },
  { id: 'lang-5-2', cvId: 'cv-5', name: 'Vietnamese', level: LanguageLevel.NATIVE, description: 'Native speaker', createdAt: new Date(), updatedAt: new Date() },
];

// CV 6: Data Engineer (candidate-6) - OPEN FOR JOB
export const mockCV6: CV = {
  id: 'cv-6',
  userId: 'candidate-6',
  title: 'Data Engineer CV',
  isMain: true,
  fullName: 'Dang Thi I',
  email: 'candidate6@example.com',
  phoneNumber: '0923456794',
  dateOfBirth: new Date('1997-08-22'),
  gender: Gender.FEMALE,
  address: '987 Nguyen Dinh Chieu, District 3, Ho Chi Minh City',
  currentPosition: 'Data Engineer',
  summary: 'Data engineer specialized in building data pipelines and ETL processes. Experience with big data technologies.',
  objective: 'Seeking data engineer position to work on large-scale data processing systems.',
  lastGeneratedAt: null,
  embedding: null,
  isOpenForJob: true,
  templateId: 'template-1',
  createdAt: new Date('2024-07-15T00:00:00Z'),
  updatedAt: new Date('2024-11-17T00:00:00Z'),
};

export const mockCV6Skills: CVSkill[] = [
  { id: 'skill-6-1', cvId: 'cv-6', skillName: 'Python', level: SkillLevel.EXPERT, yearsOfExperience: 4, createdAt: new Date(), updatedAt: new Date() },
  { id: 'skill-6-2', cvId: 'cv-6', skillName: 'Apache Spark', level: SkillLevel.ADVANCED, yearsOfExperience: 2, createdAt: new Date(), updatedAt: new Date() },
  { id: 'skill-6-3', cvId: 'cv-6', skillName: 'SQL', level: SkillLevel.EXPERT, yearsOfExperience: 5, createdAt: new Date(), updatedAt: new Date() },
  { id: 'skill-6-4', cvId: 'cv-6', skillName: 'Airflow', level: SkillLevel.INTERMEDIATE, yearsOfExperience: 1, createdAt: new Date(), updatedAt: new Date() },
  { id: 'skill-6-5', cvId: 'cv-6', skillName: 'Hadoop', level: SkillLevel.INTERMEDIATE, yearsOfExperience: 1, createdAt: new Date(), updatedAt: new Date() },
];

export const mockCV6Education: Education[] = [
  {
    id: 'edu-6-1',
    cvId: 'cv-6',
    institution: 'Ho Chi Minh University of Science',
    degree: 'Bachelor of Data Science',
    startDate: new Date('2014-09-01'),
    endDate: new Date('2018-06-30'),
    description: 'Focus on data engineering and big data technologies',
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];

export const mockCV6Experience: WorkExperience[] = [
  {
    id: 'exp-6-1',
    cvId: 'cv-6',
    title: 'Data Engineer',
    company: 'Data Analytics Corp',
    startDate: new Date('2019-01-01'),
    endDate: null,
    description: 'Design and implement data pipelines. Optimize data processing workflows. Maintain data warehouse.',
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];

export const mockCV6Languages: Language[] = [
  { id: 'lang-6-1', cvId: 'cv-6', name: 'English', level: LanguageLevel.INTERMEDIATE, description: 'Working proficiency', createdAt: new Date(), updatedAt: new Date() },
  { id: 'lang-6-2', cvId: 'cv-6', name: 'Vietnamese', level: LanguageLevel.NATIVE, description: 'Native speaker', createdAt: new Date(), updatedAt: new Date() },
];

// CV 7: Mobile Developer (candidate-7) - OPEN FOR JOB
export const mockCV7: CV = {
  id: 'cv-7',
  userId: 'candidate-7',
  title: 'Mobile Developer CV',
  isMain: true,
  fullName: 'Ngo Van K',
  email: 'candidate7@example.com',
  phoneNumber: '0923456795',
  dateOfBirth: new Date('1992-01-30'),
  gender: Gender.MALE,
  address: '147 Tran Hung Dao, District 1, Ho Chi Minh City',
  currentPosition: 'Mobile Developer',
  summary: 'Mobile developer with expertise in React Native and Flutter. Built multiple cross-platform mobile applications.',
  objective: 'Looking for mobile developer opportunities to create innovative mobile experiences.',
  lastGeneratedAt: null,
  embedding: null,
  isOpenForJob: true,
  templateId: 'template-1',
  createdAt: new Date('2024-08-01T00:00:00Z'),
  updatedAt: new Date('2024-11-16T00:00:00Z'),
};

export const mockCV7Skills: CVSkill[] = [
  { id: 'skill-7-1', cvId: 'cv-7', skillName: 'React Native', level: SkillLevel.ADVANCED, yearsOfExperience: 3, createdAt: new Date(), updatedAt: new Date() },
  { id: 'skill-7-2', cvId: 'cv-7', skillName: 'Flutter', level: SkillLevel.ADVANCED, yearsOfExperience: 2, createdAt: new Date(), updatedAt: new Date() },
  { id: 'skill-7-3', cvId: 'cv-7', skillName: 'JavaScript', level: SkillLevel.ADVANCED, yearsOfExperience: 3, createdAt: new Date(), updatedAt: new Date() },
  { id: 'skill-7-4', cvId: 'cv-7', skillName: 'Dart', level: SkillLevel.INTERMEDIATE, yearsOfExperience: 2, createdAt: new Date(), updatedAt: new Date() },
  { id: 'skill-7-5', cvId: 'cv-7', skillName: 'iOS Development', level: SkillLevel.INTERMEDIATE, yearsOfExperience: 1, createdAt: new Date(), updatedAt: new Date() },
  { id: 'skill-7-6', cvId: 'cv-7', skillName: 'Android Development', level: SkillLevel.INTERMEDIATE, yearsOfExperience: 1, createdAt: new Date(), updatedAt: new Date() },
];

export const mockCV7Education: Education[] = [
  {
    id: 'edu-7-1',
    cvId: 'cv-7',
    institution: 'Ho Chi Minh University of Technology',
    degree: 'Bachelor of Computer Science',
    startDate: new Date('2011-09-01'),
    endDate: new Date('2015-06-30'),
    description: 'Mobile development specialization',
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];

export const mockCV7Experience: WorkExperience[] = [
  {
    id: 'exp-7-1',
    cvId: 'cv-7',
    title: 'Mobile Developer',
    company: 'Mobile Apps Studio',
    startDate: new Date('2017-01-01'),
    endDate: null,
    description: 'Develop cross-platform mobile applications. Publish apps to App Store and Google Play.',
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];

export const mockCV7Languages: Language[] = [
  { id: 'lang-7-1', cvId: 'cv-7', name: 'English', level: LanguageLevel.ADVANCED, description: 'Fluent', createdAt: new Date(), updatedAt: new Date() },
  { id: 'lang-7-2', cvId: 'cv-7', name: 'Vietnamese', level: LanguageLevel.NATIVE, description: 'Native speaker', createdAt: new Date(), updatedAt: new Date() },
];

// CV 8: UI/UX Designer (candidate-8) - NOT OPEN FOR JOB
export const mockCV8: CV = {
  id: 'cv-8',
  userId: 'candidate-8',
  title: 'UI/UX Designer CV',
  isMain: true,
  fullName: 'Ly Thi L',
  email: 'candidate8@example.com',
  phoneNumber: '0923456796',
  dateOfBirth: new Date('1999-03-12'),
  gender: Gender.FEMALE,
  address: '258 Ly Tu Trong, District 1, Ho Chi Minh City',
  currentPosition: 'UI/UX Designer',
  summary: 'Creative UI/UX designer with passion for creating beautiful and user-friendly interfaces.',
  objective: null,
  lastGeneratedAt: null,
  embedding: null,
  isOpenForJob: false, // NOT OPEN FOR JOB
  templateId: 'template-2',
  createdAt: new Date('2024-08-15T00:00:00Z'),
  updatedAt: new Date('2024-11-15T00:00:00Z'),
};

export const mockCV8Skills: CVSkill[] = [
  { id: 'skill-8-1', cvId: 'cv-8', skillName: 'Figma', level: SkillLevel.EXPERT, yearsOfExperience: 3, createdAt: new Date(), updatedAt: new Date() },
  { id: 'skill-8-2', cvId: 'cv-8', skillName: 'Adobe XD', level: SkillLevel.ADVANCED, yearsOfExperience: 2, createdAt: new Date(), updatedAt: new Date() },
  { id: 'skill-8-3', cvId: 'cv-8', skillName: 'Sketch', level: SkillLevel.INTERMEDIATE, yearsOfExperience: 1, createdAt: new Date(), updatedAt: new Date() },
];

export const mockCV8Education: Education[] = [
  {
    id: 'edu-8-1',
    cvId: 'cv-8',
    institution: 'Ho Chi Minh University of Architecture',
    degree: 'Bachelor of Design',
    startDate: new Date('2015-09-01'),
    endDate: new Date('2019-06-30'),
    description: 'Focus on user interface and user experience design',
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];

export const mockCV8Experience: WorkExperience[] = [];
export const mockCV8Languages: Language[] = [
  { id: 'lang-8-1', cvId: 'cv-8', name: 'English', level: LanguageLevel.INTERMEDIATE, description: 'Good', createdAt: new Date(), updatedAt: new Date() },
  { id: 'lang-8-2', cvId: 'cv-8', name: 'Vietnamese', level: LanguageLevel.NATIVE, description: 'Native speaker', createdAt: new Date(), updatedAt: new Date() },
];

// Export all CVs
export const mockCVs: CV[] = [
  mockCV1, mockCV2, mockCV3, mockCV4, mockCV5, mockCV6, mockCV7, mockCV8,
];

// Export all nested data arrays
export const mockCVSkills: CVSkill[] = [
  ...mockCV1Skills, ...mockCV2Skills, ...mockCV3Skills, ...mockCV4Skills,
  ...mockCV5Skills, ...mockCV6Skills, ...mockCV7Skills, ...mockCV8Skills,
];

export const mockEducations: Education[] = [
  ...mockCV1Education, ...mockCV2Education, ...mockCV3Education, ...mockCV4Education,
  ...mockCV5Education, ...mockCV6Education, ...mockCV7Education, ...mockCV8Education,
];

export const mockWorkExperiences: WorkExperience[] = [
  ...mockCV1Experience, ...mockCV2Experience, ...mockCV3Experience, ...mockCV4Experience,
  ...mockCV5Experience, ...mockCV6Experience, ...mockCV7Experience, ...mockCV8Experience,
];

export const mockProjects: Project[] = [
  ...mockCV1Projects,
];

export const mockCertifications: Certification[] = [
  ...mockCV1Certifications, ...mockCV5Certifications,
];

export const mockLanguages: Language[] = [
  ...mockCV1Languages, ...mockCV2Languages, ...mockCV3Languages, ...mockCV4Languages,
  ...mockCV5Languages, ...mockCV6Languages, ...mockCV7Languages, ...mockCV8Languages,
];

export const mockAchievements: Achievement[] = [];
export const mockActivities: Activity[] = [];
export const mockReferences: Reference[] = [];

// Helper: Get CV with all nested data
export const getCVWithNested = (cvId: string) => {
  const cv = mockCVs.find(c => c.id === cvId);
  if (!cv) return null;

  return {
    ...cv,
    skills: mockCVSkills.filter(s => s.cvId === cvId),
    educations: mockEducations.filter(e => e.cvId === cvId),
    workExperiences: mockWorkExperiences.filter(w => w.cvId === cvId),
    projects: mockProjects.filter(p => p.cvId === cvId),
    certifications: mockCertifications.filter(c => c.cvId === cvId),
    languages: mockLanguages.filter(l => l.cvId === cvId),
    achievements: mockAchievements.filter(a => a.cvId === cvId),
    activities: mockActivities.filter(a => a.cvId === cvId),
    references: mockReferences.filter(r => r.cvId === cvId),
  };
};
