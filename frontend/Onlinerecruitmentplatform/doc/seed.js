import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

/**
 * Hash password với bcrypt
 */
const hashPassword = async (password) => {
  return await bcrypt.hash(password, 10);
};

/**
 * Seed database với dữ liệu mẫu
 */
async function main() {
  console.log('🌱 Starting seed...\n');

  // Clear existing data (optional - comment out if you want to keep existing data)
  console.log('🗑️  Clearing existing data...');
  await prisma.notification.deleteMany();
  await prisma.recommendJobforCV.deleteMany();
  await prisma.savedJob.deleteMany();
  await prisma.application.deleteMany();
  await prisma.similarJob.deleteMany();
  await prisma.jobRequirement.deleteMany();
  await prisma.jobBenefit.deleteMany();
  await prisma.job.deleteMany();
  await prisma.salary.deleteMany();
  await prisma.socialMedia.deleteMany();
  await prisma.companyMember.deleteMany();
  await prisma.company.deleteMany();
  await prisma.reference.deleteMany();
  await prisma.activity.deleteMany();
  await prisma.achievement.deleteMany();
  await prisma.language.deleteMany();
  await prisma.project.deleteMany();
  await prisma.workExperience.deleteMany();
  await prisma.certification.deleteMany();
  await prisma.education.deleteMany();
  await prisma.cVSkill.deleteMany();
  await prisma.cV.deleteMany();
  // Don't delete CV templates - using existing ones from database
  // await prisma.cVTemplate.deleteMany();
  await prisma.user.deleteMany();
  console.log('✅ Existing data cleared\n');

  // Hash password chung cho tất cả users (để dễ test)
  const defaultPassword = await hashPassword('password123');
  const adminPassword = await hashPassword('admin123');

  // ============================================
  // 1. ADMIN USERS
  // ============================================
  console.log('👑 Creating ADMIN users...');

  const admin1 = await prisma.user.create({
    data: {
      email: 'admin@jobsconnect.com',
      passwordHash: adminPassword,
      fullName: 'Admin User',
      phoneNumber: '0901234567',
      gender: 'MALE',
      role: 'ADMIN',
      dateOfBirth: new Date('1985-01-15'),
      status: 'ACTIVE',
    },
  });

  const admin2 = await prisma.user.create({
    data: {
      email: 'admin2@jobsconnect.com',
      passwordHash: adminPassword,
      fullName: 'Admin User 2',
      phoneNumber: '0901234568',
      gender: 'FEMALE',
      role: 'ADMIN',
      dateOfBirth: new Date('1990-05-20'),
      status: 'ACTIVE',
    },
  });

  console.log(`✅ Created ${2} ADMIN users`);
  console.log(`   - ${admin1.email} (${admin1.id})`);
  console.log(`   - ${admin2.email} (${admin2.id})\n`);

  // ============================================
  // 2. COMPANIES (for RECRUITERS)
  // ============================================
  console.log('🏢 Creating Companies...');

  const company1 = await prisma.company.create({
    data: {
      name: 'TechCorp Vietnam',
      website: 'https://techcorp.vn',
      description: 'Leading technology company in Vietnam, specializing in software development and digital transformation.',
      industry: 'Technology',
      companySize: 'LARGE',
      foundedYear: 2010,
      address: '123 Nguyen Hue, District 1, Ho Chi Minh City',
      phone: '0281234567',
      email: 'contact@techcorp.vn',
      status: 'ACTIVE',
    },
  });

  const company2 = await prisma.company.create({
    data: {
      name: 'StartupHub',
      website: 'https://startuphub.com',
      description: 'Innovative startup incubator and accelerator for tech startups.',
      industry: 'Technology',
      companySize: 'SMALL',
      foundedYear: 2018,
      address: '456 Le Loi, District 3, Ho Chi Minh City',
      phone: '0287654321',
      email: 'hello@startuphub.com',
      status: 'ACTIVE',
    },
  });

  const company3 = await prisma.company.create({
    data: {
      name: 'FinancePro',
      website: 'https://financepro.vn',
      description: 'Financial services and consulting company.',
      industry: 'Finance',
      companySize: 'MEDIUM',
      foundedYear: 2015,
      address: '789 Dong Khoi, District 1, Ho Chi Minh City',
      phone: '0289876543',
      email: 'info@financepro.vn',
      status: 'ACTIVE',
    },
  });

  console.log(`✅ Created ${3} Companies`);
  console.log(`   - ${company1.name} (${company1.id})`);
  console.log(`   - ${company2.name} (${company2.id})`);
  console.log(`   - ${company3.name} (${company3.id})\n`);

  // ============================================
  // 3. RECRUITER USERS
  // ============================================
  console.log('👔 Creating RECRUITER users...');

  const recruiter1 = await prisma.user.create({
    data: {
      email: 'recruiter1@techcorp.vn',
      passwordHash: defaultPassword,
      fullName: 'Nguyen Van A',
      phoneNumber: '0912345678',
      gender: 'MALE',
      role: 'RECRUITER',
      dateOfBirth: new Date('1988-03-10'),
      status: 'ACTIVE',
    },
  });

  const recruiter2 = await prisma.user.create({
    data: {
      email: 'recruiter2@startuphub.com',
      passwordHash: defaultPassword,
      fullName: 'Tran Thi B',
      phoneNumber: '0912345679',
      gender: 'FEMALE',
      role: 'RECRUITER',
      dateOfBirth: new Date('1992-07-25'),
      status: 'ACTIVE',
    },
  });

  const recruiter3 = await prisma.user.create({
    data: {
      email: 'recruiter3@financepro.vn',
      passwordHash: defaultPassword,
      fullName: 'Le Van C',
      phoneNumber: '0912345680',
      gender: 'MALE',
      role: 'RECRUITER',
      dateOfBirth: new Date('1985-11-30'),
      status: 'ACTIVE',
    },
  });

  // Link RECRUITERS với Companies
  // Mỗi RECRUITER phải có 1 CompanyMember để đảm bảo tính nhất quán
  // Company 1: recruiter1 là OWNER (chủ sở hữu)
  const member1 = await prisma.companyMember.create({
    data: {
      userId: recruiter1.id,
      companyId: company1.id,
      companyRole: 'OWNER',
    },
  });

  // Company 2: recruiter2 là MANAGER
  const member2 = await prisma.companyMember.create({
    data: {
      userId: recruiter2.id,
      companyId: company2.id,
      companyRole: 'MANAGER',
    },
  });

  // Company 3: recruiter3 là RECRUITER
  const member3 = await prisma.companyMember.create({
    data: {
      userId: recruiter3.id,
      companyId: company3.id,
      companyRole: 'RECRUITER',
    },
  });

  // Verify: Mỗi RECRUITER đều có CompanyMember
  const allRecruiters = [recruiter1, recruiter2, recruiter3];
  const allMembers = [member1, member2, member3];
  
  if (allRecruiters.length !== allMembers.length) {
    throw new Error('❌ Error: Not all RECRUITER users have CompanyMember records!');
  }

  console.log(`✅ Created ${3} RECRUITER users with CompanyMember links`);
  console.log(`   - ${recruiter1.email} → ${company1.name} (${member1.companyRole})`);
  console.log(`   - ${recruiter2.email} → ${company2.name} (${member2.companyRole})`);
  console.log(`   - ${recruiter3.email} → ${company3.name} (${member3.companyRole})`);
  console.log(`   ✅ Verified: All ${allRecruiters.length} RECRUITER users have CompanyMember records\n`);

  // ============================================
  // 4. CANDIDATE USERS
  // ============================================
  console.log('👤 Creating CANDIDATE users...');

  const candidates = [
    {
      email: 'candidate1@example.com',
      fullName: 'Pham Van D',
      phoneNumber: '0923456789',
      gender: 'MALE',
      dateOfBirth: new Date('1995-02-15'),
      status: 'ACTIVE',
    },
    {
      email: 'candidate2@example.com',
      fullName: 'Hoang Thi E',
      phoneNumber: '0923456790',
      gender: 'FEMALE',
      dateOfBirth: new Date('1998-06-20'),
      status: 'ACTIVE',
    },
    {
      email: 'candidate3@example.com',
      fullName: 'Vu Van F',
      phoneNumber: '0923456791',
      gender: 'MALE',
      dateOfBirth: new Date('1993-09-10'),
      status: 'ACTIVE',
    },
    {
      email: 'candidate4@example.com',
      fullName: 'Dao Thi G',
      phoneNumber: '0923456792',
      gender: 'FEMALE',
      dateOfBirth: new Date('1996-12-05'),
      status: 'ACTIVE',
    },
    {
      email: 'candidate5@example.com',
      fullName: 'Bui Van H',
      phoneNumber: '0923456793',
      gender: 'MALE',
      dateOfBirth: new Date('1994-04-18'),
      status: 'ACTIVE',
    },
    {
      email: 'candidate6@example.com',
      fullName: 'Dang Thi I',
      phoneNumber: '0923456794',
      gender: 'FEMALE',
      dateOfBirth: new Date('1997-08-22'),
      status: 'ACTIVE',
    },
    {
      email: 'candidate7@example.com',
      fullName: 'Ngo Van K',
      phoneNumber: '0923456795',
      gender: 'MALE',
      dateOfBirth: new Date('1992-01-30'),
      status: 'ACTIVE',
    },
    {
      email: 'candidate8@example.com',
      fullName: 'Ly Thi L',
      phoneNumber: '0923456796',
      gender: 'FEMALE',
      dateOfBirth: new Date('1999-03-12'),
      status: 'ACTIVE',
    },
  ];

  const createdCandidates = [];
  for (const candidateData of candidates) {
    const candidate = await prisma.user.create({
      data: {
        ...candidateData,
        email: candidateData.email,
        passwordHash: defaultPassword,
        role: 'CANDIDATE',
      },
    });
    createdCandidates.push(candidate);
  }

  console.log(`✅ Created ${createdCandidates.length} CANDIDATE users`);
  createdCandidates.forEach((c, index) => {
    console.log(`   ${index + 1}. ${c.email} (${c.fullName})`);
  });
  console.log('');

  // ============================================
  // 5. CV TEMPLATES (using existing templates)
  // ============================================
  console.log('📋 Using existing CV Templates...');

  // Template IDs from database
  const templateDefaultId = '1422fdb9-9750-4419-af48-6e0764f42444'; // Default template
  const templateHarvardId = '277368f3-35d6-49cb-86a3-06e1803a7f91'; // Harvard template

  // Verify templates exist
  const templateDefault = await prisma.cVTemplate.findUnique({
    where: { id: templateDefaultId },
  });
  const templateHarvard = await prisma.cVTemplate.findUnique({
    where: { id: templateHarvardId },
  });

  if (!templateDefault || !templateHarvard) {
    console.log('⚠️  Warning: Some templates not found in database. Make sure templates are created first.');
  }

  console.log(`✅ Using ${2} existing CV Templates`);
  console.log(`   - ${templateDefault?.name || 'Default'} (${templateDefaultId}) - ${templateDefault?.isActive ? 'Active' : 'Inactive'}`);
  console.log(`   - ${templateHarvard?.name || 'Harvard'} (${templateHarvardId}) - ${templateHarvard?.isActive ? 'Active' : 'Inactive'}\n`);

  // ============================================
  // 6. CVs FOR CANDIDATES (with full nested data and template references)
  // ============================================
  console.log('📄 Creating CVs with full nested data...');

  // CV 1: Senior Software Engineer
  const cv1 = await prisma.cV.create({
    data: {
      userId: createdCandidates[0].id,
      title: 'Senior Software Engineer CV',
      isMain: true,
      fullName: createdCandidates[0].fullName,
      email: createdCandidates[0].email,
      phoneNumber: createdCandidates[0].phoneNumber,
      dateOfBirth: createdCandidates[0].dateOfBirth,
      gender: createdCandidates[0].gender,
      address: '123 Nguyen Hue, District 1, Ho Chi Minh City',
      currentPosition: 'Senior Software Engineer',
      summary: 'Experienced software engineer with 5+ years of experience in full-stack development. Specialized in Node.js, React, and cloud technologies.',
      objective: 'Seeking a challenging position as a Senior Software Engineer to contribute to innovative projects and grow professionally.',
      isOpenForJob: true,
      templateId: templateDefaultId, // Default template for developer
      skills: {
        create: [
          { skillName: 'JavaScript', level: 'EXPERT', yearsOfExperience: 5 },
          { skillName: 'Node.js', level: 'EXPERT', yearsOfExperience: 4 },
          { skillName: 'React', level: 'ADVANCED', yearsOfExperience: 3 },
          { skillName: 'TypeScript', level: 'ADVANCED', yearsOfExperience: 2 },
          { skillName: 'PostgreSQL', level: 'ADVANCED', yearsOfExperience: 3 },
          { skillName: 'AWS', level: 'INTERMEDIATE', yearsOfExperience: 2 },
        ],
      },
      educations: {
        create: [
          {
            institution: 'Ho Chi Minh University of Technology',
            degree: 'Bachelor of Computer Science',
            startDate: new Date('2012-09-01'),
            endDate: new Date('2016-06-30'),
            description: 'Graduated with honors. GPA: 3.8/4.0',
          },
        ],
      },
      workExperiences: {
        create: [
          {
            title: 'Senior Software Engineer',
            company: 'TechCorp Vietnam',
            startDate: new Date('2019-01-01'),
            endDate: null,
            description: 'Lead development of microservices architecture. Mentor junior developers. Implemented CI/CD pipelines.',
          },
          {
            title: 'Software Engineer',
            company: 'StartupXYZ',
            startDate: new Date('2016-07-01'),
            endDate: new Date('2018-12-31'),
            description: 'Developed RESTful APIs using Node.js. Built responsive frontend with React. Collaborated with cross-functional teams.',
          },
        ],
      },
      projects: {
        create: [
          {
            name: 'E-commerce Platform',
            description: 'Full-stack e-commerce application with payment integration',
            startDate: new Date('2020-01-01'),
            endDate: new Date('2020-06-30'),
            url: 'https://github.com/example/ecommerce',
            role: 'Full-stack Developer',
          },
          {
            name: 'Real-time Chat Application',
            description: 'WebSocket-based chat application with real-time messaging',
            startDate: new Date('2021-03-01'),
            endDate: new Date('2021-05-31'),
            url: 'https://github.com/example/chat-app',
            role: 'Backend Developer',
          },
        ],
      },
      certifications: {
        create: [
          {
            name: 'AWS Certified Developer - Associate',
            issuer: 'Amazon Web Services',
            acquiredAt: new Date('2021-03-15'),
            description: 'Validated expertise in developing and maintaining applications on AWS',
          },
          {
            name: 'Node.js Application Development',
            issuer: 'Udemy',
            acquiredAt: new Date('2019-06-20'),
            description: 'Advanced Node.js development course',
          },
        ],
      },
      languages: {
        create: [
          { name: 'English', level: 'ADVANCED', description: 'Fluent in speaking and writing' },
          { name: 'Vietnamese', level: 'NATIVE', description: 'Native speaker' },
        ],
      },
      achievements: {
        create: [
          {
            title: 'Best Employee of the Year',
            description: 'Awarded for outstanding performance and innovation',
            acquiredAt: new Date('2022-12-31'),
          },
          {
            title: 'Open Source Contributor',
            description: 'Contributed to 10+ open source projects on GitHub',
            acquiredAt: new Date('2021-06-15'),
          },
        ],
      },
      activities: {
        create: [
          {
            title: 'Tech Meetup Organizer',
            organization: 'Ho Chi Minh Tech Community',
            startDate: new Date('2018-01-01'),
            endDate: null,
            description: 'Organize monthly tech meetups for developers',
          },
        ],
      },
      references: {
        create: [
          {
            name: 'John Doe',
            position: 'CTO',
            company: 'TechCorp Vietnam',
            description: 'Former manager. Can provide reference upon request.',
          },
        ],
      },
    },
  });

  // CV 2: Frontend Developer
  const cv2 = await prisma.cV.create({
    data: {
      userId: createdCandidates[1].id,
      title: 'Frontend Developer CV',
      isMain: true,
      fullName: createdCandidates[1].fullName,
      email: createdCandidates[1].email,
      phoneNumber: createdCandidates[1].phoneNumber,
      dateOfBirth: createdCandidates[1].dateOfBirth,
      gender: createdCandidates[1].gender,
      address: '456 Le Loi, District 3, Ho Chi Minh City',
      currentPosition: 'Frontend Developer',
      summary: 'Creative frontend developer with 3+ years of experience in building responsive and user-friendly web applications.',
      objective: 'Looking for opportunities to work on cutting-edge frontend technologies and create amazing user experiences.',
      isOpenForJob: true,
      templateId: templateHarvardId, // Harvard template for frontend developer
      skills: {
        create: [
          { skillName: 'React', level: 'ADVANCED', yearsOfExperience: 3 },
          { skillName: 'Vue.js', level: 'ADVANCED', yearsOfExperience: 2 },
          { skillName: 'JavaScript', level: 'ADVANCED', yearsOfExperience: 3 },
          { skillName: 'TypeScript', level: 'INTERMEDIATE', yearsOfExperience: 1 },
          { skillName: 'CSS/SCSS', level: 'EXPERT', yearsOfExperience: 4 },
          { skillName: 'UI/UX Design', level: 'INTERMEDIATE', yearsOfExperience: 2 },
        ],
      },
      educations: {
        create: [
          {
            institution: 'Ho Chi Minh University of Science',
            degree: 'Bachelor of Information Technology',
            startDate: new Date('2014-09-01'),
            endDate: new Date('2018-06-30'),
            description: 'Focus on web development and user interface design',
          },
        ],
      },
      workExperiences: {
        create: [
          {
            title: 'Frontend Developer',
            company: 'Digital Agency ABC',
            startDate: new Date('2019-07-01'),
            endDate: null,
            description: 'Develop responsive web applications using React and Vue.js. Collaborate with designers to implement pixel-perfect UIs.',
          },
        ],
      },
      projects: {
        create: [
          {
            name: 'E-learning Platform',
            description: 'Interactive learning platform with video streaming and quizzes',
            startDate: new Date('2020-09-01'),
            endDate: new Date('2021-02-28'),
            url: 'https://github.com/example/elearning',
            role: 'Frontend Lead',
          },
        ],
      },
      certifications: {
        create: [
          {
            name: 'React Advanced Patterns',
            issuer: 'Frontend Masters',
            acquiredAt: new Date('2020-11-10'),
            description: 'Advanced React patterns and best practices',
          },
        ],
      },
      languages: {
        create: [
          { name: 'English', level: 'INTERMEDIATE', description: 'Good communication skills' },
          { name: 'Vietnamese', level: 'NATIVE', description: 'Native speaker' },
        ],
      },
      achievements: {
        create: [
          {
            title: 'Best UI Design Award',
            description: 'Won best UI design in company hackathon',
            acquiredAt: new Date('2021-12-15'),
          },
        ],
      },
      activities: {
        create: [
          {
            title: 'Frontend Community Volunteer',
            organization: 'Vietnam Frontend Community',
            startDate: new Date('2019-01-01'),
            endDate: null,
            description: 'Help organize workshops and share knowledge',
          },
        ],
      },
      references: {
        create: [
          {
            name: 'Jane Smith',
            position: 'Lead Designer',
            company: 'Digital Agency ABC',
            description: 'Worked together on multiple projects',
          },
        ],
      },
    },
  });

  // CV 3: Backend Developer
  const cv3 = await prisma.cV.create({
    data: {
      userId: createdCandidates[2].id,
      title: 'Backend Developer CV',
      isMain: true,
      fullName: createdCandidates[2].fullName,
      email: createdCandidates[2].email,
      phoneNumber: createdCandidates[2].phoneNumber,
      dateOfBirth: createdCandidates[2].dateOfBirth,
      gender: createdCandidates[2].gender,
      address: '789 Dong Khoi, District 1, Ho Chi Minh City',
      currentPosition: 'Backend Developer',
      summary: 'Backend developer specialized in building scalable APIs and microservices. Strong experience with Node.js, Python, and database design.',
      objective: 'Seeking a backend developer position to work on high-performance systems.',
      isOpenForJob: true,
      templateId: templateDefaultId, // Default template for backend developer
      skills: {
        create: [
          { skillName: 'Node.js', level: 'ADVANCED', yearsOfExperience: 4 },
          { skillName: 'Python', level: 'ADVANCED', yearsOfExperience: 3 },
          { skillName: 'PostgreSQL', level: 'EXPERT', yearsOfExperience: 4 },
          { skillName: 'MongoDB', level: 'ADVANCED', yearsOfExperience: 3 },
          { skillName: 'Redis', level: 'INTERMEDIATE', yearsOfExperience: 2 },
          { skillName: 'Docker', level: 'ADVANCED', yearsOfExperience: 2 },
        ],
      },
      educations: {
        create: [
          {
            institution: 'Can Tho University',
            degree: 'Bachelor of Software Engineering',
            startDate: new Date('2011-09-01'),
            endDate: new Date('2015-06-30'),
            description: 'Specialized in software engineering and database systems',
          },
        ],
      },
      workExperiences: {
        create: [
          {
            title: 'Backend Developer',
            company: 'FinTech Solutions',
            startDate: new Date('2017-01-01'),
            endDate: null,
            description: 'Design and develop RESTful APIs. Optimize database queries. Implement caching strategies.',
          },
          {
            title: 'Junior Backend Developer',
            company: 'WebDev Studio',
            startDate: new Date('2015-07-01'),
            endDate: new Date('2016-12-31'),
            description: 'Developed backend services using Node.js. Worked with MySQL and MongoDB databases.',
          },
        ],
      },
      projects: {
        create: [
          {
            name: 'Payment Gateway API',
            description: 'Secure payment processing API with fraud detection',
            startDate: new Date('2020-01-01'),
            endDate: new Date('2020-12-31'),
            url: 'https://github.com/example/payment-api',
            role: 'Backend Developer',
          },
        ],
      },
      certifications: {
        create: [
          {
            name: 'MongoDB Certified Developer',
            issuer: 'MongoDB University',
            acquiredAt: new Date('2019-08-20'),
            description: 'MongoDB database design and development',
          },
        ],
      },
      languages: {
        create: [
          { name: 'English', level: 'ADVANCED', description: 'Professional working proficiency' },
          { name: 'Vietnamese', level: 'NATIVE', description: 'Native speaker' },
        ],
      },
      achievements: {
        create: [
          {
            title: 'Performance Optimization Award',
            description: 'Reduced API response time by 60%',
            acquiredAt: new Date('2021-09-30'),
          },
        ],
      },
      activities: {
        create: [
          {
            title: 'Backend Architecture Study Group',
            organization: 'Vietnam Backend Community',
            startDate: new Date('2018-01-01'),
            endDate: null,
            description: 'Study and discuss backend architecture patterns',
          },
        ],
      },
      references: {
        create: [
          {
            name: 'Michael Johnson',
            position: 'Tech Lead',
            company: 'FinTech Solutions',
            description: 'Direct supervisor. Can provide technical reference.',
          },
        ],
      },
    },
  });

  // CV 4: Full-stack Developer (with 2 CVs - one main, one secondary)
  const cv4Main = await prisma.cV.create({
    data: {
      userId: createdCandidates[3].id,
      title: 'Full-stack Developer CV - Main',
      isMain: true,
      fullName: createdCandidates[3].fullName,
      email: createdCandidates[3].email,
      phoneNumber: createdCandidates[3].phoneNumber,
      dateOfBirth: createdCandidates[3].dateOfBirth,
      gender: createdCandidates[3].gender,
      address: '321 Pasteur, District 3, Ho Chi Minh City',
      currentPosition: 'Full-stack Developer',
      summary: 'Full-stack developer with expertise in both frontend and backend technologies. Passionate about building end-to-end solutions.',
      objective: 'Looking for full-stack developer opportunities to work on innovative projects.',
      isOpenForJob: true,
      templateId: templateHarvardId, // Harvard template
      skills: {
        create: [
          { skillName: 'JavaScript', level: 'EXPERT', yearsOfExperience: 4 },
          { skillName: 'Node.js', level: 'ADVANCED', yearsOfExperience: 3 },
          { skillName: 'React', level: 'ADVANCED', yearsOfExperience: 3 },
          { skillName: 'PostgreSQL', level: 'ADVANCED', yearsOfExperience: 3 },
          { skillName: 'GraphQL', level: 'INTERMEDIATE', yearsOfExperience: 1 },
        ],
      },
      educations: {
        create: [
          {
            institution: 'Ho Chi Minh University of Technology',
            degree: 'Bachelor of Computer Science',
            startDate: new Date('2013-09-01'),
            endDate: new Date('2017-06-30'),
            description: 'Full-stack development focus',
          },
        ],
      },
      workExperiences: {
        create: [
          {
            title: 'Full-stack Developer',
            company: 'Innovation Labs',
            startDate: new Date('2018-01-01'),
            endDate: null,
            description: 'Develop both frontend and backend components. Lead feature development from design to deployment.',
          },
        ],
      },
      projects: {
        create: [
          {
            name: 'Social Media Platform',
            description: 'Full-stack social media application with real-time features',
            startDate: new Date('2019-01-01'),
            endDate: new Date('2019-12-31'),
            url: 'https://github.com/example/social-platform',
            role: 'Full-stack Developer',
          },
        ],
      },
      languages: {
        create: [
          { name: 'English', level: 'ADVANCED', description: 'Fluent' },
          { name: 'Vietnamese', level: 'NATIVE', description: 'Native speaker' },
        ],
      },
    },
  });

  // CV 4 Secondary (not main, not open for job)
  const cv4Secondary = await prisma.cV.create({
    data: {
      userId: createdCandidates[3].id,
      title: 'Full-stack Developer CV - Alternative',
      isMain: false,
      fullName: createdCandidates[3].fullName,
      email: createdCandidates[3].email,
      phoneNumber: createdCandidates[3].phoneNumber,
      dateOfBirth: createdCandidates[3].dateOfBirth,
      gender: createdCandidates[3].gender,
      address: '321 Pasteur, District 3, Ho Chi Minh City',
      currentPosition: 'Full-stack Developer',
      summary: 'Alternative CV format for different job applications',
      isOpenForJob: false,
      skills: {
        create: [
          { skillName: 'JavaScript', level: 'EXPERT', yearsOfExperience: 4 },
          { skillName: 'Node.js', level: 'ADVANCED', yearsOfExperience: 3 },
        ],
      },
    },
  });

  // CV 5: DevOps Engineer
  const cv5 = await prisma.cV.create({
    data: {
      userId: createdCandidates[4].id,
      title: 'DevOps Engineer CV',
      isMain: true,
      fullName: createdCandidates[4].fullName,
      email: createdCandidates[4].email,
      phoneNumber: createdCandidates[4].phoneNumber,
      dateOfBirth: createdCandidates[4].dateOfBirth,
      gender: createdCandidates[4].gender,
      address: '654 Vo Van Tan, District 3, Ho Chi Minh City',
      currentPosition: 'DevOps Engineer',
      summary: 'DevOps engineer with expertise in CI/CD, containerization, and cloud infrastructure. Passionate about automation and infrastructure as code.',
      objective: 'Seeking DevOps engineer position to optimize development workflows and infrastructure.',
      isOpenForJob: true,
      templateId: templateDefaultId, // Default template
      skills: {
        create: [
          { skillName: 'Docker', level: 'EXPERT', yearsOfExperience: 3 },
          { skillName: 'Kubernetes', level: 'ADVANCED', yearsOfExperience: 2 },
          { skillName: 'AWS', level: 'ADVANCED', yearsOfExperience: 3 },
          { skillName: 'Terraform', level: 'INTERMEDIATE', yearsOfExperience: 1 },
          { skillName: 'Jenkins', level: 'ADVANCED', yearsOfExperience: 2 },
          { skillName: 'Linux', level: 'EXPERT', yearsOfExperience: 5 },
        ],
      },
      educations: {
        create: [
          {
            institution: 'Ho Chi Minh University of Technology',
            degree: 'Bachelor of Information Systems',
            startDate: new Date('2012-09-01'),
            endDate: new Date('2016-06-30'),
            description: 'Focus on system administration and cloud computing',
          },
        ],
      },
      workExperiences: {
        create: [
          {
            title: 'DevOps Engineer',
            company: 'Cloud Solutions Inc',
            startDate: new Date('2018-01-01'),
            endDate: null,
            description: 'Design and maintain CI/CD pipelines. Manage Kubernetes clusters. Implement infrastructure as code.',
          },
        ],
      },
      certifications: {
        create: [
          {
            name: 'AWS Certified Solutions Architect',
            issuer: 'Amazon Web Services',
            acquiredAt: new Date('2020-05-10'),
            description: 'Expertise in designing distributed systems on AWS',
          },
          {
            name: 'Certified Kubernetes Administrator',
            issuer: 'Cloud Native Computing Foundation',
            acquiredAt: new Date('2021-09-15'),
            description: 'Kubernetes cluster administration and management',
          },
        ],
      },
      languages: {
        create: [
          { name: 'English', level: 'ADVANCED', description: 'Professional proficiency' },
          { name: 'Vietnamese', level: 'NATIVE', description: 'Native speaker' },
        ],
      },
    },
  });

  // CV 6: Data Engineer
  const cv6 = await prisma.cV.create({
    data: {
      userId: createdCandidates[5].id,
      title: 'Data Engineer CV',
      isMain: true,
      fullName: createdCandidates[5].fullName,
      email: createdCandidates[5].email,
      phoneNumber: createdCandidates[5].phoneNumber,
      dateOfBirth: createdCandidates[5].dateOfBirth,
      gender: createdCandidates[5].gender,
      address: '987 Nguyen Dinh Chieu, District 3, Ho Chi Minh City',
      currentPosition: 'Data Engineer',
      summary: 'Data engineer specialized in building data pipelines and ETL processes. Experience with big data technologies.',
      objective: 'Seeking data engineer position to work on large-scale data processing systems.',
      isOpenForJob: true,
      skills: {
        create: [
          { skillName: 'Python', level: 'EXPERT', yearsOfExperience: 4 },
          { skillName: 'Apache Spark', level: 'ADVANCED', yearsOfExperience: 2 },
          { skillName: 'SQL', level: 'EXPERT', yearsOfExperience: 5 },
          { skillName: 'Airflow', level: 'INTERMEDIATE', yearsOfExperience: 1 },
          { skillName: 'Hadoop', level: 'INTERMEDIATE', yearsOfExperience: 1 },
        ],
      },
      educations: {
        create: [
          {
            institution: 'Ho Chi Minh University of Science',
            degree: 'Bachelor of Data Science',
            startDate: new Date('2014-09-01'),
            endDate: new Date('2018-06-30'),
            description: 'Focus on data engineering and big data technologies',
          },
        ],
      },
      workExperiences: {
        create: [
          {
            title: 'Data Engineer',
            company: 'Data Analytics Corp',
            startDate: new Date('2019-01-01'),
            endDate: null,
            description: 'Design and implement data pipelines. Optimize data processing workflows. Maintain data warehouse.',
          },
        ],
      },
      languages: {
        create: [
          { name: 'English', level: 'INTERMEDIATE', description: 'Working proficiency' },
          { name: 'Vietnamese', level: 'NATIVE', description: 'Native speaker' },
        ],
      },
    },
  });

  // CV 7: Mobile Developer
  const cv7 = await prisma.cV.create({
    data: {
      userId: createdCandidates[6].id,
      title: 'Mobile Developer CV',
      isMain: true,
      fullName: createdCandidates[6].fullName,
      email: createdCandidates[6].email,
      phoneNumber: createdCandidates[6].phoneNumber,
      dateOfBirth: createdCandidates[6].dateOfBirth,
      gender: createdCandidates[6].gender,
      address: '147 Tran Hung Dao, District 1, Ho Chi Minh City',
      currentPosition: 'Mobile Developer',
      summary: 'Mobile developer with expertise in React Native and Flutter. Built multiple cross-platform mobile applications.',
      objective: 'Looking for mobile developer opportunities to create innovative mobile experiences.',
      isOpenForJob: true,
      skills: {
        create: [
          { skillName: 'React Native', level: 'ADVANCED', yearsOfExperience: 3 },
          { skillName: 'Flutter', level: 'ADVANCED', yearsOfExperience: 2 },
          { skillName: 'JavaScript', level: 'ADVANCED', yearsOfExperience: 3 },
          { skillName: 'Dart', level: 'INTERMEDIATE', yearsOfExperience: 2 },
          { skillName: 'iOS Development', level: 'INTERMEDIATE', yearsOfExperience: 1 },
          { skillName: 'Android Development', level: 'INTERMEDIATE', yearsOfExperience: 1 },
        ],
      },
      educations: {
        create: [
          {
            institution: 'Ho Chi Minh University of Technology',
            degree: 'Bachelor of Computer Science',
            startDate: new Date('2011-09-01'),
            endDate: new Date('2015-06-30'),
            description: 'Mobile development specialization',
          },
        ],
      },
      workExperiences: {
        create: [
          {
            title: 'Mobile Developer',
            company: 'Mobile Apps Studio',
            startDate: new Date('2017-01-01'),
            endDate: null,
            description: 'Develop cross-platform mobile applications. Publish apps to App Store and Google Play.',
          },
        ],
      },
      projects: {
        create: [
          {
            name: 'Food Delivery App',
            description: 'Cross-platform food delivery application with real-time tracking',
            startDate: new Date('2020-01-01'),
            endDate: new Date('2020-08-31'),
            url: 'https://github.com/example/food-delivery',
            role: 'Mobile Developer',
          },
        ],
      },
      languages: {
        create: [
          { name: 'English', level: 'ADVANCED', description: 'Fluent' },
          { name: 'Vietnamese', level: 'NATIVE', description: 'Native speaker' },
        ],
      },
    },
  });

  // CV 8: UI/UX Designer (not open for job - to test filtering)
  const cv8 = await prisma.cV.create({
    data: {
      userId: createdCandidates[7].id,
      title: 'UI/UX Designer CV',
      isMain: true,
      fullName: createdCandidates[7].fullName,
      email: createdCandidates[7].email,
      phoneNumber: createdCandidates[7].phoneNumber,
      dateOfBirth: createdCandidates[7].dateOfBirth,
      gender: createdCandidates[7].gender,
      address: '258 Ly Tu Trong, District 1, Ho Chi Minh City',
      currentPosition: 'UI/UX Designer',
      summary: 'Creative UI/UX designer with passion for creating beautiful and user-friendly interfaces.',
      isOpenForJob: false, // Not open for job
      skills: {
        create: [
          { skillName: 'Figma', level: 'EXPERT', yearsOfExperience: 3 },
          { skillName: 'Adobe XD', level: 'ADVANCED', yearsOfExperience: 2 },
          { skillName: 'Sketch', level: 'INTERMEDIATE', yearsOfExperience: 1 },
        ],
      },
      educations: {
        create: [
          {
            institution: 'Ho Chi Minh University of Architecture',
            degree: 'Bachelor of Design',
            startDate: new Date('2015-09-01'),
            endDate: new Date('2019-06-30'),
            description: 'Focus on user interface and user experience design',
          },
        ],
      },
    },
  });

  console.log(`✅ Created ${8} CVs with full nested data`);
  console.log(`   - CV 1: ${cv1.title} (${cv1.id}) - ${cv1.skills ? 'with skills' : 'no skills'}`);
  console.log(`   - CV 2: ${cv2.title} (${cv2.id})`);
  console.log(`   - CV 3: ${cv3.title} (${cv3.id})`);
  console.log(`   - CV 4: ${cv4Main.title} (Main) + ${cv4Secondary.title} (Secondary)`);
  console.log(`   - CV 5: ${cv5.title} (${cv5.id})`);
  console.log(`   - CV 6: ${cv6.title} (${cv6.id})`);
  console.log(`   - CV 7: ${cv7.title} (${cv7.id})`);
  console.log(`   - CV 8: ${cv8.title} (${cv8.id}) - Not open for job\n`);

  // ============================================
  // 7. JOBS
  // ============================================
  console.log('💼 Creating Jobs...');

  // Job 1: Senior Software Engineer - TechCorp Vietnam
  const job1 = await prisma.job.create({
    data: {
      companyId: company1.id,
      title: 'Senior Software Engineer',
      description: 'We are looking for an experienced Senior Software Engineer to join our dynamic team. You will be responsible for designing and developing scalable web applications using Node.js and React. The ideal candidate should have 5+ years of experience in full-stack development, strong problem-solving skills, and a passion for writing clean, maintainable code.',
      location: 'Ho Chi Minh City, Vietnam',
      industry: 'Technology',
      experienceLevel: 'SENIOR',
      type: 'FULL_TIME',
      urgent: false,
      status: 'ACTIVE',
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
      applicationCount: 0,
      benefits: {
        create: [
          {
            title: 'Competitive Salary',
            description: 'Attractive salary package with performance bonuses',
          },
          {
            title: 'Health Insurance',
            description: 'Comprehensive health insurance for you and your family',
          },
          {
            title: 'Flexible Working Hours',
            description: 'Work-life balance with flexible schedule',
          },
          {
            title: 'Learning & Development',
            description: 'Budget for training courses and conferences',
          },
        ],
      },
      requirements: {
        create: [
          {
            title: 'Education',
            description: 'Bachelor degree in Computer Science or related field',
          },
          {
            title: 'Experience',
            description: '5+ years of experience in software development',
          },
          {
            title: 'Technical Skills',
            description: 'Strong proficiency in JavaScript, Node.js, React, PostgreSQL',
          },
          {
            title: 'Soft Skills',
            description: 'Excellent communication skills, team player, problem-solving ability',
          },
        ],
      },
    },
  });

  // Tạo salary cho job1
  await prisma.salary.create({
    data: {
      jobId: job1.id,
      minAmount: 25000000,
      maxAmount: 40000000,
      currency: 'VND',
      isNegotiable: true,
      hideAmount: false,
    },
  });

  // Job 2: Full-stack Developer - StartupHub
  const job2 = await prisma.job.create({
    data: {
      companyId: company2.id,
      title: 'Full-stack Developer',
      description: 'Join our fast-growing startup as a Full-stack Developer. You will work on exciting projects using modern technologies like React, Node.js, and MongoDB. We offer a collaborative environment where you can learn and grow. Perfect for developers with 2-4 years of experience looking to make an impact.',
      location: 'Ho Chi Minh City, Vietnam',
      industry: 'Technology',
      experienceLevel: 'MIDDLE',
      type: 'FULL_TIME',
      urgent: true,
      status: 'ACTIVE',
      expiresAt: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000), // 20 days from now
      applicationCount: 0,
      benefits: {
        create: [
          {
            title: 'Stock Options',
            description: 'Equity participation in the company',
          },
          {
            title: 'Remote Work',
            description: 'Flexible remote work options',
          },
          {
            title: 'Startup Culture',
            description: 'Fast-paced, innovative environment',
          },
        ],
      },
      requirements: {
        create: [
          {
            title: 'Experience',
            description: '2-4 years of full-stack development experience',
          },
          {
            title: 'Skills',
            description: 'Proficient in React, Node.js, MongoDB, RESTful APIs',
          },
          {
            title: 'Mindset',
            description: 'Startup mindset, willing to learn and adapt quickly',
          },
        ],
      },
    },
  });

  // Job 3: DevOps Engineer - TechCorp Vietnam
  const job3 = await prisma.job.create({
    data: {
      companyId: company1.id,
      title: 'DevOps Engineer',
      description: 'We are seeking a skilled DevOps Engineer to help us build and maintain our cloud infrastructure. You will work with Docker, Kubernetes, AWS, and CI/CD pipelines. The role involves automating deployment processes, monitoring system performance, and ensuring high availability of our services.',
      location: 'Ho Chi Minh City, Vietnam',
      industry: 'Technology',
      experienceLevel: 'SENIOR',
      type: 'FULL_TIME',
      urgent: false,
      status: 'ACTIVE',
      expiresAt: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000), // 45 days from now
      applicationCount: 0,
      benefits: {
        create: [
          {
            title: 'Cloud Certifications',
            description: 'Support for AWS/GCP/Azure certifications',
          },
          {
            title: 'On-call Compensation',
            description: 'Additional compensation for on-call duties',
          },
        ],
      },
      requirements: {
        create: [
          {
            title: 'Experience',
            description: '3+ years of DevOps experience',
          },
          {
            title: 'Skills',
            description: 'Docker, Kubernetes, AWS, Terraform, Jenkins',
          },
          {
            title: 'Certifications',
            description: 'AWS/GCP certifications preferred',
          },
        ],
      },
    },
  });

  // Job 4: Data Engineer - FinancePro
  const job4 = await prisma.job.create({
    data: {
      companyId: company3.id,
      title: 'Data Engineer',
      description: 'Join our data team to build and maintain data pipelines. You will work with large datasets, design ETL processes, and ensure data quality. Experience with Python, Apache Spark, and SQL is essential. This role offers great opportunities to work with cutting-edge data technologies.',
      location: 'Ho Chi Minh City, Vietnam',
      industry: 'Finance',
      experienceLevel: 'MIDDLE',
      type: 'FULL_TIME',
      urgent: false,
      status: 'ACTIVE',
      expiresAt: new Date(Date.now() + 35 * 24 * 60 * 60 * 1000), // 35 days from now
      applicationCount: 0,
      benefits: {
        create: [
          {
            title: 'Data Science Training',
            description: 'Access to data science courses and workshops',
          },
        ],
      },
      requirements: {
        create: [
          {
            title: 'Experience',
            description: '2+ years of data engineering experience',
          },
          {
            title: 'Skills',
            description: 'Python, Apache Spark, SQL, Airflow',
          },
        ],
      },
    },
  });

  // Job 5: Mobile Developer - StartupHub (Contract)
  const job5 = await prisma.job.create({
    data: {
      companyId: company2.id,
      title: 'Mobile Developer (React Native)',
      description: 'We need a Mobile Developer to help us build our mobile app using React Native. This is a contract position for 6 months with possibility of extension. You will work closely with our design and backend teams to deliver a high-quality mobile experience.',
      location: 'Ho Chi Minh City, Vietnam',
      industry: 'Technology',
      experienceLevel: 'MIDDLE',
      type: 'CONTRACT',
      urgent: true,
      status: 'ACTIVE',
      expiresAt: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000), // 15 days from now
      applicationCount: 0,
      benefits: {
        create: [
          {
            title: 'Flexible Schedule',
            description: 'Work on your own schedule',
          },
        ],
      },
      requirements: {
        create: [
          {
            title: 'Experience',
            description: '2+ years of React Native development',
          },
          {
            title: 'Skills',
            description: 'React Native, JavaScript, iOS/Android development',
          },
        ],
      },
    },
  });

  // Tạo salary cho job5
  await prisma.salary.create({
    data: {
      jobId: job5.id,
      minAmount: 20000000,
      maxAmount: 30000000,
      currency: 'VND',
      isNegotiable: true,
      hideAmount: false,
    },
  });

  // Job 6: Junior Software Engineer - TechCorp Vietnam (Pending)
  const job6 = await prisma.job.create({
    data: {
      companyId: company1.id,
      title: 'Junior Software Engineer',
      description: 'Great opportunity for fresh graduates or junior developers to start their career. You will work on real projects, learn from experienced developers, and grow your skills. We provide mentorship and training programs.',
      location: 'Ho Chi Minh City, Vietnam',
      industry: 'Technology',
      experienceLevel: 'JUNIOR',
      type: 'FULL_TIME',
      urgent: false,
      status: 'PENDING', // Pending admin approval
      expiresAt: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000), // 60 days from now
      applicationCount: 0,
      benefits: {
        create: [
          {
            title: 'Mentorship Program',
            description: 'One-on-one mentorship from senior developers',
          },
          {
            title: 'Training Budget',
            description: 'Budget for online courses and certifications',
          },
        ],
      },
      requirements: {
        create: [
          {
            title: 'Education',
            description: 'Bachelor degree in Computer Science or related field',
          },
          {
            title: 'Skills',
            description: 'Basic knowledge of programming, willingness to learn',
          },
        ],
      },
    },
  });

  // Tạo salary cho job6
  await prisma.salary.create({
    data: {
      jobId: job6.id,
      minAmount: 10000000,
      maxAmount: 15000000,
      currency: 'VND',
      isNegotiable: false,
      hideAmount: false,
    },
  });

  console.log(`✅ Created ${6} Jobs`);
  console.log(`   - Job 1: ${job1.title} (${job1.id}) - ${job1.status} - ${company1.name}`);
  console.log(`   - Job 2: ${job2.title} (${job2.id}) - ${job2.status} - ${company2.name} - URGENT`);
  console.log(`   - Job 3: ${job3.title} (${job3.id}) - ${job3.status} - ${company1.name}`);
  console.log(`   - Job 4: ${job4.title} (${job4.id}) - ${job4.status} - ${company3.name}`);
  console.log(`   - Job 5: ${job5.title} (${job5.id}) - ${job5.status} - ${company2.name} - URGENT`);
  console.log(`   - Job 6: ${job6.title} (${job6.id}) - ${job6.status} - ${company1.name} - PENDING\n`);

  // ============================================
  // 7. APPLICATIONS
  // ============================================
  console.log('📝 Creating Applications...');

  // Application 1: Candidate 1 applies for Job 1 (Senior Software Engineer)
  const application1 = await prisma.application.create({
    data: {
      userId: createdCandidates[0].id,
      cvId: cv1.id,
      jobId: job1.id,
      status: 'PENDING',
      coverLetter: 'I am very interested in this Senior Software Engineer position. With 5+ years of experience in full-stack development, I believe I can contribute significantly to your team.',
    },
  });

  // Application 2: Candidate 2 applies for Job 1
  const application2 = await prisma.application.create({
    data: {
      userId: createdCandidates[1].id,
      cvId: cv2.id,
      jobId: job1.id,
      status: 'REVIEWING',
      coverLetter: 'I am excited about the opportunity to work as a Senior Software Engineer. My experience with React and Node.js aligns perfectly with your requirements.',
    },
  });

  // Application 3: Candidate 3 applies for Job 2 (Full-stack Developer)
  const application3 = await prisma.application.create({
    data: {
      userId: createdCandidates[2].id,
      cvId: cv3.id,
      jobId: job2.id,
      status: 'PENDING',
      coverLetter: 'I am interested in joining your startup as a Full-stack Developer. I am passionate about building scalable applications and working in a fast-paced environment.',
    },
  });

  // Application 4: Candidate 4 applies for Job 2
  const application4 = await prisma.application.create({
    data: {
      userId: createdCandidates[3].id,
      cvId: cv4Main.id,
      jobId: job2.id,
      status: 'ACCEPTED',
      coverLetter: 'I am thrilled about the opportunity to work with your team. My full-stack development skills and passion for innovation make me a great fit for this role.',
    },
  });

  // Application 5: Candidate 5 applies for Job 3 (DevOps Engineer)
  const application5 = await prisma.application.create({
    data: {
      userId: createdCandidates[4].id,
      cvId: cv5.id,
      jobId: job3.id,
      status: 'REVIEWING',
      coverLetter: 'I am very interested in the DevOps Engineer position. My expertise in Docker, Kubernetes, and AWS makes me an ideal candidate for this role.',
    },
  });

  // Application 6: Candidate 6 applies for Job 4 (Data Engineer)
  const application6 = await prisma.application.create({
    data: {
      userId: createdCandidates[5].id,
      cvId: cv6.id,
      jobId: job4.id,
      status: 'PENDING',
      coverLetter: 'I am excited about the Data Engineer position. My experience with Python, Apache Spark, and data pipelines aligns well with your requirements.',
    },
  });

  // Application 7: Candidate 1 applies for Job 2 (different job)
  const application7 = await prisma.application.create({
    data: {
      userId: createdCandidates[0].id,
      cvId: cv1.id,
      jobId: job2.id,
      status: 'REJECTED',
      coverLetter: 'I am interested in this Full-stack Developer position. Although I have more experience, I am open to new challenges and learning opportunities.',
      notes: 'Candidate is overqualified for this position. Consider for senior role instead.',
    },
  });

  // Application 8: Candidate 7 applies for Job 5 (Mobile Developer)
  const application8 = await prisma.application.create({
    data: {
      userId: createdCandidates[6].id,
      cvId: cv7.id,
      jobId: job5.id,
      status: 'PENDING',
      coverLetter: 'I am very interested in the Mobile Developer position. My experience with React Native and mobile app development makes me a strong candidate.',
    },
  });

  // Update job applicationCount
  await prisma.job.update({
    where: { id: job1.id },
    data: { applicationCount: 2 },
  });
  await prisma.job.update({
    where: { id: job2.id },
    data: { applicationCount: 2 },
  });
  await prisma.job.update({
    where: { id: job3.id },
    data: { applicationCount: 1 },
  });
  await prisma.job.update({
    where: { id: job4.id },
    data: { applicationCount: 1 },
  });
  await prisma.job.update({
    where: { id: job5.id },
    data: { applicationCount: 1 },
  });

  console.log(`✅ Created ${8} Applications`);
  console.log(`   - Application 1: ${createdCandidates[0].fullName} -> ${job1.title} (PENDING)`);
  console.log(`   - Application 2: ${createdCandidates[1].fullName} -> ${job1.title} (REVIEWING)`);
  console.log(`   - Application 3: ${createdCandidates[2].fullName} -> ${job2.title} (PENDING)`);
  console.log(`   - Application 4: ${createdCandidates[3].fullName} -> ${job2.title} (ACCEPTED)`);
  console.log(`   - Application 5: ${createdCandidates[4].fullName} -> ${job3.title} (REVIEWING)`);
  console.log(`   - Application 6: ${createdCandidates[5].fullName} -> ${job4.title} (PENDING)`);
  console.log(`   - Application 7: ${createdCandidates[0].fullName} -> ${job2.title} (REJECTED)`);
  console.log(`   - Application 8: ${createdCandidates[6].fullName} -> ${job5.title} (PENDING)\n`);

  // ============================================
  // 8. SUMMARY
  // ============================================
  console.log('📊 Seed Summary:');
  console.log('═══════════════════════════════════════');
  console.log(`👑 ADMIN users:      ${2}`);
  console.log(`👔 RECRUITER users:  ${3}`);
  console.log(`👤 CANDIDATE users: ${createdCandidates.length}`);
  console.log(`🏢 Companies:       ${3}`);
  console.log(`📄 CVs:             ${8} (with full nested data)`);
  console.log(`📋 CV Templates:    ${2} (using existing templates from database)`);
  console.log(`💼 Jobs:            ${6} (${5} active, ${1} pending)`);
  console.log(`📝 Applications:    ${8} (${4} pending, ${2} reviewing, ${1} accepted, ${1} rejected)`);
  console.log('═══════════════════════════════════════\n');

  console.log('🔑 Test Credentials:');
  console.log('───────────────────────────────────────');
  console.log('ADMIN:');
  console.log('  Email: admin@jobsconnect.com');
  console.log('  Password: admin123');
  console.log('');
  console.log('RECRUITER:');
  console.log('  Email: recruiter1@techcorp.vn');
  console.log('  Password: password123');
  console.log('');
  console.log('CANDIDATE:');
  console.log('  Email: candidate1@example.com');
  console.log('  Password: password123');
  console.log('───────────────────────────────────────\n');

  console.log('✅ Seed completed successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Error during seed:');
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

