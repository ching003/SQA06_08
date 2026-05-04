import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router';
import { Card, Input, Button, Tag, Select, Pagination, Spin } from 'antd';
import { SearchOutlined, EnvironmentOutlined, DollarOutlined } from '@ant-design/icons';
import { JobCard } from '../components/JobCard';
import { Job, JobStatus, UserRole } from '../lib/types';
import {
  INDUSTRIES,
  SALARY_RANGES,
  EXPERIENCE_LEVELS,
  JOB_TYPES,
  VIETNAM_PROVINCES
} from '../lib/constants';
import { jobService } from '../api/services';
import { useAuth } from '../contexts/AuthContext';
import { toast } from 'sonner';

const { Option } = Select;


export function JobSearchPage() {
  const { user } = useAuth();
  const [searchParams] = useSearchParams();

  // Initialize from URL parameters
  const initialKeyword = searchParams.get('keyword') || '';
  const initialLocation = searchParams.get('location') || 'all';
  const initialIndustry = searchParams.get('industry') || 'all';

  const [searchKeyword, setSearchKeyword] = useState(initialKeyword);
  const [debouncedSearchKeyword, setDebouncedSearchKeyword] = useState(initialKeyword);
  const [selectedLocation, setSelectedLocation] = useState(initialLocation);
  const [jobType, setJobType] = useState('all');
  const [industry, setIndustry] = useState(initialIndustry);
  const [salaryRange, setSalaryRange] = useState('all');
  const [experienceLevel, setExperienceLevel] = useState('all');
  const [jobs, setJobs] = useState<Job[]>([]);
  const [savedJobs, setSavedJobs] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalJobs, setTotalJobs] = useState(0);
  const [locationScrollIndex, setLocationScrollIndex] = useState(0);
  const [showMoreFilters, setShowMoreFilters] = useState(false);

  // Debounce search keyword
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchKeyword(searchKeyword);
    }, 500); // Wait 500ms after user stops typing

    return () => clearTimeout(timer);
  }, [searchKeyword]);

  // Fetch saved jobs if user is logged in
  useEffect(() => {
    const fetchSavedJobs = async () => {
      if (!user || user.role !== 'CANDIDATE') return;

      try {
        const response = await jobService.getSavedJobs();
        // Handle different response structures
        // API returns: { success: true, data: { savedJobs: [...], pagination: {...} } }
        // Each savedJob has: { id, userId, jobId, createdAt, job: {...} }
        let savedJobIds: string[] = [];

        // Check for data.savedJobs structure (most common)
        if ((response as any).data?.savedJobs && Array.isArray((response as any).data.savedJobs)) {
          savedJobIds = (response as any).data.savedJobs.map((savedJob: any) => savedJob.jobId || savedJob.job?.id).filter(Boolean);
        }
        // Check for items array (PaginatedResponse format)
        else if (response.items && Array.isArray(response.items)) {
          savedJobIds = response.items.map((item: any) => item.jobId || item.job?.id || item.id).filter(Boolean);
        }
        // Check for direct array
        else if (Array.isArray(response)) {
          savedJobIds = response.map((item: any) => item.jobId || item.job?.id || item.id).filter(Boolean);
        }
        // Check for data array
        else if ((response as any).data && Array.isArray((response as any).data)) {
          savedJobIds = (response as any).data.map((item: any) => item.jobId || item.job?.id || item.id).filter(Boolean);
        }
        // Check for jobs array
        else if ((response as any).jobs && Array.isArray((response as any).jobs)) {
          savedJobIds = (response as any).jobs.map((job: any) => job.id).filter(Boolean);
        }

        console.log('Saved job IDs:', savedJobIds);
        setSavedJobs(savedJobIds);
      } catch (error: any) {
        console.error('Failed to fetch saved jobs:', error);
      }
    };

    fetchSavedJobs();
  }, [user]);

  // Fetch jobs from API
  useEffect(() => {
    const fetchJobs = async () => {
      try {
        setIsLoading(true);
        const params: any = {
          page: currentPage,
          limit: 12, // Show 12 jobs per page (4 rows x 3 columns)
          status: JobStatus.ACTIVE,
        };

        // Search keyword (use debounced value)
        if (debouncedSearchKeyword) {
          params.query = debouncedSearchKeyword; // Backend expects 'query', not 'search'
        }

        // Location filter
        if (selectedLocation && selectedLocation !== 'all') {
          params.location = selectedLocation;
        }

        // Job type filter (backend expects 'jobType', not 'type')
        if (jobType !== 'all') {
          params.jobType = jobType;
        }

        // Industry filter
        if (industry !== 'all') {
          params.industry = industry;
        }

        // Experience level filter
        if (experienceLevel !== 'all') {
          params.experienceLevel = experienceLevel;
        }

        // Salary filter - send to backend instead of filtering client-side
        if (salaryRange !== 'all') {
          const range = SALARY_RANGES.find(r => r.value === salaryRange);
          if (range) {
            if (range.min === -1) {
              // Negotiable - backend should handle jobs without salary
              // We can pass a special flag or just skip salary params
            } else {
              // Only send salaryMin if > 0 (backend validation requires > 0)
              if (range.min > 0) {
                params.salaryMin = range.min;
              }
              // Always send salaryMax
              if (range.max > 0) {
                params.salaryMax = range.max;
              }
            }
          }
        }

        const response = await jobService.searchJobs(params);

        // Handle different response structures
        let jobsList: Job[] = [];
        if (response.items && Array.isArray(response.items)) {
          jobsList = response.items;
        } else if (Array.isArray(response)) {
          jobsList = response;
        } else if ((response as any).data && Array.isArray((response as any).data)) {
          jobsList = (response as any).data;
        } else if ((response as any).jobs && Array.isArray((response as any).jobs)) {
          jobsList = (response as any).jobs;
        }

        // Backend already filters by status, no need to filter again
        setJobs(jobsList);

        // Update pagination
        if (response.pagination) {
          setTotalPages(response.pagination.totalPages || 1);
          setTotalJobs(response.pagination.total || 0);
        }
      } catch (error: any) {
        console.error('Failed to fetch jobs:', error);
        toast.error(error?.message || 'Không thể tải danh sách việc làm');
        setJobs([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchJobs();
  }, [debouncedSearchKeyword, selectedLocation, jobType, industry, salaryRange, experienceLevel, currentPage]);

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

  const toggleSaveJob = async (jobId: string) => {
    if (!user || user.role !== 'CANDIDATE') {
      toast.info('Vui lòng đăng nhập để lưu việc làm');
      return;
    }

    try {
      const isSaved = savedJobs.includes(jobId);
      if (isSaved) {
        await jobService.unsaveJob(jobId);
        setSavedJobs(prev => prev.filter(id => id !== jobId));
        toast.success('Đã bỏ lưu việc làm');
      } else {
        await jobService.saveJob(jobId);
        setSavedJobs(prev => [...prev, jobId]);
        toast.success('Đã lưu việc làm');
      }
    } catch (error: any) {
      console.error('Failed to toggle save job:', error);
      toast.error(error?.message || 'Không thể lưu/bỏ lưu việc làm');
    }
  };

  const scrollLocations = (direction: 'left' | 'right') => {
    const locations = ['Tất cả', ...VIETNAM_PROVINCES];
    const maxScroll = Math.max(0, locations.length - 7);
    if (direction === 'left') {
      setLocationScrollIndex(Math.max(0, locationScrollIndex - 1));
    } else {
      setLocationScrollIndex(Math.min(maxScroll, locationScrollIndex + 1));
    }
  };

  const locations = ['Tất cả', ...VIETNAM_PROVINCES];
  const visibleLocations = locations.slice(locationScrollIndex, locationScrollIndex + 7);

  return (
    <div className="min-h-screen">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Tìm kiếm việc làm</h1>
          <p className="text-gray-600">
            Khám phá các công việc phù hợp với kỹ năng và kinh nghiệm của bạn
          </p>
        </div>

        {/* Search and Filters */}
        <Card className="glassmorphism mb-4 sm:mb-6" styles={{ body: { padding: '16px 20px' } }}>
          {/* Search Bar and Button */}
          <div className="flex gap-2 mb-3">
            <Input
              placeholder="Tìm kiếm theo vị trí, kỹ năng..."
              value={searchKeyword}
              onChange={(e) => setSearchKeyword(e.target.value)}
              prefix={<SearchOutlined className="text-gray-400" />}
              size="middle"
              className="flex-1"
            />
            <Button
              type="primary"
              onClick={() => setCurrentPage(1)}
              icon={<SearchOutlined />}
            >
              Tìm kiếm
            </Button>
          </div>

          {/* Filters Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2">
            {/* Location Filter */}
            <Select
              value={selectedLocation}
              onChange={(value) => { setSelectedLocation(value); setCurrentPage(1); }}
              placeholder="Địa điểm"
              size="middle"
              suffixIcon={<EnvironmentOutlined className="text-xs" />}
              className="text-sm"
            >
              <Option value="all">Tất cả</Option>
              {VIETNAM_PROVINCES.map(province => (
                <Option key={province} value={province}>
                  {province}
                </Option>
              ))}
            </Select>

            {/* Industry Filter */}
            <Select
              value={industry}
              onChange={(value) => { setIndustry(value); setCurrentPage(1); }}
              placeholder="Ngành nghề"
              size="middle"
              className="text-sm"
            >
              <Option value="all">Tất cả</Option>
              {INDUSTRIES.map(ind => (
                <Option key={ind.value} value={ind.value}>
                  {ind.label}
                </Option>
              ))}
            </Select>

            {/* Salary Filter */}
            <Select
              value={salaryRange}
              onChange={(value) => { setSalaryRange(value); setCurrentPage(1); }}
              placeholder="Mức lương"
              size="middle"
              suffixIcon={<DollarOutlined className="text-xs" />}
              className="text-sm"
            >
              <Option value="all">Tất cả</Option>
              {SALARY_RANGES.map(range => (
                <Option key={range.value} value={range.value}>
                  {range.label}
                </Option>
              ))}
            </Select>

            {/* Job Type Filter */}
            <Select
              value={jobType}
              onChange={(value) => { setJobType(value); setCurrentPage(1); }}
              placeholder="Loại việc"
              size="middle"
              className="text-sm"
            >
              <Option value="all">Tất cả</Option>
              {JOB_TYPES.map(type => (
                <Option key={type.value} value={type.value}>
                  {type.label}
                </Option>
              ))}
            </Select>

            {/* Experience Level Filter */}
            <Select
              value={experienceLevel}
              onChange={(value) => { setExperienceLevel(value); setCurrentPage(1); }}
              placeholder="Kinh nghiệm"
              size="middle"
              className="text-sm"
            >
              <Option value="all">Tất cả</Option>
              {EXPERIENCE_LEVELS.map(level => (
                <Option key={level.value} value={level.value}>
                  {level.label}
                </Option>
              ))}
            </Select>
          </div>

          {/* Action Buttons */}


          {/* Active Filters Tags */}
          {(industry !== 'all' || salaryRange !== 'all' || experienceLevel !== 'all' || jobType !== 'all' || selectedLocation !== 'all') && (
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
                  {industry !== 'all' && (
                    <Tag
                      closable
                      onClose={() => setIndustry('all')}
                      className="cursor-pointer m-0 bg-white border-blue-200 text-blue-700 hover:border-blue-300 rounded-lg px-3 py-1 text-sm flex items-center shadow-sm"
                    >
                      {INDUSTRIES.find(i => i.value === industry)?.label}
                    </Tag>
                  )}
                  {salaryRange !== 'all' && (
                    <Tag
                      closable
                      onClose={() => setSalaryRange('all')}
                      className="cursor-pointer m-0 bg-white border-blue-200 text-blue-700 hover:border-blue-300 rounded-lg px-3 py-1 text-sm flex items-center shadow-sm"
                    >
                      <DollarOutlined className="mr-1 text-blue-500" />
                      {SALARY_RANGES.find(r => r.value === salaryRange)?.label}
                    </Tag>
                  )}
                  {experienceLevel !== 'all' && (
                    <Tag
                      closable
                      onClose={() => setExperienceLevel('all')}
                      className="cursor-pointer m-0 bg-white border-blue-200 text-blue-700 hover:border-blue-300 rounded-lg px-3 py-1 text-sm flex items-center shadow-sm"
                    >
                      {EXPERIENCE_LEVELS.find(l => l.value === experienceLevel)?.label}
                    </Tag>
                  )}
                  {jobType !== 'all' && (
                    <Tag
                      closable
                      onClose={() => setJobType('all')}
                      className="cursor-pointer m-0 bg-white border-blue-200 text-blue-700 hover:border-blue-300 rounded-lg px-3 py-1 text-sm flex items-center shadow-sm"
                    >
                      {JOB_TYPES.find(t => t.value === jobType)?.label}
                    </Tag>
                  )}
                  <Button
                    type="link"
                    size="small"
                    onClick={() => {
                      setIndustry('all');
                      setSalaryRange('all');
                      setExperienceLevel('all');
                      setJobType('all');
                      setSelectedLocation('all');
                      setSearchKeyword('');
                      setCurrentPage(1);
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
        <div className="mb-3 sm:mb-4 mt-4">
          <p className="text-base sm:text-lg text-gray-600">
            Tìm thấy <span className="font-semibold text-gray-900">{totalJobs.toLocaleString('vi-VN')}</span> việc làm
          </p>
        </div>

        {/* Job Listings Grid */}
        {isLoading ? (
          <div className="flex items-center justify-center py-12 sm:py-20">
            <Spin size="large" />
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 mb-6 sm:mb-8">
              {jobs.map((job) => (
                <div key={job.id} className="min-w-0">
                  <JobCard
                    job={job}
                    showSaveButton={user?.role === UserRole.CANDIDATE}
                    isSaved={savedJobs.includes(job.id)}
                    onSaveToggle={toggleSaveJob}
                  />
                </div>
              ))}
            </div>

            {jobs.length === 0 && !isLoading && (
              <Card styles={{ body: { padding: '32px 48px', textAlign: 'center' } }}>
                <p className="text-base sm:text-lg text-gray-600">
                  Không tìm thấy công việc phù hợp. Vui lòng thử lại với từ khóa khác.
                </p>
              </Card>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex flex-col items-center gap-3 mt-6 sm:mt-8">
                <Pagination
                  current={currentPage}
                  total={totalJobs}
                  pageSize={12}
                  onChange={(page) => setCurrentPage(page)}
                  showSizeChanger={false}
                  showQuickJumper={false}
                  showTotal={(total, range) => (
                    <span className="hidden sm:inline">{`${range[0]}-${range[1]} của ${total} việc làm`}</span>
                  )}
                />
                <div className="text-sm text-gray-600 text-center">
                  Trang {currentPage} / {totalPages} ({totalJobs.toLocaleString('vi-VN')} việc làm)
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}