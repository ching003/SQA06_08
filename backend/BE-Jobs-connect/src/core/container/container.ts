import { createContainer, InjectionMode, asValue, asClass } from 'awilix';
import { scopePerRequest } from 'awilix-express';
import type { Cradle } from './types.js';
import { prisma } from '@shared/infrastructure/database/client.js';

// Repositories from modules
import { PrismaUserRepository } from '@modules/user/infrastructure/repositories/PrismaUserRepository.js';
import { PrismaCompanyRepository } from '@modules/company/infrastructure/repositories/PrismaCompanyRepository.js';
import { PrismaCompanyMemberRepository } from '@modules/company/infrastructure/repositories/PrismaCompanyMemberRepository.js';
import { PrismaCompanyMemberInvitationRepository } from '@modules/company/infrastructure/repositories/PrismaCompanyMemberInvitationRepository.js';
import { PrismaCVRepository } from '@modules/cv/infrastructure/repositories/PrismaCVRepository.js';
import { PrismaCVTemplateRepository } from '@modules/cv/infrastructure/repositories/PrismaCVTemplateRepository.js';
import { PrismaSavedCVRepository } from '@modules/cv/infrastructure/repositories/PrismaSavedCVRepository.js';
import { PrismaJobRepository } from '@modules/job/infrastructure/repositories/PrismaJobRepository.js';
import { PrismaSavedJobRepository } from '@modules/job/infrastructure/repositories/PrismaSavedJobRepository.js';
import { PrismaApplicationRepository } from '@modules/application/infrastructure/repositories/PrismaApplicationRepository.js';
import { PrismaNotificationRepository } from '@modules/notification/infrastructure/repositories/PrismaNotificationRepository.js';

// Services from shared
import { BcryptPasswordService } from '@shared/infrastructure/services/BcryptPasswordService.js';
import { JwtTokenService } from '@shared/infrastructure/services/JwtTokenService.js';
import { FirebaseStorageService } from '@shared/infrastructure/services/FirebaseStorageService.js';
import { StorageService } from '@shared/infrastructure/services/StorageService.js';
import { NotificationService } from '@shared/infrastructure/services/NotificationService.js';
import { PDFService } from '@shared/infrastructure/services/PDFService.js';

// Use Cases - User
import { RegisterUserUseCase } from '@modules/user/application/use-cases/RegisterUserUseCase.js';
import { LoginUserUseCase } from '@modules/user/application/use-cases/LoginUserUseCase.js';
import { GetUserByIdUseCase } from '@modules/user/application/use-cases/GetUserByIdUseCase.js';
import { GetAllUsersUseCase } from '@modules/user/application/use-cases/GetAllUsersUseCase.js';
import { GetUserInfoUseCase } from '@modules/user/application/use-cases/GetUserInfoUseCase.js';
import { GetUserAgeUseCase } from '@modules/user/application/use-cases/GetUserAgeUseCase.js';
import { UpdateProfileUseCase } from '@modules/user/application/use-cases/UpdateProfileUseCase.js';
import { ChangePasswordUseCase } from '@modules/user/application/use-cases/ChangePasswordUseCase.js';
import { UploadAvatarUseCase } from '@modules/user/application/use-cases/UploadAvatarUseCase.js';
import { UpdateUserStatusUseCase } from '@modules/user/application/use-cases/UpdateUserStatusUseCase.js';
import { LockUserUseCase } from '@modules/user/application/use-cases/LockUserUseCase.js';
import { UnlockUserUseCase } from '@modules/user/application/use-cases/UnlockUserUseCase.js';
import { CreateUserUseCase } from '@modules/user/application/use-cases/CreateUserUseCase.js';
import { UpdateUserUseCase } from '@modules/user/application/use-cases/UpdateUserUseCase.js';
import { DeleteUserUseCase } from '@modules/user/application/use-cases/DeleteUserUseCase.js';
import { LogoutUserUseCase } from '@modules/user/application/use-cases/LogoutUserUseCase.js';
import { GetRecentActivitiesUseCase } from '@modules/user/application/use-cases/GetRecentActivitiesUseCase.js';

