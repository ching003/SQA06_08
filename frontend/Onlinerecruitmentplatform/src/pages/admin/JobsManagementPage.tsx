import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { Card, Button, Input, Tag, Table, Modal, Spin, message, Select } from 'antd';
import {
  SearchOutlined,
  ProjectOutlined,
  CheckOutlined,
  CloseOutlined,
  EyeOutlined,
  LockOutlined,
  UnlockOutlined,
  DollarOutlined,
  EnvironmentOutlined,
} from '@ant-design/icons';
import { JobStatus, Job } from '../../lib/types';
import { jobService } from '../../api/services';
import { SALARY_RANGES, EXPERIENCE_LEVELS, JOB_TYPES, VIETNAM_PROVINCES } from '../../lib/constants';

interface JobWithStatus extends Job {
  applicationCount?: number | undefined;
}

const statusLabels: Record<string, string> = {
  [JobStatus.DRAFT]: 'Bản nháp',
  [JobStatus.PENDING]: 'Chờ duyệt',
  [JobStatus.APPROVED]: 'Đã duyệt',
  [JobStatus.REJECTED]: 'Từ chối',
  [JobStatus.ACTIVE]: 'Hoạt động',
  [JobStatus.INACTIVE]: 'Đã đóng',
  [JobStatus.EXPIRED]: 'Hết hạn',
  [JobStatus.CLOSED]: 'Đã đóng',
  LOCKED: 'Bị khóa',
};

const statusColors: Record<string, string> = {
  [JobStatus.PENDING]: 'orange',
  [JobStatus.APPROVED]: 'green',
  [JobStatus.REJECTED]: 'red',
  [JobStatus.ACTIVE]: 'blue',
  [JobStatus.INACTIVE]: 'default',
  [JobStatus.EXPIRED]: 'default',
  [JobStatus.CLOSED]: 'default',
  LOCKED: 'default',
};


