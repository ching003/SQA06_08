import type { PrismaClient } from '@prisma/client';

// Repository interfaces from modules
import type { IUserRepository } from '@modules/user/domain/repositories/IUserRepository.js';
import type { ICompanyRepository } from '@modules/company/domain/repositories/ICompanyRepository.js';
import type { ICompanyMemberRepository } from '@modules/company/domain/repositories/ICompanyMemberRepository.js';
import type { ICompanyMemberInvitationRepository } from '@modules/company/domain/repositories/ICompanyMemberInvitationRepository.js';
import type { ICVRepository } from '@modules/cv/domain/repositories/ICVRepository.js';
import type { ICVTemplateRepository } from '@modules/cv/domain/repositories/ICVTemplateRepository.js';
import type { ISavedCVRepository } from '@modules/cv/domain/repositories/ISavedCVRepository.js';
import type { IJobRepository } from '@modules/job/domain/repositories/IJobRepository.js';
import type { ISavedJobRepository } from '@modules/job/domain/repositories/ISavedJobRepository.js';
import type { IApplicationRepository } from '@modules/application/domain/repositories/IApplicationRepository.js';
import type { INotificationRepository } from '@modules/notification/domain/repositories/INotificationRepository.js';

// Service interfaces from shared
import type { IPasswordService } from '@shared/domain/services/IPasswordService.js';
import type { ITokenService } from '@shared/domain/services/ITokenService.js';
import type { IFileStorageService } from '@shared/domain/services/IFileStorageService.js';
import type { IStorageService } from '@shared/domain/services/IStorageService.js';
import type { INotificationService } from '@shared/domain/services/INotificationService.js';
import type { IPDFService } from '@shared/domain/services/IPDFService.js';

// Use Cases - User
import type { RegisterUserUseCase } from '@modules/user/application/use-cases/RegisterUserUseCase.js';
import type { LoginUserUseCase } from '@modules/user/application/use-cases/LoginUserUseCase.js';
import type { GetUserByIdUseCase } from '@modules/user/application/use-cases/GetUserByIdUseCase.js';
import type { GetAllUsersUseCase } from '@modules/user/application/use-cases/GetAllUsersUseCase.js';
import type { GetUserInfoUseCase } from '@modules/user/application/use-cases/GetUserInfoUseCase.js';
import type { GetUserAgeUseCase } from '@modules/user/application/use-cases/GetUserAgeUseCase.js';
import type { UpdateProfileUseCase } from '@modules/user/application/use-cases/UpdateProfileUseCase.js';
import type { ChangePasswordUseCase } from '@modules/user/application/use-cases/ChangePasswordUseCase.js';
import type { UploadAvatarUseCase } from '@modules/user/application/use-cases/UploadAvatarUseCase.js';
import type { UpdateUserStatusUseCase } from '@modules/user/application/use-cases/UpdateUserStatusUseCase.js';
import type { LockUserUseCase } from '@modules/user/application/use-cases/LockUserUseCase.js';
import type { UnlockUserUseCase } from '@modules/user/application/use-cases/UnlockUserUseCase.js';
import type { CreateUserUseCase } from '@modules/user/application/use-cases/CreateUserUseCase.js';
import type { UpdateUserUseCase } from '@modules/user/application/use-cases/UpdateUserUseCase.js';
import type { DeleteUserUseCase } from '@modules/user/application/use-cases/DeleteUserUseCase.js';
import type { LogoutUserUseCase } from '@modules/user/application/use-cases/LogoutUserUseCase.js';
import type { GetRecentActivitiesUseCase } from '@modules/user/application/use-cases/GetRecentActivitiesUseCase.js';