// Use Cases - Company
import { RegisterCompanyUseCase } from '@modules/company/application/use-cases/RegisterCompanyUseCase.js';
import { ApproveCompanyUseCase } from '@modules/company/application/use-cases/ApproveCompanyUseCase.js';
import { RejectCompanyUseCase } from '@modules/company/application/use-cases/RejectCompanyUseCase.js';
import { LockCompanyUseCase } from '@modules/company/application/use-cases/LockCompanyUseCase.js';
import { UnlockCompanyUseCase } from '@modules/company/application/use-cases/UnlockCompanyUseCase.js';
import { GetCompanyByIdUseCase } from '@modules/company/application/use-cases/GetCompanyByIdUseCase.js';
import { GetAllCompaniesUseCase } from '@modules/company/application/use-cases/GetAllCompaniesUseCase.js';
import { UpdateCompanyUseCase } from '@modules/company/application/use-cases/UpdateCompanyUseCase.js';
import { DeleteCompanyUseCase } from '@modules/company/application/use-cases/DeleteCompanyUseCase.js';
import { UploadLogoUseCase } from '@modules/company/application/use-cases/UploadLogoUseCase.js';
import { UploadBannerUseCase } from '@modules/company/application/use-cases/UploadBannerUseCase.js';
import { ListMembersUseCase } from '@modules/company/application/use-cases/ListMembersUseCase.js';
import { InviteMemberUseCase } from '@modules/company/application/use-cases/InviteMemberUseCase.js';
import { UpdateMemberRoleUseCase } from '@modules/company/application/use-cases/UpdateMemberRoleUseCase.js';
import { DeleteMemberUseCase } from '@modules/company/application/use-cases/DeleteMemberUseCase.js';
import { ListInvitationsUseCase } from '@modules/company/application/use-cases/ListInvitationsUseCase.js';
import { CancelInvitationUseCase } from '@modules/company/application/use-cases/CancelInvitationUseCase.js';
import { AcceptInvitationUseCase } from '@modules/company/application/use-cases/AcceptInvitationUseCase.js';
import { RejectInvitationUseCase } from '@modules/company/application/use-cases/RejectInvitationUseCase.js';

// Use Cases - CV
import { CreateCVUseCase } from '@modules/cv/application/use-cases/CreateCVUseCase.js';
import { GetCVByIdUseCase } from '@modules/cv/application/use-cases/GetCVByIdUseCase.js';
import { GetAllCVsUseCase } from '@modules/cv/application/use-cases/GetAllCVsUseCase.js';
import { GetCVsByUserUseCase } from '@modules/cv/application/use-cases/GetCVsByUserUseCase.js';
import { UpdateCVUseCase } from '@modules/cv/application/use-cases/UpdateCVUseCase.js';
import { DeleteCVUseCase } from '@modules/cv/application/use-cases/DeleteCVUseCase.js';
import { DuplicateCVUseCase } from '@modules/cv/application/use-cases/DuplicateCVUseCase.js';
import { SetMainCVUseCase } from '@modules/cv/application/use-cases/SetMainCVUseCase.js';
import { SearchCVsUseCase } from '@modules/cv/application/use-cases/SearchCVsUseCase.js';
import { SaveCVUseCase } from '@modules/cv/application/use-cases/SaveCVUseCase.js';
import { UnsaveCVUseCase } from '@modules/cv/application/use-cases/UnsaveCVUseCase.js';
import { GetSavedCVsUseCase } from '@modules/cv/application/use-cases/GetSavedCVsUseCase.js';
import { UpdateSavedCVNotesUseCase } from '@modules/cv/application/use-cases/UpdateSavedCVNotesUseCase.js';
import { CheckCVSavedUseCase } from '@modules/cv/application/use-cases/CheckCVSavedUseCase.js';
import { ExportCVUseCase } from '@modules/cv/application/use-cases/ExportCVUseCase.js';
import { GetRecommendedCVsForJobUseCase } from '@modules/cv/application/use-cases/GetRecommendedCVsForJobUseCase.js';
import { GetRecommendedJobsForCVUseCase } from '@modules/cv/application/use-cases/GetRecommendedJobsForCVUseCase.js';