export function JobsManagementPage() {
  const navigate = useNavigate();
  const [jobs, setJobs] = useState<JobWithStatus[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchInput, setSearchInput] = useState('');
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
  const [selectedLocation, setSelectedLocation] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [selectedSalary, setSelectedSalary] = useState('all');
  const [selectedJobType, setSelectedJobType] = useState('all');
  const [selectedExperience, setSelectedExperience] = useState('all');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalResults, setTotalResults] = useState(0);
  const [actionDialog, setActionDialog] = useState<{
    open: boolean;
    action: 'approve' | 'reject' | 'lock' | 'unlock' | null;
    jobId: string | null;
    jobTitle: string;
  }>({
    open: false,
    action: null,
    jobId: null,
    jobTitle: '',
  });
  const [isProcessing, setIsProcessing] = useState(false);

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchInput);
      setPage(1);
    }, 500);
    return () => clearTimeout(timer);
  }, [searchInput]);


  // Fetch jobs from API
  useEffect(() => {
    const fetchJobs = async () => {
      try {
        setIsLoading(true);
        const params: any = {
          page,
          limit: 20,
        };

        // Search keyword
        if (debouncedSearchTerm) {
          params.query = debouncedSearchTerm;
        }

        // Location filter
        if (selectedLocation && selectedLocation !== 'all') {
          params.location = selectedLocation;
        }

        // Status filter (additional filter beyond activeTab)
        if (selectedStatus !== 'all') {
          params.status = selectedStatus;
        }

        // Job type filter
        if (selectedJobType !== 'all') {
          params.jobType = selectedJobType;
        }

        // Experience level filter
        if (selectedExperience !== 'all') {
          params.experienceLevel = selectedExperience;
        }

        // Salary filter
        if (selectedSalary !== 'all') {
          const range = SALARY_RANGES.find(r => r.value === selectedSalary);
          if (range) {
            if (range.min > 0) {
              params.salaryMin = range.min;
            }
            if (range.max > 0) {
              params.salaryMax = range.max;
            }
          }
        }

        const response = await jobService.getJobs(params);

        setJobs((response.items || []).map(job => ({
          ...job,
          applicationCount: job.applicationCount || 0,
        })));
        setTotalPages(response.pagination?.totalPages || 1);
        setTotalResults(response.pagination?.total || 0);
      } catch (error: any) {
        console.error('Failed to fetch jobs:', error);
        message.error(error?.message || 'Không thể tải danh sách việc làm');
        setJobs([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchJobs();
  }, [page, debouncedSearchTerm, selectedLocation, selectedStatus, selectedJobType, selectedExperience, selectedSalary]);


  const handleAction = (action: 'approve' | 'reject' | 'lock' | 'unlock', jobId: string, jobTitle: string) => {
    setActionDialog({
      open: true,
      action,
      jobId,
      jobTitle,
    });
  };

  const confirmAction = async () => {
    if (!actionDialog.jobId || !actionDialog.action) return;

    try {
      setIsProcessing(true);
      let updatedJob: Job;

      if (actionDialog.action === 'approve') {
        updatedJob = await jobService.approveJob(actionDialog.jobId);
        setJobs(prev =>
          prev.map(job =>
            job.id === actionDialog.jobId
              ? { ...job, status: JobStatus.APPROVED }
              : job
          )
        );
        message.success('Đã duyệt tin tuyển dụng');
      } else if (actionDialog.action === 'reject') {
        updatedJob = await jobService.rejectJob(actionDialog.jobId);
        setJobs(prev =>
          prev.map(job =>
            job.id === actionDialog.jobId
              ? { ...job, status: JobStatus.REJECTED }
              : job
          )
        );
        message.success('Đã từ chối tin tuyển dụng');
      } else if (actionDialog.action === 'lock') {
        updatedJob = await jobService.lockJob(actionDialog.jobId);
        setJobs(prev =>
          prev.map(job =>
            job.id === actionDialog.jobId
              ? { ...job, status: updatedJob.status }
              : job
          )
        );
        message.success('Đã khóa tin tuyển dụng');
      } else if (actionDialog.action === 'unlock') {
        updatedJob = await jobService.unlockJob(actionDialog.jobId);
        setJobs(prev =>
          prev.map(job =>
            job.id === actionDialog.jobId
              ? { ...job, status: updatedJob.status }
              : job
          )
        );
        message.success('Đã mở khóa tin tuyển dụng');
      }
      setActionDialog({ open: false, action: null, jobId: null, jobTitle: '' });
    } catch (error: any) {
      console.error('Failed to update job status:', error);
      const actionMessages: Record<string, string> = {
        approve: 'duyệt',
        reject: 'từ chối',
        lock: 'khóa',
        unlock: 'mở khóa',
      };
      message.error(error?.message || `Không thể ${actionMessages[actionDialog.action || '']} tin tuyển dụng`);
    } finally {
      setIsProcessing(false);
    }
  };

  const getActionDialogContent = () => {
    const messages = {
      approve: {
        title: 'Duyệt tin tuyển dụng',
        description: `Bạn có chắc chắn muốn duyệt tin tuyển dụng "${actionDialog.jobTitle}"? Tin này sẽ hiển thị công khai cho ứng viên.`,
        action: 'Duyệt',
      },
      reject: {
        title: 'Từ chối tin tuyển dụng',
        description: `Bạn có chắc chắn muốn từ chối tin tuyển dụng "${actionDialog.jobTitle}"? Tin này sẽ không được công khai.`,
        action: 'Từ chối',
      },
      lock: {
        title: 'Khóa tin tuyển dụng',
        description: `Bạn có chắc chắn muốn khóa tin tuyển dụng "${actionDialog.jobTitle}"? Tin này sẽ không hiển thị công khai.`,
        action: 'Khóa',
      },
      unlock: {
        title: 'Mở khóa tin tuyển dụng',
        description: `Bạn có chắc chắn muốn mở khóa tin tuyển dụng "${actionDialog.jobTitle}"?`,
        action: 'Mở khóa',
      },
    };

    return actionDialog.action ? messages[actionDialog.action] : null;
  };

  const dialogContent = getActionDialogContent();

  const formatSalary = (job: JobWithStatus) => {
    if (!job.salary) return 'Thỏa thuận';
    if (job.salary.hideAmount) return 'Thỏa thuận';
    if (job.salary.isNegotiable) return 'Thỏa thuận';
    if (!job.salary.minAmount && !job.salary.maxAmount) return 'Thỏa thuận';
    const min = Math.floor((job.salary.minAmount || 0) / 1000000);
    const max = Math.floor((job.salary.maxAmount || 0) / 1000000);
    return `${min}-${max}tr`;
  };

  const columns = [
    {
      title: 'Vị trí tuyển dụng',
      dataIndex: 'title',
      key: 'title',
      width: 180,
      render: (_: any, record: JobWithStatus) => (
        <div className="min-w-0">
          <div className="text-gray-900 font-medium truncate">{record.title}</div>
          {record.experienceLevel && (
            <div className="text-gray-500 text-sm truncate">{record.experienceLevel}</div>
          )}
        </div>
      ),
    },
    {
      title: 'Mức lương',
      key: 'salary',
      render: (_: any, record: JobWithStatus) => (
        <span className="text-gray-600">{formatSalary(record)}</span>
      ),
    },
    {
      title: 'Ngày đăng',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (date: string) => (
        <span className="text-gray-600">
          {new Date(date).toLocaleDateString('vi-VN')}
        </span>
      ),
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => (
        <Tag color={statusColors[status] || 'default'}>
          {statusLabels[status] || status}
        </Tag>
      ),
    },
    {
      title: 'Thao tác',
      key: 'action',
      align: 'right' as const,
      render: (_: any, record: JobWithStatus) => (
        <div className="flex justify-end gap-2">
          <Button
            type="text"
            size="small"
            icon={<EyeOutlined />}
            onClick={() => navigate(`/jobs/${record.id}`)}
          />
          {record.status === JobStatus.PENDING && (
            <>
              <Button
                type="text"
                size="small"
                icon={<CheckOutlined />}
                className="text-green-600 hover:text-green-700"
                onClick={() => handleAction('approve', record.id, record.title)}
                disabled={isProcessing}
              />
              <Button
                type="text"
                size="small"
                icon={<CloseOutlined />}
                className="text-red-600 hover:text-red-700"
                onClick={() => handleAction('reject', record.id, record.title)}
                disabled={isProcessing}
              />
            </>
          )}
          {(record.status as string) === 'LOCKED' ? (
            <Button
              type="text"
              size="small"
              icon={<UnlockOutlined />}
              className="text-green-600 hover:text-green-700"
              onClick={() => handleAction('unlock', record.id, record.title)}
              disabled={isProcessing}
            />
          ) : record.status !== JobStatus.PENDING ? (
            <Button
              type="text"
              size="small"
              icon={<LockOutlined />}
              className="text-red-600 hover:text-red-700"
              onClick={() => handleAction('lock', record.id, record.title)}
              disabled={isProcessing}
            />
          ) : null}
        </div>
      ),
    },
  ];

  return (
    <div className="min-h-screen py-8">
      <div className="max-w-6xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Quản lý việc làm</h1>
          <p className="text-base text-gray-600">
            Duyệt và quản lý tin tuyển dụng trên hệ thống
          </p>
        </div>

        {/* Filters */}
        <Card className="mb-6 glassmorphism" styles={{ body: { padding: '16px 20px' } }}>
          {/* Search Bar */}
          <div className="flex gap-2 mb-3">
            <Input
              placeholder="Tìm kiếm việc làm..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              prefix={<SearchOutlined className="text-gray-400" />}
              size="middle"
              className="flex-1"
              allowClear
            />
          </div>

          {/* Filters Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2">
            {/* Location Filter */}
            <Select
              value={selectedLocation}
              onChange={(value) => { setSelectedLocation(value); setPage(1); }}
              placeholder="Địa điểm"
              size="middle"
              suffixIcon={<EnvironmentOutlined className="text-xs" />}
              className="text-sm"
            >
              <Select.Option value="all">Tất cả</Select.Option>
              {VIETNAM_PROVINCES.map(province => (
                <Select.Option key={province} value={province}>
                  {province}
                </Select.Option>
              ))}
            </Select>

            {/* Status Filter */}
            <Select
              value={selectedStatus}
              onChange={(value) => { setSelectedStatus(value); setPage(1); }}
              placeholder="Trạng thái"
              size="middle"
              className="text-sm"
            >
              <Select.Option value="all">Tất cả</Select.Option>
              <Select.Option value={JobStatus.DRAFT}>Bản nháp</Select.Option>
              <Select.Option value={JobStatus.PENDING}>Chờ duyệt</Select.Option>
              <Select.Option value={JobStatus.ACTIVE}>Hoạt động</Select.Option>
              <Select.Option value={JobStatus.INACTIVE}>Đã đóng</Select.Option>
              <Select.Option value={JobStatus.LOCKED}>Bị khóa</Select.Option>
              <Select.Option value={JobStatus.EXPIRED}>Hết hạn</Select.Option>
            </Select>

            {/* Salary Filter */}
            <Select
              value={selectedSalary}
              onChange={(value) => { setSelectedSalary(value); setPage(1); }}
              placeholder="Mức lương"
              size="middle"
              suffixIcon={<DollarOutlined className="text-xs" />}
              className="text-sm"
            >
              <Select.Option value="all">Tất cả</Select.Option>
              {SALARY_RANGES.map(range => (
                <Select.Option key={range.value} value={range.value}>
                  {range.label}
                </Select.Option>
              ))}
            </Select>

            {/* Job Type Filter */}
            <Select
              value={selectedJobType}
              onChange={(value) => { setSelectedJobType(value); setPage(1); }}
              placeholder="Loại việc"
              size="middle"
              className="text-sm"
            >
              <Select.Option value="all">Tất cả</Select.Option>
              {JOB_TYPES.filter(t => t.value !== 'all').map(type => (
                <Select.Option key={type.value} value={type.value}>
                  {type.label}
                </Select.Option>
              ))}
            </Select>

            {/* Experience Level Filter */}
            <Select
              value={selectedExperience}
              onChange={(value) => { setSelectedExperience(value); setPage(1); }}
              placeholder="Kinh nghiệm"
              size="middle"
              className="text-sm"
            >
              <Select.Option value="all">Tất cả</Select.Option>
              {EXPERIENCE_LEVELS.filter(l => l.value !== 'all').map(level => (
                <Select.Option key={level.value} value={level.value}>
                  {level.label}
                </Select.Option>
              ))}
            </Select>
          </div>

          {/* Active Filters Tags */}
          {(selectedStatus !== 'all' || selectedSalary !== 'all' || selectedExperience !== 'all' || selectedJobType !== 'all' || selectedLocation !== 'all') && (
            <div className="mt-4">
              <div className="bg-blue-50/50 rounded-xl p-3 border border-blue-100 flex flex-wrap items-center gap-3">
                <span className="text-sm text-blue-800 font-medium px-1">Đang lọc:</span>
                <div className="flex flex-wrap gap-2">
                  {selectedLocation !== 'all' && (
                    <Tag
                      closable
                      onClose={() => setSelectedLocation('all')}
                      className="cursor-pointer m-0 bg-white border-blue-200 text-blue-700 hover:border-blue-300 rounded-lg px-3 py-1 text-sm flex items-center shadow-sm"
                    >
                      <EnvironmentOutlined className="mr-1 text-blue-500" />
                      {selectedLocation}
                    </Tag>
                  )}
                  {selectedStatus !== 'all' && (
                    <Tag
                      closable
                      onClose={() => setSelectedStatus('all')}
                      className="cursor-pointer m-0 bg-white border-blue-200 text-blue-700 hover:border-blue-300 rounded-lg px-3 py-1 text-sm flex items-center shadow-sm"
                    >
                      {statusLabels[selectedStatus]}
                    </Tag>
                  )}
                  {selectedSalary !== 'all' && (
                    <Tag
                      closable
                      onClose={() => setSelectedSalary('all')}
                      className="cursor-pointer m-0 bg-white border-blue-200 text-blue-700 hover:border-blue-300 rounded-lg px-3 py-1 text-sm flex items-center shadow-sm"
                    >
                      <DollarOutlined className="mr-1 text-blue-500" />
                      {SALARY_RANGES.find(r => r.value === selectedSalary)?.label}
                    </Tag>
                  )}
                  {selectedExperience !== 'all' && (
                    <Tag
                      closable
                      onClose={() => setSelectedExperience('all')}
                      className="cursor-pointer m-0 bg-white border-blue-200 text-blue-700 hover:border-blue-300 rounded-lg px-3 py-1 text-sm flex items-center shadow-sm"
                    >
                      {EXPERIENCE_LEVELS.find(l => l.value === selectedExperience)?.label}
                    </Tag>
                  )}
                  {selectedJobType !== 'all' && (
                    <Tag
                      closable
                      onClose={() => setSelectedJobType('all')}
                      className="cursor-pointer m-0 bg-white border-blue-200 text-blue-700 hover:border-blue-300 rounded-lg px-3 py-1 text-sm flex items-center shadow-sm"
                    >
                      {JOB_TYPES.find(t => t.value === selectedJobType)?.label}
                    </Tag>
                  )}
                  <Button
                    type="link"
                    size="small"
                    onClick={() => {
                      setSelectedStatus('all');
                      setSelectedSalary('all');
                      setSelectedExperience('all');
                      setSelectedJobType('all');
                      setSelectedLocation('all');
                      setSearchInput('');
                      setPage(1);
                    }}
                    className="text-red-500 hover:text-red-700 text-xs ml-2"
                  >
                    Xóa tất cả
                  </Button>
                </div>
              </div>
            </div>
          )}
        </Card>

        {/* Results Count */}
        <div className="mb-4">
          <p className="text-sm text-gray-600">
            Tìm thấy <span className="font-semibold text-gray-900">{totalResults}</span> việc làm
          </p>
        </div>

        {/* Jobs Table */}
        <Card styles={{ body: { padding: 0 } }}>
          {isLoading ? (
            <div className="p-12 text-center">
              <Spin size="large" className="mb-4" />
              <p className="text-gray-600">Đang tải danh sách việc làm...</p>
            </div>
          ) : jobs.length === 0 ? (
            <div className="p-12 text-center">
              <ProjectOutlined className="text-5xl text-gray-300 mb-4" />
              <p className="text-gray-600">Không tìm thấy việc làm nào</p>
            </div>
          ) : (
            <Table
              columns={columns}
              dataSource={jobs}
              rowKey="id"
              pagination={false}
              scroll={{ x: 1200 }}
            />
          )}
        </Card>

        {/* Pagination */}
        {!isLoading && totalPages > 1 && (
          <div className="flex items-center justify-between mt-6">
            <div className="text-sm text-gray-600">
              Trang {page} / {totalPages}
            </div>
            <div className="flex gap-2">
              <Button
                onClick={() => setPage(prev => Math.max(1, prev - 1))}
                disabled={page === 1}
              >
                Trước
              </Button>
              <Button
                onClick={() => setPage(prev => Math.min(totalPages, prev + 1))}
                disabled={page === totalPages}
              >
                Sau
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Confirmation Dialog */}
      <Modal
        open={actionDialog.open}
        onCancel={() => setActionDialog({ open: false, action: null, jobId: null, jobTitle: '' })}
        onOk={confirmAction}
        title={dialogContent?.title}
        okText={isProcessing ? 'Đang xử lý...' : dialogContent?.action}
        cancelText="Hủy"
        confirmLoading={isProcessing}
      >
        <p>{dialogContent?.description}</p>
      </Modal>
    </div>
  );
}
