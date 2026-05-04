import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { Card, Button, Input, Tag, Select, Modal, Spin } from 'antd';
import {
  RightOutlined, FolderOutlined, SearchOutlined, FileTextOutlined, ShopOutlined, CalendarOutlined,
  EyeOutlined, CloseCircleOutlined, CheckCircleOutlined, ClockCircleOutlined, EnvironmentOutlined, DollarOutlined,
  ExclamationCircleOutlined, DeleteOutlined
} from '@ant-design/icons';
import { useAuth } from '../contexts/AuthContext';
import { applicationService } from '../api/services';
import { formatDistanceToNow } from 'date-fns';
import { vi } from 'date-fns/locale';
import { toast } from 'sonner';
import { Application, AppStatus, Job, Company, CV } from '../lib/types';

const { Option } = Select;

type StatusFilter = 'all' | AppStatus;
type SortBy = 'date-new' | 'date-old' | 'status';

export function ApplicationsPage() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [applications, setApplications] = useState<Application[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<SortBy>('date-new');
  const [selectedApp, setSelectedApp] = useState<string | null>(null);
  const [isWithdrawing, setIsWithdrawing] = useState<string | null>(null);

  // Fetch applications from API
  useEffect(() => {
    const fetchApplications = async () => {
      if (!user) {
        setApplications([]);
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        const response = await applicationService.getMyApplications();

        // Handle different response structures
        let applicationsList: Application[] = [];
        if (Array.isArray(response)) {
          applicationsList = response;
        } else if (response && (response as any).items && Array.isArray((response as any).items)) {
          applicationsList = (response as any).items;
        } else if (response && (response as any).data && Array.isArray((response as any).data)) {
          applicationsList = (response as any).data;
        }

        setApplications(applicationsList);
      } catch (error: any) {
        console.error('Failed to fetch applications:', error);
        toast.error(error.message || 'Không thể tải danh sách đơn ứng tuyển');
        setApplications([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchApplications();
  }, [user]);

  // Format salary helper
  const formatSalary = (job: Job | undefined) => {
    if (!job) return 'Thỏa thuận';
    if (job.salary) {
      const salary = job.salary;
      if (salary.hideAmount) return 'Thỏa thuận';
      const min = salary.minAmount?.toLocaleString('vi-VN') || '';
      const max = salary.maxAmount?.toLocaleString('vi-VN') || '';
      const currency = salary.currency || 'VND';
      if (min && max) {
        return `${min} - ${max} ${currency}`;
      }
      if (min) return `Từ ${min} ${currency}`;
      if (max) return `Đến ${max} ${currency}`;
    }
    return 'Thỏa thuận';
  };

  // Filter applications
  const filteredApplications = applications.filter(app => {
    // Status filter
    if (statusFilter !== 'all' && app.status !== statusFilter) return false;

    // Search filter
    if (searchQuery) {
      const job = app.job;
      const searchLower = searchQuery.toLowerCase();

      // Handle both nested company object and flat companyName
      const companyName = (job as any)?.companyName || job?.company?.name || '';

      if (!job?.title.toLowerCase().includes(searchLower) &&
        !companyName.toLowerCase().includes(searchLower)) {
        return false;
      }
    }

    return true;
  });

  // Sort applications
  const sortedApplications = [...filteredApplications].sort((a, b) => {
    switch (sortBy) {
      case 'date-new':
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      case 'date-old':
        return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      case 'status':
        return a.status.localeCompare(b.status);
      default:
        return 0;
    }
  });

  const statusConfig = {
    [AppStatus.PENDING]: {
      label: 'Chờ xử lý',
      color: 'gold',
      icon: <ClockCircleOutlined />,
    },
    [AppStatus.REVIEWING]: {
      label: 'Đang xem xét',
      color: 'blue',
      icon: <EyeOutlined />,
    },
    [AppStatus.ACCEPTED]: {
      label: 'Đã chấp nhận',
      color: 'green',
      icon: <CheckCircleOutlined />,
    },
    [AppStatus.REJECTED]: {
      label: 'Đã từ chối',
      color: 'red',
      icon: <CloseCircleOutlined />,
    },
    [AppStatus.CANCELLED]: {
      label: 'Đã rút đơn',
      color: 'default',
      icon: <CloseCircleOutlined />,
    },
  };

  const handleCancelApplication = async (appId: string) => {
    if (!confirm('Bạn có chắc muốn hủy đơn ứng tuyển này?')) {
      return;
    }

    try {
      setIsWithdrawing(appId);
      await applicationService.withdrawApplication(appId);
      toast.success('Đã rút đơn ứng tuyển');
      setApplications(prev => prev.map(app =>
        app.id === appId ? { ...app, status: AppStatus.CANCELLED } : app
      ));
      setSelectedApp(null);
    } catch (error: any) {
      console.error('Failed to withdraw application:', error);
      toast.error(error.message || 'Không thể hủy đơn ứng tuyển');
    } finally {
      setIsWithdrawing(null);
    }
  };

  const selectedApplication = selectedApp
    ? sortedApplications.find(app => app.id === selectedApp)
    : null;

  const selectedJob = selectedApplication?.job;
  const selectedCV = selectedApplication?.cv;

  // Handle both nested company object and flat companyName
  const selectedCompanyName = selectedJob ? ((selectedJob as any)?.companyName || selectedJob?.company?.name || 'Công ty') : '';
  const selectedCompanyLogo = selectedJob?.company?.logoUrl;

  return (
    <div className="min-h-screen py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-gray-600 mb-6">
          <button onClick={() => navigate('/candidate/dashboard')} className="hover:text-blue-600">
            Dashboard
          </button>
          <RightOutlined className="text-sm" />
          <span className="text-gray-900">Đơn ứng tuyển</span>
        </div>

        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Đơn ứng tuyển của tôi</h1>
          <p className="text-base sm:text-lg text-gray-600">
            Theo dõi và quản lý các đơn ứng tuyển của bạn
          </p>
        </div>

        {/* Filters */}
        <Card className="glassmorphism mb-4 sm:mb-6" styles={{ body: { padding: '16px 24px' } }}>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4">
            {/* Status Filter */}
            <div>
              <label className="text-sm sm:text-base text-gray-700 mb-2 block font-medium">Trạng thái</label>
              <Select
                value={statusFilter}
                onChange={(value: StatusFilter) => setStatusFilter(value)}
                className="w-full"
              >
                <Option value="all">Tất cả</Option>
                <Option value={AppStatus.PENDING}>Chờ xử lý</Option>
                <Option value={AppStatus.REVIEWING}>Đang xem xét</Option>
                <Option value={AppStatus.ACCEPTED}>Đã chấp nhận</Option>
                <Option value={AppStatus.REJECTED}>Đã từ chối</Option>
                <Option value={AppStatus.CANCELLED}>Đã rút đơn</Option>
              </Select>
            </div>

            {/* Search */}
            <div>
              <label className="text-sm sm:text-base text-gray-700 mb-2 block font-medium">Tìm kiếm</label>
              <Input
                placeholder="Tên công việc hoặc công ty..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                prefix={<SearchOutlined className="text-gray-400" />}
                size="large"
              />
            </div>

            {/* Sort */}
            <div>
              <label className="text-sm sm:text-base text-gray-700 mb-2 block font-medium">Sắp xếp theo</label>
              <Select
                value={sortBy}
                onChange={(value: SortBy) => setSortBy(value)}
                className="w-full"
              >
                <Option value="date-new">Ngày ứng tuyển (Mới nhất)</Option>
                <Option value="date-old">Ngày ứng tuyển (Cũ nhất)</Option>
                <Option value="status">Trạng thái</Option>
              </Select>
            </div>
          </div>


          {/* Filter Summary */}
          <div className="mt-4 p-3 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 sm:gap-0 text-sm sm:text-base text-gray-700">
              <span>
                Hiển thị <strong className="text-gray-900">{sortedApplications.length}</strong> trong tổng số{' '}
                <strong className="text-gray-900">{applications.length}</strong> đơn ứng tuyển
              </span>
              {(statusFilter !== 'all' || searchQuery) && (
                <Button
                  type="text"
                  size="small"
                  onClick={() => {
                    setStatusFilter('all');
                    setSearchQuery('');
                  }}
                >
                  Xóa bộ lọc
                </Button>
              )}
            </div>
          </div>
        </Card>

        {/* Applications List */}
        {isLoading ? (
          <Card className="mt-6" styles={{ body: { padding: '32px 48px', textAlign: 'center' } }}>
            <Spin size="large" className="mb-4" />
            <p className="text-sm sm:text-base text-gray-600">Đang tải danh sách đơn ứng tuyển...</p>
          </Card>
        ) : sortedApplications.length > 0 ? (
          <div className="space-y-3 sm:space-y-4 mt-6">
            {sortedApplications.map(app => {
              const job = app.job;
              const cv = app.cv;

              if (!job) return null;

              // Handle both nested company object and flat companyName
              const companyName = (job as any)?.companyName || job?.company?.name || 'Công ty';
              const companyLogo = job?.company?.logoUrl;

              const config = statusConfig[app.status as keyof typeof statusConfig] || statusConfig[AppStatus.PENDING];

              return (
                <Card key={app.id} className="glassmorphism transition-all" styles={{ body: { padding: '16px 24px' } }}>
                  <div className="flex items-start gap-3 sm:gap-6">
                    {/* Company Logo */}
                    <div className="hidden md:flex h-12 w-12 sm:h-16 sm:w-16 bg-gray-100 rounded-lg items-center justify-center flex-shrink-0">
                      {companyLogo ? (
                        <img src={companyLogo} alt={companyName} className="h-10 w-10 sm:h-12 sm:w-12 object-contain rounded-lg" />
                      ) : (
                        <ShopOutlined className="text-lg sm:text-xl text-gray-400" />
                      )}
                    </div>

                    {/* Application Details */}
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-col sm:flex-row items-start sm:items-start justify-between gap-2 sm:gap-4 mb-2 sm:mb-3">
                        <div className="flex-1 min-w-0">
                          <button
                            onClick={() => navigate(`/jobs/${job.id}`)}
                            className="text-base sm:text-lg text-gray-900 hover:text-blue-600 mb-1 block break-words text-left font-medium"
                          >
                            {job.title}
                          </button>
                          <p className="text-sm sm:text-base text-gray-600 truncate">{companyName}</p>
                        </div>
                        <Tag color={config.color} className="flex-shrink-0">
                          <span className="flex items-center gap-1 text-sm">
                            {config.icon}
                            <span className="hidden sm:inline">{config.label}</span>
                            <span className="sm:hidden">{config.label.split(' ')[0]}</span>
                          </span>
                        </Tag>
                      </div>

                      {/* Job Info */}
                      <div className="flex flex-wrap gap-2 sm:gap-4 text-sm sm:text-base text-gray-600 mb-3 sm:mb-4">
                        <div className="flex items-center gap-1">
                          <EnvironmentOutlined className="text-sm sm:text-base flex-shrink-0" />
                          <span className="truncate">{job.location}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <DollarOutlined className="text-sm sm:text-base flex-shrink-0" />
                          <span className="truncate">{formatSalary(job)}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <CalendarOutlined className="text-sm sm:text-base flex-shrink-0" />
                          <span className="truncate">
                            Ứng tuyển {formatDistanceToNow(new Date(app.createdAt), {
                              addSuffix: true,
                              locale: vi
                            })}
                          </span>
                        </div>
                      </div>

                      {/* CV Used */}
                      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 p-2 sm:p-3 bg-gray-50 rounded-lg mb-3 sm:mb-4">
                        <div className="flex items-center gap-2">
                          <FileTextOutlined className="text-blue-600 flex-shrink-0" />
                          <span className="text-sm sm:text-base text-gray-700 font-medium">CV sử dụng:</span>
                        </div>
                        {cv ? (
                          <button
                            onClick={() => navigate(`/candidate/cvs/${cv.id}`)}
                            className="text-sm sm:text-base text-blue-600 hover:underline truncate max-w-full"
                          >
                            {cv.title || 'CV không có tiêu đề'}
                          </button>
                        ) : (
                          <span className="text-sm sm:text-base text-gray-500">CV không tồn tại</span>
                        )}
                      </div>

                      {/* Cover Letter Preview */}
                      {app.coverLetter && (
                        <div className="p-2 sm:p-3 bg-gradient-to-br from-blue-100 via-blue-200 to-blue-300 border border-blue-100 rounded-lg mb-3 sm:mb-4">
                          <p className="text-sm sm:text-base text-gray-700 mb-1 font-medium">Thư xin việc:</p>
                          <p className="text-sm sm:text-base text-gray-600 line-clamp-2">{app.coverLetter}</p>
                        </div>
                      )}

                      {/* Actions */}
                      <div className="flex flex-wrap gap-2 sm:gap-3">
                        <Button
                          onClick={() => setSelectedApp(app.id)}
                          className="flex-1 sm:flex-initial"
                          icon={<EyeOutlined />}
                        >
                          Chi tiết
                        </Button>
                        <Button
                          className="flex-1 sm:flex-initial"
                          onClick={() => navigate(`/jobs/${job.id}`)}
                          icon={<FolderOutlined />}
                        >
                          Xem công việc
                        </Button>
                        {app.status === AppStatus.PENDING && (
                          <Button
                            onClick={() => handleCancelApplication(app.id)}
                            disabled={isWithdrawing === app.id}
                            className="flex-1 sm:flex-initial text-red-600 hover:text-red-700"
                            icon={isWithdrawing === app.id ? <Spin size="small" /> : <CloseCircleOutlined />}
                          >
                            <span className="hidden sm:inline">{isWithdrawing === app.id ? 'Đang hủy...' : 'Hủy đơn'}</span>
                            <span className="sm:hidden">{isWithdrawing === app.id ? 'Hủy...' : 'Hủy'}</span>
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        ) : (
          <Card styles={{ body: { padding: '32px 48px', textAlign: 'center' } }}>
            <FolderOutlined className="text-4xl sm:text-5xl text-gray-400 mb-4" />
            <h3 className="text-base sm:text-lg text-gray-900 mb-2">
              {searchQuery || statusFilter !== 'all'
                ? 'Không tìm thấy đơn ứng tuyển nào'
                : 'Bạn chưa ứng tuyển công việc nào'}
            </h3>
            <p className="text-sm sm:text-base text-gray-600 mb-4 sm:mb-6">
              {searchQuery || statusFilter !== 'all'
                ? 'Thử thay đổi bộ lọc hoặc tìm kiếm khác'
                : 'Khám phá các công việc phù hợp và bắt đầu ứng tuyển ngay'}
            </p>
            <Button size="small" onClick={() => navigate('/jobs')} className="w-full sm:w-auto" icon={<SearchOutlined />}>
              Tìm việc làm
            </Button>
          </Card>
        )}

        {/* Application Detail Modal */}
        <Modal
          open={!!selectedApp}
          onCancel={() => setSelectedApp(null)}
          title="Chi tiết đơn ứng tuyển"
          footer={null}
          width={800}
          className="glassmorphism-modal"
        >
          {selectedApplication && selectedJob && (
            <>
              <div className="space-y-6">
                {/* Job Info */}
                <div>
                  <h3 className="text-gray-900 mb-3">Thông tin công việc</h3>
                  <div className="p-4 bg-gray-50 rounded-lg space-y-2">
                    <p className="text-gray-900">{selectedJob.title}</p>
                    <p className="text-gray-600">{selectedCompanyName}</p>
                    <div className="flex flex-wrap gap-4 text-gray-600">
                      <div className="flex items-center gap-1">
                        <EnvironmentOutlined className="text-base" />
                        <span>{selectedJob.location}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <DollarOutlined className="text-base" />
                        <span>{formatSalary(selectedJob)}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Application Details */}
                <div>
                  <h3 className="text-gray-900 mb-3">Chi tiết ứng tuyển</h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <span className="text-gray-700">Ngày ứng tuyển</span>
                      <span className="text-gray-900">
                        {new Date(selectedApplication.createdAt).toLocaleDateString('vi-VN')}
                      </span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <span className="text-gray-700">Trạng thái</span>
                      <Tag color={statusConfig[selectedApplication.status as keyof typeof statusConfig].color}>
                        <span className="flex items-center gap-1">
                          {statusConfig[selectedApplication.status as keyof typeof statusConfig].icon}
                          {statusConfig[selectedApplication.status as keyof typeof statusConfig].label}
                        </span>
                      </Tag>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <span className="text-gray-700">CV sử dụng</span>
                      {selectedCV ? (
                        <button
                          onClick={() => navigate(`/candidate/cvs/${selectedCV.id}`)}
                          className="text-blue-600 hover:underline"
                        >
                          {selectedCV.title || 'CV không có tiêu đề'}
                        </button>
                      ) : (
                        <span className="text-gray-500">CV không tồn tại</span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Cover Letter */}
                {selectedApplication.coverLetter && (
                  <div>
                    <h3 className="text-gray-900 mb-3">Thư xin việc</h3>
                    <div className="p-4 bg-gray-50 rounded-lg">
                      <p className="text-gray-700 whitespace-pre-wrap">
                        {selectedApplication.coverLetter}
                      </p>
                    </div>
                  </div>
                )}

                {/* Recruiter Notes */}
                {selectedApplication.notes && (
                  <div>
                    <h3 className="text-gray-900 mb-3">Ghi chú từ nhà tuyển dụng</h3>
                    <div className="p-4 bg-gradient-to-br from-blue-100 via-blue-200 to-blue-300 border border-blue-100 rounded-lg">
                      <div className="flex gap-2">
                        <ExclamationCircleOutlined className="text-blue-600 flex-shrink-0 mt-0.5" />
                        <p className="text-gray-700">{selectedApplication.notes}</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Actions */}
                <div className="flex gap-3 pt-4 border-t">
                  <Button
                    onClick={() => navigate(`/jobs/${selectedJob.id}`)}
                    className="flex-1"
                  >
                    Xem công việc
                  </Button>
                  {selectedApplication.status === AppStatus.PENDING && (
                    <Button
                      onClick={() => handleCancelApplication(selectedApplication.id)}
                      disabled={isWithdrawing === selectedApplication.id}
                      className="flex-1 text-red-600 hover:text-red-700"
                      icon={isWithdrawing === selectedApplication.id ? <Spin size="small" /> : <DeleteOutlined />}
                    >
                      {isWithdrawing === selectedApplication.id ? 'Đang hủy...' : 'Hủy đơn'}
                    </Button>
                  )}
                </div>
              </div>
            </>
          )}
        </Modal>
      </div>
    </div>
  );
}