// Use Cases - CV Template
import { GetAllTemplatesUseCase } from '@modules/cv/application/use-cases/GetAllTemplatesUseCase.js';
import { GetActiveTemplatesUseCase } from '@modules/cv/application/use-cases/GetActiveTemplatesUseCase.js';
import { GetTemplateByIdUseCase } from '@modules/cv/application/use-cases/GetTemplateByIdUseCase.js';
import { CreateTemplateUseCase } from '@modules/cv/application/use-cases/CreateTemplateUseCase.js';
import { UpdateTemplateUseCase } from '@modules/cv/application/use-cases/UpdateTemplateUseCase.js';
import { DeleteTemplateUseCase } from '@modules/cv/application/use-cases/DeleteTemplateUseCase.js';
import { ActivateTemplateUseCase } from '@modules/cv/application/use-cases/ActivateTemplateUseCase.js';
import { DeactivateTemplateUseCase } from '@modules/cv/application/use-cases/DeactivateTemplateUseCase.js';

// Use Cases - Job
import { GetAllJobsUseCase } from '@modules/job/application/use-cases/GetAllJobsUseCase.js';
import { GetJobByIdUseCase } from '@modules/job/application/use-cases/GetJobByIdUseCase.js';
import { GetJobsByCompanyUseCase } from '@modules/job/application/use-cases/GetJobsByCompanyUseCase.js';
import { SearchJobsUseCase } from '@modules/job/application/use-cases/SearchJobsUseCase.js';
import { GetSimilarJobsUseCase } from '@modules/job/application/use-cases/GetSimilarJobsUseCase.js';
import { CreateJobUseCase } from '@modules/job/application/use-cases/CreateJobUseCase.js';
import { UpdateJobUseCase } from '@modules/job/application/use-cases/UpdateJobUseCase.js';
import { DeleteJobUseCase } from '@modules/job/application/use-cases/DeleteJobUseCase.js';
import { CloseJobUseCase } from '@modules/job/application/use-cases/CloseJobUseCase.js';
import { RepostJobUseCase } from '@modules/job/application/use-cases/RepostJobUseCase.js';
import { ApproveJobUseCase } from '@modules/job/application/use-cases/ApproveJobUseCase.js';
import { RejectJobUseCase } from '@modules/job/application/use-cases/RejectJobUseCase.js';
import { LockJobUseCase } from '@modules/job/application/use-cases/LockJobUseCase.js';
import { UnlockJobUseCase } from '@modules/job/application/use-cases/UnlockJobUseCase.js';
import { SaveJobUseCase } from '@modules/job/application/use-cases/SaveJobUseCase.js';
import { UnsaveJobUseCase } from '@modules/job/application/use-cases/UnsaveJobUseCase.js';
import { GetSavedJobsUseCase } from '@modules/job/application/use-cases/GetSavedJobsUseCase.js';
import { CheckJobSavedUseCase } from '@modules/job/application/use-cases/CheckJobSavedUseCase.js';
import { GetRecommendedJobsUseCase } from '@modules/job/application/use-cases/GetRecommendedJobsUseCase.js';

// Use Cases - Application
import { ApplyJobUseCase } from '@modules/application/application/use-cases/ApplyJobUseCase.js';
import { GetMyApplicationsUseCase } from '@modules/application/application/use-cases/GetMyApplicationsUseCase.js';
import { GetApplicationByIdUseCase } from '@modules/application/application/use-cases/GetApplicationByIdUseCase.js';
import { GetApplicationsByJobUseCase } from '@modules/application/application/use-cases/GetApplicationsByJobUseCase.js';
import { UpdateApplicationStatusUseCase } from '@modules/application/application/use-cases/UpdateApplicationStatusUseCase.js';
import { WithdrawApplicationUseCase } from '@modules/application/application/use-cases/WithdrawApplicationUseCase.js';

