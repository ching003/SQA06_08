import { React, useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { useAuth } from '../../contexts/AuthContext';
import { Application, AppStatus, Job } from '../../lib/types';
import { formatDistanceToNow } from 'date-fns';
import { vi } from 'date-fns/locale';
import { toast } from 'sonner';
import { jobService, applicationService } from '../../api/services';
import { Card, Button, Input, Tag, Tabs, Select, Dropdown, Menu, Avatar, Spin } from 'antd';
import type { MenuProps } from 'antd';
import { CandidateProfileModal } from '../../components/recruiter/CandidateProfileModal';
import {
  SearchOutlined,
  UserOutlined,
  MailOutlined,
  PhoneOutlined,
  FileTextOutlined,
  EyeOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  MoreOutlined,
  DownloadOutlined,
  ClockCircleOutlined,
  ProjectOutlined,
  FilterOutlined,
} from '@ant-design/icons';

const { Option } = Select;

type ApplicationsTab = 'all' | 'pending' | 'reviewing' | 'accepted' | 'rejected' | 'cancelled';

interface ApplicationWithDetails extends Application {
  candidate: {
    id: string;
    name: string;
    email: string;
    phone?: string;
    avatar?: string;
  };
  job: {
    id: string;
    title: string;
    companyId: string;
  };
  cvTitle: string;
}

export function ApplicationsListPage() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState<ApplicationsTab>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedJob, setSelectedJob] = useState<string>('all');
  const [selectedApplication, setSelectedApplication] = useState<ApplicationWithDetails | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [companyJobs, setCompanyJobs] = useState<Job[]>([]);
  const [applications, setApplications] = useState<ApplicationWithDetails[]>([]);

  // API returns company.id (nested) but frontend type expects companyId (flat)
  const companyId = user?.companyMember?.companyId || user?.companyMember?.company?.id;

  // Fetch company jobs and applications
  useEffect(() => {
    const fetchData = async () => {
      if (!companyId) {
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);

        // Fetch company jobs
        const jobsResponse = await jobService.getJobsByCompany(companyId);
        const jobs = Array.isArray(jobsResponse.items) ? jobsResponse.items : [];
        setCompanyJobs(jobs);

        // Fetch applications for all jobs
        const allApplications: ApplicationWithDetails[] = [];
        for (const job of jobs) {
          try {
            const jobApplications = await applicationService.getApplicationsByJob(job.id);
            for (const app of jobApplications) {
              allApplications.push({
                ...app,
                candidate: {
                  id: app.user?.id || '',
                  name: app.user?.fullName || 'Unknown',
                  email: app.user?.email || '',
                  phone: app.user?.phoneNumber || undefined,
                  avatar: app.user?.avatarUrl || undefined,
                },
                job: {
                  id: job.id,
                  title: job.title,
                  companyId: job.companyId,
                },
                cvTitle: app.cv?.title || 'CV',
              });
            }
          } catch (error) {
            console.error(`Failed to fetch applications for job ${job.id}:`, error);
          }
        }

        // Sort by createdAt descending
        allApplications.sort((a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );

        setApplications(allApplications);
      } catch (error: any) {
        console.error('Failed to fetch applications:', error);
        toast.error(error?.message || 'Không thể tải danh sách đơn ứng tuyển');
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [companyId]);

  const statusConfig = {
    [AppStatus.PENDING]: {
      label: 'Chờ xử lý',
      color: 'orange',
      icon: ClockCircleOutlined,
    },
    [AppStatus.REVIEWING]: {
      label: 'Đang xem xét',
      color: 'blue',
      icon: EyeOutlined,
    },
    [AppStatus.ACCEPTED]: {
      label: 'Đã chấp nhận',
      color: 'green',
      icon: CheckCircleOutlined,
    },
    [AppStatus.REJECTED]: {
      label: 'Đã từ chối',
      color: 'red',
      icon: CloseCircleOutlined,
    },
    [AppStatus.CANCELLED]: {
      label: 'Đã rút đơn',
      color: 'default',
      icon: CloseCircleOutlined,
    },
  };

  const filteredApplications = applications.filter((app) => {
    // Filter by tab
    if (activeTab !== 'all') {
      const statusMap: Record<ApplicationsTab, AppStatus | null> = {
        all: null,
        pending: AppStatus.PENDING,
        reviewing: AppStatus.REVIEWING,
        accepted: AppStatus.ACCEPTED,
        rejected: AppStatus.REJECTED,
        cancelled: AppStatus.CANCELLED,
      };
      if (statusMap[activeTab] && app.status !== statusMap[activeTab]) {
        return false;
      }
    }

    // Filter by job
    if (selectedJob !== 'all' && app.jobId !== selectedJob) {
      return false;
    }

    // Filter by search
    if (searchQuery) {
      const searchLower = searchQuery.toLowerCase();
      return (
        app.candidate.name.toLowerCase().includes(searchLower) ||
        app.candidate.email.toLowerCase().includes(searchLower) ||
        app.job.title.toLowerCase().includes(searchLower) ||
        app.cvTitle.toLowerCase().includes(searchLower)
      );
    }

    return true;
  });

  const getTabCount = (tab: ApplicationsTab) => {
    const statusMap: Record<ApplicationsTab, AppStatus | null> = {
      all: null,
      pending: AppStatus.PENDING,
      reviewing: AppStatus.REVIEWING,
      accepted: AppStatus.ACCEPTED,
      rejected: AppStatus.REJECTED,
      cancelled: AppStatus.CANCELLED,
    };

    let filtered = applications;

    // Apply job filter
    if (selectedJob !== 'all') {
      filtered = filtered.filter(app => app.jobId === selectedJob);
    }

    if (tab === 'all') return filtered.length;
    return filtered.filter(app => app.status === statusMap[tab]).length;
  };

  const handleUpdateStatus = async (appId: string, newStatus: AppStatus) => {
    try {
      await applicationService.updateApplicationStatus(appId, {
        status: newStatus,
      });

      // Update local state
      setApplications(prev =>
        prev.map(app =>
          app.id === appId ? { ...app, status: newStatus } : app
        )
      );

      const statusMessages = {
        [AppStatus.REVIEWING]: 'Đã chuyển sang trạng thái đang xem xét',
        [AppStatus.ACCEPTED]: 'Đã chấp nhận ứng viên',
        [AppStatus.REJECTED]: 'Đã từ chối ứng viên',
      };

      toast.success(statusMessages[newStatus] || 'Đã cập nhật trạng thái');
    } catch (error: any) {
      console.error('Failed to update application status:', error);
      toast.error(error?.message || 'Không thể cập nhật trạng thái');
    }
  };

  const handleBulkAction = async (action: 'accept' | 'reject') => {
    const selectedApps = filteredApplications.filter(app =>
      app.status === AppStatus.PENDING || app.status === AppStatus.REVIEWING
    );

    if (selectedApps.length === 0) {
      toast.error('Không có đơn nào phù hợp để thực hiện hành động này');
      return;
    }

    const newStatus = action === 'accept' ? AppStatus.ACCEPTED : AppStatus.REJECTED;
    const message = action === 'accept' ? 'chấp nhận' : 'từ chối';

    if (!confirm(`Bạn có chắc muốn ${message} ${selectedApps.length} đơn ứng tuyển đang hiển thị?`)) {
      return;
    }

    try {
      // Update all applications
      const updatePromises = selectedApps.map(app =>
        applicationService.updateApplicationStatus(app.id, { status: newStatus })
      );

      await Promise.all(updatePromises);

      // Update local state
      setApplications(prev =>
        prev.map(app =>
          selectedApps.some(sa => sa.id === app.id)
            ? { ...app, status: newStatus }
            : app
        )
      );

      toast.success(`Đã ${message} ${selectedApps.length} đơn ứng tuyển`);
    } catch (error: any) {
      console.error('Failed to update applications:', error);
      toast.error(error?.message || 'Không thể cập nhật trạng thái');
    }
  };

  const handleOpenModal = (app: ApplicationWithDetails) => {
    setSelectedApplication(app);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedApplication(null);
  };

  if (!companyId) {
    return (
      <div className="min-h-screen py-8">
        <div className="max-w-6xl mx-auto px-4">
          <Card className="glassmorphism" styles={{ body: { padding: '48px', textAlign: 'center' } }}>
            <ProjectOutlined className="text-4xl text-gray-400 mb-4" />
            <h2 className="text-lg text-gray-900 mb-2">Không tìm thấy công ty</h2>
            <p className="text-base text-gray-600">Bạn chưa thuộc công ty nào.</p>
          </Card>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen py-8">
        <div className="max-w-6xl mx-auto px-4">
          <Card className="glassmorphism" styles={{ body: { padding: '48px', textAlign: 'center' } }}>
            <Spin size="large" className="mb-4" />
            <p className="text-base text-gray-600">Đang tải danh sách đơn ứng tuyển...</p>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-8">
      <div className="max-w-6xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Quản lý đơn ứng tuyển</h1>
          <p className="text-gray-600">
            Xem và quản lý tất cả đơn ứng tuyển từ ứng viên
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
          <Card className="glassmorphism" styles={{ body: { padding: '16px', textAlign: 'center' } }}>
            <div className="text-lg text-gray-900 mb-1">{getTabCount('all')}</div>
            <div className="text-sm text-gray-600">Tổng số</div>
          </Card>
          <Card className="glassmorphism" styles={{ body: { padding: '16px', textAlign: 'center' } }}>
            <div className="text-lg text-yellow-600 mb-1">{getTabCount('pending')}</div>
            <div className="text-sm text-gray-600">Chờ xét</div>
          </Card>
          <Card className="glassmorphism" styles={{ body: { padding: '16px', textAlign: 'center' } }}>
            <div className="text-lg text-blue-600 mb-1">{getTabCount('reviewing')}</div>
            <div className="text-sm text-gray-600">Đang xét</div>
          </Card>
          <Card className="glassmorphism" styles={{ body: { padding: '16px', textAlign: 'center' } }}>
            <div className="text-lg text-green-600 mb-1">{getTabCount('accepted')}</div>
            <div className="text-sm text-gray-600">Chấp nhận</div>
          </Card>
          <Card className="glassmorphism" styles={{ body: { padding: '16px', textAlign: 'center' } }}>
            <div className="text-lg text-red-600 mb-1">{getTabCount('rejected')}</div>
            <div className="text-sm text-gray-600">Từ chối</div>
          </Card>
        </div>

        {/* Filters */}
        <Card className="glassmorphism mb-6" styles={{ body: { padding: '24px' } }}>
          <Tabs
            activeKey={activeTab}
            onChange={(v) => setActiveTab(v as ApplicationsTab)}
            items={[
              { key: 'all', label: `Tất cả (${getTabCount('all')})` },
              { key: 'pending', label: `Chờ xét (${getTabCount('pending')})` },
              { key: 'reviewing', label: `Đang xét (${getTabCount('reviewing')})` },
              { key: 'accepted', label: `Chấp nhận (${getTabCount('accepted')})` },
              { key: 'rejected', label: `Từ chối (${getTabCount('rejected')})` },
              { key: 'cancelled', label: `Đã rút (${getTabCount('cancelled')})` },
            ]}
          />
          <div className="mt-4">
            <Input
              placeholder="Tìm ứng viên, công việc..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              prefix={<SearchOutlined className="text-gray-400" />}
              size="middle"
            />
          </div>
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pt-4 mt-4 border-t">
            <div className="flex items-center gap-2">
              <FilterOutlined className="text-base text-gray-600" />
              <Select
                value={selectedJob}
                onChange={setSelectedJob}
                style={{ width: 280 }}
                placeholder="Lọc theo công việc"
              >
                <Option value="all">Tất cả công việc</Option>
                {companyJobs.map(job => (
                  <Option key={job.id} value={job.id}>
                    {job.title}
                  </Option>
                ))}
              </Select>
            </div>
          </div>
        </Card>

        {/* Applications List */}
        {filteredApplications.length > 0 ? (
          <div className="space-y-4 mt-6">
            {filteredApplications.map((app) => {
              const StatusIcon = statusConfig[app.status].icon;

              return (
                <Card key={app.id} className="glassmorphism hover:shadow-md transition-shadow" styles={{ body: { padding: '24px' } }}>
                  <div className="flex items-start gap-4">
                    {/* Avatar */}
                    <Avatar
                      size={48}
                      src={app.candidate.avatar}
                      className="bg-blue-600 flex-shrink-0"
                    >
                      {app.candidate.name.charAt(0).toUpperCase()}
                    </Avatar>

                    {/* Candidate Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-4 mb-3">
                        <div className="flex-1 min-w-0">
                          <button
                            onClick={() => navigate(`/recruiter/cvs/${app.cvId}`)}
                            className="text-gray-900 hover:text-blue-600 mb-2 block"
                          >
                            {app.candidate.name}
                          </button>
                          <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-gray-600 mb-2">
                            <div className="flex items-center gap-1">
                              <ProjectOutlined className="text-base" />
                              <button
                                onClick={() => navigate(`/recruiter/jobs/${app.job.id}/applications`)}
                                className="hover:text-blue-600"
                              >
                                {app.job.title}
                              </button>
                            </div>
                            <div className="flex items-center gap-1">
                              <MailOutlined className="text-base" />
                              <span className="truncate">{app.candidate.email}</span>
                            </div>
                            {app.candidate.phone && (
                              <div className="flex items-center gap-1">
                                <PhoneOutlined className="text-base" />
                                <span>{app.candidate.phone}</span>
                              </div>
                            )}
                          </div>
                          <div className="flex items-center gap-2">
                            <Tag color={statusConfig[app.status].color} icon={<StatusIcon />}>
                              {statusConfig[app.status].label}
                            </Tag>
                            <span className="text-sm text-gray-500">
                              Nộp {formatDistanceToNow(new Date(app.createdAt), {
                                addSuffix: true,
                                locale: vi
                              })}
                            </span>
                          </div>
                        </div>

                        {/* Actions Dropdown */}
                        <Dropdown
                          menu={{
                            items: [
                              {
                                key: 'view',
                                label: 'Xem hồ sơ',
                                icon: <EyeOutlined />,
                                onClick: () => navigate(`/recruiter/cvs/${app.cvId}`),
                              },
                              {
                                key: 'download',
                                label: 'Tải CV',
                                icon: <DownloadOutlined />,
                                onClick: () => window.open('#', '_blank'),
                              },
                              ...(app.status !== AppStatus.REVIEWING && app.status !== AppStatus.CANCELLED ? [{
                                key: 'reviewing',
                                label: 'Đánh dấu đang xét',
                                icon: <EyeOutlined />,
                                onClick: () => handleUpdateStatus(app.id, AppStatus.REVIEWING),
                              }] : []),
                              ...(app.status !== AppStatus.ACCEPTED && app.status !== AppStatus.CANCELLED ? [{
                                key: 'accept',
                                label: 'Chấp nhận',
                                icon: <CheckCircleOutlined />,
                                onClick: () => handleUpdateStatus(app.id, AppStatus.ACCEPTED),
                              }] : []),
                              ...(app.status !== AppStatus.REJECTED && app.status !== AppStatus.CANCELLED ? [{
                                key: 'reject',
                                label: 'Từ chối',
                                icon: <CloseCircleOutlined />,
                                danger: true,
                                onClick: () => handleUpdateStatus(app.id, AppStatus.REJECTED),
                              }] : []),
                            ] as MenuProps['items'],
                          }}
                          trigger={['click']}
                          placement="bottomRight"
                        >
                          <Button type="text" size="small" icon={<MoreOutlined />} />
                        </Dropdown>
                      </div>

                      {/* CV Info */}
                      <div className="flex items-center gap-2 text-sm text-gray-600 mb-3">
                        <FileTextOutlined className="text-base" />
                        <span>CV: {app.cvTitle}</span>
                      </div>

                      {/* Cover Letter Preview */}
                      {app.coverLetter && (
                        <div className="bg-gradient-to-br from-blue-100 via-blue-200 to-blue-300 rounded-lg p-3 mb-3">
                          <div className="flex items-center gap-2 mb-2 text-sm text-gray-700">
                            <FileTextOutlined className="text-base" />
                            <span>Thư xin việc:</span>
                          </div>
                          <p className="text-sm text-gray-600 line-clamp-2">
                            {app.coverLetter}
                          </p>
                        </div>
                      )}

                      {/* Quick Actions */}
                      <div className="flex flex-wrap gap-2">
                        <Button
                          size="small"
                          icon={<EyeOutlined />}
                          onClick={() => handleOpenModal(app)}
                        >
                          Xem hồ sơ
                        </Button>
                        {app.status !== AppStatus.ACCEPTED && app.status !== AppStatus.REJECTED && app.status !== AppStatus.CANCELLED && (
                          <>
                            <Button
                              size="small"
                              icon={<CheckCircleOutlined />}
                              onClick={() => handleUpdateStatus(app.id, AppStatus.ACCEPTED)}
                              className="text-green-600 hover:text-green-700"
                            >
                              Chấp nhận
                            </Button>
                            <Button
                              size="small"
                              danger
                              icon={<CloseCircleOutlined />}
                              onClick={() => handleUpdateStatus(app.id, AppStatus.REJECTED)}
                            >
                              Từ chối
                            </Button>
                          </>
                        )}
                        {app.status === AppStatus.CANCELLED && (
                          <span className="text-sm text-gray-500 italic">Ứng viên đã rút đơn</span>
                        )}
                      </div>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        ) : (
          <Card className="glassmorphism" styles={{ body: { padding: '48px', textAlign: 'center' } }}>
            <UserOutlined className="text-5xl text-gray-400 mb-4" />
            <h3 className="text-lg text-gray-900 mb-2">
              {searchQuery || selectedJob !== 'all'
                ? 'Không tìm thấy đơn ứng tuyển nào'
                : 'Chưa có đơn ứng tuyển nào'}
            </h3>
            <p className="text-base text-gray-600">
              {searchQuery || selectedJob !== 'all'
                ? 'Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm'
                : 'Các đơn ứng tuyển sẽ xuất hiện ở đây khi có ứng viên nộp đơn'}
            </p>
          </Card>
        )}

        {/* Candidate Profile Modal */}
        {selectedApplication && (
          <CandidateProfileModal
            application={selectedApplication}
            jobTitle={selectedApplication.job.title}
            isOpen={isModalOpen}
            onClose={handleCloseModal}
            onUpdateStatus={handleUpdateStatus}
          />
        )}
      </div>
    </div>
  );
}