// Use Cases - Company
import type { RegisterCompanyUseCase } from '@modules/company/application/use-cases/RegisterCompanyUseCase.js';
import type { ApproveCompanyUseCase } from '@modules/company/application/use-cases/ApproveCompanyUseCase.js';
import type { RejectCompanyUseCase } from '@modules/company/application/use-cases/RejectCompanyUseCase.js';
import type { LockCompanyUseCase } from '@modules/company/application/use-cases/LockCompanyUseCase.js';
import type { UnlockCompanyUseCase } from '@modules/company/application/use-cases/UnlockCompanyUseCase.js';
import type { GetCompanyByIdUseCase } from '@modules/company/application/use-cases/GetCompanyByIdUseCase.js';
import type { GetAllCompaniesUseCase } from '@modules/company/application/use-cases/GetAllCompaniesUseCase.js';
import type { UpdateCompanyUseCase } from '@modules/company/application/use-cases/UpdateCompanyUseCase.js';
import type { DeleteCompanyUseCase } from '@modules/company/application/use-cases/DeleteCompanyUseCase.js';
import type { UploadLogoUseCase } from '@modules/company/application/use-cases/UploadLogoUseCase.js';
import type { UploadBannerUseCase } from '@modules/company/application/use-cases/UploadBannerUseCase.js';
import type { ListMembersUseCase } from '@modules/company/application/use-cases/ListMembersUseCase.js';
import type { InviteMemberUseCase } from '@modules/company/application/use-cases/InviteMemberUseCase.js';
import type { UpdateMemberRoleUseCase } from '@modules/company/application/use-cases/UpdateMemberRoleUseCase.js';
import type { DeleteMemberUseCase } from '@modules/company/application/use-cases/DeleteMemberUseCase.js';
import type { ListInvitationsUseCase } from '@modules/company/application/use-cases/ListInvitationsUseCase.js';
import type { CancelInvitationUseCase } from '@modules/company/application/use-cases/CancelInvitationUseCase.js';
import type { AcceptInvitationUseCase } from '@modules/company/application/use-cases/AcceptInvitationUseCase.js';
import type { RejectInvitationUseCase } from '@modules/company/application/use-cases/RejectInvitationUseCase.js';

// Use Cases - CV
import type { CreateCVUseCase } from '@modules/cv/application/use-cases/CreateCVUseCase.js';
import type { GetCVByIdUseCase } from '@modules/cv/application/use-cases/GetCVByIdUseCase.js';
import type { GetAllCVsUseCase } from '@modules/cv/application/use-cases/GetAllCVsUseCase.js';
import type { GetCVsByUserUseCase } from '@modules/cv/application/use-cases/GetCVsByUserUseCase.js';
import type { UpdateCVUseCase } from '@modules/cv/application/use-cases/UpdateCVUseCase.js';
import type { DeleteCVUseCase } from '@modules/cv/application/use-cases/DeleteCVUseCase.js';
import type { SetMainCVUseCase } from '@modules/cv/application/use-cases/SetMainCVUseCase.js';
import type { SearchCVsUseCase } from '@modules/cv/application/use-cases/SearchCVsUseCase.js';
import type { SaveCVUseCase } from '@modules/cv/application/use-cases/SaveCVUseCase.js';
import type { UnsaveCVUseCase } from '@modules/cv/application/use-cases/UnsaveCVUseCase.js';
import type { GetSavedCVsUseCase } from '@modules/cv/application/use-cases/GetSavedCVsUseCase.js';
import type { UpdateSavedCVNotesUseCase } from '@modules/cv/application/use-cases/UpdateSavedCVNotesUseCase.js';
import type { CheckCVSavedUseCase } from '@modules/cv/application/use-cases/CheckCVSavedUseCase.js';
import type { ExportCVUseCase } from '@modules/cv/application/use-cases/ExportCVUseCase.js';
import type { GetRecommendedCVsForJobUseCase } from '@modules/cv/application/use-cases/GetRecommendedCVsForJobUseCase.js';
import type { GetRecommendedJobsForCVUseCase } from '@modules/cv/application/use-cases/GetRecommendedJobsForCVUseCase.js';
import type { DuplicateCVUseCase } from '@modules/cv/application/use-cases/DuplicateCVUseCase.js';

