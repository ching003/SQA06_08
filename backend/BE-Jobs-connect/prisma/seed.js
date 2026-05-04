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
 * Seed database với dữ liệu mẫu tiếng Việt
 */
async function main() {
  console.log('🌱 Bắt đầu seed dữ liệu...\n');

  // Clear existing data
  console.log('🗑️  Xóa dữ liệu cũ...');
  await prisma.notification.deleteMany();
  await prisma.companyMemberInvitation.deleteMany();
  await prisma.recommendJobforCV.deleteMany();
  await prisma.savedCV.deleteMany();
  await prisma.savedJob.deleteMany();
  await prisma.application.deleteMany();
  await prisma.similarJob.deleteMany();
  await prisma.jobSkill.deleteMany();
  await prisma.jobRequirement.deleteMany();
  await prisma.jobBenefit.deleteMany();
  await prisma.salary.deleteMany();
  await prisma.job.deleteMany();
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
  await prisma.user.deleteMany();
  console.log('✅ Đã xóa dữ liệu cũ\n');

  // Hash password
  const defaultPassword = await hashPassword('password123');
  const adminPassword = await hashPassword('admin123');

  // ============================================
  // 1. ADMIN USERS
  // ============================================
  console.log('👑 Tạo tài khoản ADMIN...');

  const admin1 = await prisma.user.create({
    data: {
      email: 'admin@jobsconnect.com',
      passwordHash: adminPassword,
      fullName: 'Nguyễn Văn Quản Trị',
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
      fullName: 'Trần Thị Quản Lý',
      phoneNumber: '0901234568',
      gender: 'FEMALE',
      role: 'ADMIN',
      dateOfBirth: new Date('1990-05-20'),
      status: 'ACTIVE',
    },
  });

  console.log(`✅ Đã tạo ${2} tài khoản ADMIN\n`);

  // ============================================
  // 2. COMPANIES
  // ============================================
  console.log('🏢 Tạo các Công ty...');

  const company1 = await prisma.company.create({
    data: {
      name: 'Công ty Cổ phần Công nghệ FPT',
      website: 'https://fpt.com.vn',
      description: 'FPT là tập đoàn công nghệ hàng đầu Việt Nam với hơn 30 năm kinh nghiệm trong lĩnh vực công nghệ thông tin, viễn thông và giáo dục. Chúng tôi cung cấp các giải pháp chuyển đổi số, phát triển phần mềm và dịch vụ IT cho các doanh nghiệp trong và ngoài nước. Môi trường làm việc năng động, cơ hội phát triển nghề nghiệp rộng mở.',
      industry: 'Công nghệ thông tin',
      companySize: 'ENTERPRISE',
      foundedYear: 1988,
      address: '17 Duy Tân, Cầu Giấy, Hà Nội',
      phone: '024 7300 7300',
      email: 'contact@fpt.com.vn',
      status: 'ACTIVE',
    },
  });

  const company2 = await prisma.company.create({
    data: {
      name: 'VNG Corporation',
      website: 'https://vng.com.vn',
      description: 'VNG là công ty công nghệ hàng đầu Việt Nam, nổi tiếng với các sản phẩm như Zalo, ZaloPay và nhiều game online đình đám. Chúng tôi tạo ra các sản phẩm công nghệ phục vụ hàng triệu người dùng. Văn hóa startup, sáng tạo không giới hạn, đãi ngộ cạnh tranh.',
      industry: 'Công nghệ thông tin',
      companySize: 'LARGE',
      foundedYear: 2004,
      address: '182 Lê Đại Hành, Quận 11, TP. Hồ Chí Minh',
      phone: '028 3820 8888',
      email: 'hr@vng.com.vn',
      status: 'ACTIVE',
    },
  });

  const company3 = await prisma.company.create({
    data: {
      name: 'Ngân hàng TMCP Techcombank',
      website: 'https://techcombank.com.vn',
      description: 'Techcombank là một trong những ngân hàng TMCP hàng đầu Việt Nam với mạng lưới chi nhánh rộng khắp cả nước. Chúng tôi cung cấp các dịch vụ tài chính đa dạng cho cá nhân và doanh nghiệp. Cơ hội thăng tiến rõ ràng, đào tạo bài bản.',
      industry: 'Tài chính - Ngân hàng',
      companySize: 'LARGE',
      foundedYear: 1993,
      address: '191 Bà Triệu, Hai Bà Trưng, Hà Nội',
      phone: '024 3944 6699',
      email: 'careers@techcombank.com.vn',
      status: 'ACTIVE',
    },
  });

  const company4 = await prisma.company.create({
    data: {
      name: 'Shopee Vietnam',
      website: 'https://careers.shopee.vn',
      description: 'Shopee là nền tảng thương mại điện tử hàng đầu Đông Nam Á và Đài Loan. Với sứ mệnh mang lại trải nghiệm mua sắm trực tuyến tốt nhất, chúng tôi không ngừng đổi mới và phát triển. Môi trường trẻ trung, năng động, nhiều hoạt động team building.',
      industry: 'Thương mại điện tử',
      companySize: 'LARGE',
      foundedYear: 2015,
      address: 'Tòa nhà Etown Central, 11 Đoàn Văn Bơ, Quận 4, TP.HCM',
      phone: '028 7108 1088',
      email: 'careers.vn@shopee.com',
      status: 'ACTIVE',
    },
  });

  const company5 = await prisma.company.create({
    data: {
      name: 'Startup ABC Solutions',
      website: 'https://abcsolutions.vn',
      description: 'ABC Solutions là startup công nghệ trẻ chuyên về giải pháp AI và Machine Learning cho doanh nghiệp. Chúng tôi đang tìm kiếm những tài năng đam mê công nghệ để cùng xây dựng tương lai. Văn hóa flat, học hỏi liên tục, ESOP hấp dẫn.',
      industry: 'Công nghệ thông tin',
      companySize: 'STARTUP',
      foundedYear: 2021,
      address: '123 Nguyễn Huệ, Quận 1, TP.HCM',
      phone: '028 1234 5678',
      email: 'hr@abcsolutions.vn',
      status: 'ACTIVE',
    },
  });

  console.log(`✅ Đã tạo ${5} Công ty\n`);

  // ============================================
  // 3. RECRUITER USERS
  // ============================================
  console.log('👔 Tạo tài khoản RECRUITER...');

  const recruiter1 = await prisma.user.create({
    data: {
      email: 'hr.manager@fpt.com.vn',
      passwordHash: defaultPassword,
      fullName: 'Lê Thị Hồng Nhung',
      phoneNumber: '0912345678',
      gender: 'FEMALE',
      role: 'RECRUITER',
      dateOfBirth: new Date('1988-03-10'),
      status: 'ACTIVE',
    },
  });

  const recruiter2 = await prisma.user.create({
    data: {
      email: 'recruitment@vng.com.vn',
      passwordHash: defaultPassword,
      fullName: 'Phạm Văn Hùng',
      phoneNumber: '0912345679',
      gender: 'MALE',
      role: 'RECRUITER',
      dateOfBirth: new Date('1992-07-25'),
      status: 'ACTIVE',
    },
  });

  const recruiter3 = await prisma.user.create({
    data: {
      email: 'talent@techcombank.com.vn',
      passwordHash: defaultPassword,
      fullName: 'Nguyễn Thị Mai Anh',
      phoneNumber: '0912345680',
      gender: 'FEMALE',
      role: 'RECRUITER',
      dateOfBirth: new Date('1990-11-30'),
      status: 'ACTIVE',
    },
  });

  const recruiter4 = await prisma.user.create({
    data: {
      email: 'hr@shopee.vn',
      passwordHash: defaultPassword,
      fullName: 'Trần Minh Đức',
      phoneNumber: '0912345681',
      gender: 'MALE',
      role: 'RECRUITER',
      dateOfBirth: new Date('1993-04-15'),
      status: 'ACTIVE',
    },
  });

  const recruiter5 = await prisma.user.create({
    data: {
      email: 'founder@abcsolutions.vn',
      passwordHash: defaultPassword,
      fullName: 'Võ Thanh Tùng',
      phoneNumber: '0912345682',
      gender: 'MALE',
      role: 'RECRUITER',
      dateOfBirth: new Date('1995-08-20'),
      status: 'ACTIVE',
    },
  });

  // Link recruiters với companies
  await prisma.companyMember.create({ data: { userId: recruiter1.id, companyId: company1.id, companyRole: 'OWNER' } });
  await prisma.companyMember.create({ data: { userId: recruiter2.id, companyId: company2.id, companyRole: 'OWNER' } });
  await prisma.companyMember.create({ data: { userId: recruiter3.id, companyId: company3.id, companyRole: 'MANAGER' } });
  await prisma.companyMember.create({ data: { userId: recruiter4.id, companyId: company4.id, companyRole: 'RECRUITER' } });
  await prisma.companyMember.create({ data: { userId: recruiter5.id, companyId: company5.id, companyRole: 'OWNER' } });

  console.log(`✅ Đã tạo ${5} tài khoản RECRUITER\n`);

  // ============================================
  // 4. CANDIDATE USERS
  // ============================================
  console.log('👤 Tạo tài khoản CANDIDATE...');

  const candidates = [
    { email: 'nguyenvanan@gmail.com', fullName: 'Nguyễn Văn An', phoneNumber: '0923456789', gender: 'MALE', dateOfBirth: new Date('1995-02-15') },
    { email: 'tranthimai@gmail.com', fullName: 'Trần Thị Mai', phoneNumber: '0923456790', gender: 'FEMALE', dateOfBirth: new Date('1998-06-20') },
    { email: 'levantung@gmail.com', fullName: 'Lê Văn Tùng', phoneNumber: '0923456791', gender: 'MALE', dateOfBirth: new Date('1993-09-10') },
    { email: 'phamthihuong@gmail.com', fullName: 'Phạm Thị Hương', phoneNumber: '0923456792', gender: 'FEMALE', dateOfBirth: new Date('1996-12-05') },
    { email: 'hoangvanduc@gmail.com', fullName: 'Hoàng Văn Đức', phoneNumber: '0923456793', gender: 'MALE', dateOfBirth: new Date('1994-04-18') },
    { email: 'ngothilan@gmail.com', fullName: 'Ngô Thị Lan', phoneNumber: '0923456794', gender: 'FEMALE', dateOfBirth: new Date('1997-08-22') },
    { email: 'dangvanhieu@gmail.com', fullName: 'Đặng Văn Hiếu', phoneNumber: '0923456795', gender: 'MALE', dateOfBirth: new Date('1992-01-30') },
    { email: 'buithithanh@gmail.com', fullName: 'Bùi Thị Thanh', phoneNumber: '0923456796', gender: 'FEMALE', dateOfBirth: new Date('1999-03-12') },
    { email: 'vovannam@gmail.com', fullName: 'Võ Văn Nam', phoneNumber: '0923456797', gender: 'MALE', dateOfBirth: new Date('1991-07-08') },
    { email: 'doanthikim@gmail.com', fullName: 'Đoàn Thị Kim', phoneNumber: '0923456798', gender: 'FEMALE', dateOfBirth: new Date('2000-11-25') },
  ];

  const createdCandidates = [];
  for (const candidateData of candidates) {
    const candidate = await prisma.user.create({
      data: { ...candidateData, passwordHash: defaultPassword, role: 'CANDIDATE', status: 'ACTIVE' },
    });
    createdCandidates.push(candidate);
  }

  console.log(`✅ Đã tạo ${createdCandidates.length} tài khoản CANDIDATE\n`);

  // ============================================
  // 5. CV TEMPLATES
  // ============================================
  console.log('📋 Xóa và tạo lại CV Templates với URL mới...');

  // Xóa tất cả CV templates cũ
  await prisma.cVTemplate.deleteMany({});
  console.log('  🗑️  Đã xóa tất cả CV templates cũ');

  // Tạo lại CV Templates với URL mới từ Firebase Storage
  const templateDefault = await prisma.cVTemplate.create({
    data: {
      name: 'Default Template',
      htmlUrl: 'https://firebasestorage.googleapis.com/v0/b/jobsconnect-dafde.firebasestorage.app/o/cv-templates%2Fdefault.html?alt=media&token=6b5becb2-3970-4db9-90ba-f66eb7f678f4',
      previewUrl: 'https://firebasestorage.googleapis.com/v0/b/jobsconnect-dafde.firebasestorage.app/o/cv-template-previews%2Fpreview%20default.png?alt=media&token=4c914854-13bf-412a-93a4-7db2230ab4ef',
      isActive: true,
    },
  });
  console.log('  ✅ Đã tạo Default Template');

  const templateHarvard = await prisma.cVTemplate.create({
    data: {
      name: 'Harvard Template',
      htmlUrl: 'https://firebasestorage.googleapis.com/v0/b/jobsconnect-dafde.firebasestorage.app/o/cv-templates%2Fharvard.html?alt=media&token=2e28b0ad-61ee-49d0-8ffc-a79d2c333736',
      previewUrl: 'https://firebasestorage.googleapis.com/v0/b/jobsconnect-dafde.firebasestorage.app/o/cv-template-previews%2Fpreview%20harvard.png?alt=media&token=e88121e8-e1e7-4c6b-b0ee-92e42a6059e8',
      isActive: true,
    },
  });
  console.log('  ✅ Đã tạo Harvard Template');

  const templateModern = await prisma.cVTemplate.create({
    data: {
      name: 'Modern Template',
      htmlUrl: 'https://firebasestorage.googleapis.com/v0/b/jobsconnect-dafde.firebasestorage.app/o/cv-templates%2Fmodern.html?alt=media&token=9aba4d52-6d41-4310-bd67-76430739cf3d',
      previewUrl: 'https://firebasestorage.googleapis.com/v0/b/jobsconnect-dafde.firebasestorage.app/o/cv-template-previews%2Fpreview%20modern.png?alt=media&token=9e8b7844-d3d8-412e-8c65-fa2da9d499db',
      isActive: true,
    },
  });
  console.log('  ✅ Đã tạo Modern Template');

  const templateDefaultId = templateDefault.id;
  const templateHarvardId = templateHarvard.id;
  const templateModernId = templateModern.id;

  console.log(`✅ CV Templates đã được tạo mới với URL Firebase Storage\n`);

  // ============================================
  // 6. CVs FOR CANDIDATES
  // ============================================
  console.log('📄 Tạo CV với dữ liệu chi tiết...');

  // CV 1: Senior Software Engineer
  const cv1 = await prisma.cV.create({
    data: {
      userId: createdCandidates[0].id,
      title: 'CV Kỹ sư phần mềm cao cấp',
      isMain: true,
      fullName: 'Nguyễn Văn An',
      email: 'nguyenvanan@gmail.com',
      phoneNumber: '0923456789',
      dateOfBirth: new Date('1995-02-15'),
      gender: 'MALE',
      address: '123 Nguyễn Huệ, Quận 1, TP. Hồ Chí Minh',
      currentPosition: 'Kỹ sư phần mềm cao cấp',
      summary: 'Kỹ sư phần mềm với hơn 5 năm kinh nghiệm phát triển ứng dụng web full-stack. Chuyên môn về Node.js, React và các công nghệ cloud. Đam mê xây dựng các hệ thống có khả năng mở rộng cao và tối ưu hiệu suất.',
      objective: 'Tìm kiếm vị trí Kỹ sư phần mềm cao cấp tại công ty công nghệ hàng đầu để đóng góp kinh nghiệm và tiếp tục phát triển chuyên môn.',
      isOpenForJob: true,
      templateId: templateDefaultId,
      skills: {
        create: [
          { skillName: 'JavaScript', level: 'EXPERT', yearsOfExperience: 5 },
          { skillName: 'TypeScript', level: 'ADVANCED', yearsOfExperience: 3 },
          { skillName: 'Node.js', level: 'EXPERT', yearsOfExperience: 4 },
          { skillName: 'React', level: 'ADVANCED', yearsOfExperience: 3 },
          { skillName: 'PostgreSQL', level: 'ADVANCED', yearsOfExperience: 4 },
          { skillName: 'AWS', level: 'INTERMEDIATE', yearsOfExperience: 2 },
          { skillName: 'Docker', level: 'INTERMEDIATE', yearsOfExperience: 2 },
        ],
      },
      educations: {
        create: [
          {
            institution: 'Đại học Bách khoa TP.HCM',
            degree: 'Cử nhân Khoa học Máy tính',
            startDate: new Date('2013-09-01'),
            endDate: new Date('2017-06-30'),
            description: 'Tốt nghiệp loại Giỏi. Điểm trung bình: 8.5/10. Đồ án tốt nghiệp: Xây dựng hệ thống quản lý học tập trực tuyến.',
          },
        ],
      },
      workExperiences: {
        create: [
          {
            title: 'Kỹ sư phần mềm cao cấp',
            company: 'Công ty ABC Tech',
            startDate: new Date('2020-01-01'),
            endDate: null,
            description: 'Thiết kế và phát triển kiến trúc microservices cho hệ thống thương mại điện tử phục vụ 1 triệu người dùng. Hướng dẫn và đào tạo 5 thành viên junior trong team. Triển khai CI/CD pipeline giảm 50% thời gian deploy.',
          },
          {
            title: 'Kỹ sư phần mềm',
            company: 'Công ty XYZ Software',
            startDate: new Date('2017-07-01'),
            endDate: new Date('2019-12-31'),
            description: 'Phát triển RESTful APIs sử dụng Node.js và Express. Xây dựng giao diện người dùng với React và Redux. Tối ưu hóa truy vấn database giảm 40% thời gian phản hồi.',
          },
        ],
      },
      projects: {
        create: [
          {
            name: 'Hệ thống thương mại điện tử',
            description: 'Xây dựng nền tảng e-commerce hoàn chỉnh với các tính năng: giỏ hàng, thanh toán online, quản lý đơn hàng, hệ thống đánh giá sản phẩm.',
            startDate: new Date('2021-01-01'),
            endDate: new Date('2021-06-30'),
            url: 'https://github.com/nguyenvanan/ecommerce',
            role: 'Tech Lead',
          },
          {
            name: 'Ứng dụng chat realtime',
            description: 'Phát triển ứng dụng chat sử dụng WebSocket với các tính năng: nhắn tin nhóm, gửi file, video call.',
            startDate: new Date('2020-06-01'),
            endDate: new Date('2020-09-30'),
            url: 'https://github.com/nguyenvanan/chat-app',
            role: 'Full-stack Developer',
          },
        ],
      },
      certifications: {
        create: [
          { name: 'AWS Certified Developer - Associate', issuer: 'Amazon Web Services', acquiredAt: new Date('2022-03-15'), description: 'Chứng chỉ phát triển ứng dụng trên nền tảng AWS' },
          { name: 'Professional Scrum Master I', issuer: 'Scrum.org', acquiredAt: new Date('2021-08-20'), description: 'Chứng chỉ Scrum Master cấp độ 1' },
        ],
      },
      languages: {
        create: [
          { name: 'Tiếng Anh', level: 'ADVANCED', description: 'TOEIC 850. Giao tiếp và đọc tài liệu kỹ thuật tốt.' },
          { name: 'Tiếng Việt', level: 'NATIVE', description: 'Tiếng mẹ đẻ' },
        ],
      },
      achievements: {
        create: [
          { title: 'Nhân viên xuất sắc năm 2022', description: 'Được tuyên dương vì đóng góp xuất sắc trong dự án chuyển đổi số', acquiredAt: new Date('2022-12-31') },
          { title: 'Giải nhì Hackathon FPT 2021', description: 'Đề tài: Ứng dụng AI trong chăm sóc sức khỏe', acquiredAt: new Date('2021-10-15') },
        ],
      },
      activities: {
        create: [
          { title: 'Diễn giả Tech Talk', organization: 'Vietnam Web Summit', startDate: new Date('2022-01-01'), endDate: null, description: 'Chia sẻ kiến thức về kiến trúc microservices tại các hội thảo công nghệ' },
        ],
      },
      references: {
        create: [
          { name: 'Nguyễn Văn Bình', position: 'CTO', company: 'ABC Tech', description: 'Quản lý trực tiếp. Liên hệ theo yêu cầu.' },
        ],
      },
    },
  });

  // CV 2: Frontend Developer
  const cv2 = await prisma.cV.create({
    data: {
      userId: createdCandidates[1].id,
      title: 'CV Lập trình viên Frontend',
      isMain: true,
      fullName: 'Trần Thị Mai',
      email: 'tranthimai@gmail.com',
      phoneNumber: '0923456790',
      dateOfBirth: new Date('1998-06-20'),
      gender: 'FEMALE',
      address: '456 Lê Lợi, Quận 3, TP. Hồ Chí Minh',
      currentPosition: 'Frontend Developer',
      summary: 'Lập trình viên Frontend với 3 năm kinh nghiệm xây dựng giao diện web responsive và thân thiện người dùng. Thành thạo React, Vue.js và các công nghệ frontend hiện đại. Đam mê UI/UX và tạo trải nghiệm người dùng tốt nhất.',
      objective: 'Mong muốn gia nhập team phát triển sản phẩm tại công ty công nghệ để ứng dụng kiến thức frontend và học hỏi thêm về UX design.',
      isOpenForJob: true,
      templateId: templateHarvardId,
      skills: {
        create: [
          { skillName: 'React', level: 'ADVANCED', yearsOfExperience: 3 },
          { skillName: 'Vue.js', level: 'ADVANCED', yearsOfExperience: 2 },
          { skillName: 'JavaScript', level: 'ADVANCED', yearsOfExperience: 3 },
          { skillName: 'TypeScript', level: 'INTERMEDIATE', yearsOfExperience: 1 },
          { skillName: 'HTML/CSS', level: 'EXPERT', yearsOfExperience: 4 },
          { skillName: 'Figma', level: 'INTERMEDIATE', yearsOfExperience: 2 },
        ],
      },
      educations: {
        create: [
          {
            institution: 'Đại học Khoa học Tự nhiên TP.HCM',
            degree: 'Cử nhân Công nghệ Thông tin',
            startDate: new Date('2016-09-01'),
            endDate: new Date('2020-06-30'),
            description: 'Chuyên ngành Kỹ thuật phần mềm. Điểm trung bình: 8.2/10.',
          },
        ],
      },
      workExperiences: {
        create: [
          {
            title: 'Frontend Developer',
            company: 'Digital Agency DEF',
            startDate: new Date('2020-07-01'),
            endDate: null,
            description: 'Phát triển giao diện web cho 20+ dự án của khách hàng. Sử dụng React và Vue.js để xây dựng SPA. Làm việc chặt chẽ với team design để implement pixel-perfect UI.',
          },
        ],
      },
      projects: {
        create: [
          {
            name: 'Nền tảng học trực tuyến',
            description: 'Xây dựng giao diện người dùng cho hệ thống e-learning với video streaming, quiz và tracking tiến độ học tập.',
            startDate: new Date('2022-01-01'),
            endDate: new Date('2022-06-30'),
            role: 'Frontend Lead',
          },
        ],
      },
      certifications: {
        create: [
          { name: 'React Advanced Certification', issuer: 'Udemy', acquiredAt: new Date('2021-05-10'), description: 'Chứng chỉ React nâng cao' },
        ],
      },
      languages: {
        create: [
          { name: 'Tiếng Anh', level: 'INTERMEDIATE', description: 'IELTS 6.0. Đọc tài liệu kỹ thuật tốt.' },
          { name: 'Tiếng Việt', level: 'NATIVE', description: 'Tiếng mẹ đẻ' },
        ],
      },
    },
  });

  // CV 3: Backend Developer
  const cv3 = await prisma.cV.create({
    data: {
      userId: createdCandidates[2].id,
      title: 'CV Lập trình viên Backend',
      isMain: true,
      fullName: 'Lê Văn Tùng',
      email: 'levantung@gmail.com',
      phoneNumber: '0923456791',
      dateOfBirth: new Date('1993-09-10'),
      gender: 'MALE',
      address: '789 Điện Biên Phủ, Quận Bình Thạnh, TP.HCM',
      currentPosition: 'Backend Developer',
      summary: 'Lập trình viên Backend với 6 năm kinh nghiệm xây dựng API và hệ thống backend có khả năng mở rộng cao. Chuyên về Node.js, Python và thiết kế database. Kinh nghiệm làm việc với hệ thống phục vụ hàng triệu người dùng.',
      objective: 'Tìm kiếm vị trí Backend Developer hoặc Tech Lead tại công ty fintech để áp dụng kinh nghiệm và đóng góp vào sản phẩm tài chính.',
      isOpenForJob: true,
      skills: {
        create: [
          { skillName: 'Node.js', level: 'EXPERT', yearsOfExperience: 5 },
          { skillName: 'Python', level: 'ADVANCED', yearsOfExperience: 4 },
          { skillName: 'PostgreSQL', level: 'EXPERT', yearsOfExperience: 5 },
          { skillName: 'Redis', level: 'ADVANCED', yearsOfExperience: 3 },
          { skillName: 'MongoDB', level: 'ADVANCED', yearsOfExperience: 3 },
          { skillName: 'Docker', level: 'ADVANCED', yearsOfExperience: 3 },
          { skillName: 'Kubernetes', level: 'INTERMEDIATE', yearsOfExperience: 1 },
        ],
      },
      educations: {
        create: [
          {
            institution: 'Đại học Công nghệ Thông tin - ĐHQG HCM',
            degree: 'Kỹ sư Công nghệ Phần mềm',
            startDate: new Date('2011-09-01'),
            endDate: new Date('2016-06-30'),
            description: 'Tốt nghiệp loại Khá. Chuyên sâu về hệ thống phân tán.',
          },
        ],
      },
      workExperiences: {
        create: [
          {
            title: 'Senior Backend Developer',
            company: 'FinTech Solutions Vietnam',
            startDate: new Date('2019-01-01'),
            endDate: null,
            description: 'Thiết kế và phát triển hệ thống thanh toán xử lý 100,000+ giao dịch/ngày. Tối ưu hóa API giảm 60% response time. Lead team 4 developers.',
          },
          {
            title: 'Backend Developer',
            company: 'E-commerce Company GHI',
            startDate: new Date('2016-07-01'),
            endDate: new Date('2018-12-31'),
            description: 'Phát triển hệ thống quản lý đơn hàng và inventory. Xây dựng caching layer với Redis.',
          },
        ],
      },
      certifications: {
        create: [
          { name: 'MongoDB Certified Developer', issuer: 'MongoDB University', acquiredAt: new Date('2020-09-20'), description: 'Chứng chỉ phát triển với MongoDB' },
          { name: 'AWS Solutions Architect', issuer: 'Amazon Web Services', acquiredAt: new Date('2021-11-15'), description: 'Chứng chỉ kiến trúc giải pháp AWS' },
        ],
      },
      languages: {
        create: [
          { name: 'Tiếng Anh', level: 'ADVANCED', description: 'TOEIC 800. Giao tiếp với khách hàng nước ngoài.' },
          { name: 'Tiếng Việt', level: 'NATIVE', description: 'Tiếng mẹ đẻ' },
        ],
      },
    },
  });

  // CV 4: Data Analyst
  const cv4 = await prisma.cV.create({
    data: {
      userId: createdCandidates[3].id,
      title: 'CV Chuyên viên Phân tích Dữ liệu',
      isMain: true,
      fullName: 'Phạm Thị Hương',
      email: 'phamthihuong@gmail.com',
      phoneNumber: '0923456792',
      dateOfBirth: new Date('1996-12-05'),
      gender: 'FEMALE',
      address: '321 Trần Hưng Đạo, Quận 5, TP.HCM',
      currentPosition: 'Data Analyst',
      summary: 'Chuyên viên phân tích dữ liệu với 4 năm kinh nghiệm trong lĩnh vực tài chính và thương mại điện tử. Thành thạo SQL, Python và các công cụ visualization. Có khả năng biến data thành insights có giá trị cho business.',
      objective: 'Tìm kiếm vị trí Data Analyst hoặc Business Intelligence tại công ty có dữ liệu phong phú để phát triển kỹ năng phân tích.',
      isOpenForJob: true,
      skills: {
        create: [
          { skillName: 'SQL', level: 'EXPERT', yearsOfExperience: 4 },
          { skillName: 'Python', level: 'ADVANCED', yearsOfExperience: 3 },
          { skillName: 'Tableau', level: 'ADVANCED', yearsOfExperience: 3 },
          { skillName: 'Power BI', level: 'INTERMEDIATE', yearsOfExperience: 2 },
          { skillName: 'Excel', level: 'EXPERT', yearsOfExperience: 5 },
          { skillName: 'Apache Spark', level: 'BEGINNER', yearsOfExperience: 1 },
        ],
      },
      educations: {
        create: [
          {
            institution: 'Đại học Kinh tế TP.HCM',
            degree: 'Cử nhân Thống kê Kinh tế',
            startDate: new Date('2014-09-01'),
            endDate: new Date('2018-06-30'),
            description: 'Tốt nghiệp loại Giỏi. Đồ án: Phân tích hành vi khách hàng trong e-commerce.',
          },
        ],
      },
      workExperiences: {
        create: [
          {
            title: 'Senior Data Analyst',
            company: 'Shopee Vietnam',
            startDate: new Date('2021-01-01'),
            endDate: null,
            description: 'Phân tích dữ liệu sales và marketing để tối ưu campaign. Xây dựng dashboard tracking KPIs cho ban lãnh đạo. Phát hiện insights giúp tăng 20% conversion rate.',
          },
          {
            title: 'Data Analyst',
            company: 'Ngân hàng ABC',
            startDate: new Date('2018-07-01'),
            endDate: new Date('2020-12-31'),
            description: 'Phân tích dữ liệu khách hàng và giao dịch. Xây dựng mô hình dự đoán rủi ro tín dụng. Báo cáo cho các phòng ban nghiệp vụ.',
          },
        ],
      },
      languages: {
        create: [
          { name: 'Tiếng Anh', level: 'INTERMEDIATE', description: 'TOEIC 700. Đọc báo cáo và tài liệu tốt.' },
          { name: 'Tiếng Việt', level: 'NATIVE', description: 'Tiếng mẹ đẻ' },
        ],
      },
    },
  });

  // CV 5: DevOps Engineer
  const cv5 = await prisma.cV.create({
    data: {
      userId: createdCandidates[4].id,
      title: 'CV Kỹ sư DevOps',
      isMain: true,
      fullName: 'Hoàng Văn Đức',
      email: 'hoangvanduc@gmail.com',
      phoneNumber: '0923456793',
      dateOfBirth: new Date('1994-04-18'),
      gender: 'MALE',
      address: '654 Võ Văn Tần, Quận 3, TP.HCM',
      currentPosition: 'DevOps Engineer',
      summary: 'Kỹ sư DevOps với 5 năm kinh nghiệm triển khai và vận hành hệ thống trên cloud. Chuyên về AWS, Docker, Kubernetes và CI/CD automation. Đam mê tối ưu hóa quy trình phát triển phần mềm.',
      objective: 'Tìm kiếm vị trí DevOps Engineer hoặc SRE tại công ty có hệ thống phức tạp, quy mô lớn.',
      isOpenForJob: true,
      skills: {
        create: [
          { skillName: 'AWS', level: 'EXPERT', yearsOfExperience: 4 },
          { skillName: 'Docker', level: 'EXPERT', yearsOfExperience: 4 },
          { skillName: 'Kubernetes', level: 'ADVANCED', yearsOfExperience: 3 },
          { skillName: 'Terraform', level: 'ADVANCED', yearsOfExperience: 2 },
          { skillName: 'Jenkins', level: 'ADVANCED', yearsOfExperience: 3 },
          { skillName: 'Linux', level: 'EXPERT', yearsOfExperience: 5 },
          { skillName: 'Ansible', level: 'INTERMEDIATE', yearsOfExperience: 2 },
        ],
      },
      educations: {
        create: [
          {
            institution: 'Đại học Bách khoa Hà Nội',
            degree: 'Kỹ sư Công nghệ Thông tin',
            startDate: new Date('2012-09-01'),
            endDate: new Date('2017-06-30'),
            description: 'Chuyên ngành Mạng máy tính và An toàn thông tin.',
          },
        ],
      },
      workExperiences: {
        create: [
          {
            title: 'Senior DevOps Engineer',
            company: 'Cloud Solutions Vietnam',
            startDate: new Date('2020-01-01'),
            endDate: null,
            description: 'Quản lý hạ tầng AWS cho 50+ microservices. Thiết kế và triển khai CI/CD pipelines giảm 70% thời gian deploy. Xây dựng hệ thống monitoring với Prometheus và Grafana.',
          },
          {
            title: 'System Administrator',
            company: 'Tech Company JKL',
            startDate: new Date('2017-07-01'),
            endDate: new Date('2019-12-31'),
            description: 'Quản trị hệ thống Linux servers. Triển khai Docker containers. Viết scripts automation bằng Bash và Python.',
          },
        ],
      },
      certifications: {
        create: [
          { name: 'AWS Certified Solutions Architect - Professional', issuer: 'Amazon Web Services', acquiredAt: new Date('2021-06-15'), description: 'Chứng chỉ kiến trúc sư giải pháp AWS cấp chuyên gia' },
          { name: 'Certified Kubernetes Administrator (CKA)', issuer: 'CNCF', acquiredAt: new Date('2022-02-20'), description: 'Chứng chỉ quản trị Kubernetes' },
        ],
      },
      languages: {
        create: [
          { name: 'Tiếng Anh', level: 'ADVANCED', description: 'IELTS 7.0. Giao tiếp kỹ thuật tốt.' },
          { name: 'Tiếng Việt', level: 'NATIVE', description: 'Tiếng mẹ đẻ' },
        ],
      },
    },
  });

  // CV 6: Mobile Developer
  const cv6 = await prisma.cV.create({
    data: {
      userId: createdCandidates[5].id,
      title: 'CV Lập trình viên Mobile',
      isMain: true,
      fullName: 'Ngô Thị Lan',
      email: 'ngothilan@gmail.com',
      phoneNumber: '0923456794',
      dateOfBirth: new Date('1997-08-22'),
      gender: 'FEMALE',
      address: '987 Nguyễn Đình Chiểu, Quận 3, TP.HCM',
      currentPosition: 'Mobile Developer',
      summary: 'Lập trình viên Mobile với 3 năm kinh nghiệm phát triển ứng dụng iOS và Android. Thành thạo React Native và Flutter để xây dựng ứng dụng cross-platform. Có nhiều ứng dụng đã publish trên App Store và Google Play.',
      objective: 'Tìm kiếm vị trí Mobile Developer tại công ty startup để phát triển sản phẩm mobile sáng tạo.',
      isOpenForJob: true,
      skills: {
        create: [
          { skillName: 'React Native', level: 'ADVANCED', yearsOfExperience: 3 },
          { skillName: 'Flutter', level: 'ADVANCED', yearsOfExperience: 2 },
          { skillName: 'Swift', level: 'INTERMEDIATE', yearsOfExperience: 2 },
          { skillName: 'Kotlin', level: 'INTERMEDIATE', yearsOfExperience: 1 },
          { skillName: 'JavaScript', level: 'ADVANCED', yearsOfExperience: 3 },
          { skillName: 'Dart', level: 'INTERMEDIATE', yearsOfExperience: 2 },
        ],
      },
      educations: {
        create: [
          {
            institution: 'Đại học FPT',
            degree: 'Kỹ sư Phần mềm',
            startDate: new Date('2015-09-01'),
            endDate: new Date('2019-06-30'),
            description: 'Chuyên ngành Phát triển ứng dụng di động.',
          },
        ],
      },
      workExperiences: {
        create: [
          {
            title: 'Mobile Developer',
            company: 'Mobile Apps Studio',
            startDate: new Date('2019-07-01'),
            endDate: null,
            description: 'Phát triển 10+ ứng dụng mobile cho khách hàng. Lead team phát triển ứng dụng giao đồ ăn với 100,000+ downloads. Tối ưu performance và UX.',
          },
        ],
      },
      projects: {
        create: [
          {
            name: 'Ứng dụng giao đồ ăn',
            description: 'Phát triển ứng dụng đặt và giao đồ ăn với real-time tracking, thanh toán online, đánh giá.',
            startDate: new Date('2021-01-01'),
            endDate: new Date('2021-08-31'),
            role: 'Lead Mobile Developer',
          },
        ],
      },
      languages: {
        create: [
          { name: 'Tiếng Anh', level: 'ADVANCED', description: 'TOEIC 780. Giao tiếp tốt.' },
          { name: 'Tiếng Việt', level: 'NATIVE', description: 'Tiếng mẹ đẻ' },
        ],
      },
    },
  });

  // CV 7: AI/ML Engineer
  const cv7 = await prisma.cV.create({
    data: {
      userId: createdCandidates[6].id,
      title: 'CV Kỹ sư AI/Machine Learning',
      isMain: true,
      fullName: 'Đặng Văn Hiếu',
      email: 'dangvanhieu@gmail.com',
      phoneNumber: '0923456795',
      dateOfBirth: new Date('1992-01-30'),
      gender: 'MALE',
      address: '147 Trần Hưng Đạo, Quận 1, TP.HCM',
      currentPosition: 'AI/ML Engineer',
      summary: 'Kỹ sư AI/ML với 5 năm kinh nghiệm phát triển các mô hình machine learning và deep learning. Chuyên về NLP, Computer Vision và Recommendation Systems. Có nhiều bài báo khoa học được công bố.',
      objective: 'Tìm kiếm vị trí AI Engineer tại công ty công nghệ để nghiên cứu và ứng dụng AI vào sản phẩm thực tế.',
      isOpenForJob: true,
      skills: {
        create: [
          { skillName: 'Python', level: 'EXPERT', yearsOfExperience: 6 },
          { skillName: 'TensorFlow', level: 'ADVANCED', yearsOfExperience: 4 },
          { skillName: 'PyTorch', level: 'ADVANCED', yearsOfExperience: 3 },
          { skillName: 'NLP', level: 'ADVANCED', yearsOfExperience: 3 },
          { skillName: 'Computer Vision', level: 'INTERMEDIATE', yearsOfExperience: 2 },
          { skillName: 'MLOps', level: 'INTERMEDIATE', yearsOfExperience: 2 },
        ],
      },
      educations: {
        create: [
          {
            institution: 'Đại học Bách khoa TP.HCM',
            degree: 'Thạc sĩ Khoa học Máy tính',
            startDate: new Date('2016-09-01'),
            endDate: new Date('2018-06-30'),
            description: 'Luận văn: Ứng dụng Deep Learning trong nhận dạng hình ảnh y tế.',
          },
          {
            institution: 'Đại học Bách khoa TP.HCM',
            degree: 'Cử nhân Khoa học Máy tính',
            startDate: new Date('2010-09-01'),
            endDate: new Date('2014-06-30'),
            description: 'Tốt nghiệp loại Giỏi.',
          },
        ],
      },
      workExperiences: {
        create: [
          {
            title: 'Senior AI Engineer',
            company: 'AI Research Lab Vietnam',
            startDate: new Date('2020-01-01'),
            endDate: null,
            description: 'Nghiên cứu và phát triển các mô hình NLP cho tiếng Việt. Xây dựng hệ thống recommendation cho e-commerce với 95% accuracy. Hướng dẫn team 3 junior AI engineers.',
          },
          {
            title: 'Machine Learning Engineer',
            company: 'HealthTech Company',
            startDate: new Date('2018-07-01'),
            endDate: new Date('2019-12-31'),
            description: 'Phát triển mô hình AI phân tích hình ảnh X-quang. Triển khai MLOps pipeline.',
          },
        ],
      },
      languages: {
        create: [
          { name: 'Tiếng Anh', level: 'ADVANCED', description: 'IELTS 7.5. Viết báo khoa học quốc tế.' },
          { name: 'Tiếng Việt', level: 'NATIVE', description: 'Tiếng mẹ đẻ' },
        ],
      },
    },
  });

  // CV 8: UI/UX Designer
  const cv8 = await prisma.cV.create({
    data: {
      userId: createdCandidates[7].id,
      title: 'CV Thiết kế UI/UX',
      isMain: true,
      fullName: 'Bùi Thị Thanh',
      email: 'buithithanh@gmail.com',
      phoneNumber: '0923456796',
      dateOfBirth: new Date('1999-03-12'),
      gender: 'FEMALE',
      address: '258 Lý Tự Trọng, Quận 1, TP.HCM',
      currentPosition: 'UI/UX Designer',
      summary: 'Nhà thiết kế UI/UX với 2 năm kinh nghiệm tạo ra các giao diện đẹp và trải nghiệm người dùng tuyệt vời. Thành thạo Figma, Adobe XD và các nguyên tắc thiết kế.',
      isOpenForJob: false, // Không tìm việc
      skills: {
        create: [
          { skillName: 'Figma', level: 'EXPERT', yearsOfExperience: 3 },
          { skillName: 'Adobe XD', level: 'ADVANCED', yearsOfExperience: 2 },
          { skillName: 'Sketch', level: 'INTERMEDIATE', yearsOfExperience: 1 },
          { skillName: 'Adobe Illustrator', level: 'INTERMEDIATE', yearsOfExperience: 2 },
          { skillName: 'Prototyping', level: 'ADVANCED', yearsOfExperience: 2 },
        ],
      },
      educations: {
        create: [
          {
            institution: 'Đại học Mỹ thuật TP.HCM',
            degree: 'Cử nhân Thiết kế Đồ họa',
            startDate: new Date('2017-09-01'),
            endDate: new Date('2021-06-30'),
            description: 'Chuyên ngành Thiết kế giao diện số.',
          },
        ],
      },
    },
  });

  // CV 9: Business Analyst
  const cv9 = await prisma.cV.create({
    data: {
      userId: createdCandidates[8].id,
      title: 'CV Chuyên viên Phân tích Nghiệp vụ',
      isMain: true,
      fullName: 'Võ Văn Nam',
      email: 'vovannam@gmail.com',
      phoneNumber: '0923456797',
      dateOfBirth: new Date('1991-07-08'),
      gender: 'MALE',
      address: '369 Hai Bà Trưng, Quận 3, TP.HCM',
      currentPosition: 'Business Analyst',
      summary: 'Chuyên viên phân tích nghiệp vụ với 6 năm kinh nghiệm trong lĩnh vực ngân hàng và fintech. Có khả năng cầu nối giữa business và technical team. Thành thạo viết tài liệu yêu cầu và quản lý dự án.',
      objective: 'Tìm kiếm vị trí Senior BA hoặc Product Owner tại công ty fintech.',
      isOpenForJob: true,
      skills: {
        create: [
          { skillName: 'Business Analysis', level: 'EXPERT', yearsOfExperience: 6 },
          { skillName: 'SQL', level: 'ADVANCED', yearsOfExperience: 4 },
          { skillName: 'Jira', level: 'EXPERT', yearsOfExperience: 5 },
          { skillName: 'Agile/Scrum', level: 'ADVANCED', yearsOfExperience: 4 },
          { skillName: 'UML', level: 'ADVANCED', yearsOfExperience: 4 },
        ],
      },
      educations: {
        create: [
          {
            institution: 'Đại học Ngoại thương TP.HCM',
            degree: 'Cử nhân Quản trị Kinh doanh',
            startDate: new Date('2009-09-01'),
            endDate: new Date('2013-06-30'),
            description: 'Chuyên ngành Quản trị Hệ thống Thông tin.',
          },
        ],
      },
      workExperiences: {
        create: [
          {
            title: 'Senior Business Analyst',
            company: 'VPBank',
            startDate: new Date('2019-01-01'),
            endDate: null,
            description: 'Phân tích yêu cầu cho các dự án digital banking. Viết BRD, FRD và user stories. Làm việc với stakeholders từ nhiều phòng ban.',
          },
          {
            title: 'Business Analyst',
            company: 'MoMo',
            startDate: new Date('2015-07-01'),
            endDate: new Date('2018-12-31'),
            description: 'Phân tích quy trình thanh toán và ví điện tử. Thiết kế wireframes và user flow.',
          },
        ],
      },
      languages: {
        create: [
          { name: 'Tiếng Anh', level: 'ADVANCED', description: 'TOEIC 850. Làm việc với đối tác nước ngoài.' },
          { name: 'Tiếng Việt', level: 'NATIVE', description: 'Tiếng mẹ đẻ' },
        ],
      },
    },
  });

  // CV 10: Fresh Graduate
  const cv10 = await prisma.cV.create({
    data: {
      userId: createdCandidates[9].id,
      title: 'CV Sinh viên mới tốt nghiệp',
      isMain: true,
      fullName: 'Đoàn Thị Kim',
      email: 'doanthikim@gmail.com',
      phoneNumber: '0923456798',
      dateOfBirth: new Date('2000-11-25'),
      gender: 'FEMALE',
      address: '111 Nguyễn Văn Cừ, Quận 5, TP.HCM',
      currentPosition: 'Fresher Developer',
      summary: 'Sinh viên mới tốt nghiệp ngành Công nghệ Thông tin với đam mê lập trình web. Nhanh nhẹn, ham học hỏi và mong muốn được đào tạo để trở thành developer giỏi.',
      objective: 'Tìm kiếm vị trí Fresher/Junior Developer để bắt đầu sự nghiệp trong ngành IT.',
      isOpenForJob: true,
      skills: {
        create: [
          { skillName: 'JavaScript', level: 'BEGINNER', yearsOfExperience: 1 },
          { skillName: 'HTML/CSS', level: 'INTERMEDIATE', yearsOfExperience: 2 },
          { skillName: 'React', level: 'BEGINNER', yearsOfExperience: 1 },
          { skillName: 'Java', level: 'BEGINNER', yearsOfExperience: 1 },
          { skillName: 'Git', level: 'BEGINNER', yearsOfExperience: 1 },
        ],
      },
      educations: {
        create: [
          {
            institution: 'Đại học Khoa học Tự nhiên TP.HCM',
            degree: 'Cử nhân Công nghệ Thông tin',
            startDate: new Date('2018-09-01'),
            endDate: new Date('2022-06-30'),
            description: 'Điểm trung bình: 7.8/10. Đồ án tốt nghiệp: Website quản lý thư viện.',
          },
        ],
      },
      projects: {
        create: [
          {
            name: 'Website quản lý thư viện',
            description: 'Đồ án tốt nghiệp: Xây dựng hệ thống quản lý mượn trả sách, tra cứu sách online.',
            startDate: new Date('2022-01-01'),
            endDate: new Date('2022-05-31'),
            role: 'Full-stack Developer',
          },
        ],
      },
      languages: {
        create: [
          { name: 'Tiếng Anh', level: 'INTERMEDIATE', description: 'TOEIC 650. Đọc tài liệu kỹ thuật được.' },
          { name: 'Tiếng Việt', level: 'NATIVE', description: 'Tiếng mẹ đẻ' },
        ],
      },
    },
  });

  console.log(`✅ Đã tạo ${10} CV với dữ liệu chi tiết\n`);

  // ============================================
  // 7. JOBS
  // ============================================
  console.log('💼 Tạo các Tin tuyển dụng...');

  // Job 1: Senior Software Engineer - FPT
  const job1 = await prisma.job.create({
    data: {
      companyId: company1.id,
      title: 'Kỹ sư Phần mềm Cao cấp (Node.js)',
      description: `FPT Software đang tìm kiếm Kỹ sư Phần mềm Cao cấp để tham gia phát triển các dự án outsourcing cho khách hàng Nhật Bản và châu Âu.

**Mô tả công việc:**
- Thiết kế và phát triển các ứng dụng web sử dụng Node.js và React
- Tham gia vào toàn bộ vòng đời phát triển phần mềm
- Code review và hỗ trợ các thành viên junior trong team
- Làm việc với khách hàng để hiểu và phân tích yêu cầu
- Đề xuất các giải pháp kỹ thuật và cải tiến quy trình

**Yêu cầu:**
- 5+ năm kinh nghiệm phát triển phần mềm
- Thành thạo Node.js, TypeScript, React
- Kinh nghiệm với PostgreSQL, MongoDB
- Tiếng Anh giao tiếp tốt (TOEIC 650+)`,
      location: 'Hà Nội, Việt Nam',
      industry: 'Công nghệ thông tin',
      experienceLevel: 'SENIOR',
      type: 'FULL_TIME',
      urgent: false,
      status: 'ACTIVE',
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      applicationCount: 0,
      skills: {
        create: [
          { skillName: 'Node.js', level: 'ADVANCED', yearsOfExperience: 4 },
          { skillName: 'TypeScript', level: 'ADVANCED', yearsOfExperience: 2 },
          { skillName: 'React', level: 'ADVANCED', yearsOfExperience: 3 },
          { skillName: 'PostgreSQL', level: 'INTERMEDIATE', yearsOfExperience: 2 },
        ],
      },
      benefits: {
        create: [
          { title: 'Lương hấp dẫn', description: 'Mức lương cạnh tranh từ 25-45 triệu VND, thưởng dự án và thưởng cuối năm lên đến 3 tháng lương' },
          { title: 'Bảo hiểm sức khỏe', description: 'Bảo hiểm sức khỏe cao cấp cho bạn và gia đình tại các bệnh viện quốc tế' },
          { title: 'Làm việc linh hoạt', description: 'Hybrid working, giờ làm việc linh hoạt, work from home 2 ngày/tuần' },
          { title: 'Đào tạo phát triển', description: 'Ngân sách học tập 2000$/năm, các khóa đào tạo nội bộ, cơ hội đi onsite nước ngoài' },
          { title: 'Phúc lợi khác', description: 'Laptop làm việc, voucher ăn trưa, gym, du lịch công ty hàng năm' },
        ],
      },
      requirements: {
        create: [
          { title: 'Học vấn', description: 'Tốt nghiệp Đại học chuyên ngành CNTT hoặc liên quan' },
          { title: 'Kinh nghiệm', description: '5+ năm kinh nghiệm phát triển phần mềm, trong đó ít nhất 3 năm với Node.js' },
          { title: 'Kỹ năng kỹ thuật', description: 'Thành thạo Node.js, TypeScript, React. Có kinh nghiệm với microservices và cloud (AWS/GCP)' },
          { title: 'Ngôn ngữ', description: 'Tiếng Anh giao tiếp tốt (TOEIC 650+ hoặc tương đương)' },
          { title: 'Kỹ năng mềm', description: 'Khả năng làm việc nhóm, giao tiếp tốt, chịu được áp lực công việc' },
        ],
      },
    },
  });

  await prisma.salary.create({
    data: { jobId: job1.id, minAmount: 25000000, maxAmount: 45000000, currency: 'VND', isNegotiable: true, hideAmount: false },
  });

  // Job 2: Full-stack Developer - VNG
  const job2 = await prisma.job.create({
    data: {
      companyId: company2.id,
      title: 'Lập trình viên Full-stack (Zalo Team)',
      description: `VNG tuyển dụng Full-stack Developer gia nhập team Zalo - ứng dụng nhắn tin số 1 Việt Nam với hơn 75 triệu người dùng.

**Mô tả công việc:**
- Phát triển các tính năng mới cho Zalo Web và Zalo PC
- Tối ưu hóa performance để phục vụ hàng triệu người dùng đồng thời
- Làm việc với các công nghệ real-time messaging
- Collaborate với team mobile và backend

**Bạn sẽ làm việc với:**
- Frontend: React, Redux, WebSocket
- Backend: Go, Node.js, gRPC
- Database: MySQL, Redis, Elasticsearch
- Tools: Kubernetes, Jenkins, Grafana`,
      location: 'TP. Hồ Chí Minh, Việt Nam',
      industry: 'Công nghệ thông tin',
      experienceLevel: 'MIDDLE',
      type: 'FULL_TIME',
      urgent: true,
      status: 'ACTIVE',
      expiresAt: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000),
      applicationCount: 0,
      skills: {
        create: [
          { skillName: 'React', level: 'ADVANCED', yearsOfExperience: 2 },
          { skillName: 'Node.js', level: 'INTERMEDIATE', yearsOfExperience: 2 },
          { skillName: 'Go', level: 'BEGINNER', yearsOfExperience: 1 },
          { skillName: 'Redis', level: 'INTERMEDIATE', yearsOfExperience: 1 },
        ],
      },
      benefits: {
        create: [
          { title: 'Cổ phiếu ESOP', description: 'Được nhận cổ phiếu VNG với giá ưu đãi' },
          { title: 'Lương thưởng cao', description: 'Lương tháng 13-14, thưởng performance, review lương 2 lần/năm' },
          { title: 'Văn hóa startup', description: 'Môi trường làm việc sáng tạo, không giới hạn, team building hàng quý' },
          { title: 'Phúc lợi đặc biệt', description: 'Canteen miễn phí, phòng gym, game room, parking miễn phí' },
        ],
      },
      requirements: {
        create: [
          { title: 'Kinh nghiệm', description: '2-4 năm kinh nghiệm phát triển web application' },
          { title: 'Kỹ năng', description: 'Thành thạo React và ít nhất một backend language (Node.js/Go/Java)' },
          { title: 'Mindset', description: 'Đam mê công nghệ, tinh thần startup, chủ động học hỏi' },
        ],
      },
    },
  });

  await prisma.salary.create({
    data: { jobId: job2.id, minAmount: 20000000, maxAmount: 35000000, currency: 'VND', isNegotiable: true, hideAmount: false },
  });

  // Job 3: Data Analyst - Techcombank
  const job3 = await prisma.job.create({
    data: {
      companyId: company3.id,
      title: 'Chuyên viên Phân tích Dữ liệu (Data Analytics)',
      description: `Techcombank tuyển dụng Data Analyst cho Khối Phân tích Dữ liệu - nơi dữ liệu được biến thành insights giúp ngân hàng đưa ra quyết định chiến lược.

**Mô tả công việc:**
- Phân tích dữ liệu khách hàng, giao dịch để tìm insights kinh doanh
- Xây dựng dashboard và báo cáo cho ban lãnh đạo
- Phát triển mô hình dự đoán hành vi khách hàng
- Hỗ trợ các phòng ban nghiệp vụ trong việc ra quyết định dựa trên dữ liệu

**Môi trường làm việc:**
- Data warehouse hiện đại với petabytes dữ liệu
- Các công cụ phân tích tiên tiến: SQL, Python, Tableau, Power BI
- Team đa dạng với chuyên gia từ nhiều lĩnh vực`,
      location: 'Hà Nội, Việt Nam',
      industry: 'Tài chính - Ngân hàng',
      experienceLevel: 'MIDDLE',
      type: 'FULL_TIME',
      urgent: false,
      status: 'ACTIVE',
      expiresAt: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000),
      applicationCount: 0,
      skills: {
        create: [
          { skillName: 'SQL', level: 'ADVANCED', yearsOfExperience: 2 },
          { skillName: 'Python', level: 'INTERMEDIATE', yearsOfExperience: 1 },
          { skillName: 'Tableau', level: 'INTERMEDIATE', yearsOfExperience: 1 },
          { skillName: 'Excel', level: 'ADVANCED', yearsOfExperience: 2 },
        ],
      },
      benefits: {
        create: [
          { title: 'Lương thưởng ngân hàng', description: 'Lương cạnh tranh, thưởng KPI hàng quý, lương tháng 13-15' },
          { title: 'Đào tạo bài bản', description: 'Các khóa training chuyên sâu về banking, data analytics, leadership' },
          { title: 'Cơ hội thăng tiến', description: 'Lộ trình career path rõ ràng, cơ hội luân chuyển giữa các phòng ban' },
          { title: 'Phúc lợi ngân hàng', description: 'Ưu đãi vay mua nhà/xe, bảo hiểm sức khỏe toàn diện' },
        ],
      },
      requirements: {
        create: [
          { title: 'Học vấn', description: 'Tốt nghiệp Đại học chuyên ngành Toán, Thống kê, CNTT, Kinh tế hoặc liên quan' },
          { title: 'Kinh nghiệm', description: '2+ năm kinh nghiệm phân tích dữ liệu, ưu tiên trong lĩnh vực tài chính' },
          { title: 'Kỹ năng', description: 'Thành thạo SQL, Excel. Biết Python và công cụ visualization là lợi thế' },
        ],
      },
    },
  });

  await prisma.salary.create({
    data: { jobId: job3.id, minAmount: 18000000, maxAmount: 30000000, currency: 'VND', isNegotiable: false, hideAmount: false },
  });

  // Job 4: DevOps Engineer - Shopee
  const job4 = await prisma.job.create({
    data: {
      companyId: company4.id,
      title: 'Kỹ sư DevOps (Cloud Infrastructure)',
      description: `Shopee Vietnam đang tìm kiếm DevOps Engineer để quản lý và tối ưu hạ tầng cloud phục vụ hàng triệu giao dịch mỗi ngày.

**Mô tả công việc:**
- Quản lý và vận hành hạ tầng Kubernetes clusters
- Thiết kế và triển khai CI/CD pipelines
- Monitoring, alerting và incident response
- Tự động hóa quy trình operations với Infrastructure as Code
- Collaborate với development teams để optimize deployment

**Tech Stack:**
- Cloud: AWS, GCP
- Container: Docker, Kubernetes
- IaC: Terraform, Ansible
- Monitoring: Prometheus, Grafana, ELK
- CI/CD: Jenkins, GitLab CI`,
      location: 'TP. Hồ Chí Minh, Việt Nam',
      industry: 'Thương mại điện tử',
      experienceLevel: 'SENIOR',
      type: 'FULL_TIME',
      urgent: true,
      status: 'ACTIVE',
      expiresAt: new Date(Date.now() + 25 * 24 * 60 * 60 * 1000),
      applicationCount: 0,
      skills: {
        create: [
          { skillName: 'Kubernetes', level: 'ADVANCED', yearsOfExperience: 2 },
          { skillName: 'AWS', level: 'ADVANCED', yearsOfExperience: 3 },
          { skillName: 'Docker', level: 'ADVANCED', yearsOfExperience: 3 },
          { skillName: 'Terraform', level: 'INTERMEDIATE', yearsOfExperience: 1 },
          { skillName: 'Linux', level: 'ADVANCED', yearsOfExperience: 4 },
        ],
      },
      benefits: {
        create: [
          { title: 'Lương cạnh tranh', description: 'Mức lương top thị trường, bonus hàng quý và cuối năm' },
          { title: 'Môi trường quốc tế', description: 'Làm việc với đồng nghiệp đến từ nhiều quốc gia trong khu vực' },
          { title: 'Learning budget', description: '$1500/năm cho training và certification' },
          { title: 'Wellness benefits', description: 'Bảo hiểm sức khỏe, gym membership, mental health support' },
        ],
      },
      requirements: {
        create: [
          { title: 'Kinh nghiệm', description: '3+ năm kinh nghiệm DevOps/SRE' },
          { title: 'Kỹ năng kỹ thuật', description: 'Thành thạo Kubernetes, Docker, AWS/GCP. Kinh nghiệm với Terraform là bắt buộc' },
          { title: 'Chứng chỉ', description: 'CKA, AWS Solutions Architect hoặc tương đương là lợi thế' },
        ],
      },
    },
  });

  await prisma.salary.create({
    data: { jobId: job4.id, minAmount: 30000000, maxAmount: 50000000, currency: 'VND', isNegotiable: true, hideAmount: false },
  });

  // Job 5: AI Engineer - ABC Solutions
  const job5 = await prisma.job.create({
    data: {
      companyId: company5.id,
      title: 'Kỹ sư AI/Machine Learning',
      description: `ABC Solutions - startup AI đang tìm kiếm AI Engineer để xây dựng các sản phẩm AI cho doanh nghiệp Việt Nam.

**Mô tả công việc:**
- Nghiên cứu và phát triển các mô hình ML/DL
- Xây dựng các giải pháp NLP cho tiếng Việt
- Triển khai và tối ưu mô hình AI vào production
- Làm việc trực tiếp với khách hàng để hiểu và giải quyết business problems

**Sản phẩm bạn sẽ xây dựng:**
- Chatbot AI thông minh
- Hệ thống phân tích sentiment
- Document understanding và extraction
- Recommendation engine`,
      location: 'TP. Hồ Chí Minh, Việt Nam',
      industry: 'Công nghệ thông tin',
      experienceLevel: 'MIDDLE',
      type: 'FULL_TIME',
      urgent: false,
      status: 'ACTIVE',
      expiresAt: new Date(Date.now() + 40 * 24 * 60 * 60 * 1000),
      applicationCount: 0,
      skills: {
        create: [
          { skillName: 'Python', level: 'ADVANCED', yearsOfExperience: 3 },
          { skillName: 'TensorFlow', level: 'INTERMEDIATE', yearsOfExperience: 2 },
          { skillName: 'PyTorch', level: 'INTERMEDIATE', yearsOfExperience: 1 },
          { skillName: 'NLP', level: 'INTERMEDIATE', yearsOfExperience: 1 },
        ],
      },
      benefits: {
        create: [
          { title: 'ESOP hấp dẫn', description: 'Cơ hội sở hữu cổ phần công ty với giá ưu đãi' },
          { title: 'Flexible working', description: 'Làm việc remote, giờ giấc linh hoạt' },
          { title: 'Learning culture', description: 'Môi trường học hỏi liên tục, được sponsor đi conference' },
          { title: 'Small team, big impact', description: 'Đóng góp trực tiếp vào sản phẩm, được lắng nghe ý kiến' },
        ],
      },
      requirements: {
        create: [
          { title: 'Học vấn', description: 'Tốt nghiệp Đại học/Thạc sĩ chuyên ngành CNTT, Toán, hoặc liên quan' },
          { title: 'Kinh nghiệm', description: '2+ năm kinh nghiệm ML/AI, có kinh nghiệm NLP là lợi thế lớn' },
          { title: 'Kỹ năng', description: 'Thành thạo Python, deep learning frameworks (TensorFlow/PyTorch)' },
        ],
      },
    },
  });

  await prisma.salary.create({
    data: { jobId: job5.id, minAmount: 22000000, maxAmount: 40000000, currency: 'VND', isNegotiable: true, hideAmount: false },
  });

  // Job 6: Mobile Developer - Shopee
  const job6 = await prisma.job.create({
    data: {
      companyId: company4.id,
      title: 'Lập trình viên Mobile (React Native)',
      description: `Shopee tuyển dụng Mobile Developer để phát triển ứng dụng Shopee - app e-commerce được download nhiều nhất Việt Nam.

**Mô tả công việc:**
- Phát triển tính năng mới cho Shopee App (iOS & Android)
- Tối ưu hiệu năng và trải nghiệm người dùng
- Làm việc với A/B testing để cải thiện conversion
- Collaborate với team backend, design và product`,
      location: 'TP. Hồ Chí Minh, Việt Nam',
      industry: 'Thương mại điện tử',
      experienceLevel: 'MIDDLE',
      type: 'FULL_TIME',
      urgent: false,
      status: 'ACTIVE',
      expiresAt: new Date(Date.now() + 35 * 24 * 60 * 60 * 1000),
      applicationCount: 0,
      skills: {
        create: [
          { skillName: 'React Native', level: 'ADVANCED', yearsOfExperience: 2 },
          { skillName: 'JavaScript', level: 'ADVANCED', yearsOfExperience: 3 },
          { skillName: 'TypeScript', level: 'INTERMEDIATE', yearsOfExperience: 1 },
        ],
      },
      benefits: {
        create: [
          { title: 'Lương thưởng hấp dẫn', description: 'Lương cạnh tranh, bonus performance' },
          { title: 'Career growth', description: 'Cơ hội phát triển trong môi trường e-commerce top 1' },
        ],
      },
      requirements: {
        create: [
          { title: 'Kinh nghiệm', description: '2+ năm kinh nghiệm React Native' },
          { title: 'Portfolio', description: 'Có ứng dụng đã publish trên App Store/Google Play' },
        ],
      },
    },
  });

  await prisma.salary.create({
    data: { jobId: job6.id, minAmount: 20000000, maxAmount: 35000000, currency: 'VND', isNegotiable: true, hideAmount: false },
  });

  // Job 7: Junior Developer - FPT (Pending)
  const job7 = await prisma.job.create({
    data: {
      companyId: company1.id,
      title: 'Lập trình viên Junior (Fresher Welcome)',
      description: `FPT Software mở chương trình tuyển dụng Fresher 2024 - cơ hội tuyệt vời cho các bạn sinh viên mới ra trường bắt đầu sự nghiệp IT.

**Mô tả công việc:**
- Được đào tạo bài bản về quy trình phát triển phần mềm
- Tham gia các dự án thực tế cùng mentor
- Học hỏi các công nghệ mới: Java, .NET, Python, JavaScript

**Chương trình đào tạo:**
- 2 tháng bootcamp với giảng viên giàu kinh nghiệm
- Được mentor hướng dẫn 1-1
- Chứng chỉ nội bộ sau khi hoàn thành`,
      location: 'Hà Nội / TP.HCM / Đà Nẵng',
      industry: 'Công nghệ thông tin',
      experienceLevel: 'FRESHER',
      type: 'FULL_TIME',
      urgent: false,
      status: 'PENDING', // Chờ duyệt
      expiresAt: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000),
      applicationCount: 0,
      skills: {
        create: [
          { skillName: 'Lập trình cơ bản', level: 'BEGINNER', yearsOfExperience: 0 },
          { skillName: 'Thuật toán', level: 'BEGINNER', yearsOfExperience: 0 },
        ],
      },
      benefits: {
        create: [
          { title: 'Đào tạo miễn phí', description: 'Bootcamp 2 tháng hoàn toàn miễn phí' },
          { title: 'Mentor 1-1', description: 'Được senior engineer hướng dẫn trực tiếp' },
          { title: 'Lương fresher cạnh tranh', description: 'Mức lương từ 8-12 triệu cho fresher' },
        ],
      },
      requirements: {
        create: [
          { title: 'Học vấn', description: 'Sinh viên năm cuối hoặc mới tốt nghiệp ngành CNTT' },
          { title: 'Đam mê', description: 'Yêu thích lập trình, ham học hỏi, sẵn sàng làm việc chăm chỉ' },
        ],
      },
    },
  });

  await prisma.salary.create({
    data: { jobId: job7.id, minAmount: 8000000, maxAmount: 12000000, currency: 'VND', isNegotiable: false, hideAmount: false },
  });

  // Job 8: Backend Developer - VNG
  const job8 = await prisma.job.create({
    data: {
      companyId: company2.id,
      title: 'Lập trình viên Backend (Go/Java)',
      description: `VNG tuyển dụng Backend Developer cho team platform - nền tảng hỗ trợ tất cả các sản phẩm của VNG.

**Mô tả công việc:**
- Phát triển và maintain các microservices
- Xây dựng API cho hàng triệu requests/giây
- Tối ưu hiệu năng và độ tin cậy của hệ thống`,
      location: 'TP. Hồ Chí Minh, Việt Nam',
      industry: 'Công nghệ thông tin',
      experienceLevel: 'SENIOR',
      type: 'FULL_TIME',
      urgent: false,
      status: 'ACTIVE',
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      applicationCount: 0,
      skills: {
        create: [
          { skillName: 'Go', level: 'ADVANCED', yearsOfExperience: 2 },
          { skillName: 'Java', level: 'ADVANCED', yearsOfExperience: 3 },
          { skillName: 'MySQL', level: 'ADVANCED', yearsOfExperience: 3 },
          { skillName: 'Redis', level: 'INTERMEDIATE', yearsOfExperience: 2 },
        ],
      },
      benefits: {
        create: [
          { title: 'Package hấp dẫn', description: 'Lương thưởng + ESOP' },
          { title: 'Môi trường tech', description: 'Làm việc với các kỹ sư giỏi nhất VN' },
        ],
      },
      requirements: {
        create: [
          { title: 'Kinh nghiệm', description: '4+ năm backend development' },
          { title: 'Kỹ năng', description: 'Expert Go hoặc Java, kinh nghiệm high-traffic system' },
        ],
      },
    },
  });

  await prisma.salary.create({
    data: { jobId: job8.id, minAmount: 30000000, maxAmount: 50000000, currency: 'VND', isNegotiable: true, hideAmount: false },
  });

  console.log(`✅ Đã tạo ${8} Tin tuyển dụng\n`);

  // ============================================
  // 8. APPLICATIONS
  // ============================================
  console.log('📝 Tạo các Đơn ứng tuyển...');

  const applications = [
    { userId: createdCandidates[0].id, cvId: cv1.id, jobId: job1.id, status: 'REVIEWING', coverLetter: 'Tôi rất quan tâm đến vị trí Kỹ sư Phần mềm Cao cấp tại FPT. Với 5 năm kinh nghiệm trong lĩnh vực phát triển web và chuyên môn về Node.js, React, tôi tin mình có thể đóng góp tích cực cho team.' },
    { userId: createdCandidates[1].id, cvId: cv2.id, jobId: job2.id, status: 'PENDING', coverLetter: 'Tôi mong muốn được gia nhập team Zalo của VNG. Kinh nghiệm 3 năm làm Frontend với React và Vue.js giúp tôi tự tin có thể contribute vào các dự án của team.' },
    { userId: createdCandidates[2].id, cvId: cv3.id, jobId: job1.id, status: 'PENDING', coverLetter: 'Là Backend Developer với 6 năm kinh nghiệm, tôi muốn apply vị trí Senior tại FPT để phát triển bản thân trong môi trường chuyên nghiệp.' },
    { userId: createdCandidates[3].id, cvId: cv4.id, jobId: job3.id, status: 'ACCEPTED', coverLetter: 'Với background về phân tích dữ liệu trong lĩnh vực tài chính, tôi rất phù hợp với vị trí Data Analyst tại Techcombank.' },
    { userId: createdCandidates[4].id, cvId: cv5.id, jobId: job4.id, status: 'REVIEWING', coverLetter: 'Tôi có 5 năm kinh nghiệm DevOps và các chứng chỉ AWS, CKA. Tôi tin mình có thể đóng góp vào việc tối ưu hạ tầng của Shopee.' },
    { userId: createdCandidates[5].id, cvId: cv6.id, jobId: job6.id, status: 'PENDING', coverLetter: 'Là Mobile Developer với 3 năm kinh nghiệm React Native, tôi muốn tham gia phát triển app Shopee.' },
    { userId: createdCandidates[6].id, cvId: cv7.id, jobId: job5.id, status: 'REVIEWING', coverLetter: 'Với nền tảng về AI/ML và đam mê NLP tiếng Việt, tôi rất hứng thú với các sản phẩm AI của ABC Solutions.' },
    { userId: createdCandidates[8].id, cvId: cv9.id, jobId: job3.id, status: 'REJECTED', coverLetter: 'Tôi có kinh nghiệm BA trong ngân hàng và muốn chuyển sang Data Analyst.', notes: 'Profile thiên về BA hơn là DA, suggest apply vị trí BA' },
    { userId: createdCandidates[9].id, cvId: cv10.id, jobId: job7.id, status: 'PENDING', coverLetter: 'Em là sinh viên mới tốt nghiệp và rất mong được tham gia chương trình Fresher của FPT để phát triển kỹ năng.' },
    { userId: createdCandidates[0].id, cvId: cv1.id, jobId: job8.id, status: 'PENDING', coverLetter: 'Tôi cũng muốn apply vị trí Backend tại VNG với kinh nghiệm về Node.js và hệ thống high-traffic.' },
  ];

  for (const app of applications) {
    await prisma.application.create({ data: app });
  }

  // Update applicationCount
  await prisma.job.update({ where: { id: job1.id }, data: { applicationCount: 2 } });
  await prisma.job.update({ where: { id: job2.id }, data: { applicationCount: 1 } });
  await prisma.job.update({ where: { id: job3.id }, data: { applicationCount: 2 } });
  await prisma.job.update({ where: { id: job4.id }, data: { applicationCount: 1 } });
  await prisma.job.update({ where: { id: job5.id }, data: { applicationCount: 1 } });
  await prisma.job.update({ where: { id: job6.id }, data: { applicationCount: 1 } });
  await prisma.job.update({ where: { id: job7.id }, data: { applicationCount: 1 } });
  await prisma.job.update({ where: { id: job8.id }, data: { applicationCount: 1 } });

  console.log(`✅ Đã tạo ${applications.length} Đơn ứng tuyển\n`);

  // ============================================
  // 9. SAVED JOBS
  // ============================================
  console.log('💾 Tạo Saved Jobs...');

  await prisma.savedJob.createMany({
    data: [
      { userId: createdCandidates[0].id, jobId: job2.id },
      { userId: createdCandidates[0].id, jobId: job4.id },
      { userId: createdCandidates[1].id, jobId: job1.id },
      { userId: createdCandidates[2].id, jobId: job8.id },
      { userId: createdCandidates[3].id, jobId: job3.id },
      { userId: createdCandidates[5].id, jobId: job6.id },
      { userId: createdCandidates[9].id, jobId: job7.id },
    ],
  });

  console.log(`✅ Đã tạo 7 Saved Jobs\n`);

  // ============================================
  // 10. SAVED CVs
  // ============================================
  console.log('📌 Tạo Saved CVs...');

  await prisma.savedCV.createMany({
    data: [
      { userId: recruiter1.id, cvId: cv1.id, notes: 'Ứng viên Senior rất mạnh, phù hợp với dự án mới' },
      { userId: recruiter1.id, cvId: cv3.id, notes: 'Backend giỏi, có thể interview cho vị trí lead' },
      { userId: recruiter2.id, cvId: cv2.id, notes: 'Frontend skill tốt' },
      { userId: recruiter2.id, cvId: cv7.id, notes: 'AI Engineer potential' },
      { userId: recruiter3.id, cvId: cv4.id, notes: 'Đã accept, chuẩn bị onboard' },
      { userId: recruiter4.id, cvId: cv5.id, notes: 'DevOps kinh nghiệm, đang review' },
      { userId: recruiter4.id, cvId: cv6.id, notes: 'Mobile dev tốt' },
    ],
  });

  console.log(`✅ Đã tạo 7 Saved CVs\n`);

  // ============================================
  // 11. SIMILAR JOBS
  // ============================================
  console.log('🔗 Tạo Similar Jobs...');

  await prisma.similarJob.createMany({
    data: [
      { jobId: job1.id, similarJobId: job2.id, similarity: 0.85 },
      { jobId: job1.id, similarJobId: job8.id, similarity: 0.80 },
      { jobId: job2.id, similarJobId: job1.id, similarity: 0.85 },
      { jobId: job2.id, similarJobId: job8.id, similarity: 0.75 },
      { jobId: job4.id, similarJobId: job5.id, similarity: 0.60 },
      { jobId: job5.id, similarJobId: job4.id, similarity: 0.60 },
      { jobId: job6.id, similarJobId: job2.id, similarity: 0.70 },
    ],
  });

  console.log(`✅ Đã tạo 7 Similar Jobs\n`);

  // ============================================
  // 12. RECOMMEND JOBS FOR CV
  // ============================================
  console.log('🎯 Tạo Recommend Jobs for CVs...');

  await prisma.recommendJobforCV.createMany({
    data: [
      { cvId: cv1.id, jobId: job1.id, similarity: 0.95 },
      { cvId: cv1.id, jobId: job8.id, similarity: 0.88 },
      { cvId: cv2.id, jobId: job2.id, similarity: 0.90 },
      { cvId: cv3.id, jobId: job8.id, similarity: 0.92 },
      { cvId: cv3.id, jobId: job1.id, similarity: 0.85 },
      { cvId: cv4.id, jobId: job3.id, similarity: 0.93 },
      { cvId: cv5.id, jobId: job4.id, similarity: 0.95 },
      { cvId: cv6.id, jobId: job6.id, similarity: 0.90 },
      { cvId: cv7.id, jobId: job5.id, similarity: 0.92 },
      { cvId: cv10.id, jobId: job7.id, similarity: 0.88 },
    ],
  });

  console.log(`✅ Đã tạo 10 Recommend Jobs\n`);

  // ============================================
  // 13. NOTIFICATIONS
  // ============================================
  console.log('🔔 Tạo Notifications...');

  // Welcome notifications
  for (const candidate of createdCandidates) {
    await prisma.notification.create({
      data: {
        userId: candidate.id,
        type: 'WELCOME',
        title: 'Chào mừng bạn đến với JobsConnect!',
        message: `Xin chào ${candidate.fullName}! Cảm ơn bạn đã đăng ký tài khoản JobsConnect. Hãy tạo CV và khám phá hàng ngàn cơ hội việc làm phù hợp với bạn ngay hôm nay!`,
        isRead: Math.random() > 0.5,
        readAt: Math.random() > 0.5 ? new Date() : null,
      },
    });
  }

  // Application notifications
  await prisma.notification.create({
    data: {
      userId: recruiter1.id,
      type: 'APPLICATION_RECEIVED',
      title: 'Đơn ứng tuyển mới',
      message: `${createdCandidates[0].fullName} vừa ứng tuyển vị trí "${job1.title}"`,
      isRead: false,
    },
  });

  await prisma.notification.create({
    data: {
      userId: recruiter1.id,
      type: 'APPLICATION_RECEIVED',
      title: 'Đơn ứng tuyển mới',
      message: `${createdCandidates[2].fullName} vừa ứng tuyển vị trí "${job1.title}"`,
      isRead: true,
      readAt: new Date(),
    },
  });

  await prisma.notification.create({
    data: {
      userId: createdCandidates[3].id,
      type: 'APPLICATION_STATUS_CHANGED',
      title: 'Chúc mừng! Đơn ứng tuyển được chấp nhận',
      message: `Đơn ứng tuyển của bạn cho vị trí "${job3.title}" tại Techcombank đã được CHẤP NHẬN! HR sẽ liên hệ với bạn trong thời gian sớm nhất.`,
      isRead: true,
      readAt: new Date(),
    },
  });

  await prisma.notification.create({
    data: {
      userId: createdCandidates[0].id,
      type: 'APPLICATION_STATUS_CHANGED',
      title: 'Đơn ứng tuyển đang được xem xét',
      message: `Đơn ứng tuyển của bạn cho vị trí "${job1.title}" đã chuyển sang trạng thái ĐANG XEM XÉT. Chúng tôi sẽ phản hồi sớm!`,
      isRead: false,
    },
  });

  await prisma.notification.create({
    data: {
      userId: admin1.id,
      type: 'JOB_POSTED',
      title: 'Tin tuyển dụng mới cần duyệt',
      message: `FPT Software vừa đăng tin tuyển dụng "${job7.title}" và đang chờ phê duyệt.`,
      isRead: false,
    },
  });

  console.log(`✅ Đã tạo ${createdCandidates.length + 5} Notifications\n`);

  // ============================================
  // SUMMARY
  // ============================================
  console.log('📊 Tóm tắt Seed Data:');
  console.log('═══════════════════════════════════════');
  console.log(`👑 ADMIN:          2 tài khoản`);
  console.log(`👔 RECRUITER:      5 tài khoản`);
  console.log(`👤 CANDIDATE:      ${createdCandidates.length} tài khoản`);
  console.log(`🏢 Công ty:        5 công ty`);
  console.log(`📄 CV:             10 CV đầy đủ`);
  console.log(`💼 Việc làm:       8 tin (7 active, 1 pending)`);
  console.log(`📝 Đơn ứng tuyển:  ${applications.length} đơn`);
  console.log(`💾 Saved Jobs:     7`);
  console.log(`📌 Saved CVs:      7`);
  console.log(`🔗 Similar Jobs:   7`);
  console.log(`🎯 Recommend:      10`);
  console.log(`🔔 Notifications:  ${createdCandidates.length + 5}`);
  console.log('═══════════════════════════════════════\n');

  console.log('🔑 Thông tin đăng nhập test:');
  console.log('───────────────────────────────────────');
  console.log('ADMIN:');
  console.log('  Email: admin@jobsconnect.com');
  console.log('  Password: admin123');
  console.log('');
  console.log('RECRUITER (FPT):');
  console.log('  Email: hr.manager@fpt.com.vn');
  console.log('  Password: password123');
  console.log('');
  console.log('CANDIDATE:');
  console.log('  Email: nguyenvanan@gmail.com');
  console.log('  Password: password123');
  console.log('───────────────────────────────────────\n');

  console.log('✅ Seed hoàn tất thành công!');
}

main()
  .catch((e) => {
    console.error('❌ Lỗi khi seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
