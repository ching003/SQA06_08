import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router';
import { Card, Button, Input, Select, Spin } from 'antd';
import { SearchOutlined, BookOutlined } from '@ant-design/icons';
import { JobCard } from '../components/JobCard';
import { useAuth } from '../contexts/AuthContext';
import { Job, JobType } from '../lib/types';
import { toast } from 'sonner';
import { jobService } from '../api/services';

const { Option } = Select;

type JobTypeFilter = 'all' | 'full-time' | 'part-time' | 'contract' | 'internship';
type SortBy = 'date-new' | 'date-old' | 'salary-high' | 'salary-low' | 'expiring';

export function SavedJobsPage() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [savedJobs, setSavedJobs] = useState<Job[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [jobTypeFilter, setJobTypeFilter] = useState<JobTypeFilter>('all');
  const [locationFilter, setLocationFilter] = useState('all');
  const [sortBy, setSortBy] = useState<SortBy>('date-new');

  // Fetch saved jobs from API
  useEffect(() => {
    const fetchSavedJobs = async () => {
      if (!user || user.role !== 'CANDIDATE') {
        return;
      }

      try {
        setIsLoading(true);
        const response = await jobService.getSavedJobs();

        // Handle different response structures
        // Service returns response.data which is: { savedJobs: [...], pagination: {...} }
        // Each savedJob has: { id, userId, jobId, createdAt, job: {...} }
        let jobsList: Job[] = [];

        // Service returns { savedJobs: [...], pagination: {...} }
        if ((response as any).savedJobs && Array.isArray((response as any).savedJobs)) {
          jobsList = (response as any).savedJobs.map((savedJob: any) => savedJob.job || savedJob).filter(Boolean);
        }
        // Check for items array (PaginatedResponse format)
        else if (response.items && Array.isArray(response.items)) {
          jobsList = response.items.map((item: any) => item.job || item).filter(Boolean);
        }
        // Check for direct array
        else if (Array.isArray(response)) {
          jobsList = response.map((item: any) => item.job || item).filter(Boolean);
        }
        // Check for data.savedJobs structure (if API response wasn't processed)
        else if ((response as any).data?.savedJobs && Array.isArray((response as any).data.savedJobs)) {
          jobsList = (response as any).data.savedJobs.map((savedJob: any) => savedJob.job || savedJob).filter(Boolean);
        }
        // Check for data array
        else if ((response as any).data && Array.isArray((response as any).data)) {
          jobsList = (response as any).data.map((item: any) => item.job || item).filter(Boolean);
        }
        // Check for jobs array
        else if ((response as any).jobs && Array.isArray((response as any).jobs)) {
          jobsList = (response as any).jobs;
        }

        setSavedJobs(jobsList);
      } catch (error: any) {
        console.error('Failed to fetch saved jobs:', error);
        toast.error(error?.message || 'Không thể tải danh sách việc làm đã lưu');
        setSavedJobs([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchSavedJobs();
  }, [user]);

  // Get unique locations
  const locations = ['all', ...Array.from(new Set(savedJobs.map(job => job.location).filter(Boolean)))];

  // Format salary
  const formatSalary = (job: Job) => {
    if (!job.salary) return 'Thoả thuận';
    if (job.salary.hideAmount) return 'Thoả thuận';

    const min = job.salary.minAmount || 0;
    const max = job.salary.maxAmount || 0;
    const currency = job.salary.currency || 'VND';

    if (!min && !max) return 'Thoả thuận';

    // Format for VND
    if (currency === 'VND' || currency === 'vnd') {
      const format = (val: number) => `${(val / 1000000).toFixed(0)} triệu`;
      if (min && max) return `${format(min)} - ${format(max)}`;
      if (min) return `Từ ${format(min)}`;
      if (max) return `Tới ${format(max)}`;
    }

    // Format for USD
    if (currency === 'USD' || currency === 'usd') {
      if (min && max) return `${min} - ${max} USD`;
      if (min) return `Từ ${min} USD`;
      if (max) return `Tới ${max} USD`;
    }

    return 'Thoả thuận';
  };

  // Filter jobs
  const filteredJobs = savedJobs.filter(job => {
    // Job type filter
    if (jobTypeFilter !== 'all') {
      const jobType = job.type?.toLowerCase().replace('_', '-');
      if (jobType !== jobTypeFilter) return false;
    }

    // Location filter
    if (locationFilter !== 'all' && job.location !== locationFilter) return false;

    // Search filter
    if (searchQuery) {
      const searchLower = searchQuery.toLowerCase();
      const titleMatch = job.title.toLowerCase().includes(searchLower);
      const companyMatch = job.company?.name.toLowerCase().includes(searchLower);

      if (!titleMatch && !companyMatch) return false;
    }

    return true;
  });

  // Sort jobs
  const sortedJobs = [...filteredJobs].sort((a, b) => {
    switch (sortBy) {
      case 'date-new':
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      case 'date-old':
        return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      case 'salary-high':
        const aMax = a.salary?.maxAmount || a.salary?.minAmount || 0;
        const bMax = b.salary?.maxAmount || b.salary?.minAmount || 0;
        return bMax - aMax;
      case 'salary-low':
        const aMin = a.salary?.minAmount || a.salary?.maxAmount || 0;
        const bMin = b.salary?.minAmount || b.salary?.maxAmount || 0;
        return aMin - bMin;
      case 'expiring':
        const aExp = a.expiresAt ? new Date(a.expiresAt).getTime() : Infinity;
        const bExp = b.expiresAt ? new Date(b.expiresAt).getTime() : Infinity;
        return aExp - bExp;
      default:
        return 0;
    }
  });

  const handleRemoveSaved = async (jobId: string) => {
    try {
      await jobService.unsaveJob(jobId);
      setSavedJobs(prev => prev.filter(job => job.id !== jobId));
      toast.success('Đã bỏ lưu việc làm');
    } catch (error: any) {
      console.error('Failed to unsave job:', error);
      toast.error(error?.message || 'Không thể bỏ lưu việc làm');
    }
  };

  const jobTypeLabels: Record<string, string> = {
    'full-time': 'Toàn thời gian',
    'part-time': 'Bán thời gian',
    'contract': 'Hợp đồng',
    'internship': 'Thực tập',
    'freelance': 'Freelance',
  };

  const isExpiringSoon = (expiresAt: Date | null) => {
    if (!expiresAt) return false;
    const daysUntilExpiry = Math.ceil(
      (new Date(expiresAt).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
    );
    return daysUntilExpiry <= 7 && daysUntilExpiry > 0;
  };

  if (!user || user.role !== 'CANDIDATE') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="max-w-md" styles={{ body: { padding: '48px', textAlign: 'center' } }}>
          <BookOutlined className="text-6xl text-gray-400 mb-4" />
          <h3 className="text-gray-900 mb-2">Vui lòng đăng nhập</h3>
          <p className="text-gray-600 mb-6">
            Bạn cần đăng nhập với tài khoản ứng viên để xem việc làm đã lưu
          </p>
          <Button onClick={() => navigate('/login')}>
            Đăng nhập
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-4 sm:py-6">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 ">
        {/* Header */}
        <div className="mb-4 sm:mb-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Công việc đã lưu</h1>
          <p className="text-base sm:text-lg text-gray-600">
            Quản lý các công việc bạn quan tâm và ứng tuyển khi sẵn sàng
          </p>
        </div>

        {/* Filters */}
        <Card className="glassmorphism !mb-4 sm:mb-6" >
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
            {/* Search */}
            <div className="sm:col-span-2 md:col-span-2">
              <Input
                placeholder="Tìm kiếm theo tên công việc hoặc công ty..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                prefix={<SearchOutlined className="text-gray-400" />}
                size="large"
              />
            </div>

            {/* Job Type Filter */}
            <div>
              <Select
                value={jobTypeFilter}
                onChange={(value: JobTypeFilter) => setJobTypeFilter(value)}
                placeholder="Loại công việc"
                className="w-full"
              >
                <Option value="all">Tất cả</Option>
                <Option value="full-time">Toàn thời gian</Option>
                <Option value="part-time">Bán thời gian</Option>
                <Option value="contract">Hợp đồng</Option>
                <Option value="internship">Thực tập</Option>
              </Select>
            </div>

            {/* Location Filter */}
            <div>
              <Select
                value={locationFilter}
                onChange={setLocationFilter}
                placeholder="Địa điểm"
                className="w-full"
              >
                {locations.map(location => (
                  <Option key={location} value={location}>
                    {location === 'all' ? 'Tất cả' : location}
                  </Option>
                ))}
              </Select>
            </div>
          </div>

          {/* Sort */}
          <div className="mt-3 sm:mt-4 pt-3 sm:pt-4 border-t flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-0">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4 w-full sm:w-auto">
              <span className="text-sm sm:text-base text-gray-700 whitespace-nowrap font-medium">Sắp xếp theo:</span>
              <Select
                value={sortBy}
                onChange={(value: SortBy) => setSortBy(value)}
                className="w-full sm:w-[200px]"
              >
                <Option value="date-new">Ngày lưu (Mới nhất)</Option>
                <Option value="date-old">Ngày lưu (Cũ nhất)</Option>
                <Option value="salary-high">Lương (Cao đến thấp)</Option>
                <Option value="salary-low">Lương (Thấp đến cao)</Option>
                <Option value="expiring">Sắp hết hạn</Option>
              </Select>
            </div>

            <div className="text-sm sm:text-base text-gray-600 w-full sm:w-auto">
              Hiển thị <strong>{sortedJobs.length}</strong> trong tổng số{' '}
              <strong>{savedJobs.length}</strong> công việc
            </div>
          </div>

          {(jobTypeFilter !== 'all' || locationFilter !== 'all' || searchQuery) && (
            <Button
              type="text"
              onClick={() => {
                setJobTypeFilter('all');
                setLocationFilter('all');
                setSearchQuery('');
              }}
              className="mt-3 sm:mt-4"
            >
              Xóa bộ lọc
            </Button>
          )}
        </Card>

        {/* Jobs List */}
        {isLoading ? (
          <div className="flex items-center justify-center py-12 sm:py-20">
            <Spin size="large" />
          </div>
        ) : sortedJobs.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {sortedJobs.map(job => (
              <JobCard
                key={job.id}
                job={job}
                showSaveButton={true}
                isSaved={true}
                onSaveToggle={handleRemoveSaved}
              />
            ))}
          </div>
        ) : (
          <Card styles={{ body: { padding: '32px 48px', textAlign: 'center' } }}>
            <BookOutlined className="text-4xl sm:text-5xl text-gray-400 mb-4" />
            <h3 className="text-base sm:text-lg text-gray-900 mb-2">
              {searchQuery || jobTypeFilter !== 'all' || locationFilter !== 'all'
                ? 'Không tìm thấy công việc nào'
                : 'Bạn chưa lưu công việc nào'}
            </h3>
            <p className="text-sm sm:text-base text-gray-600 mb-4 sm:mb-6">
              {searchQuery || jobTypeFilter !== 'all' || locationFilter !== 'all'
                ? 'Thử thay đổi bộ lọc hoặc tìm kiếm khác'
                : 'Lưu các công việc bạn quan tâm để dễ dàng theo dõi và ứng tuyển sau'}
            </p>
            <Button size="small" onClick={() => navigate('/jobs')} className="w-full sm:w-auto" icon={<SearchOutlined />}>
              Khám phá việc làm
            </Button>
          </Card>
        )}
      </div>
    </div>
  );
}