// Use Cases - Notification
import { GetMyNotificationsUseCase } from '@modules/notification/application/use-cases/GetMyNotificationsUseCase.js';
import { GetNotificationByIdUseCase } from '@modules/notification/application/use-cases/GetNotificationByIdUseCase.js';
import { GetUnreadCountUseCase } from '@modules/notification/application/use-cases/GetUnreadCountUseCase.js';
import { MarkAsReadUseCase } from '@modules/notification/application/use-cases/MarkAsReadUseCase.js';
import { MarkAllAsReadUseCase } from '@modules/notification/application/use-cases/MarkAllAsReadUseCase.js';
import { DeleteNotificationUseCase } from '@modules/notification/application/use-cases/DeleteNotificationUseCase.js';
import { DeleteAllReadNotificationsUseCase } from '@modules/notification/application/use-cases/DeleteAllReadNotificationsUseCase.js';

// Controllers from modules
import { UserController } from '@modules/user/interfaces/controllers/UserController.js';
import { CompanyController } from '@modules/company/interfaces/controllers/CompanyController.js';
import { CVController } from '@modules/cv/interfaces/controllers/CVController.js';
import { CVTemplateController } from '@modules/cv/interfaces/controllers/CVTemplateController.js';
import { JobController } from '@modules/job/interfaces/controllers/JobController.js';
import { ApplicationController } from '@modules/application/interfaces/controllers/ApplicationController.js';
import { NotificationController } from '@modules/notification/interfaces/controllers/NotificationController.js';

// Middleware
import { AuthMiddleware } from '@core/middleware/authMiddleware.js';

const container = createContainer<Cradle>({
  injectionMode: InjectionMode.PROXY,
  strict: true,
});

// Register Prisma client
container.register({
  prisma: asValue(prisma),
});

// Register Repositories
container.register({
  userRepository: asClass(PrismaUserRepository).singleton(),
  companyRepository: asClass(PrismaCompanyRepository).singleton(),
  companyMemberRepository: asClass(PrismaCompanyMemberRepository).singleton(),
  companyMemberInvitationRepository: asClass(PrismaCompanyMemberInvitationRepository).singleton(),
  cvRepository: asClass(PrismaCVRepository).singleton(),
  cvTemplateRepository: asClass(PrismaCVTemplateRepository).singleton(),
  savedCVRepository: asClass(PrismaSavedCVRepository).singleton(),
  jobRepository: asClass(PrismaJobRepository).singleton(),
  savedJobRepository: asClass(PrismaSavedJobRepository).singleton(),
  applicationRepository: asClass(PrismaApplicationRepository).singleton(),
  notificationRepository: asClass(PrismaNotificationRepository).singleton(),
});

// Register Services
container.register({
  passwordService: asClass(BcryptPasswordService).singleton(),
  tokenService: asClass(JwtTokenService).singleton(),
  fileStorageService: asClass(FirebaseStorageService).singleton(),
  storageService: asClass(StorageService).singleton(),
  notificationService: asClass(NotificationService).singleton(),
  pdfService: asClass(PDFService).singleton(),
});

// Register Use Cases - User
container.register({
  registerUserUseCase: asClass(RegisterUserUseCase).scoped(),
  loginUserUseCase: asClass(LoginUserUseCase).scoped(),
  getUserByIdUseCase: asClass(GetUserByIdUseCase).scoped(),
  getAllUsersUseCase: asClass(GetAllUsersUseCase).scoped(),
  getUserInfoUseCase: asClass(GetUserInfoUseCase).scoped(),
  getUserAgeUseCase: asClass(GetUserAgeUseCase).scoped(),
  updateProfileUseCase: asClass(UpdateProfileUseCase).scoped(),
  changePasswordUseCase: asClass(ChangePasswordUseCase).scoped(),
  uploadAvatarUseCase: asClass(UploadAvatarUseCase).scoped(),
  updateUserStatusUseCase: asClass(UpdateUserStatusUseCase).scoped(),
  lockUserUseCase: asClass(LockUserUseCase).scoped(),
  unlockUserUseCase: asClass(UnlockUserUseCase).scoped(),
  createUserUseCase: asClass(CreateUserUseCase).scoped(),
  updateUserUseCase: asClass(UpdateUserUseCase).scoped(),
  deleteUserUseCase: asClass(DeleteUserUseCase).scoped(),
  logoutUserUseCase: asClass(LogoutUserUseCase).scoped(),
  getRecentActivitiesUseCase: asClass(GetRecentActivitiesUseCase).scoped(),
});

