import { createBrowserRouter } from 'react-router';
import { RootLayout } from '../pages/RootLayout';
import { LandingPage } from '../pages/LandingPage';
import { LoginPage } from '../pages/LoginPage';
import { RegisterPage } from '../pages/RegisterPage';
import { JobSearchPage } from '../pages/JobSearchPage';
import { JobDetailPage } from '../pages/JobDetailPage';
import { CompanyDetailPage } from '../pages/CompanyDetailPage';
import { CompanyListPage } from '../pages/CompanyListPage';
import { CandidateDashboard } from '../pages/CandidateDashboard';
import { CVManagementPage } from '../pages/CVManagementPage';
import { CVEditorPage } from '../pages/CVEditorPage';
import { ApplicationsPage } from '../pages/ApplicationsPage';
import { SavedJobsPage } from '../pages/SavedJobsPage';
import { RecommendedJobsPage } from '../pages/RecommendedJobsPage';
import { ProfilePage } from '../pages/ProfilePage';
import { SettingsPage } from '../pages/SettingsPage';
import { NotificationsPage } from '../pages/NotificationsPage';
import { RecruiterDashboard } from '../pages/RecruiterDashboard';
import { CompanyRegistrationPage } from '../pages/CompanyRegistrationPage';
import { CompanyManagementPage } from '../pages/recruiter/CompanyManagementPage';
import { MembersManagementPage } from '../pages/recruiter/MembersManagementPage';
import { JobsManagementPage as RecruiterJobsManagementPage } from '../pages/recruiter/JobsManagementPage';
import { JobFormPage } from '../pages/recruiter/JobFormPage';
import { JobApplicationsPage } from '../pages/recruiter/JobApplicationsPage';
import { ApplicationsListPage } from '../pages/recruiter/ApplicationsListPage';
import TeamMembersPage from '../pages/recruiter/TeamMembersPage';
import { RecruiterLayout } from '../pages/recruiter/RecruiterLayout';
import { CandidateSearchPage } from '../pages/recruiter/CandidateSearchPage';
import { CandidateDetailPage } from '../pages/recruiter/CandidateDetailPage';
import { SavedCVsPage } from '../pages/recruiter/SavedCVsPage';
import { NotificationsPage as RecruiterNotificationsPage } from '../pages/recruiter/NotificationsPage';
import { AdminLayout } from '../pages/admin/AdminLayout';
import { AdminDashboard } from '../pages/admin/AdminDashboard';
import { CompaniesManagementPage } from '../pages/admin/CompaniesManagementPage';
import { JobsManagementPage } from '../pages/admin/JobsManagementPage';
import { UsersManagementPage } from '../pages/admin/UsersManagementPage';
import { CVTemplateListPage } from '../pages/admin/CVTemplateListPage';
import { CVTemplateEditorPage } from '../pages/admin/CVTemplateEditorPage';
import { CVTemplateDetailPage } from '../pages/admin/CVTemplateDetailPage';
import { NotFoundPage } from '../pages/NotFoundPage';
import { ContactPage } from '../pages/ContactPage';
import { FAQPage } from '../pages/FAQPage';
import { TermsOfServicePage } from '../pages/TermsOfServicePage';
import { PrivacyPolicyPage } from '../pages/PrivacyPolicyPage';
import { ProtectedRoute } from '../components/ProtectedRoute';
import { UserRole } from '../lib/types';