// Use Cases - CV Template
import type { GetAllTemplatesUseCase } from '@modules/cv/application/use-cases/GetAllTemplatesUseCase.js';
import type { GetActiveTemplatesUseCase } from '@modules/cv/application/use-cases/GetActiveTemplatesUseCase.js';
import type { GetTemplateByIdUseCase } from '@modules/cv/application/use-cases/GetTemplateByIdUseCase.js';
import type { CreateTemplateUseCase } from '@modules/cv/application/use-cases/CreateTemplateUseCase.js';
import type { UpdateTemplateUseCase } from '@modules/cv/application/use-cases/UpdateTemplateUseCase.js';
import type { DeleteTemplateUseCase } from '@modules/cv/application/use-cases/DeleteTemplateUseCase.js';
import type { ActivateTemplateUseCase } from '@modules/cv/application/use-cases/ActivateTemplateUseCase.js';
import type { DeactivateTemplateUseCase } from '@modules/cv/application/use-cases/DeactivateTemplateUseCase.js';

// Use Cases - Job
import type { GetAllJobsUseCase } from '@modules/job/application/use-cases/GetAllJobsUseCase.js';
import type { GetJobByIdUseCase } from '@modules/job/application/use-cases/GetJobByIdUseCase.js';
import type { GetJobsByCompanyUseCase } from '@modules/job/application/use-cases/GetJobsByCompanyUseCase.js';
import type { SearchJobsUseCase } from '@modules/job/application/use-cases/SearchJobsUseCase.js';
import type { GetSimilarJobsUseCase } from '@modules/job/application/use-cases/GetSimilarJobsUseCase.js';
import type { CreateJobUseCase } from '@modules/job/application/use-cases/CreateJobUseCase.js';
import type { UpdateJobUseCase } from '@modules/job/application/use-cases/UpdateJobUseCase.js';
import type { DeleteJobUseCase } from '@modules/job/application/use-cases/DeleteJobUseCase.js';
import type { CloseJobUseCase } from '@modules/job/application/use-cases/CloseJobUseCase.js';
import type { RepostJobUseCase } from '@modules/job/application/use-cases/RepostJobUseCase.js';
import type { ApproveJobUseCase } from '@modules/job/application/use-cases/ApproveJobUseCase.js';
import type { RejectJobUseCase } from '@modules/job/application/use-cases/RejectJobUseCase.js';
import type { LockJobUseCase } from '@modules/job/application/use-cases/LockJobUseCase.js';
import type { UnlockJobUseCase } from '@modules/job/application/use-cases/UnlockJobUseCase.js';
import type { SaveJobUseCase } from '@modules/job/application/use-cases/SaveJobUseCase.js';
import type { UnsaveJobUseCase } from '@modules/job/application/use-cases/UnsaveJobUseCase.js';
import type { GetSavedJobsUseCase } from '@modules/job/application/use-cases/GetSavedJobsUseCase.js';
import type { CheckJobSavedUseCase } from '@modules/job/application/use-cases/CheckJobSavedUseCase.js';
import type { GetRecommendedJobsUseCase } from '@modules/job/application/use-cases/GetRecommendedJobsUseCase.js';

// Use Cases - Application
import type { ApplyJobUseCase } from '@modules/application/application/use-cases/ApplyJobUseCase.js';
import type { GetMyApplicationsUseCase } from '@modules/application/application/use-cases/GetMyApplicationsUseCase.js';
import type { GetApplicationByIdUseCase } from '@modules/application/application/use-cases/GetApplicationByIdUseCase.js';
import type { GetApplicationsByJobUseCase } from '@modules/application/application/use-cases/GetApplicationsByJobUseCase.js';
import type { UpdateApplicationStatusUseCase } from '@modules/application/application/use-cases/UpdateApplicationStatusUseCase.js';
import type { WithdrawApplicationUseCase } from '@modules/application/application/use-cases/WithdrawApplicationUseCase.js';

// Use Cases - Notification
import type { GetMyNotificationsUseCase } from '@modules/notification/application/use-cases/GetMyNotificationsUseCase.js';
import type { GetNotificationByIdUseCase } from '@modules/notification/application/use-cases/GetNotificationByIdUseCase.js';
import type { GetUnreadCountUseCase } from '@modules/notification/application/use-cases/GetUnreadCountUseCase.js';
import type { MarkAsReadUseCase } from '@modules/notification/application/use-cases/MarkAsReadUseCase.js';
import type { MarkAllAsReadUseCase } from '@modules/notification/application/use-cases/MarkAllAsReadUseCase.js';
import type { DeleteNotificationUseCase } from '@modules/notification/application/use-cases/DeleteNotificationUseCase.js';
import type { DeleteAllReadNotificationsUseCase } from '@modules/notification/application/use-cases/DeleteAllReadNotificationsUseCase.js';