// Register Use Cases - Company
container.register({
  registerCompanyUseCase: asClass(RegisterCompanyUseCase).scoped(),
  approveCompanyUseCase: asClass(ApproveCompanyUseCase).scoped(),
  rejectCompanyUseCase: asClass(RejectCompanyUseCase).scoped(),
  lockCompanyUseCase: asClass(LockCompanyUseCase).scoped(),
  unlockCompanyUseCase: asClass(UnlockCompanyUseCase).scoped(),
  getCompanyByIdUseCase: asClass(GetCompanyByIdUseCase).scoped(),
  getAllCompaniesUseCase: asClass(GetAllCompaniesUseCase).scoped(),
  updateCompanyUseCase: asClass(UpdateCompanyUseCase).scoped(),
  deleteCompanyUseCase: asClass(DeleteCompanyUseCase).scoped(),
  uploadLogoUseCase: asClass(UploadLogoUseCase).scoped(),
  uploadBannerUseCase: asClass(UploadBannerUseCase).scoped(),
  listMembersUseCase: asClass(ListMembersUseCase).scoped(),
  inviteMemberUseCase: asClass(InviteMemberUseCase).scoped(),
  updateMemberRoleUseCase: asClass(UpdateMemberRoleUseCase).scoped(),
  deleteMemberUseCase: asClass(DeleteMemberUseCase).scoped(),
  listInvitationsUseCase: asClass(ListInvitationsUseCase).scoped(),
  cancelInvitationUseCase: asClass(CancelInvitationUseCase).scoped(),
  acceptInvitationUseCase: asClass(AcceptInvitationUseCase).scoped(),
  rejectInvitationUseCase: asClass(RejectInvitationUseCase).scoped(),
});

// Register Use Cases - CV
container.register({
  createCVUseCase: asClass(CreateCVUseCase).scoped(),
  getCVByIdUseCase: asClass(GetCVByIdUseCase).scoped(),
  getAllCVsUseCase: asClass(GetAllCVsUseCase).scoped(),
  getCVsByUserUseCase: asClass(GetCVsByUserUseCase).scoped(),
  updateCVUseCase: asClass(UpdateCVUseCase).scoped(),
  deleteCVUseCase: asClass(DeleteCVUseCase).scoped(),
  duplicateCVUseCase: asClass(DuplicateCVUseCase).scoped(),
  setMainCVUseCase: asClass(SetMainCVUseCase).scoped(),
  searchCVsUseCase: asClass(SearchCVsUseCase).scoped(),
  saveCVUseCase: asClass(SaveCVUseCase).scoped(),
  unsaveCVUseCase: asClass(UnsaveCVUseCase).scoped(),
  getSavedCVsUseCase: asClass(GetSavedCVsUseCase).scoped(),
  updateSavedCVNotesUseCase: asClass(UpdateSavedCVNotesUseCase).scoped(),
  checkCVSavedUseCase: asClass(CheckCVSavedUseCase).scoped(),
  exportCVUseCase: asClass(ExportCVUseCase).scoped(),
  getRecommendedCVsForJobUseCase: asClass(GetRecommendedCVsForJobUseCase).scoped(),
  getRecommendedJobsForCVUseCase: asClass(GetRecommendedJobsForCVUseCase).scoped(),
});

