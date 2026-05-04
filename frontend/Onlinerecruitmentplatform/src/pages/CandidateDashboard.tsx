import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router';
import { useAuth } from '../contexts/AuthContext';
import { Card, Button, Tag, Spin } from 'antd';
import {
  FileTextOutlined,
  FolderOutlined,
  BookOutlined,
  RiseOutlined,
  BellOutlined,
  EyeOutlined,
  SendOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  ShopOutlined,
} from '@ant-design/icons';
import { JobCard } from '../components/JobCard';
import { AppStatus, Job, CV, Application, UserRole } from '../lib/types';
import { cvService, applicationService, jobService } from '../api/services';
import { toast } from 'sonner';

export function CandidateDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [cvs, setCVs] = useState<CV[]>([]);
  const [applications, setApplications] = useState<Application[]>([]);
  const [recommendedJobs, setRecommendedJobs] = useState<Job[]>([]);
  const [savedJobs, setSavedJobs] = useState<Job[]>([]);
  const [savedJobsCount, setSavedJobsCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch dashboard data
  useEffect(() => {
    const fetchDashboardData = async () => {
      if (!user || user.role !== 'CANDIDATE') {
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);

        // Fetch CVs
        const cvsResponse = await cvService.getCVs({ page: 1, limit: 10 });
        const cvsList = cvsResponse.items || [];
        setCVs(cvsList);

        // Fetch Applications
        try {
          const appsResponse = await applicationService.getMyApplications();
          setApplications(Array.isArray(appsResponse) ? appsResponse : []);
        } catch (error: any) {
          console.error('Failed to fetch applications:', error);
          // Try alternative method
          try {
            const appsResponse = await applicationService.getApplications({ page: 1, limit: 10 });
            setApplications(appsResponse.items || []);
          } catch (err) {
            setApplications([]);
          }
        }

        // Fetch Saved Jobs
        try {
          const savedResponse = await jobService.getSavedJobs({ page: 1, limit: 3 });
          // Service returns { savedJobs: [...], pagination: {...} }
          let jobsList: Job[] = [];
          if ((savedResponse as any).savedJobs && Array.isArray((savedResponse as any).savedJobs)) {
            jobsList = (savedResponse as any).savedJobs.map((savedJob: any) => savedJob.job || savedJob).filter(Boolean);
          } else if (savedResponse.items && Array.isArray(savedResponse.items)) {
            jobsList = savedResponse.items.map((item: any) => item.job || item).filter(Boolean);
          } else if (Array.isArray(savedResponse)) {
            jobsList = savedResponse.map((item: any) => item.job || item).filter(Boolean);
          }
          setSavedJobs(jobsList);
          
          // Set count from pagination or array length
          if (savedResponse.pagination?.total !== undefined) {
            setSavedJobsCount(savedResponse.pagination.total);
          } else {
            setSavedJobsCount(jobsList.length);
          }
        } catch (error: any) {
          console.error('Failed to fetch saved jobs:', error);
          setSavedJobs([]);
          setSavedJobsCount(0);
        }

        // Fetch Recommended Jobs
        try {
          const recommendedResponse = await jobService.getRecommendedJobs({ page: 1, limit: 3 });
          // Service returns response.data which is { jobs: [...] }
          let jobs: Job[] = [];
          if ((recommendedResponse as any).jobs && Array.isArray((recommendedResponse as any).jobs)) {
            jobs = (recommendedResponse as any).jobs;
          } else if (recommendedResponse.items && Array.isArray(recommendedResponse.items)) {
            jobs = recommendedResponse.items;
          } else if (Array.isArray(recommendedResponse)) {
            jobs = recommendedResponse;
          }
          setRecommendedJobs(jobs);
        } catch (error: any) {
          console.error('Failed to fetch recommended jobs:', error);
          setRecommendedJobs([]);
        }
      } catch (error: any) {
        console.error('Failed to fetch dashboard data:', error);
        toast.error('Không thể tải dữ liệu dashboard');
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, [user]);

  const stats = {
    cvs: cvs.length,
    applications: applications.length,
    savedJobs: savedJobsCount,
    profileViews: 0, // This would need a separate API endpoint
  };

  const statusColors: Record<string, string> = {
    [AppStatus.PENDING]: 'bg-yellow-100 text-yellow-800',
    [AppStatus.REVIEWING]: 'bg-blue-100 text-blue-800',
    [AppStatus.ACCEPTED]: 'bg-green-100 text-green-800',
    [AppStatus.REJECTED]: 'bg-red-100 text-red-800',
    [AppStatus.CANCELLED]: 'bg-gray-100 text-gray-800',
  };

  const statusLabels: Record<string, string> = {
    [AppStatus.PENDING]: 'Chờ xử lý',
    [AppStatus.REVIEWING]: 'Đang xem xét',
    [AppStatus.ACCEPTED]: 'Đã chấp nhận',
    [AppStatus.REJECTED]: 'Đã từ chối',
    [AppStatus.CANCELLED]: 'Đã rút đơn',
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case AppStatus.PENDING: return <SendOutlined className="text-sm" />;
      case AppStatus.REVIEWING: return <EyeOutlined className="text-sm" />;
      case AppStatus.ACCEPTED: return <CheckCircleOutlined className="text-sm" />;
      case AppStatus.REJECTED: return <CloseCircleOutlined className="text-sm" />;
      default: return null;
    }
  };

  const formatSalary = (job: Job) => {
    if (!job.salary) return 'Thoả thuận';
    if (job.salary.hideAmount) return 'Thoả thuận';
    
    const min = job.salary.minAmount || 0;
    const max = job.salary.maxAmount || 0;
    const currency = job.salary.currency || 'VND';
    
    if (!min && !max) return 'Thoả thuận';
    
    if (currency === 'VND' || currency === 'vnd') {
      const format = (val: number) => `${(val / 1000000).toFixed(0)} triệu`;
      if (min && max) return `${format(min)} - ${format(max)}`;
      if (min) return `Từ ${format(min)}`;
      if (max) return `Tới ${format(max)}`;
    }
    
    if (currency === 'USD' || currency === 'usd') {
      if (min && max) return `${min} - ${max} USD`;
      if (min) return `Từ ${min} USD`;
      if (max) return `Tới ${max} USD`;
    }
    
    return 'Thoả thuận';
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div className="min-h-screen py-4 sm:py-6 lg:py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <h1 className="text-xl sm:text-2xl lg:text-3xl text-gray-900 mb-2">
            Chào mừng trở lại, {user?.fullName || 'Ứng viên'}!
          </h1>
          <p className="text-base sm:text-lg text-gray-600">
            Quản lý CV, tìm kiếm việc làm và theo dõi đơn ứng tuyển của bạn
          </p>
        </div>

        {/* Upgrade to Recruiter Banner */}
        <Card
          className="glassmorphism mb-6 sm:mb-8 border-purple-200 cursor-pointer hover:shadow-lg transition-all"
          onClick={() => navigate('/recruiter/company/register')}
          styles={{ body: { padding: '20px 24px' } }}
        >
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-start gap-4 flex-1">
              <div className="h-12 w-12 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <ShopOutlined className="text-2xl text-purple-600" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-1">
                  Trở thành nhà tuyển dụng
                </h3>
                <p className="text-sm sm:text-base text-gray-600">
                  Đăng ký công ty để đăng tin tuyển dụng và tìm kiếm ứng viên phù hợp
                </p>
              </div>
            </div>
            <Button
              type="primary"
              size="large"
              className="flex-shrink-0 w-full sm:w-auto"
              onClick={(e) => {
                e.stopPropagation();
                navigate('/recruiter/company/register');
              }}
            >
              Đăng ký ngay
            </Button>
          </div>
        </Card>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-8 sm:mb-10">
          <Card 
            className="glassmorphism cursor-pointer transition-all" 
            onClick={() => navigate('/candidate/cvs')}
            styles={{ body: { padding: '16px 24px' } }}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm sm:text-base text-gray-600 mb-1">CV của tôi</p>
                <p className="text-xl sm:text-2xl text-gray-900 font-semibold">{stats.cvs}</p>
              </div>
              <div className="h-10 w-10 sm:h-12 sm:w-12 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                <FileTextOutlined className="text-lg sm:text-xl text-blue-600" />
              </div>
            </div>
          </Card>

          <Card 
            className="glassmorphism cursor-pointer transition-all" 
            onClick={() => navigate('/candidate/applications')}
            styles={{ body: { padding: '16px 24px' } }}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm sm:text-base text-gray-600 mb-1">Đơn ứng tuyển</p>
                <p className="text-xl sm:text-2xl text-gray-900 font-semibold">{stats.applications}</p>
              </div>
              <div className="h-10 w-10 sm:h-12 sm:w-12 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                <FolderOutlined className="text-lg sm:text-xl text-green-600" />
              </div>
            </div>
          </Card>

          <Card 
            className="glassmorphism cursor-pointer transition-all" 
            onClick={() => navigate('/candidate/saved-jobs')}
            styles={{ body: { padding: '16px 24px' } }}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm sm:text-base text-gray-600 mb-1">Việc đã lưu</p>
                <p className="text-xl sm:text-2xl text-gray-900 font-semibold">{stats.savedJobs}</p>
              </div>
              <div className="h-10 w-10 sm:h-12 sm:w-12 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0">
                <BookOutlined className="text-lg sm:text-xl text-purple-600" />
              </div>
            </div>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {/* Recent Applications */}
            <Card
              title={
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 sm:gap-0">
                  <span className="text-base sm:text-lg">Đơn ứng tuyển gần đây</span>
                  <Link to="/candidate/applications">
                    <Button type="text" size="small">Xem tất cả</Button>
                  </Link>
                </div>
              }
              styles={{ 
                body: { padding: '16px 24px' },
                root: { marginBottom: '24px' }
              }}
              className="glassmorphism mb-6 sm:mb-8"
            >
                {applications.length > 0 ? (
                  <div className="space-y-3 sm:space-y-4">
                    {applications.slice(0, 3).map(app => {
                      const job = app.job;
                      const company = job?.company;
                      
                      if (!job) return null;

                      return (
                        <div key={app.id} className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 sm:gap-4 p-3 sm:p-4 border rounded-lg hover:bg-gray-50">
                          <div className="flex-1 min-w-0">
                            <Link to={`/jobs/${job.id}`}>
                              <h4 className="text-base sm:text-lg text-gray-900 hover:text-blue-600 mb-1 break-words font-medium">
                                {job.title}
                              </h4>
                            </Link>
                            {company && (
                              <p className="text-sm sm:text-base text-gray-600 mb-1 sm:mb-2 truncate">{company.name}</p>
                            )}
                            <p className="text-sm sm:text-base text-gray-500">
                              Ứng tuyển: {new Date(app.createdAt).toLocaleDateString('vi-VN')}
                            </p>
                          </div>
                          <Tag 
                            color={
                              app.status === AppStatus.PENDING ? 'gold' :
                              app.status === AppStatus.REVIEWING ? 'blue' :
                              app.status === AppStatus.ACCEPTED ? 'green' :
                              app.status === AppStatus.REJECTED ? 'red' : 'default'
                            }
                            className="flex-shrink-0"
                          >
                            <span className="flex items-center gap-1 text-sm">
                              {getStatusIcon(app.status)}
                              <span className="hidden sm:inline">{statusLabels[app.status] || app.status}</span>
                              <span className="sm:hidden">{statusLabels[app.status]?.split(' ')[0] || app.status}</span>
                            </span>
                          </Tag>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-center py-6 sm:py-8">
                    <p className="text-sm sm:text-base text-gray-600 mb-4">Bạn chưa có đơn ứng tuyển nào</p>
                    <Link to="/jobs">
                      <Button size="small">Tìm việc làm</Button>
                    </Link>
                  </div>
                )}
            </Card>

            {/* Recommended Jobs */}
            <Card
              title={
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 sm:gap-0">
                  <span className="text-base sm:text-lg flex items-center gap-2">
                    <BellOutlined className="text-blue-600" />
                    Việc làm phù hợp với bạn
                  </span>
                  <Link to="/candidate/recommended">
                    <Button type="text" size="small">Xem thêm</Button>
                  </Link>
                </div>
              }
              styles={{ 
                body: { padding: '16px 24px' },
                root: { marginBottom: '24px' }
              }}
              className="glassmorphism mb-6 sm:mb-8"
            >
                {recommendedJobs.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
                    {recommendedJobs.map(job => (
                      <div key={job.id} className="min-w-0">
                        <JobCard
                          job={job}
                          showSaveButton={user?.role === UserRole.CANDIDATE}
                        />
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-6 sm:py-8">
                    <p className="text-sm sm:text-base text-gray-600 mb-4">Chưa có việc làm gợi ý</p>
                    <Link to="/jobs">
                      <Button size="small">Tìm việc làm</Button>
                    </Link>
                  </div>
                )}
            </Card>

            {/* Saved Jobs */}
            <Card
              title={
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 sm:gap-0">
                  <span className="text-base sm:text-lg flex items-center gap-2">
                    <BookOutlined className="text-purple-600" />
                    Việc đã lưu
                  </span>
                  <Link to="/candidate/saved-jobs">
                    <Button type="text" size="small">Xem tất cả</Button>
                  </Link>
                </div>
              }
              styles={{ 
                body: { padding: '16px 24px' },
                root: { marginBottom: '24px' }
              }}
              className="glassmorphism mb-6 sm:mb-8"
            >
                {savedJobs.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
                    {savedJobs.map(job => (
                      <div key={job.id} className="min-w-0">
                        <JobCard
                          job={job}
                          showSaveButton={user?.role === UserRole.CANDIDATE}
                          isSaved={true}
                          onSaveToggle={async (jobId: string) => {
                            try {
                              await jobService.unsaveJob(jobId);
                              setSavedJobs(prev => prev.filter(j => j.id !== jobId));
                              setSavedJobsCount(prev => Math.max(0, prev - 1));
                              toast.success('Đã bỏ lưu việc làm');
                            } catch (error: any) {
                              console.error('Failed to unsave job:', error);
                              toast.error(error?.message || 'Không thể bỏ lưu việc làm');
                            }
                          }}
                        />
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-6 sm:py-8">
                    <p className="text-sm sm:text-base text-gray-600 mb-4">Bạn chưa lưu việc làm nào</p>
                    <Link to="/jobs">
                      <Button size="small">Tìm việc làm</Button>
                    </Link>
                  </div>
                )}
            </Card>
          </div>

          {/* Sidebar */}
          <div>
            {/* Quick Actions */}
            <Card
              title={<span className="text-base sm:text-lg">Hành động nhanh</span>}
              styles={{ 
                body: { padding: '16px 24px' },
                root: { marginBottom: '24px' }
              }}
              className="glassmorphism mb-6 sm:mb-8"
            >
              <div className="!space-y-2 !sm:space-y-3">
                <Button type="primary" block onClick={() => navigate('/candidate/cvs/new')} >
                  <FileTextOutlined className="glassmorphis" />
                  Tạo CV mới
                </Button>
                <Button block onClick={() => navigate('/jobs')}>
                  <FolderOutlined className="mr-2" />
                  Tìm việc làm
                </Button>
                <Button block onClick={() => navigate('/candidate/saved-jobs')}>
                  <BookOutlined className="mr-2" />
                  Việc đã lưu
                </Button>
                <Button block onClick={() => navigate('/candidate/recommended')}>
                  <RiseOutlined className="mr-2" />
                  Việc làm gợi ý
                </Button>
              </div>
            </Card>

            {/* Profile Completion */}
            <Card
              title={<span className="text-base sm:text-lg">Hoàn thiện hồ sơ</span>}
              styles={{ 
                body: { padding: '16px 24px' },
                root: { marginBottom: '24px' }
              }}
              className="glassmorphism mb-6 sm:mb-8"
            >
                <div className="space-y-4">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-gray-600">Tiến độ</span>
                      <span className="text-gray-900">
                        {cvs.length > 0 ? '75%' : '25%'}
                      </span>
                    </div>
                    <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-blue-600" 
                        style={{ width: cvs.length > 0 ? '75%' : '25%' }} 
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2 text-gray-600">
                    <div className="flex items-center gap-2">
                      {user?.avatarUrl ? (
                        <CheckCircleOutlined className="text-green-600" />
                      ) : (
                        <div className="h-4 w-4 border-2 border-gray-300 rounded-full" />
                      )}
                      <span>Thêm ảnh đại diện</span>
                    </div>
                    <div className="flex items-center gap-2">
                      {cvs.length > 0 ? (
                        <CheckCircleOutlined className="text-green-600" />
                      ) : (
                        <div className="h-4 w-4 border-2 border-gray-300 rounded-full" />
                      )}
                      <span>Tạo CV</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="h-4 w-4 border-2 border-gray-300 rounded-full" />
                      <span>Thêm kỹ năng</span>
                    </div>
                  </div>

                  <Link to="/profile">
                    <Button block className="mt-4">
                      Hoàn thiện ngay
                    </Button>
                  </Link>
                </div>
            </Card>

            {/* CV List */}
            <Card
              title={
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 sm:gap-0">
                  <span className="text-base sm:text-lg">CV của tôi</span>
                  <Button type="text" size="small" onClick={() => navigate('/candidate/cvs')}>
                    Xem tất cả
                  </Button>
                </div>
              }
              styles={{ 
                body: { padding: '16px 24px' },
                root: { marginBottom: '24px' }
              }}
              className="glassmorphism mb-6 sm:mb-8"
            >
                {cvs.length > 0 ? (
                  <div className="space-y-2 sm:space-y-3">
                    {cvs.slice(0, 3).map(cv => {
                      return (
                        <div 
                          key={cv.id} 
                          className="flex items-center justify-between gap-2 p-2 sm:p-3 border rounded-lg hover:bg-gray-50 cursor-pointer"
                          onClick={() => navigate(`/candidate/cvs/${cv.id}`)}
                        >
                          <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
                            <FileTextOutlined className="text-blue-600 flex-shrink-0" />
                            <div className="min-w-0 flex-1">
                              <p className="text-base sm:text-lg text-gray-900 truncate">{cv.title}</p>
                              <p className="text-sm sm:text-base text-gray-500 truncate">
                                {cv.template?.name || 'Mẫu CV'}
                              </p>
                            </div>
                          </div>
                          {cv.isMain && (
                            <Tag color="blue" className="flex-shrink-0 text-sm">Chính</Tag>
                          )}
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-center py-4 sm:py-6">
                    <p className="text-sm sm:text-base text-gray-600 mb-4">Bạn chưa có CV nào</p>
                    <Button onClick={() => navigate('/candidate/cvs/new')}>
                      Tạo CV mới
                    </Button>
                  </div>
                )}
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