// Controllers from modules
import type { UserController } from '@modules/user/interfaces/controllers/UserController.js';
import type { CompanyController } from '@modules/company/interfaces/controllers/CompanyController.js';
import type { CVController } from '@modules/cv/interfaces/controllers/CVController.js';
import type { CVTemplateController } from '@modules/cv/interfaces/controllers/CVTemplateController.js';
import type { JobController } from '@modules/job/interfaces/controllers/JobController.js';
import type { ApplicationController } from '@modules/application/interfaces/controllers/ApplicationController.js';
import type { NotificationController } from '@modules/notification/interfaces/controllers/NotificationController.js';

// Middleware
import type { AuthMiddleware } from '@core/middleware/authMiddleware.js';

export interface Cradle {
  // Prisma
  prisma: PrismaClient;

  // Repositories
  userRepository: IUserRepository;
  companyRepository: ICompanyRepository;
  companyMemberRepository: ICompanyMemberRepository;
  companyMemberInvitationRepository: ICompanyMemberInvitationRepository;
  cvRepository: ICVRepository;
  cvTemplateRepository: ICVTemplateRepository;
  savedCVRepository: ISavedCVRepository;
  jobRepository: IJobRepository;
  savedJobRepository: ISavedJobRepository;
  applicationRepository: IApplicationRepository;
  notificationRepository: INotificationRepository;

  // Services
  passwordService: IPasswordService;
  tokenService: ITokenService;
  fileStorageService: IFileStorageService;
  storageService: IStorageService;
  notificationService: INotificationService;
  pdfService: IPDFService;

  // Use Cases - User
  registerUserUseCase: RegisterUserUseCase;
  loginUserUseCase: LoginUserUseCase;
  getUserByIdUseCase: GetUserByIdUseCase;
  getAllUsersUseCase: GetAllUsersUseCase;
  getUserInfoUseCase: GetUserInfoUseCase;
  getUserAgeUseCase: GetUserAgeUseCase;
  updateProfileUseCase: UpdateProfileUseCase;
  changePasswordUseCase: ChangePasswordUseCase;
  uploadAvatarUseCase: UploadAvatarUseCase;
  updateUserStatusUseCase: UpdateUserStatusUseCase;
  lockUserUseCase: LockUserUseCase;
  unlockUserUseCase: UnlockUserUseCase;
  createUserUseCase: CreateUserUseCase;
  updateUserUseCase: UpdateUserUseCase;
  deleteUserUseCase: DeleteUserUseCase;
  logoutUserUseCase: LogoutUserUseCase;
  getRecentActivitiesUseCase: GetRecentActivitiesUseCase;

  // Use Cases - Company
  registerCompanyUseCase: RegisterCompanyUseCase;
  approveCompanyUseCase: ApproveCompanyUseCase;
  rejectCompanyUseCase: RejectCompanyUseCase;
  lockCompanyUseCase: LockCompanyUseCase;
  unlockCompanyUseCase: UnlockCompanyUseCase;
  getCompanyByIdUseCase: GetCompanyByIdUseCase;
  getAllCompaniesUseCase: GetAllCompaniesUseCase;
  updateCompanyUseCase: UpdateCompanyUseCase;
  deleteCompanyUseCase: DeleteCompanyUseCase;
  uploadLogoUseCase: UploadLogoUseCase;
  uploadBannerUseCase: UploadBannerUseCase;
  listMembersUseCase: ListMembersUseCase;
  inviteMemberUseCase: InviteMemberUseCase;
  updateMemberRoleUseCase: UpdateMemberRoleUseCase;
  deleteMemberUseCase: DeleteMemberUseCase;
  listInvitationsUseCase: ListInvitationsUseCase;
  cancelInvitationUseCase: CancelInvitationUseCase;
  acceptInvitationUseCase: AcceptInvitationUseCase;
  rejectInvitationUseCase: RejectInvitationUseCase;

