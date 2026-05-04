import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router';
import { Card, Button, Tag, Spin } from 'antd';
import {
  ProjectOutlined, UserOutlined, EyeOutlined, RiseOutlined, PlusOutlined, ClockCircleOutlined, UserAddOutlined,
  ShopOutlined, CalendarOutlined, WarningOutlined
} from '@ant-design/icons';
import { useAuth } from '../contexts/AuthContext';
import { formatDistanceToNow } from 'date-fns';
import { vi } from 'date-fns/locale';
import { Job, Application, Company, JobStatus, AppStatus, CompanyRole } from '../lib/types';
import { jobService, applicationService, companyService } from '../api/services';
import { toast } from 'sonner';
import { CandidateProfileModal } from '../components/recruiter/CandidateProfileModal';

export function RecruiterDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();

  // State
  const [companyJobs, setCompanyJobs] = useState<Job[]>([]);
  const [applications, setApplications] = useState<Application[]>([]);
  const [company, setCompany] = useState<Company | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedApplication, setSelectedApplication] = useState<Application | null>(null);

  // Get company ID from user's company member info
  // API returns companyMember.company.id (nested) or companyMember.companyId (flat)
  const companyId = user?.companyMember?.companyId || user?.companyMember?.company?.id;

  // Check if user can manage company (OWNER or MANAGER only)
  // API returns "role" but frontend type uses "companyRole"
  const memberRole = user?.companyMember?.companyRole || (user?.companyMember as any)?.role;
  const canManageCompany = memberRole === CompanyRole.OWNER ||
    memberRole === CompanyRole.MANAGER;

  useEffect(() => {
    if (!companyId) {
      setIsLoading(false);
      return;
    }

    const fetchData = async () => {
      setIsLoading(true);
      setError(null);

      try {
        // Fetch company info, jobs, and applications in parallel
        const [companyData, jobsResponse] = await Promise.all([
          companyService.getCompanyById(companyId),
          jobService.getJobsByCompany(companyId, { limit: 100 }),
        ]);

        setCompany(companyData);
        setCompanyJobs(jobsResponse.items || []);

        // Fetch applications for all jobs
        const allApplications: Application[] = [];
        const jobs = jobsResponse.items || [];

        // Fetch applications for each job (limit to first 10 jobs to avoid too many requests)
        const jobsToFetch = jobs.slice(0, 10);
        const applicationPromises = jobsToFetch.map(job =>
          applicationService.getApplicationsByJob(job.id).catch(() => [])
        );

        const applicationsResults = await Promise.all(applicationPromises);
        applicationsResults.forEach(apps => {
          if (Array.isArray(apps)) {
            allApplications.push(...apps);
          }
        });

        // Sort by created date (newest first)
        allApplications.sort((a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );

        setApplications(allApplications);
      } catch (err: any) {
        console.error('Failed to fetch dashboard data:', err);
        setError(err.message || 'Không thể tải dữ liệu');
        toast.error('Không thể tải dữ liệu dashboard');
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [companyId]);

  // Calculate stats
  const stats = {
    activeJobs: companyJobs.filter(j => j.status === JobStatus.ACTIVE).length,
    totalJobs: companyJobs.length,
    totalApplications: applications.length,
    pendingApplications: applications.filter(a => a.status === AppStatus.PENDING).length,
    totalViews: companyJobs.reduce((sum, job) => sum + (job.applicationCount || 0) * 3, 0), // Estimate views
  };

  const recentApplications = applications.slice(0, 5);

  const statusLabels: Record<string, string> = {
    PENDING: 'Chờ xử lý',
    REVIEWING: 'Đang xem xét',
    ACCEPTED: 'Đã chấp nhận',
    REJECTED: 'Đã từ chối',
    CANCELLED: 'Đã rút đơn',
  };

  const statusColors: Record<string, string> = {
    PENDING: 'bg-yellow-100 text-yellow-800',
    REVIEWING: 'bg-blue-100 text-blue-800',
    ACCEPTED: 'bg-green-100 text-green-800',
    REJECTED: 'bg-red-100 text-red-800',
    CANCELLED: 'bg-gray-100 text-gray-800',
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center py-8 px-3 sm:px-4">
        <div className="text-center">
          <Spin size="large" className="mb-4" />
          <p className="text-sm sm:text-base text-gray-600">Đang tải dữ liệu...</p>
        </div>
      </div>
    );
  }

  // No company state
  if (!companyId) {
    return (
      <div className="min-h-screen py-4 sm:py-6 lg:py-8">
        <div className="max-w-6xl mx-auto px-3 sm:px-4 lg:px-6 xl:px-8">
          <Card className="glassmorphism" styles={{ body: { padding: '24px 16px', textAlign: 'center' } }}>
            <div className="sm:py-4 sm:px-8">
              <ShopOutlined className="text-4xl sm:text-5xl text-gray-400 mb-4" />
              <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2">
                Chưa có công ty
              </h3>
              <p className="text-sm sm:text-base text-gray-600 mb-4 sm:mb-6">
                Bạn cần đăng ký công ty để bắt đầu đăng tin tuyển dụng
              </p>
              <Link to="/recruiter/company/register">
                <Button type="primary" size="large" icon={<PlusOutlined />} className="w-full sm:w-auto">
                  Đăng ký công ty
                </Button>
              </Link>
            </div>
          </Card>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen py-4 sm:py-6 lg:py-8">
        <div className="max-w-6xl mx-auto px-3 sm:px-4 lg:px-6 xl:px-8">
          <Card className="glassmorphism" styles={{ body: { padding: '24px 16px', textAlign: 'center' } }}>
            <div className="sm:py-4 sm:px-8">
              <WarningOutlined className="text-4xl sm:text-5xl text-red-400 mb-4" />
              <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2">
                Có lỗi xảy ra
              </h3>
              <p className="text-sm sm:text-base text-gray-600 mb-4 sm:mb-6">{error}</p>
              <Button onClick={() => window.location.reload()} className="w-full sm:w-auto">
                Thử lại
              </Button>
            </div>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-4 sm:py-6 lg:py-8">
      <div className="max-w-6xl mx-auto px-3 sm:px-4 lg:px-6 xl:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Dashboard nhà tuyển dụng
          </h1>
          <p className="text-base text-gray-600">
            Quản lý tin tuyển dụng và đơn ứng tuyển
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-4 sm:mb-6 lg:mb-8">
          <Card
            className="glassmorphism cursor-pointer hover:shadow-md transition-shadow"
            onClick={() => navigate('/recruiter/jobs')}
            styles={{ body: { padding: '16px 20px sm:24px' } }}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm text-gray-600 mb-1">Tin đang tuyển</p>
                <p className="text-xl sm:text-2xl font-bold text-gray-900">{stats.activeJobs}</p>
              </div>
              <div className="h-10 w-10 sm:h-12 sm:w-12 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                <ProjectOutlined className="text-lg sm:text-xl text-blue-600" />
              </div>
            </div>
          </Card>

          <Card
            className="glassmorphism cursor-pointer hover:shadow-md transition-shadow"
            onClick={() => navigate('/recruiter/applications')}
            styles={{ body: { padding: '16px 20px sm:24px' } }}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm text-gray-600 mb-1">Tổng ứng viên</p>
                <p className="text-xl sm:text-2xl font-bold text-gray-900">{stats.totalApplications}</p>
              </div>
              <div className="h-10 w-10 sm:h-12 sm:w-12 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                <UserOutlined className="text-lg sm:text-xl text-green-600" />
              </div>
            </div>
          </Card>

          <Card
            className="glassmorphism cursor-pointer hover:shadow-md transition-shadow"
            onClick={() => navigate('/recruiter/applications?status=PENDING')}
            styles={{ body: { padding: '16px 20px sm:24px' } }}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm text-gray-600 mb-1">Chờ xử lý</p>
                <p className="text-xl sm:text-2xl font-bold text-gray-900">{stats.pendingApplications}</p>
              </div>
              <div className="h-10 w-10 sm:h-12 sm:w-12 bg-orange-100 rounded-full flex items-center justify-center flex-shrink-0">
                <UserAddOutlined className="text-lg sm:text-xl text-orange-600" />
              </div>
            </div>
          </Card>

          <Card className="glassmorphism" styles={{ body: { padding: '16px 20px sm:24px' } }}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm text-gray-600 mb-1">Lượt xem tin</p>
                <p className="text-xl sm:text-2xl font-bold text-gray-900">{stats.totalViews}</p>
              </div>
              <div className="h-10 w-10 sm:h-12 sm:w-12 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0">
                <RiseOutlined className="text-lg sm:text-xl text-purple-600" />
              </div>
            </div>
          </Card>
        </div>

        <div className="grid lg:grid-cols-3 gap-4 sm:gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-4 sm:space-y-6">
            {/* Recent Applications */}
            <Card
              className="glassmorphism"
              title={
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                  <span className="text-base sm:text-lg font-semibold">Đơn ứng tuyển mới</span>
                  <Link to="/recruiter/applications">
                    <Button type="text" size="small" className="text-xs sm:text-sm">Xem tất cả</Button>
                  </Link>
                </div>
              }
              styles={{ body: { padding: '16px' } }}
            >
              {recentApplications.length > 0 ? (
                <div className="space-y-3 sm:space-y-4">
                  {recentApplications.map(app => {
                    const job = companyJobs.find(j => j.id === app.jobId);

                    return (
                      <div key={app.id} className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 sm:gap-3 p-3 sm:p-4 border border-white/30 rounded-lg hover:bg-white/40 transition-colors">
                        <div className="flex gap-2 sm:gap-3 flex-1 min-w-0">
                          <div className="h-10 w-10 bg-gray-200 rounded-full flex items-center justify-center flex-shrink-0">
                            <span className="text-gray-600 font-medium text-sm sm:text-base">
                              {(app.user?.fullName || app.cv?.fullName || 'U').charAt(0).toUpperCase()}
                            </span>
                          </div>
                          <div className="flex-1 min-w-0">
                            <button
                              onClick={() => setSelectedApplication(app)}
                              className="text-left w-full"
                            >
                              <h4 className="font-medium text-sm sm:text-base text-gray-900 hover:text-blue-600 mb-1 truncate">
                                {app.user?.fullName || app.cv?.fullName || 'Ứng viên'}
                              </h4>
                            </button>
                            <p className="text-xs sm:text-sm text-gray-600 mb-1 truncate">
                              {job?.title || 'Vị trí không xác định'}
                            </p>
                            <p className="text-xs text-gray-500">
                              {formatDistanceToNow(new Date(app.createdAt), {
                                addSuffix: true,
                                locale: vi
                              })}
                            </p>
                          </div>
                        </div>
                        <Tag color={
                          app.status === AppStatus.PENDING ? 'orange' :
                            app.status === AppStatus.REVIEWING ? 'blue' :
                              app.status === AppStatus.ACCEPTED ? 'green' :
                                app.status === AppStatus.REJECTED ? 'red' :
                                  'default'
                        } className="flex-shrink-0 text-xs sm:text-sm">
                          {statusLabels[app.status] || app.status}
                        </Tag>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-6 sm:py-8">
                  <UserOutlined className="text-3xl sm:text-4xl text-gray-300 mb-3" />
                  <p className="text-sm sm:text-base text-gray-600">Chưa có đơn ứng tuyển nào</p>
                </div>
              )}
            </Card>

            {/* Active Jobs */}
            <Card
              className="glassmorphism"
              title={
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                  <span className="text-base sm:text-lg font-semibold">Tin tuyển dụng đang hoạt động</span>
                  <Link to="/recruiter/jobs">
                    <Button type="text" size="small" className="text-xs sm:text-sm">Xem tất cả</Button>
                  </Link>
                </div>
              }
              styles={{ body: { padding: '16px' } }}
            >
              {companyJobs.length > 0 ? (
                <div className="space-y-3 sm:space-y-4">
                  {companyJobs
                    .filter(job => job.status === JobStatus.ACTIVE)
                    .slice(0, 3)
                    .map(job => (
                      <div key={job.id} className="p-3 sm:p-4 border border-white/30 rounded-lg hover:bg-white/40 transition-colors">
                        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 sm:gap-3 mb-2 sm:mb-3">
                          <Link to={`/recruiter/jobs/${job.id}`} className="flex-1 min-w-0">
                            <h4 className="font-medium text-sm sm:text-base text-gray-900 hover:text-blue-600 truncate">
                              {job.title}
                            </h4>
                          </Link>
                          <Tag color={job.urgent ? 'red' : 'blue'} className="flex-shrink-0 text-xs sm:text-sm">
                            {job.urgent ? 'Gấp' : 'Đang tuyển'}
                          </Tag>
                        </div>

                        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-6 text-xs sm:text-sm text-gray-600">
                          <div className="flex items-center gap-1">
                            <UserOutlined className="text-sm sm:text-base" />
                            <span>{job.applicationCount || 0} ứng viên</span>
                          </div>
                          {job.expiresAt && (
                            <div className="flex items-center gap-1">
                              <CalendarOutlined className="text-sm sm:text-base" />
                              <span>
                                Hết hạn {formatDistanceToNow(new Date(job.expiresAt), {
                                  locale: vi
                                })}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}

                  {companyJobs.filter(job => job.status === JobStatus.ACTIVE).length === 0 && (
                    <div className="text-center py-4 sm:py-6">
                      <p className="text-sm sm:text-base text-gray-600 mb-3 sm:mb-4">Chưa có tin tuyển dụng đang hoạt động</p>
                      <Link to="/recruiter/jobs/new">
                        <Button icon={<PlusOutlined />} size="small" className="w-full sm:w-auto">
                          Đăng tin tuyển dụng
                        </Button>
                      </Link>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-6 sm:py-8">
                  <ProjectOutlined className="text-3xl sm:text-4xl text-gray-300 mb-3" />
                  <p className="text-sm sm:text-base text-gray-600 mb-3 sm:mb-4">Bạn chưa có tin tuyển dụng nào</p>
                  <Link to="/recruiter/jobs/new">
                    <Button icon={<PlusOutlined />} size="small" className="w-full sm:w-auto">
                      Đăng tin tuyển dụng
                    </Button>
                  </Link>
                </div>
              )}
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-4 sm:space-y-6">
            {/* Quick Actions */}
            <Card
              className="glassmorphism"
              title={<span className="text-base sm:text-lg font-semibold">Hành động nhanh</span>}
              styles={{ body: { padding: '16px' } }}
            >
              <div className="flex flex-col gap-2">
                <Link to="/recruiter/jobs/new">
                  <Button className="w-full text-xs sm:text-sm" icon={<PlusOutlined />} size="small">
                    Đăng tin tuyển dụng
                  </Button>
                </Link>
                <Link to="/recruiter/applications">
                  <Button className="w-full text-xs sm:text-sm" icon={<UserOutlined />} size="small">
                    Xem đơn ứng tuyển
                  </Button>
                </Link>
                {canManageCompany && (
                  <Link to="/recruiter/company">
                    <Button className="w-full text-xs sm:text-sm" icon={<ShopOutlined />} size="small">
                      Quản lý công ty
                    </Button>
                  </Link>
                )}
              </div>
            </Card>

            {/* Company Info */}
            <Card
              className="glassmorphism"
              title={<span className="text-base sm:text-lg font-semibold">Thông tin công ty</span>}
              styles={{ body: { padding: '16px' } }}
            >
              <div className="text-center mb-3 sm:mb-4">
                {company?.logoUrl ? (
                  <img
                    src={company.logoUrl}
                    alt={company.name}
                    className="h-12 w-12 sm:h-16 sm:w-16 rounded-lg object-cover mx-auto mb-2"
                  />
                ) : (
                  <div className="h-12 w-12 sm:h-16 sm:w-16 bg-gray-100 rounded-lg flex items-center justify-center mx-auto mb-2">
                    <ShopOutlined className="text-xl sm:text-2xl text-gray-400" />
                  </div>
                )}
                <h3 className="text-sm sm:text-base font-semibold text-gray-900 mb-1 truncate">
                  {company?.name || 'Công ty'}
                </h3>
                <Tag color={company?.status === 'ACTIVE' ? 'green' : 'default'} className="text-xs sm:text-sm">
                  {company?.status === 'ACTIVE' ? 'Đã xác thực' : company?.status || 'Chờ duyệt'}
                </Tag>
              </div>

              <div className="space-y-2 text-xs sm:text-sm text-gray-600">
                {company?.industry && (
                  <p className="flex items-center gap-2 truncate">
                    <ProjectOutlined className="text-sm sm:text-base flex-shrink-0" />
                    <span className="truncate">{company.industry}</span>
                  </p>
                )}
                {company?.companySize && (
                  <p className="flex items-center gap-2">
                    <UserOutlined className="text-sm sm:text-base flex-shrink-0" />
                    <span>{company.companySize === 'SMALL' ? '1-50 nhân viên' :
                      company.companySize === 'MEDIUM' ? '51-200 nhân viên' :
                        company.companySize === 'LARGE' ? '201-1000 nhân viên' :
                          company.companySize === 'ENTERPRISE' ? '1000+ nhân viên' :
                            company.companySize}</span>
                  </p>
                )}
              </div>

              {canManageCompany && (
                <Link to="/recruiter/company">
                  <Button className="w-full mt-3 sm:mt-4 text-xs sm:text-sm" size="small">
                    Chỉnh sửa
                  </Button>
                </Link>
              )}
            </Card>

            {/* Tips */}

          </div>
        </div>
      </div>

      {/* Candidate Profile Modal */}
      {selectedApplication && (
        <CandidateProfileModal
          application={selectedApplication}
          isOpen={!!selectedApplication}
          onClose={() => setSelectedApplication(null)}
        />
      )}
    </div>
  );
}