// Register Use Cases - CV Template
container.register({
  getAllTemplatesUseCase: asClass(GetAllTemplatesUseCase).scoped(),
  getActiveTemplatesUseCase: asClass(GetActiveTemplatesUseCase).scoped(),
  getTemplateByIdUseCase: asClass(GetTemplateByIdUseCase).scoped(),
  createTemplateUseCase: asClass(CreateTemplateUseCase).scoped(),
  updateTemplateUseCase: asClass(UpdateTemplateUseCase).scoped(),
  deleteTemplateUseCase: asClass(DeleteTemplateUseCase).scoped(),
  activateTemplateUseCase: asClass(ActivateTemplateUseCase).scoped(),
  deactivateTemplateUseCase: asClass(DeactivateTemplateUseCase).scoped(),
});

// Register Use Cases - Job
container.register({
  getAllJobsUseCase: asClass(GetAllJobsUseCase).scoped(),
  getJobByIdUseCase: asClass(GetJobByIdUseCase).scoped(),
  getJobsByCompanyUseCase: asClass(GetJobsByCompanyUseCase).scoped(),
  searchJobsUseCase: asClass(SearchJobsUseCase).scoped(),
  getSimilarJobsUseCase: asClass(GetSimilarJobsUseCase).scoped(),
  createJobUseCase: asClass(CreateJobUseCase).scoped(),
  updateJobUseCase: asClass(UpdateJobUseCase).scoped(),
  deleteJobUseCase: asClass(DeleteJobUseCase).scoped(),
  closeJobUseCase: asClass(CloseJobUseCase).scoped(),
  repostJobUseCase: asClass(RepostJobUseCase).scoped(),
  approveJobUseCase: asClass(ApproveJobUseCase).scoped(),
  rejectJobUseCase: asClass(RejectJobUseCase).scoped(),
  lockJobUseCase: asClass(LockJobUseCase).scoped(),
  unlockJobUseCase: asClass(UnlockJobUseCase).scoped(),
  saveJobUseCase: asClass(SaveJobUseCase).scoped(),
  unsaveJobUseCase: asClass(UnsaveJobUseCase).scoped(),
  getSavedJobsUseCase: asClass(GetSavedJobsUseCase).scoped(),
  checkJobSavedUseCase: asClass(CheckJobSavedUseCase).scoped(),
  getRecommendedJobsUseCase: asClass(GetRecommendedJobsUseCase).scoped(),
});

// Register Use Cases - Application
container.register({
  applyJobUseCase: asClass(ApplyJobUseCase).scoped(),
  getMyApplicationsUseCase: asClass(GetMyApplicationsUseCase).scoped(),
  getApplicationByIdUseCase: asClass(GetApplicationByIdUseCase).scoped(),
  getApplicationsByJobUseCase: asClass(GetApplicationsByJobUseCase).scoped(),
  updateApplicationStatusUseCase: asClass(UpdateApplicationStatusUseCase).scoped(),
  withdrawApplicationUseCase: asClass(WithdrawApplicationUseCase).scoped(),
});

// Register Use Cases - Notification
container.register({
  getMyNotificationsUseCase: asClass(GetMyNotificationsUseCase).scoped(),
  getNotificationByIdUseCase: asClass(GetNotificationByIdUseCase).scoped(),
  getUnreadCountUseCase: asClass(GetUnreadCountUseCase).scoped(),
  markAsReadUseCase: asClass(MarkAsReadUseCase).scoped(),
  markAllAsReadUseCase: asClass(MarkAllAsReadUseCase).scoped(),
  deleteNotificationUseCase: asClass(DeleteNotificationUseCase).scoped(),
  deleteAllReadNotificationsUseCase: asClass(DeleteAllReadNotificationsUseCase).scoped(),
});

// Register Controllers
container.register({
  userController: asClass(UserController).scoped(),
  companyController: asClass(CompanyController).scoped(),
  cvController: asClass(CVController).scoped(),
  cvTemplateController: asClass(CVTemplateController).scoped(),
  jobController: asClass(JobController).scoped(),
  applicationController: asClass(ApplicationController).scoped(),
  notificationController: asClass(NotificationController).scoped(),
});

// Register Middleware
container.register({
  authMiddleware: asClass(AuthMiddleware).singleton(),
});

export { container, scopePerRequest };