  // Use Cases - CV
  createCVUseCase: CreateCVUseCase;
  getCVByIdUseCase: GetCVByIdUseCase;
  getAllCVsUseCase: GetAllCVsUseCase;
  getCVsByUserUseCase: GetCVsByUserUseCase;
  updateCVUseCase: UpdateCVUseCase;
  deleteCVUseCase: DeleteCVUseCase;
  setMainCVUseCase: SetMainCVUseCase;
  searchCVsUseCase: SearchCVsUseCase;
  saveCVUseCase: SaveCVUseCase;
  unsaveCVUseCase: UnsaveCVUseCase;
  getSavedCVsUseCase: GetSavedCVsUseCase;
  updateSavedCVNotesUseCase: UpdateSavedCVNotesUseCase;
  checkCVSavedUseCase: CheckCVSavedUseCase;
  exportCVUseCase: ExportCVUseCase;
  getRecommendedCVsForJobUseCase: GetRecommendedCVsForJobUseCase;
  getRecommendedJobsForCVUseCase: GetRecommendedJobsForCVUseCase;
  duplicateCVUseCase: DuplicateCVUseCase;

  // Use Cases - CV Template
  getAllTemplatesUseCase: GetAllTemplatesUseCase;
  getActiveTemplatesUseCase: GetActiveTemplatesUseCase;
  getTemplateByIdUseCase: GetTemplateByIdUseCase;
  createTemplateUseCase: CreateTemplateUseCase;
  updateTemplateUseCase: UpdateTemplateUseCase;
  deleteTemplateUseCase: DeleteTemplateUseCase;
  activateTemplateUseCase: ActivateTemplateUseCase;
  deactivateTemplateUseCase: DeactivateTemplateUseCase;

  // Use Cases - Job
  getAllJobsUseCase: GetAllJobsUseCase;
  getJobByIdUseCase: GetJobByIdUseCase;
  getJobsByCompanyUseCase: GetJobsByCompanyUseCase;
  searchJobsUseCase: SearchJobsUseCase;
  getSimilarJobsUseCase: GetSimilarJobsUseCase;
  createJobUseCase: CreateJobUseCase;
  updateJobUseCase: UpdateJobUseCase;
  deleteJobUseCase: DeleteJobUseCase;
  closeJobUseCase: CloseJobUseCase;
  repostJobUseCase: RepostJobUseCase;
  approveJobUseCase: ApproveJobUseCase;
  rejectJobUseCase: RejectJobUseCase;
  lockJobUseCase: LockJobUseCase;
  unlockJobUseCase: UnlockJobUseCase;
  saveJobUseCase: SaveJobUseCase;
  unsaveJobUseCase: UnsaveJobUseCase;
  getSavedJobsUseCase: GetSavedJobsUseCase;
  checkJobSavedUseCase: CheckJobSavedUseCase;
  getRecommendedJobsUseCase: GetRecommendedJobsUseCase;

  // Use Cases - Application
  applyJobUseCase: ApplyJobUseCase;
  getMyApplicationsUseCase: GetMyApplicationsUseCase;
  getApplicationByIdUseCase: GetApplicationByIdUseCase;
  getApplicationsByJobUseCase: GetApplicationsByJobUseCase;
  updateApplicationStatusUseCase: UpdateApplicationStatusUseCase;
  withdrawApplicationUseCase: WithdrawApplicationUseCase;

  // Use Cases - Notification
  getMyNotificationsUseCase: GetMyNotificationsUseCase;
  getNotificationByIdUseCase: GetNotificationByIdUseCase;
  getUnreadCountUseCase: GetUnreadCountUseCase;
  markAsReadUseCase: MarkAsReadUseCase;
  markAllAsReadUseCase: MarkAllAsReadUseCase;
  deleteNotificationUseCase: DeleteNotificationUseCase;
  deleteAllReadNotificationsUseCase: DeleteAllReadNotificationsUseCase;

  // Controllers
  userController: UserController;
  companyController: CompanyController;
  cvController: CVController;
  cvTemplateController: CVTemplateController;
  jobController: JobController;
  applicationController: ApplicationController;
  notificationController: NotificationController;

  // Middleware
  authMiddleware: AuthMiddleware;
}
