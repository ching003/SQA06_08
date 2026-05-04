import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { Card, Button, Input, Select, Spin } from 'antd';
import {
  RightOutlined, ThunderboltOutlined, SearchOutlined,
  ReloadOutlined, FileTextOutlined
} from '@ant-design/icons';
import { JobCard } from '../components/JobCard';
import { useAuth } from '../contexts/AuthContext';
import { toast } from 'sonner';
import { jobService } from '../api/services/jobService';
import { cvService } from '../api/services/cvService';
import { Job, UserRole } from '../lib/types';

const { Option } = Select;

type JobTypeFilter = 'all' | 'full-time' | 'part-time' | 'contract' | 'internship';

interface JobWithMatch {
  job: Job;
  matchScore: number;
  matchingSkills?: string[];
  matchingReasons?: string[];
}

export function RecommendedJobsPage() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [searchQuery, setSearchQuery] = useState('');
  const [jobTypeFilter, setJobTypeFilter] = useState<JobTypeFilter>('all');
  const [jobsWithMatches, setJobsWithMatches] = useState<JobWithMatch[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [hasCV, setHasCV] = useState(true);
  const [savedJobIds, setSavedJobIds] = useState<string[]>([]);

  // Fetch recommended jobs from API
  const fetchRecommendedJobs = async () => {
    try {
      setIsLoading(true);

      // Step 1: Get all CVs of the user
      const userCVsResponse: any = await cvService.getCVs();
      let userCVs: any[] = [];

      // Handle different response structures
      if (userCVsResponse.items && Array.isArray(userCVsResponse.items)) {
        userCVs = userCVsResponse.items;
      } else if (userCVsResponse.data?.items && Array.isArray(userCVsResponse.data.items)) {
        userCVs = userCVsResponse.data.items;
      } else if (Array.isArray(userCVsResponse)) {
        userCVs = userCVsResponse;
      }

      // Check if user has any CVs
      if (userCVs.length === 0) {
        setHasCV(false);
        setIsLoading(false);
        return;
      }

      // Step 2: Fetch recommended jobs for each CV
      const allRecommendations: Map<string, JobWithMatch> = new Map();

      await Promise.all(
        userCVs.map(async (cv) => {
          try {
            const response: any = await cvService.getRecommendedJobsForCV(cv.id, { limit: 50 });

            // Handle different response structures
            let recommendations: any[] = [];
            if (response.recommendations && Array.isArray(response.recommendations)) {
              recommendations = response.recommendations;
            } else if (response.items && Array.isArray(response.items)) {
              recommendations = response.items;
            } else if (Array.isArray(response)) {
              recommendations = response;
            }

            // Process each recommendation
            recommendations.forEach((rec: any) => {
              const job = rec.job || rec;
              const jobId = job.id;

              // Get similarity score (0.0 - 1.0 from backend)
              const similarity = rec.similarity || 0;
              const matchScore = Math.round(similarity * 100); // Convert to percentage

              // Keep the highest match score if job appears in multiple CVs
              const existing = allRecommendations.get(jobId);
              if (!existing || matchScore > existing.matchScore) {
                allRecommendations.set(jobId, {
                  job,
                  matchScore,
                  matchingSkills: rec.matchingSkills || [],
                  matchingReasons: rec.matchingReasons || [],
                });
              }
            });
          } catch (err) {
            console.error(`Failed to fetch recommendations for CV ${cv.id}:`, err);
            // Continue with other CVs even if one fails
          }
        })
      );

      // Step 3: Convert map to array and sort by match score
      const jobsWithMatchData = Array.from(allRecommendations.values())
        .sort((a, b) => b.matchScore - a.matchScore);

      setJobsWithMatches(jobsWithMatchData);
      setHasCV(true);
    } catch (error: any) {
      console.error('Error fetching recommended jobs:', error);

      // If error indicates no CV, show the no CV state
      if (error.message?.includes('CV') || error.message?.includes('cv') ||
        error.message?.includes('resume') || error.message?.includes('không tìm thấy')) {
        setHasCV(false);
      } else {
        toast.error(error.message || 'Không thể tải danh sách việc làm gợi ý');
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch saved jobs from API
  useEffect(() => {
    const fetchSavedJobs = async () => {
      try {
        const response = await jobService.getSavedJobs({ page: 1, limit: 100 });

        let savedJobsArray: any[] = [];

        // Handle response structure
        if (response && (response as any).data?.savedJobs && Array.isArray((response as any).data.savedJobs)) {
          savedJobsArray = (response as any).data.savedJobs;
        } else if (response && (response as any).savedJobs && Array.isArray((response as any).savedJobs)) {
          savedJobsArray = (response as any).savedJobs;
        } else if (response && response.items && Array.isArray(response.items)) {
          savedJobsArray = response.items;
        } else if (response && (response as any).data?.items && Array.isArray((response as any).data.items)) {
          savedJobsArray = (response as any).data.items;
        } else if (Array.isArray(response)) {
          savedJobsArray = response;
        }

        // Extract job IDs from saved jobs
        const ids: string[] = [];
        savedJobsArray.forEach((item: any) => {
          if (item.jobId) {
            ids.push(item.jobId);
          } else if (item.job?.id) {
            ids.push(item.job.id);
          } else if (item.id && !item.jobId) {
            ids.push(item.id);
          }
        });

        setSavedJobIds(ids);
      } catch (error) {
        console.error('Failed to fetch saved jobs:', error);
        setSavedJobIds([]);
      }
    };

    if (user && user.role === UserRole.CANDIDATE) {
      fetchSavedJobs();
    }
  }, [user]);

  // Fetch jobs on mount
  useEffect(() => {
    fetchRecommendedJobs();
  }, []);

  // Filter jobs
  const filteredJobs = jobsWithMatches.filter(({ job }) => {
    // Job type filter
    if (jobTypeFilter !== 'all') {
      const jobType = job.type?.toLowerCase().replace('_', '-');
      if (jobType !== jobTypeFilter) return false;
    }

    // Search filter
    if (searchQuery) {
      const searchLower = searchQuery.toLowerCase();
      const companyName = job.company?.name || '';

      if (!job.title.toLowerCase().includes(searchLower) &&
        !companyName.toLowerCase().includes(searchLower)) {
        return false;
      }
    }

    return true;
  });

  // No longer categorize - show all jobs in one list

  const handleRefresh = async () => {
    await fetchRecommendedJobs();
    toast.success('Đã làm mới danh sách gợi ý');
  };

  const handleSaveJob = async (jobId: string) => {
    try {
      if (savedJobIds.includes(jobId)) {
        await jobService.unsaveJob(jobId);
        setSavedJobIds(prev => prev.filter(id => id !== jobId));
        toast.success('Đã bỏ lưu công việc');
      } else {
        await jobService.saveJob(jobId);
        setSavedJobIds(prev => [...prev, jobId]);
        toast.success('Đã lưu công việc');
      }
    } catch (error: any) {
      toast.error(error.message || 'Không thể lưu công việc');
    }
  };

  const handleApply = (jobId: string) => {
    navigate(`/jobs/${jobId}`);
  };


  const jobTypeLabels: Record<string, string> = {
    'full-time': 'Toàn thời gian',
    'part-time': 'Bán thời gian',
    'contract': 'Hợp đồng',
    'internship': 'Thực tập',
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen py-4 sm:py-6 lg:py-8">
        <div className="max-w-6xl mx-auto px-3 sm:px-4 lg:px-6 xl:px-8">
          <Card className="glassmorphism" styles={{ body: { padding: '24px 16px', textAlign: 'center' } }}>
            <div className="sm:py-4 sm:px-8">
              <Spin size="large" className="mb-4" />
              <h3 className="text-base sm:text-lg text-gray-900 mb-2">Đang tải việc làm gợi ý...</h3>
              <p className="text-sm sm:text-base text-gray-600">
                Vui lòng đợi trong giây lát
              </p>
            </div>
          </Card>
        </div>
      </div>
    );
  }

  // No CV state
  if (!hasCV) {
    return (
      <div className="min-h-screen py-4 sm:py-6 lg:py-8">
        <div className="max-w-6xl mx-auto px-3 sm:px-4 lg:px-6 xl:px-8">
          <Card className="glassmorphism" styles={{ body: { padding: '24px 16px', textAlign: 'center' } }}>
            <div className="sm:py-4 sm:px-8">
              <FileTextOutlined className="text-4xl sm:text-5xl text-gray-400 mb-4" />
              <h3 className="text-base sm:text-lg text-gray-900 mb-2">Vui lòng tạo CV để nhận gợi ý việc làm</h3>
              <p className="text-sm sm:text-base text-gray-600 mb-4 sm:mb-6">
                Chúng tôi cần CV của bạn để có thể gợi ý những công việc phù hợp nhất
              </p>
              <Button size="small" onClick={() => navigate('/candidate/cvs/new')} className="w-full sm:w-auto" icon={<FileTextOutlined />}>
                Tạo CV ngay
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
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-xs sm:text-sm text-gray-600 mb-3 sm:mb-4 lg:mb-6">
          <button onClick={() => navigate('/candidate/dashboard')} className="hover:text-blue-600">
            Dashboard
          </button>
          <RightOutlined className="text-xs" />
          <span className="text-gray-900">Việc làm gợi ý</span>
        </div>

        {/* Header */}
        <div className="mb-2">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4 mb-2">
            <div className="flex items-center gap-2 sm:gap-3">

              <div>
                <h1 className="text-2xl font-bold text-gray-900">Việc làm gợi ý</h1>
                <p className="text-xs sm:text-sm lg:text-base text-gray-600">
                  Dựa trên hồ sơ CV của bạn
                </p>
              </div>
            </div>
            <Button onClick={handleRefresh} icon={<ReloadOutlined />} size="small" className="w-full sm:w-auto">
              <span className="hidden sm:inline">Làm mới</span>
            </Button>
          </div>
        </div>

        {/* Filters */}
        <Card className="glassmorphism mb-4 sm:mb-6" styles={{ body: { padding: '12px 16px' } }}>
          <div className="sm:px-2">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
              {/* Search */}
              <div className="sm:col-span-2 lg:col-span-2">
                <label className="text-xs sm:text-sm lg:text-base text-gray-700 mb-1.5 sm:mb-2 block font-medium">Tìm kiếm</label>
                <Input
                  placeholder="Tên công việc hoặc công ty..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  prefix={<SearchOutlined className="text-gray-400" />}
                  size="large"
                  className="w-full"
                />
              </div>

              {/* Job Type Filter */}
              <div>
                <label className="text-xs sm:text-sm lg:text-base text-gray-700 mb-1.5 sm:mb-2 block font-medium">Loại công việc</label>
                <Select
                  value={jobTypeFilter}
                  onChange={(value: JobTypeFilter) => setJobTypeFilter(value)}
                  className="w-full"
                  size="large"
                >
                  <Option value="all">Tất cả</Option>
                  <Option value="full-time">Toàn thời gian</Option>
                  <Option value="part-time">Bán thời gian</Option>
                  <Option value="contract">Hợp đồng</Option>
                  <Option value="internship">Thực tập</Option>
                </Select>
              </div>
            </div>


            <div className="mt-4 p-3 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 sm:gap-0 text-xs sm:text-sm lg:text-base text-gray-700">
                <span>
                  Tìm thấy{' '}<strong className="text-gray-900">{filteredJobs.length}</strong>{' '}công việc phù hợp
                </span>
                {(jobTypeFilter !== 'all' || searchQuery) && (
                  <Button
                    type="text"
                    size="small"
                    onClick={() => {
                      setJobTypeFilter('all');
                      setSearchQuery('');
                    }}
                  >
                    Xóa bộ lọc
                  </Button>
                )}
              </div>
            </div>
          </div>
        </Card>

        {/* All Recommended Jobs */}
        {filteredJobs.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8 mt-4">
            {filteredJobs.map(({ job, matchingSkills, matchScore }) => {
              const company = job.company;
              if (!company) return null;

              return (
                <JobCard
                  key={job.id}
                  job={job}
                  showSaveButton={true}
                  isSaved={savedJobIds.includes(job.id)}
                  onSaveToggle={handleSaveJob}
                  matchingSkills={matchingSkills}
                />
              );
            })}
          </div>
        )}

        {/* Empty State */}
        {filteredJobs.length === 0 && (
          <Card className="glassmorphism" styles={{ body: { padding: '24px 16px', textAlign: 'center' } }}>
            <div className="sm:py-4 sm:px-8">
              <SearchOutlined className="text-4xl sm:text-5xl text-gray-400 mb-4" />
              <h3 className="text-base sm:text-lg text-gray-900 mb-2">Không tìm thấy công việc phù hợp</h3>
              <p className="text-sm sm:text-base text-gray-600 mb-4 sm:mb-6">
                Thử điều chỉnh bộ lọc hoặc cập nhật CV của bạn để nhận được nhiều gợi ý hơn
              </p>
              <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 justify-center">
                <Button onClick={() => navigate('/candidate/cvs')} size="small" className="w-full sm:w-auto">
                  Cập nhật CV
                </Button>
                <Button type="primary" onClick={() => navigate('/jobs')} size="small" className="w-full sm:w-auto">
                  Tìm việc làm
                </Button>
              </div>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}
