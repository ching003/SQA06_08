import { React, useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router';
import { useAuth } from '../../contexts/AuthContext';
import { Application, AppStatus, Job } from '../../lib/types';
import { formatDistanceToNow } from 'date-fns';
import { vi } from 'date-fns/locale';
import { toast } from 'sonner';
import { jobService, applicationService } from '../../api/services';
import { Card, Button, Input, Tag, Tabs, Avatar, Spin } from 'antd';
import { CandidateProfileModal } from '../../components/recruiter/CandidateProfileModal';
import {
  ArrowLeftOutlined,
  SearchOutlined,
  EnvironmentOutlined,
  ProjectOutlined,
  UserOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  ClockCircleOutlined,
  MailOutlined,
  PhoneOutlined,
  FileTextOutlined,
} from '@ant-design/icons';

type ApplicationsTab = 'all' | 'pending' | 'reviewing' | 'accepted' | 'rejected';

export function JobApplicationsPage() {
  const { id: jobId } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [activeTab, setActiveTab] = useState<ApplicationsTab>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedApplication, setSelectedApplication] = useState<Application | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [job, setJob] = useState<Job | null>(null);
  const [applications, setApplications] = useState<Application[]>([]);

  // Fetch job and applications
  useEffect(() => {
    const fetchData = async () => {
      if (!jobId) {
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);

        // Fetch job details
        const jobData = await jobService.getJobById(jobId);
        setJob(jobData);

        // Fetch applications for this job
        const apps = await applicationService.getApplicationsByJob(jobId);
        setApplications(apps);
      } catch (error: any) {
        console.error('Failed to fetch data:', error);
        toast.error(error?.message || 'Không thể tải dữ liệu');
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [jobId]);

  if (isLoading) {
    return (
      <div className="min-h-screen py-8">
        <div className="max-w-6xl mx-auto px-4">
          <Card className="glassmorphism" styles={{ body: { padding: '48px', textAlign: 'center' } }}>
            <Spin size="large" className="mb-4" />
            <p className="text-base text-gray-600">Đang tải dữ liệu...</p>
          </Card>
        </div>
      </div>
    );
  }

  if (!job) {
    return (
      <div className="min-h-screen py-8">
        <div className="max-w-6xl mx-auto px-4 text-center">
          <h2 className="text-lg text-gray-900 mb-2">Không tìm thấy tin tuyển dụng</h2>
          <Button onClick={() => navigate('/recruiter/jobs')}>
            Quay lại danh sách
          </Button>
        </div>
      </div>
    );
  }

  const statusConfig = {
    [AppStatus.PENDING]: {
      label: 'Mới',
      color: 'blue',
      icon: ClockCircleOutlined,
    },
    [AppStatus.REVIEWING]: {
      label: 'Đang xem xét',
      color: 'orange',
      icon: ClockCircleOutlined,
    },
    [AppStatus.ACCEPTED]: {
      label: 'Đã duyệt',
      color: 'green',
      icon: CheckCircleOutlined,
    },
    [AppStatus.REJECTED]: {
      label: 'Từ chối',
      color: 'red',
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
      };
      if (statusMap[activeTab] && app.status !== statusMap[activeTab]) {
        return false;
      }
    }

    // Filter by search
    if (searchQuery) {
      const candidate = app.user;
      const searchLower = searchQuery.toLowerCase();
      return (
        candidate?.fullName?.toLowerCase().includes(searchLower) ||
        candidate?.email.toLowerCase().includes(searchLower)
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
    };

    if (tab === 'all') return applications.length;
    return applications.filter(app => app.status === statusMap[tab]).length;
  };

  const handleApprove = async (applicationId: string) => {
    try {
      await applicationService.updateApplicationStatus(applicationId, {
        status: AppStatus.ACCEPTED,
      });

      setApplications(prev =>
        prev.map(app =>
          app.id === applicationId
            ? { ...app, status: AppStatus.ACCEPTED }
            : app
        )
      );
      toast.success('Đã phê duyệt đơn ứng tuyển');
    } catch (error: any) {
      console.error('Failed to approve application:', error);
      toast.error(error?.message || 'Không thể phê duyệt đơn ứng tuyển');
    }
  };

  const handleReject = async (applicationId: string) => {
    try {
      await applicationService.updateApplicationStatus(applicationId, {
        status: AppStatus.REJECTED,
      });

      setApplications(prev =>
        prev.map(app =>
          app.id === applicationId
            ? { ...app, status: AppStatus.REJECTED }
            : app
        )
      );
      toast.success('Đã từ chối đơn ứng tuyển');
    } catch (error: any) {
      console.error('Failed to reject application:', error);
      toast.error(error?.message || 'Không thể từ chối đơn ứng tuyển');
    }
  };

  const handleStatusChange = async (applicationId: string, status: AppStatus) => {
    try {
      await applicationService.updateApplicationStatus(applicationId, {
        status,
      });

      setApplications(prev =>
        prev.map(app =>
          app.id === applicationId ? { ...app, status } : app
        )
      );
      toast.success(`Đã chuyển trạng thái sang "${statusConfig[status].label}"`);
    } catch (error: any) {
      console.error('Failed to update application status:', error);
      toast.error(error?.message || 'Không thể cập nhật trạng thái');
    }
  };

  return (
    <div className="min-h-screen py-8">
      <div className="max-w-6xl mx-auto px-4">
        {/* Back Button */}
        <Button
          type="text"
          icon={<ArrowLeftOutlined />}
          onClick={() => navigate(-1)}
          className="mb-8"
        >
          Quay lại
        </Button>

        {/* Job Info Header */}
        <Card className="glassmorphism mb-6" styles={{ body: { padding: '24px' } }}>
          <div className="flex items-start gap-4">
            <div className="hidden md:block h-16 w-16 bg-gray-100 rounded-lg flex-shrink-0 flex items-center justify-center">
              <ProjectOutlined className="text-2xl text-gray-400" />
            </div>
            <div className="flex-1 min-w-0">
              <h1 className="text-xl text-gray-900 mb-2">{job.title}</h1>
              <div className="flex flex-wrap gap-4 text-sm text-gray-600 mb-3">
                <div className="flex items-center gap-1">
                  <EnvironmentOutlined className="text-base" />
                  <span>{job.location}</span>
                </div>
                <div className="flex items-center gap-1">
                  <UserOutlined className="text-base" />
                  <span>{applications.length} ứng viên</span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Tag color="blue">
                  {getTabCount('pending')} đơn mới
                </Tag>
                <Tag color="orange">
                  {getTabCount('reviewing')} đang xem xét
                </Tag>
                <Tag color="green">
                  {getTabCount('accepted')} đã duyệt
                </Tag>
              </div>
            </div>
            <Button
              onClick={() => navigate(`/recruiter/jobs/${jobId}`)}
            >
              Xem tin tuyển dụng
            </Button>
          </div>
        </Card>

        {/* Filters */}
        <Card className="glassmorphism mb-6" styles={{ body: { padding: '24px' } }}>
          <Tabs
            activeKey={activeTab}
            onChange={(v) => setActiveTab(v as ApplicationsTab)}
            items={[
              { key: 'all', label: `Tất cả (${getTabCount('all')})` },
              { key: 'pending', label: `Mới (${getTabCount('pending')})` },
              { key: 'reviewing', label: `Đang xét (${getTabCount('reviewing')})` },
              { key: 'accepted', label: `Đã duyệt (${getTabCount('accepted')})` },
              { key: 'rejected', label: `Từ chối (${getTabCount('rejected')})` },
            ]}
          />
          <div className="mt-4">
            <Input
              placeholder="Tìm ứng viên..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              prefix={<SearchOutlined className="text-gray-400" />}
              size="middle"
            />
          </div>
        </Card>

        {/* Applications List */}
        {filteredApplications.length > 0 ? (
          <div className="space-y-4 mt-6">
            {filteredApplications.map((application) => {
              const candidate = application.user;
              if (!candidate) return null;

              const StatusIcon = statusConfig[application.status].icon;

              return (
                <Card key={application.id} className="glassmorphism hover:shadow-md transition-shadow" styles={{ body: { padding: '24px' } }}>
                  <div className="flex items-start gap-4">
                    {/* Avatar */}
                    <Avatar
                      size={64}
                      src={candidate.avatarUrl}
                      className="flex-shrink-0 bg-blue-600"
                    >
                      {candidate.fullName?.split(' ').map(n => n[0]).join('') || 'U'}
                    </Avatar>

                    {/* Candidate Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-4 mb-2">
                        <div className="flex-1 min-w-0">
                          <h3 className="text-lg text-gray-900 mb-1">{candidate.fullName}</h3>
                          <div className="flex items-center gap-2 mb-2">
                            <Tag color={statusConfig[application.status].color} icon={<StatusIcon />}>
                              {statusConfig[application.status].label}
                            </Tag>
                          </div>
                        </div>
                      </div>

                      {/* Contact Info */}
                      <div className="flex flex-wrap gap-4 text-sm text-gray-600 mb-3">
                        <div className="flex items-center gap-1">
                          <MailOutlined className="text-base" />
                          <span>{candidate.email}</span>
                        </div>
                        {candidate.phoneNumber && (
                          <div className="flex items-center gap-1">
                            <PhoneOutlined className="text-base" />
                            <span>{candidate.phoneNumber}</span>
                          </div>
                        )}
                      </div>

                      {/* Application Date */}
                      <div className="flex items-center gap-1 text-sm text-gray-500 mb-4">
                        <ClockCircleOutlined className="text-base" />
                        <span>
                          Ứng tuyển {formatDistanceToNow(new Date(application.createdAt), {
                            addSuffix: true,
                            locale: vi
                          })}
                        </span>
                      </div>

                      {/* Cover Letter Preview */}
                      {application.coverLetter && (
                        <div className="bg-gradient-to-br from-blue-100 via-blue-200 to-blue-300 rounded-lg p-4 mb-4">
                          <div className="flex items-center gap-2 mb-2 text-sm">
                            <FileTextOutlined className="text-base text-gray-600" />
                            <span className="text-gray-900">Thư giới thiệu</span>
                          </div>
                          <p className="text-sm text-gray-600 line-clamp-2">
                            {application.coverLetter}
                          </p>
                        </div>
                      )}

                      {/* Action Buttons */}
                      <div className="flex flex-wrap gap-2">
                        <Button
                          size="small"
                          onClick={() => setSelectedApplication(application)}
                        >
                          Xem hồ sơ chi tiết
                        </Button>

                        {application.status === AppStatus.PENDING && (
                          <Button
                            size="small"
                            onClick={() => handleStatusChange(application.id, AppStatus.REVIEWING)}
                          >
                            Đánh dấu đang xét
                          </Button>
                        )}

                        {application.status !== AppStatus.ACCEPTED && (
                          <Button
                            size="small"
                            icon={<CheckCircleOutlined />}
                            onClick={() => handleApprove(application.id)}
                            className="text-green-600 hover:text-green-700"
                          >
                            Phê duyệt
                          </Button>
                        )}

                        {application.status !== AppStatus.REJECTED && (
                          <Button
                            size="small"
                            danger
                            icon={<CloseCircleOutlined />}
                            onClick={() => handleReject(application.id)}
                          >
                            Từ chối
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
          <Card className="glassmorphism" styles={{ body: { padding: '48px', textAlign: 'center' } }}>
            <UserOutlined className="text-5xl text-gray-400 mb-4" />
            <h3 className="text-lg text-gray-900 mb-2">
              {searchQuery ? 'Không tìm thấy ứng viên nào' : 'Chưa có đơn ứng tuyển nào'}
            </h3>
            <p className="text-base text-gray-600">
              {searchQuery
                ? 'Thử tìm kiếm với từ khóa khác'
                : 'Đơn ứng tuyển sẽ xuất hiện ở đây khi có ứng viên nộp hồ sơ'}
            </p>
          </Card>
        )}
      </div>

      {/* Candidate Profile Modal */}
      {selectedApplication && (
        <CandidateProfileModal
          application={selectedApplication}
          jobTitle={job.title}
          isOpen={true}
          onClose={() => setSelectedApplication(null)}
          onUpdateStatus={handleStatusChange}
        />
      )}
    </div>
  );
}