export const router = createBrowserRouter([
  {
    path: '/',
    Component: RootLayout,
    children: [
      { index: true, Component: LandingPage },
      { path: 'login', Component: LoginPage },
      { path: 'register', Component: RegisterPage },
      { path: 'jobs', Component: JobSearchPage },
      { path: 'jobs/:id', Component: JobDetailPage },
      { path: 'companies', Component: CompanyListPage },
      { path: 'companies/:id', Component: CompanyDetailPage },
      {
        path: 'profile',
        element: <ProtectedRoute><ProfilePage /></ProtectedRoute>
      },
      {
        path: 'settings',
        element: <ProtectedRoute><SettingsPage /></ProtectedRoute>
      },
      {
        path: 'notifications',
        element: <ProtectedRoute><NotificationsPage /></ProtectedRoute>
      },

      // Static pages
      { path: 'contact', Component: ContactPage },
      { path: 'faq', Component: FAQPage },
      { path: 'terms', Component: TermsOfServicePage },
      { path: 'privacy', Component: PrivacyPolicyPage },

      // Candidate routes
      {
        path: 'candidate/dashboard',
        element: <ProtectedRoute allowedRoles={[UserRole.CANDIDATE]}><CandidateDashboard /></ProtectedRoute>
      },
      {
        path: 'candidate/cvs',
        element: <ProtectedRoute allowedRoles={[UserRole.CANDIDATE]}><CVManagementPage /></ProtectedRoute>
      },
      {
        path: 'candidate/cvs/new',
        element: <ProtectedRoute allowedRoles={[UserRole.CANDIDATE]}><CVEditorPage /></ProtectedRoute>
      },
      {
        path: 'candidate/cvs/:id/edit',
        element: <ProtectedRoute allowedRoles={[UserRole.CANDIDATE]}><CVEditorPage /></ProtectedRoute>
      },
      {
        path: 'candidate/applications',
        element: <ProtectedRoute allowedRoles={[UserRole.CANDIDATE]}><ApplicationsPage /></ProtectedRoute>
      },
      {
        path: 'candidate/saved-jobs',
        element: <ProtectedRoute allowedRoles={[UserRole.CANDIDATE]}><SavedJobsPage /></ProtectedRoute>
      },
      {
        path: 'candidate/recommended',
        element: <ProtectedRoute allowedRoles={[UserRole.CANDIDATE]}><RecommendedJobsPage /></ProtectedRoute>
      },

      // Recruiter routes
      {
        path: 'recruiter/company/register',
        element: <ProtectedRoute allowedRoles={[UserRole.RECRUITER, UserRole.CANDIDATE]}><CompanyRegistrationPage /></ProtectedRoute>
      },
      {
        path: 'recruiter',
        element: <ProtectedRoute allowedRoles={[UserRole.RECRUITER]}><RecruiterLayout /></ProtectedRoute>,
        children: [
          { path: 'dashboard', Component: RecruiterDashboard },
          { path: 'company', Component: CompanyManagementPage },
          { path: 'team-members', Component: MembersManagementPage },
          { path: 'candidates', Component: CandidateSearchPage },
          { path: 'saved-cvs', Component: SavedCVsPage },
          { path: 'cvs/:id', Component: CandidateDetailPage },
          { path: 'jobs', Component: RecruiterJobsManagementPage },
          { path: 'jobs/new', Component: JobFormPage },
          { path: 'jobs/:id/edit', Component: JobFormPage },
          { path: 'jobs/:id/applications', Component: JobApplicationsPage },
          { path: 'applications', Component: ApplicationsListPage },
          { path: 'notifications', Component: RecruiterNotificationsPage },
        ],
      },

      // Admin routes
      {
        path: 'admin',
        element: <ProtectedRoute allowedRoles={[UserRole.ADMIN]}><AdminLayout /></ProtectedRoute>,
        children: [
          { path: 'dashboard', Component: AdminDashboard },
          { path: 'companies', Component: CompaniesManagementPage },
          { path: 'jobs', Component: JobsManagementPage },
          { path: 'users', Component: UsersManagementPage },
          { path: 'cv-templates', Component: CVTemplateListPage },
          { path: 'cv-templates/new', Component: CVTemplateEditorPage },
          { path: 'cv-templates/:id', Component: CVTemplateDetailPage },
          { path: 'cv-templates/:id/edit', Component: CVTemplateEditorPage },
          { path: 'notifications', Component: NotificationsPage },
        ],
      },

      // Catch all
      { path: '*', Component: NotFoundPage },
    ],
  },
]);