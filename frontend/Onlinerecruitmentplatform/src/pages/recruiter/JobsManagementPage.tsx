import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { useAuth } from '../../contexts/AuthContext';
import { Job, JobStatus } from '../../lib/types';
import { formatDistanceToNow } from 'date-fns';
import { vi } from 'date-fns/locale';
import { toast } from 'sonner';
import { jobService } from '../../api/services';
import { Card, Button, Input, Tag, Tabs, Modal, Spin, Typography } from 'antd';
import { ExclamationCircleOutlined } from '@ant-design/icons';
import {
  PlusOutlined,
  SearchOutlined,
  ProjectOutlined,
  EnvironmentOutlined,
  UserOutlined,
  CalendarOutlined,
  EditOutlined,
  ReloadOutlined,
  CloseCircleOutlined,
  DollarOutlined,
  ClockCircleOutlined,
  ThunderboltOutlined,
  CheckCircleOutlined,
  FileTextOutlined,
  GiftOutlined,
  SendOutlined,
} from '@ant-design/icons';
import {
  getExperienceLevelLabel,
  getJobTypeLabel,
  getIndustryLabel,
  formatSalaryRange
} from '../../lib/constants';

type JobsTab = 'all' | 'active' | 'inactive' | 'draft' | 'expired';

// Job interface từ API đã bao gồm applicationCount, company, salary, benefits, requirements

