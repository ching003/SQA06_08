import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router';
import { Card, Input, Button, Spin, Carousel } from 'antd';
import { JobCard } from '../components/JobCard';
import { CompanyCard } from '../components/CompanyCard';
import { SearchOutlined, ContainerOutlined, UserOutlined, LineChartOutlined, SafetyOutlined, ThunderboltOutlined, EnvironmentOutlined, DollarOutlined, ClockCircleOutlined, RightOutlined, StarOutlined, ShopOutlined, LoadingOutlined, FacebookOutlined, TwitterOutlined, LinkedinOutlined, InstagramOutlined } from '@ant-design/icons';
import { useAuth } from '../contexts/AuthContext';
import { UserRole, Job, Company } from '../lib/types';
import { jobService, companyService, cvService } from '../api/services';

export function LandingPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [activeJobs, setActiveJobs] = useState<Job[]>([]);
  const [activeCompanies, setActiveCompanies] = useState<Company[]>([]);
  const [isLoadingJobs, setIsLoadingJobs] = useState(true);
  const [isLoadingCompanies, setIsLoadingCompanies] = useState(true);
  const [jobCounts, setJobCounts] = useState<Record<string, number>>({});
  const [searchKeyword, setSearchKeyword] = useState('');
  const [searchLocation, setSearchLocation] = useState('');
  const [recommendedJobs, setRecommendedJobs] = useState<Array<{ job: Job; matchScore: number }>>([]);
  const [isLoadingRecommended, setIsLoadingRecommended] = useState(false);
  const [savedJobIds, setSavedJobIds] = useState<Set<string>>(new Set());

  // Fetch active jobs
  useEffect(() => {
    const fetchJobs = async () => {
      try {
        setIsLoadingJobs(true);
        const response = await jobService.getJobs({
          status: 'ACTIVE',
          page: 1,
          limit: 6,
          sortBy: 'salary',
          order: 'desc',
        });
        // API returns { success: true, data: { jobs: [...], pagination: {...} } }
        // response từ service đã unwrap, nên có thể là:
        // - { jobs: [...], pagination: {...} } (API actual response)
        // - { items: [...], pagination: {...} } (PaginatedResponse standard)
        let jobs: Job[] = [];
        if ((response as any).jobs && Array.isArray((response as any).jobs)) {
          jobs = (response as any).jobs;
        } else if ((response as any).data?.jobs && Array.isArray((response as any).data.jobs)) {
          jobs = (response as any).data.jobs;
        } else if (response.items && Array.isArray(response.items)) {
          jobs = response.items;
        } else if (Array.isArray(response)) {
          jobs = response;
        }

        // Sort jobs by salary (highest first)
        const sortedJobs = jobs.sort((a, b) => {
          const aSalary = a.salary?.maxAmount || a.salary?.minAmount || 0;
          const bSalary = b.salary?.maxAmount || b.salary?.minAmount || 0;
          return bSalary - aSalary;
        });

        // Debug: Log salary data
        console.log('Hot Jobs with salary data:', sortedJobs.map(j => ({
          title: j.title,
          salary: j.salary
        })));

        setActiveJobs(sortedJobs);
      } catch (error) {
        console.error('Failed to fetch jobs:', error);
        setActiveJobs([]);
      } finally {
        setIsLoadingJobs(false);
      }
    };

    fetchJobs();
  }, []);

  // Fetch active companies
  useEffect(() => {
    const fetchCompanies = async () => {
      try {
        setIsLoadingCompanies(true);
        let queryParams: any = {
          page: 1,
          limit: 6,
          status: 'ACTIVE',
        };

        // If user is logged in and has recommended jobs, filter by industry of first job's company
        if (user && user.role === UserRole.CANDIDATE && recommendedJobs.length > 0) {
          try {
            const firstJob = recommendedJobs[0]?.job;
            const companyId = firstJob?.company?.id;
            if (companyId) {
              const companyData = await companyService.getCompanyById(companyId);
              if (companyData && companyData.industry) {
                queryParams.industry = companyData.industry;
              }
            }
          } catch (error) {
            console.error('Failed to fetch company industry:', error);
            // Continue without industry filter if error
          }
        }

        const response = await companyService.getCompanies(queryParams);
        // API returns { success: true, data: [...], pagination: {...} }
        // response từ service đã unwrap, nên có thể là:
        // - { items: [...], pagination: {...} } (PaginatedResponse standard)
        // - { data: [...], pagination: {...} } (API actual response)
        // - Direct array (if service unwraps further)
        let companiesData: Company[] = [];
        if (Array.isArray(response)) {
          companiesData = response;
        } else if (Array.isArray((response as any).data)) {
          companiesData = (response as any).data;
        } else if (Array.isArray((response as any).items)) {
          companiesData = (response as any).items;
        } else if (response.items && Array.isArray(response.items)) {
          companiesData = response.items;
        }

        // Companies are already filtered by status on server side
        const companies = companiesData;

        // Fetch job counts for each company
        const counts: Record<string, number> = {};
        await Promise.all(
          companies.map(async (company: Company) => {
            try {
              const jobsResponse = await jobService.getJobsByCompany(company.id, { page: 1, limit: 1 });
              const jobs = (jobsResponse as any).jobs || jobsResponse.items || [];
              counts[company.id] = (jobsResponse as any).pagination?.total || jobs.length;
            } catch (error) {
              console.error(`Failed to fetch jobs for company ${company.id}:`, error);
              counts[company.id] = 0;
            }
          })
        );

        // Sort companies by job count (descending) and take top 6
        const sortedCompanies = companies
          .sort((a, b) => (counts[b.id] || 0) - (counts[a.id] || 0))
          .slice(0, 6);

        setActiveCompanies(sortedCompanies);
        setJobCounts(counts);
      } catch (error) {
        console.error('Failed to fetch companies:', error);
        setActiveCompanies([]);
      } finally {
        setIsLoadingCompanies(false);
      }
    };

    fetchCompanies();
  }, [user, recommendedJobs]);

  // Fetch recommended jobs (only for logged-in users)
  useEffect(() => {
    if (!user || user.role !== UserRole.CANDIDATE) {
      setRecommendedJobs([]);
      return;
    }

    const fetchRecommended = async () => {
      try {
        setIsLoadingRecommended(true);

        // Step 1: Get all CVs of the user
        const userCVsResponse: any = await cvService.getCVs();
        let userCVs: any[] = [];

        if (userCVsResponse.items && Array.isArray(userCVsResponse.items)) {
          userCVs = userCVsResponse.items;
        } else if (userCVsResponse.data?.items && Array.isArray(userCVsResponse.data.items)) {
          userCVs = userCVsResponse.data.items;
        } else if (Array.isArray(userCVsResponse)) {
          userCVs = userCVsResponse;
        }

        // If no CVs, no recommendations
        if (userCVs.length === 0) {
          setRecommendedJobs([]);
          setIsLoadingRecommended(false);
          return;
        }

        // Step 2: Fetch recommended jobs for each CV
        const allRecommendations: Map<string, { job: Job; matchScore: number }> = new Map();

        await Promise.all(
          userCVs.map(async (cv) => {
            try {
              const response: any = await cvService.getRecommendedJobsForCV(cv.id, { limit: 50 });

              let recommendations: any[] = [];
              if (response.recommendations && Array.isArray(response.recommendations)) {
                recommendations = response.recommendations;
              } else if (response.items && Array.isArray(response.items)) {
                recommendations = response.items;
              } else if (Array.isArray(response)) {
                recommendations = response;
              }

              recommendations.forEach((rec: any) => {
                const job = rec.job || rec;
                const jobId = job.id;
                const similarity = rec.similarity || 0;
                const matchScore = Math.round(similarity * 100);

                // Keep the highest match score if job appears in multiple CVs
                const existing = allRecommendations.get(jobId);
                if (!existing || matchScore > existing.matchScore) {
                  allRecommendations.set(jobId, { job, matchScore });
                }
              });
            } catch (err) {
              console.error(`Failed to fetch recommendations for CV ${cv.id}:`, err);
            }
          })
        );

        // Step 3: Convert map to array, sort by match score, take top 6
        const jobsWithMatchData = Array.from(allRecommendations.values())
          .sort((a, b) => b.matchScore - a.matchScore)
          .slice(0, 6);

        setRecommendedJobs(jobsWithMatchData);
      } catch (error) {
        console.error('Failed to fetch recommended jobs:', error);
        setRecommendedJobs([]);
      } finally {
        setIsLoadingRecommended(false);
      }
    };

    fetchRecommended();
  }, [user]);

  // Fetch saved jobs (only for logged-in users)
  useEffect(() => {
    if (!user || user.role !== UserRole.CANDIDATE) {
      setSavedJobIds(new Set());
      return;
    }

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
        const ids = new Set<string>();
        savedJobsArray.forEach((item: any) => {
          if (item.jobId) {
            ids.add(item.jobId);
          } else if (item.job?.id) {
            ids.add(item.job.id);
          } else if (item.id && !item.jobId) {
            ids.add(item.id);
          }
        });

        setSavedJobIds(ids);
      } catch (error) {
        console.error('Failed to fetch saved jobs:', error);
        setSavedJobIds(new Set());
      }
    };

    fetchSavedJobs();
  }, [user]);

  const handleSaveToggle = async (jobId: string) => {
    try {
      if (savedJobIds.has(jobId)) {
        await jobService.unsaveJob(jobId);
        setSavedJobIds(prev => {
          const newSet = new Set(prev);
          newSet.delete(jobId);
          return newSet;
        });
      } else {
        await jobService.saveJob(jobId);
        setSavedJobIds(prev => new Set(prev).add(jobId));
      }
    } catch (error) {
      console.error('Failed to save/unsave job:', error);
    }
  };

  const handleSearch = () => {
    const params = new URLSearchParams();
    if (searchKeyword) params.set('keyword', searchKeyword);
    if (searchLocation) params.set('location', searchLocation);
    navigate(`/jobs?${params.toString()}`);
  };

  const formatSalary = (job: Job) => {
    if (!job.salary) return 'Thỏa thuận';
    if (job.salary.hideAmount) return 'Thỏa thuận';
    if (!job.salary.minAmount || !job.salary.maxAmount) return 'Thỏa thuận';
    const min = Math.floor(job.salary.minAmount / 1000000);
    const max = Math.floor(job.salary.maxAmount / 1000000);
    const currency = job.salary.currency || 'VND';
    return `${min} - ${max} triệu ${currency}`;
  };

  return (
    <div className="min-h-screen">
      {/* Hero Section with Search and Carousel */}
      <section className="pt-6 px-4 pb-6">
        <div className="max-w-6xl mx-auto">
          {/* Search Bar */}
          <div className="mb-6">
            <Card className='glassmorphism'>
              <div className="flex flex-col md:flex-row gap-3">
                <Input
                  size="large"
                  prefix={<SearchOutlined className="text-gray-400" />}
                  placeholder="Tên công việc, từ khóa..."
                  className="flex-1"
                  value={searchKeyword}
                  onChange={(e) => setSearchKeyword(e.target.value)}
                  onPressEnter={handleSearch}
                />
                <Input
                  size="large"
                  prefix={<ShopOutlined className="text-gray-400" />}
                  placeholder="Địa điểm"
                  className="flex-1"
                  value={searchLocation}
                  onChange={(e) => setSearchLocation(e.target.value)}
                  onPressEnter={handleSearch}
                />
                <Button type="primary" size="large" onClick={handleSearch}>
                  Tìm kiếm
                </Button>
              </div>
            </Card>
          </div>

          {/* Hero Carousel - Smaller with Rounded Corners */}
          <div className="relative overflow-hidden rounded-3xl shadow-2xl">
            <Carousel
              autoplay
              autoplaySpeed={4000}
              effect="fade"
              arrows
              dots={{ className: "custom-carousel-dots" }}
            >
              <div className="relative h-[180px] sm:h-[200px] md:h-[220px] lg:h-[250px]">
                <img
                  src="/images/hero/hero-1.png"
                  alt="Tìm kiếm cơ hội nghề nghiệp"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-r from-blue-900/70 via-blue-600/60 to-transparent flex items-center justify-start px-8 sm:px-12 md:px-16">
                  <div className="max-w-2xl">
                    <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-white mb-2 sm:mb-3">
                      Kết Nối Tài Năng
                    </h2>
                    <h3 className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold text-white mb-2 sm:mb-3">
                      Tạo Dựng Tương Lai
                    </h3>
                    <p className="text-sm sm:text-base md:text-lg text-white/90">
                      Nền tảng tuyển dụng thông minh với AI
                    </p>
                  </div>
                </div>
              </div>

              <div className="relative h-[180px] sm:h-[200px] md:h-[220px] lg:h-[250px]">
                <img
                  src="/images/hero/hero-2.png"
                  alt="Cơ hội việc làm hàng đầu"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-r from-blue-900/70 via-indigo-600/60 to-transparent flex items-center justify-start px-8 sm:px-12 md:px-16">
                  <div className="max-w-2xl">
                    <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-white mb-2 sm:mb-3">
                      Hàng Nghìn
                    </h2>
                    <h3 className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold text-white mb-2 sm:mb-3">
                      Cơ Hội Việc Làm
                    </h3>
                    <p className="text-sm sm:text-base md:text-lg text-white/90">
                      Từ các công ty hàng đầu tại Việt Nam
                    </p>
                  </div>
                </div>
              </div>

              <div className="relative h-[180px] sm:h-[200px] md:h-[220px] lg:h-[250px]">
                <img
                  src="/images/hero/hero-4.png"
                  alt="Phát triển sự nghiệp"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-r from-blue-900/70 via-blue-600/60 to-transparent flex items-center justify-start px-8 sm:px-12 md:px-16">
                  <div className="max-w-2xl">
                    <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-white mb-2 sm:mb-3">
                      Phát Triển
                    </h2>
                    <h3 className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold text-white mb-2 sm:mb-3">
                      Sự Nghiệp Vững Chắc
                    </h3>
                    <p className="text-sm sm:text-base md:text-lg text-white/90">
                      Công cụ và tài nguyên hỗ trợ toàn diện
                    </p>
                  </div>
                </div>
              </div>

              <div className="relative h-[180px] sm:h-[200px] md:h-[220px] lg:h-[250px]">
                <img
                  src="/images/hero/hero-5.png"
                  alt="Ứng tuyển dễ dàng"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-r from-blue-900/70 via-blue-600/60 to-transparent flex items-center justify-start px-8 sm:px-12 md:px-16">
                  <div className="max-w-2xl">
                    <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-white mb-2 sm:mb-3">
                      Ứng Tuyển
                    </h2>
                    <h3 className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold text-white mb-2 sm:mb-3">
                      Nhanh Chóng & Dễ Dàng
                    </h3>
                    <p className="text-sm sm:text-base md:text-lg text-white/90">
                      Chỉ với vài cú click, CV của bạn đến tay nhà tuyển dụng
                    </p>
                  </div>
                </div>
              </div>

              <div className="relative h-[180px] sm:h-[200px] md:h-[220px] lg:h-[250px]">
                <img
                  src="/images/hero/hero-6.png"
                  alt="Đồng hành cùng bạn"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-r from-blue-900/70 via-blue-600/60 to-transparent flex items-center justify-start px-8 sm:px-12 md:px-16">
                  <div className="max-w-2xl">
                    <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-white mb-2 sm:mb-3">
                      Đồng Hành
                    </h2>
                    <h3 className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold text-white mb-2 sm:mb-3">
                      Cùng Bạn Thành Công
                    </h3>
                    <p className="text-sm sm:text-base md:text-lg text-white/90">
                      Hỗ trợ tận tâm từ đầu đến cuối hành trình
                    </p>
                  </div>
                </div>
              </div>
            </Carousel>
          </div>
        </div>
      </section>


      {/* Hot Jobs Section */}
      <section className="px-4">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">Việc Làm Nổi Bật</h2>
              <p className="text-base text-gray-600">Cơ hội việc làm hấp dẫn từ các công ty hàng đầu</p>
            </div>
            <Link to="/jobs">
              <Button>
                Xem tất cả
                <RightOutlined className="ml-2" />
              </Button>
            </Link>
          </div>

          {isLoadingJobs ? (
            <div className="flex justify-center items-center py-12">
              <Spin size="large" />
            </div>
          ) : activeJobs.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <p>Chưa có việc làm nào</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {activeJobs.map((job) => (
                <JobCard
                  key={job.id}
                  job={job}
                  showSaveButton={user?.role === UserRole.CANDIDATE}
                  isSaved={savedJobIds.has(job.id)}
                  onSaveToggle={handleSaveToggle}
                />
              ))}
            </div>
          )}
        </div>
      </section >

      {/* Recommended Jobs Section (for logged-in candidates) */}
      {user && user.role === UserRole.CANDIDATE && recommendedJobs.length > 0 && (
        <section className="px-4 py-10">
          <div className="max-w-6xl mx-auto">
            <div className="flex items-center justify-between mb-8 flex-row-reverse">
              <div>
                <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">Việc Làm Được Gợi Ý Cho Bạn</h2>
                <p className="text-base text-gray-600">Những công việc phù hợp với hồ sơ và kỹ năng của bạn</p>
              </div>
              <Link to="/candidate/recommended">
                <Button >
                  Xem tất cả
                  <RightOutlined className="ml-2" />
                </Button>
              </Link>
            </div>

            {isLoadingRecommended ? (
              <div className="flex justify-center items-center py-12">
                <Spin size="large" />
              </div>
            ) : recommendedJobs.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <p>Chưa có việc làm được gợi ý</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                {recommendedJobs.map(({ job }) => (
                  <JobCard
                    key={job.id}
                    job={job}
                    showSaveButton={user?.role === UserRole.CANDIDATE}
                    isSaved={savedJobIds.has(job.id)}
                    onSaveToggle={handleSaveToggle}
                  />
                ))}
              </div>
            )}
          </div>
        </section>
      )}

      {/* Top Companies Section */}
      < section className="py-10 px-4" >
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">Nhà Tuyển Dụng Hàng Đầu</h2>
              <p className="text-base text-gray-600">Các công ty uy tín đang tuyển dụng</p>
            </div>
            <Link to="/companies">
              <Button>
                Xem tất cả
                <RightOutlined className="ml-2" />
              </Button>
            </Link>
          </div>

          {isLoadingCompanies ? (
            <div className="flex justify-center items-center py-12">
              <Spin size="large" />
            </div>
          ) : activeCompanies.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <p>Chưa có công ty nào</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {activeCompanies.map((company) => {
                const jobCount = jobCounts[company.id] || 0;
                return (
                  <CompanyCard key={company.id} company={company} jobCount={jobCount} />
                );
              })}
            </div>
          )}
        </div>
      </section >

      {/* Features Section */}
      < section className="py-20 px-4 bg-gradient-to-br from-gray-50 to-slate-100" >
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">Tại Sao Chọn JobsConnect?</h2>
            <p className="text-base text-gray-600">
              Nền tảng tuyển dụng thông minh với nhiều tính năng vượt trội
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <Card styles={{ body: { padding: '24px' } }}>
              <div className="h-12 w-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                <ThunderboltOutlined className="h-6 w-6 text-blue-600" />
              </div>
              <h3 className="text-gray-900 mb-2 text-base sm:text-lg font-semibold">AI Thông Minh</h3>
              <p className="text-gray-600 text-sm sm:text-base">
                Công nghệ AI giúp gợi ý công việc phù hợp nhất với kỹ năng và kinh nghiệm của bạn
              </p>
            </Card>

            <Card styles={{ body: { padding: '24px' } }}>
              <div className="h-12 w-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                <ContainerOutlined className="h-6 w-6 text-blue-600" />
              </div>
              <h3 className="text-gray-900 mb-2 text-base sm:text-lg font-semibold">Quản Lý CV Dễ Dàng</h3>
              <p className="text-gray-600 text-sm sm:text-base">
                Tạo, chỉnh sửa và quản lý nhiều CV với các mẫu thiết kế chuyên nghiệp
              </p>
            </Card>

            <Card styles={{ body: { padding: '24px' } }}>
              <div className="h-12 w-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                <UserOutlined className="h-6 w-6 text-blue-600" />
              </div>
              <h3 className="text-gray-900 mb-2 text-base sm:text-lg font-semibold">Kết Nối Trực Tiếp</h3>
              <p className="text-gray-600 text-sm sm:text-base">
                Giao tiếp trực tiếp với nhà tuyển dụng, nhận phản hồi nhanh chóng
              </p>
            </Card>

            <Card styles={{ body: { padding: '24px' } }}>
              <div className="h-12 w-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                <ShopOutlined className="h-6 w-6 text-blue-600" />
              </div>
              <h3 className="text-gray-900 mb-2 text-base sm:text-lg font-semibold">Công Ty Uy Tín</h3>
              <p className="text-gray-600 text-sm sm:text-base">
                Kết nối với hàng nghìn công ty hàng đầu đã được xác thực
              </p>
            </Card>

            <Card styles={{ body: { padding: '24px' } }}>
              <div className="h-12 w-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                <LineChartOutlined className="h-6 w-6 text-blue-600" />
              </div>
              <h3 className="text-gray-900 mb-2 text-base sm:text-lg font-semibold">Phát Triển Sự Nghiệp</h3>
              <p className="text-gray-600 text-sm sm:text-base">
                Công cụ và tài nguyên giúp bạn phát triển kỹ năng và thăng tiến
              </p>
            </Card>

            <Card styles={{ body: { padding: '24px' } }}>
              <div className="h-12 w-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                <SafetyOutlined className="h-6 w-6 text-blue-600" />
              </div>
              <h3 className="text-gray-900 mb-2 text-base sm:text-lg font-semibold">Bảo Mật Cao</h3>
              <p className="text-gray-600 text-sm sm:text-base">
                Thông tin cá nhân được bảo vệ với công nghệ mã hóa tiên tiến
              </p>
            </Card>
          </div>
        </div>
      </section >

      {/* CTA Section */}
      < section className="py-20 px-4 bg-gradient-to-b from-blue-300 to-blue-500" >
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-2xl md:text-3xl font-bold text-white mb-4">
            Sẵn Sàng Bắt Đầu Hành Trình Mới?
          </h2>
          <p className="text-blue-100 mb-8">
            Tham gia JobsConnect ngay hôm nay và khám phá hàng nghìn cơ hội việc làm hấp dẫn
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/register">
              <Button size="large" type="default">
                Đăng ký miễn phí
              </Button>
            </Link>
            <Link to="/jobs">
              <Button size="large" className="bg-transparent text-white border-white hover:bg-blue-700">
                Khám phá việc làm
              </Button>
            </Link>
          </div>
        </div>
      </section >

      {/* Footer */}
      <footer className="bg-gray-950 text-gray-400 py-16 px-4 border-t border-gray-800">
        <div className="max-w-6xl mx-auto">
          {/* Main Footer Content */}
          <div className="grid grid-cols-1 md:grid-cols-5 gap-8 mb-12">
            {/* Brand & About */}
            <div className="md:col-span-1">
              <div className="flex items-center gap-2 mb-4">
                <img src="/logo.jpg" alt="JobsConnect" className="h-8 w-auto" />
                <span className="text-blue-400 font-bold text-lg">JobsConnect</span>
              </div>
              <p className="text-sm text-gray-500 mb-4">
                Nền tảng tuyển dụng thông minh kết nối ứng viên với nhà tuyển dụng
              </p>
              {/* Social Media */}
              <div className="flex gap-3">
                <a href="#" className="text-gray-500 hover:text-blue-400 transition text-lg">
                  <FacebookOutlined />
                </a>
                <a href="#" className="text-gray-500 hover:text-blue-400 transition text-lg">
                  <TwitterOutlined />
                </a>
                <a href="#" className="text-gray-500 hover:text-blue-400 transition text-lg">
                  <LinkedinOutlined />
                </a>
                <a href="#" className="text-gray-500 hover:text-blue-400 transition text-lg">
                  <InstagramOutlined />
                </a>
              </div>
            </div>

            {/* For Candidates */}
            <div>
              <h4 className="text-white font-semibold mb-4 text-sm">Dành cho ứng viên</h4>
              <ul className="space-y-2">
                <li><Link to="/jobs" className="text-gray-500 hover:text-white transition text-sm">Tìm việc làm</Link></li>
                <li><Link to="/companies" className="text-gray-500 hover:text-white transition text-sm">Tìm công ty</Link></li>
                <li><Link to="/candidate/cvs" className="text-gray-500 hover:text-white transition text-sm">Quản lý CV</Link></li>
                <li><Link to="/candidate/applications" className="text-gray-500 hover:text-white transition text-sm">Đơn ứng tuyển</Link></li>
              </ul>
            </div>

            {/* For Employers */}
            <div>
              <h4 className="text-white font-semibold mb-4 text-sm">Dành cho nhà tuyển dụng</h4>
              <ul className="space-y-2">
                <li><Link to="/recruiter/jobs" className="text-gray-500 hover:text-white transition text-sm">Đăng tin tuyển dụng</Link></li>
                <li><Link to="/recruiter/candidates" className="text-gray-500 hover:text-white transition text-sm">Tìm ứng viên</Link></li>
                <li><Link to="/recruiter/applications" className="text-gray-500 hover:text-white transition text-sm">Quản lý đơn</Link></li>
                <li><Link to="/recruiter/company" className="text-gray-500 hover:text-white transition text-sm">Quản lý công ty</Link></li>
              </ul>
            </div>

            {/* Company Info */}
            <div>
              <h4 className="text-white font-semibold mb-4 text-sm">Về JobsConnect</h4>
              <ul className="space-y-2">
                <li><a href="#" className="text-gray-500 hover:text-white transition text-sm">Giới thiệu</a></li>
                <li><Link to="/contact" className="text-gray-500 hover:text-white transition text-sm">Liên hệ</Link></li>
                <li><Link to="/faq" className="text-gray-500 hover:text-white transition text-sm">Câu hỏi thường gặp</Link></li>
                <li><a href="#" className="text-gray-500 hover:text-white transition text-sm">Blog</a></li>
              </ul>
            </div>

            {/* Legal */}
            <div>
              <h4 className="text-white font-semibold mb-4 text-sm">Pháp lý</h4>
              <ul className="space-y-2">
                <li><Link to="/terms" className="text-gray-500 hover:text-white transition text-sm">Điều khoản sử dụng</Link></li>
                <li><Link to="/privacy" className="text-gray-500 hover:text-white transition text-sm">Chính sách bảo mật</Link></li>
                <li><a href="#" className="text-gray-500 hover:text-white transition text-sm">Chính sách cookie</a></li>
              </ul>
            </div>
          </div>

          {/* Divider */}
          <div className="border-t border-gray-800 pt-8">
            {/* Bottom Footer */}
            <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-gray-600">
              <p>&copy; 2025 JobsConnect. All rights reserved.</p>
              <div className="flex gap-4">
                <span>Made with care in Vietnam</span>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div >
  );
}