export function JobsManagementPage() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState<JobsTab>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Repost modal state
  const [repostModal, setRepostModal] = useState<{
    open: boolean;
    jobId: string | null;
    jobTitle: string;
  }>({
    open: false,
    jobId: null,
    jobTitle: '',
  });
  const [repostExpiresAt, setRepostExpiresAt] = useState('');
  const [isReposting, setIsReposting] = useState(false);

  const [jobs, setJobs] = useState<Job[]>([]);

  // Get company ID - API returns company.id (nested) but frontend type expects companyId (flat)
  const companyId = user?.companyMember?.companyId || user?.companyMember?.company?.id;

  // Fetch jobs from API
  useEffect(() => {
    const fetchJobs = async () => {
      if (!companyId) {
        toast.error('Bạn chưa thuộc công ty nào');
        return;
      }

      try {
        setIsLoading(true);
        const response = await jobService.getJobsByCompany(companyId);
        // jobService.getJobsByCompany now returns PaginatedResponse<Job> with items array
        const jobsList = response.items || [];
        setJobs(jobsList);
      } catch (error: any) {
        console.error('Failed to fetch jobs:', error);
        toast.error(error?.message || 'Không thể tải danh sách việc làm');
        setJobs([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchJobs();
  }, [user]);

  const statusConfig: Record<JobStatus, { label: string; color: string }> = {
    [JobStatus.ACTIVE]: {
      label: 'Đang hiển thị',
      color: 'green',
    },
    [JobStatus.INACTIVE]: {
      label: 'Đã đóng',
      color: 'default',
    },
    [JobStatus.DRAFT]: {
      label: 'Lưu nháp',
      color: 'default',
    },
    [JobStatus.EXPIRED]: {
      label: 'Hết hạn',
      color: 'orange',
    },
    [JobStatus.CLOSED]: {
      label: 'Đã đóng',
      color: 'red',
    },
    [JobStatus.PENDING]: {
      label: 'Chờ duyệt',
      color: 'gold',
    },
    [JobStatus.APPROVED]: {
      label: 'Đã duyệt',
      color: 'blue',
    },
    [JobStatus.REJECTED]: {
      label: 'Từ chối',
      color: 'red',
    },
    [JobStatus.LOCKED]: {
      label: 'Bị khóa',
      color: 'red',
    },
  };

  const filteredJobs = jobs.filter((job) => {
    // Filter by tab
    if (activeTab !== 'all') {
      const statusMap: Record<JobsTab, JobStatus | null> = {
        all: null,
        active: JobStatus.ACTIVE,
        inactive: JobStatus.INACTIVE,
        draft: JobStatus.DRAFT,
        expired: JobStatus.EXPIRED,
      };
      if (statusMap[activeTab] && job.status !== statusMap[activeTab]) {
        return false;
      }
    }

    // Filter by search
    if (searchQuery) {
      const searchLower = searchQuery.toLowerCase();
      return job.title.toLowerCase().includes(searchLower);
    }

    return true;
  });

  // Refresh jobs list from API
  const refreshJobs = async () => {
    if (!companyId) return;
    try {
      const response = await jobService.getJobsByCompany(companyId);
      setJobs(response.items || []);
    } catch (error) {
      console.error('Failed to refresh jobs:', error);
    }
  };

  const handleCloseJob = async (jobId: string) => {
    try {
      await jobService.closeJob(jobId);
      toast.success('Đã đóng tin tuyển dụng');
      await refreshJobs(); // Refresh to get latest data
    } catch (error: any) {
      console.error('Failed to close job:', error);
      toast.error(error?.message || 'Không thể đóng tin tuyển dụng');
    }
  };

  // Open repost modal
  const handleRepost = (job: Job) => {
    // Set default expires date to 30 days from now
    const defaultDate = new Date();
    defaultDate.setDate(defaultDate.getDate() + 30);
    setRepostExpiresAt(defaultDate.toISOString().split('T')[0]);

    setRepostModal({
      open: true,
      jobId: job.id,
      jobTitle: job.title,
    });
  };

  // Confirm repost with selected date
  const confirmRepost = async () => {
    if (!repostModal.jobId) return;

    setIsReposting(true);
    try {
      await jobService.repostJob(repostModal.jobId, {
        expiresAt: repostExpiresAt ? new Date(repostExpiresAt).toISOString() : undefined,
      });
      toast.success('Đã đăng lại tin tuyển dụng');
      setRepostModal({ open: false, jobId: null, jobTitle: '' });
      await refreshJobs();
    } catch (error: any) {
      console.error('Failed to repost job:', error);
      toast.error(error?.message || 'Không thể tái đăng tin tuyển dụng');
    } finally {
      setIsReposting(false);
    }
  };

  const handlePublishDraft = async (jobId: string) => {
    try {
      await jobService.updateJob(jobId, { status: JobStatus.ACTIVE });
      toast.success('Đã đăng tin tuyển dụng');
      await refreshJobs(); // Refresh to get latest data
    } catch (error: any) {
      console.error('Failed to publish draft:', error);
      toast.error(error?.message || 'Không thể đăng tin tuyển dụng');
    }
  };



  const getTabCount = (tab: JobsTab) => {
    const statusMap: Record<JobsTab, JobStatus | null> = {
      all: null,
      active: JobStatus.ACTIVE,
      inactive: JobStatus.INACTIVE,
      draft: JobStatus.DRAFT,
      expired: JobStatus.EXPIRED,
    };

    if (tab === 'all') return jobs.length;
    return jobs.filter(job => job.status === statusMap[tab]).length;
  };

  return (
    <div className="min-h-screen py-8">
      <div className="max-w-6xl mx-auto px-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Tin tuyển dụng</h1>
            <p className="text-gray-600">
              Quản lý các tin tuyển dụng của công ty
            </p>
          </div>
          <Button type="primary" icon={<PlusOutlined />} onClick={() => navigate('/recruiter/jobs/new')}>
            Tạo tin mới
          </Button>
        </div>

        {/* Tabs and Search */}
        <Card className="glassmorphism mb-6" styles={{ body: { padding: '24px' } }}>
          <Tabs
            activeKey={activeTab}
            onChange={(v) => setActiveTab(v as JobsTab)}
            items={[
              { key: 'all', label: `Tất cả (${getTabCount('all')})` },
              { key: 'active', label: `Đang hiển thị (${getTabCount('active')})` },
              { key: 'draft', label: `Lưu nháp (${getTabCount('draft')})` },
              { key: 'expired', label: `Hết hạn (${getTabCount('expired')})` },
              { key: 'inactive', label: `Đã đóng (${getTabCount('inactive')})` },
            ]}
          />
          <div className="mt-4">
            <Input
              placeholder="Tìm kiếm tin..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              prefix={<SearchOutlined className="text-gray-400" />}
              size="middle"
            />
          </div>
        </Card>

        {/* Jobs List */}
        {isLoading ? (
          <Card className="glassmorphism" styles={{ body: { padding: '48px', textAlign: 'center' } }}>
            <Spin size="large" className="mb-4" />
            <p className="text-base text-gray-600">Đang tải danh sách việc làm...</p>
          </Card>
        ) : filteredJobs.length > 0 ? (
          <div className="space-y-4">
            {filteredJobs.map((job) => {
              return (
                <Card key={job.id} className="glassmorphism hover:shadow-md transition-shadow" styles={{ body: { padding: '24px' } }}>
                  <div className="flex items-start gap-4">
                    {/* Company Logo */}
                    <div className="hidden md:block h-16 w-16 bg-gray-100 rounded-lg flex-shrink-0 overflow-hidden">
                      {job.company?.logoUrl ? (
                        <img src={job.company.logoUrl} alt={job.company.name} className="h-full w-full object-cover" />
                      ) : (
                        <div className="h-full w-full flex items-center justify-center">
                          <ProjectOutlined className="text-2xl text-gray-400" />
                        </div>
                      )}
                    </div>

                    {/* Job Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-4 mb-3">
                        <div className="flex-1 min-w-0">
                          <button
                            onClick={() => navigate(`/jobs/${job.id}`)}
                            className="text-lg font-semibold text-gray-900 hover:text-blue-600 mb-2 block text-left"
                          >
                            {job.title}
                          </button>
                          <div className="flex flex-wrap items-center gap-2">
                            <Tag color={statusConfig[job.status]?.color || 'default'}>
                              {statusConfig[job.status]?.label || job.status}
                            </Tag>
                            {job.urgent && (
                              <Tag color="red" icon={<ThunderboltOutlined />}>
                                Tuyển gấp
                              </Tag>
                            )}
                            {job.type && (
                              <Tag>
                                {getJobTypeLabel(job.type)}
                              </Tag>
                            )}
                            {job.experienceLevel && (
                              <Tag>
                                {getExperienceLevelLabel(job.experienceLevel)}
                              </Tag>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Job Details Grid */}
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm text-gray-600 mb-3">
                        {job.location && (
                          <div className="flex items-center gap-1.5">
                            <EnvironmentOutlined className="text-base text-gray-400 flex-shrink-0" />
                            <span className="truncate">{job.location}</span>
                          </div>
                        )}
                        <div className="flex items-center gap-1.5">
                          <DollarOutlined className="text-base text-green-500 flex-shrink-0" />
                          <span className="text-green-600 font-medium">
                            {job.salary
                              ? formatSalaryRange(
                                job.salary.minAmount,
                                job.salary.maxAmount,
                                job.salary.currency || 'VND',
                                job.salary.hideAmount || false,
                                job.salary.isNegotiable || false
                              )
                              : 'Thỏa thuận'}
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <UserOutlined className="text-base text-blue-500 flex-shrink-0" />
                          <span>{job.applicationCount || 0} ứng viên</span>
                        </div>
                        {job.industry && (
                          <div className="flex items-center gap-1.5">
                            <ProjectOutlined className="text-base text-gray-400 flex-shrink-0" />
                            <span className="truncate">{getIndustryLabel(job.industry)}</span>
                          </div>
                        )}
                      </div>

                      {/* Benefits & Requirements Count */}
                      <div className="flex flex-wrap gap-3 text-sm text-gray-500 mb-3">
                        {job.benefits && job.benefits.length > 0 && (
                          <div className="flex items-center gap-1.5">
                            <GiftOutlined className="text-base text-purple-500" />
                            <span>{job.benefits.length} phúc lợi</span>
                          </div>
                        )}
                        {job.requirements && job.requirements.length > 0 && (
                          <div className="flex items-center gap-1.5">
                            <FileTextOutlined className="text-base text-orange-500" />
                            <span>{job.requirements.length} yêu cầu</span>
                          </div>
                        )}
                      </div>

                      {/* Dates */}
                      <div className="flex flex-wrap gap-4 text-sm text-gray-500 mb-4">
                        <div className="flex items-center gap-1.5">
                          <CalendarOutlined className="text-base" />
                          <span>
                            Đăng {formatDistanceToNow(new Date(job.createdAt), {
                              addSuffix: true,
                              locale: vi
                            })}
                          </span>
                        </div>
                        {job.expiresAt && (
                          <div className="flex items-center gap-1.5">
                            <ClockCircleOutlined className="text-base" />
                            <span>
                              Hạn: {new Date(job.expiresAt).toLocaleDateString('vi-VN')}
                              {new Date(job.expiresAt) < new Date() && (
                                <span className="text-red-500 ml-1">(Đã hết hạn)</span>
                              )}
                            </span>
                          </div>
                        )}
                        {job.updatedAt && job.updatedAt !== job.createdAt && (
                          <div className="flex items-center gap-1.5">
                            <CheckCircleOutlined className="text-base" />
                            <span>
                              Cập nhật {formatDistanceToNow(new Date(job.updatedAt), {
                                addSuffix: true,
                                locale: vi
                              })}
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Action Buttons */}
                      <div className="flex flex-wrap gap-2">
                        {job.status === JobStatus.DRAFT && (
                          <Button
                            size="small"
                            type="primary"
                            icon={<SendOutlined />}
                            onClick={() => handlePublishDraft(job.id)}
                            className="bg-green-600 hover:bg-green-700"
                          >
                            Đăng tin
                          </Button>
                        )}
                        <Button
                          size="small"
                          icon={<UserOutlined />}
                          onClick={() => navigate(`/recruiter/jobs/${job.id}/applications`)}
                        >
                          Ứng viên ({job.applicationCount || 0})
                        </Button>
                        <Button
                          size="small"
                          icon={<EditOutlined />}
                          onClick={() => navigate(`/recruiter/jobs/${job.id}/edit`)}
                        >
                          Chỉnh sửa
                        </Button>
                        {[JobStatus.ACTIVE, JobStatus.APPROVED].includes(job.status) && (
                          <Button
                            size="small"
                            icon={<CloseCircleOutlined />}
                            onClick={() => handleCloseJob(job.id)}
                          >
                            Đóng tin
                          </Button>
                        )}
                        {[JobStatus.EXPIRED, JobStatus.CLOSED, JobStatus.REJECTED, JobStatus.INACTIVE].includes(job.status) && (
                          <Button
                            size="small"
                            icon={<ReloadOutlined />}
                            onClick={() => handleRepost(job)}
                            className="text-green-600 hover:text-green-700"
                          >
                            Tái đăng
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
            <ProjectOutlined className="text-5xl text-gray-400 mb-4" />
            <h3 className="text-lg text-gray-900 mb-2">
              {searchQuery ? 'Không tìm thấy tin tuyển dụng nào' : 'Chưa có tin tuyển dụng nào'}
            </h3>
            <p className="text-base text-gray-600 mb-6">
              {searchQuery
                ? 'Thử tìm kiếm với từ khóa khác'
                : 'Tạo tin tuyển dụng đầu tiên để bắt đầu thu hút ứng viên'}
            </p>
            <Button type="primary" icon={<PlusOutlined />} onClick={() => navigate('/recruiter/jobs/new')}>
              Tạo tin mới
            </Button>
          </Card>
        )}
      </div>

      {/* Repost Modal */}
      <Modal
        open={repostModal.open}
        onCancel={() => setRepostModal({ open: false, jobId: null, jobTitle: '' })}
        onOk={confirmRepost}
        okText="Tái đăng"
        cancelText="Hủy"
        confirmLoading={isReposting}
        okButtonProps={{ disabled: !repostExpiresAt }}
        title={
          <div className="flex items-center gap-2">
            <ReloadOutlined className="text-lg text-green-600" />
            <span>Tái đăng tin tuyển dụng</span>
          </div>
        }
      >
        <div className="space-y-3 py-2">
          <Typography.Text>
            Chọn ngày hết hạn mới cho tin: <strong>{repostModal.jobTitle}</strong>
          </Typography.Text>
          <div className="space-y-2">
            <Typography.Text strong>Ngày hết hạn</Typography.Text>
            <Input
              type="date"
              value={repostExpiresAt}
              onChange={(e) => setRepostExpiresAt(e.target.value)}
              min={new Date().toISOString().split('T')[0]}
            />
          </div>

          {/* Quick select buttons */}
          <div className="flex flex-wrap gap-1.5">
            {[15, 30, 60, 90].map(days => (
              <Button
                key={days}
                size="small"
                onClick={() => {
                  const date = new Date();
                  date.setDate(date.getDate() + days);
                  setRepostExpiresAt(date.toISOString().split('T')[0]);
                }}
              >
                {days} ngày
              </Button>
            ))}
          </div>
        </div>
      </Modal>
    </div>
  );
}