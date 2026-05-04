import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router';
import { Card, Button, Badge, Divider, Modal, Input, Select, Spin } from 'antd';
import {
  EnvironmentOutlined, DollarOutlined, ProjectOutlined, BankOutlined,
  ClockCircleOutlined, EyeOutlined, UserOutlined, CheckCircleOutlined,
  BookOutlined, ShareAltOutlined, ArrowLeftOutlined, LoadingOutlined
} from '@ant-design/icons';
import { useAuth } from '../contexts/AuthContext';
import { UserRole, Job, Company, CV, SkillLevel } from '../lib/types';
import { jobService, companyService, cvService, applicationService } from '../api/services';
import { message } from 'antd';
import { formatDistanceToNow } from 'date-fns';
import { vi } from 'date-fns/locale';
import { JobCard } from '../components/JobCard';

const { TextArea } = Input;
const { Option } = Select;

// Skill level labels
const skillLevelLabels: Record<string, string> = {
  [SkillLevel.BEGINNER]: 'Cơ bản',
  [SkillLevel.INTERMEDIATE]: 'Trung bình',
  [SkillLevel.ADVANCED]: 'Nâng cao',
  [SkillLevel.EXPERT]: 'Chuyên gia',
};

export function JobDetailPage() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [job, setJob] = useState<Job | null>(null);
  const [company, setCompany] = useState<Company | null>(null);
  const [userCVs, setUserCVs] = useState<CV[]>([]);
  const [companyJobs, setCompanyJobs] = useState<Job[]>([]);
  const [similarJobs, setSimilarJobs] = useState<Array<Job & { similarity?: number; isSaved?: boolean }>>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingCVs, setIsLoadingCVs] = useState(false);
  const [isLoadingCompanyJobs, setIsLoadingCompanyJobs] = useState(false);
  const [isLoadingSimilar, setIsLoadingSimilar] = useState(false);
  const [isApplyDialogOpen, setIsApplyDialogOpen] = useState(false);
  const [selectedCVId, setSelectedCVId] = useState('');
  const [coverLetter, setCoverLetter] = useState('');
  const [isSaved, setIsSaved] = useState(false);
  const [isApplying, setIsApplying] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Fetch job and company data
  useEffect(() => {
    const fetchJob = async () => {
      if (!id) return;

      try {
        setIsLoading(true);
        const jobData = await jobService.getJobById(id);
        setJob(jobData);

        // Fetch company if job has companyId
        if (jobData.companyId) {
          try {
            const companyData = await companyService.getCompanyById(jobData.companyId);
            setCompany(companyData);
          } catch (error) {
            console.error('Failed to fetch company:', error);
            // If company fetch fails, try to use company from job object if available
            if ((jobData as any).company) {
              setCompany((jobData as any).company);
            }
          }
        } else if ((jobData as any).company) {
          // If company is nested in job object
          setCompany((jobData as any).company);
        }
      } catch (error) {
        console.error('Failed to fetch job:', error);
        message.error('Không thể tải thông tin công việc');
        setJob(null);
      } finally {
        setIsLoading(false);
      }
    };

    fetchJob();
  }, [id]);

  // Fetch user CVs if user is candidate
  useEffect(() => {
    const fetchUserCVs = async () => {
      if (!user || user.role !== UserRole.CANDIDATE || !user.id) return;

      try {
        setIsLoadingCVs(true);
        const cvs = await cvService.getCVsByUser(user.id);
        setUserCVs(cvs);
      } catch (error) {
        console.error('Failed to fetch user CVs:', error);
        setUserCVs([]);
      } finally {
        setIsLoadingCVs(false);
      }
    };

    fetchUserCVs();
  }, [user]);

  // Fetch company jobs (for sidebar)
  useEffect(() => {
    const fetchCompanyJobs = async () => {
      if (!job || !job.companyId) return;

      try {
        setIsLoadingCompanyJobs(true);
        const response = await jobService.getJobsByCompany(job.companyId, {
          page: 1,
          limit: 5,
        });

        let jobs: Job[] = [];
        if (response.items && Array.isArray(response.items)) {
          jobs = response.items;
        } else if (Array.isArray(response)) {
          jobs = response;
        }

        // Exclude current job and only show ACTIVE jobs
        const companyJobsList = jobs.filter(j =>
          j.id !== job.id && j.status === 'ACTIVE'
        ).slice(0, 5);

        setCompanyJobs(companyJobsList);
      } catch (error) {
        console.error('Failed to fetch company jobs:', error);
        setCompanyJobs([]);
      } finally {
        setIsLoadingCompanyJobs(false);
      }
    };

    fetchCompanyJobs();
  }, [job]);

  // Fetch similar jobs (for bottom section)
  useEffect(() => {
    const fetchSimilarJobs = async () => {
      if (!job || !id) return;

      try {
        setIsLoadingSimilar(true);
        const response = await jobService.getSimilarJobs(id, {
          limit: 6,
          minSimilarity: 0,
        });

        // Handle different response formats
        let jobs: any[] = [];
        if (Array.isArray(response)) {
          jobs = response;
        } else if ((response as any).jobs && Array.isArray((response as any).jobs)) {
          jobs = (response as any).jobs;
        } else if ((response as any).items && Array.isArray((response as any).items)) {
          jobs = (response as any).items;
        } else if (response.items && Array.isArray(response.items)) {
          jobs = response.items;
        }

        // If user is a candidate, fetch saved jobs to mark which ones are saved
        if (user && user.role === UserRole.CANDIDATE) {
          try {
            const savedResponse = await jobService.getSavedJobs({ page: 1, limit: 100 });

            let savedJobsArray: any[] = [];
            // Handle response structure
            if (savedResponse && (savedResponse as any).data?.savedJobs && Array.isArray((savedResponse as any).data.savedJobs)) {
              savedJobsArray = (savedResponse as any).data.savedJobs;
            } else if (savedResponse && (savedResponse as any).savedJobs && Array.isArray((savedResponse as any).savedJobs)) {
              savedJobsArray = (savedResponse as any).savedJobs;
            } else if (savedResponse && savedResponse.items && Array.isArray(savedResponse.items)) {
              savedJobsArray = savedResponse.items;
            } else if (savedResponse && (savedResponse as any).data?.items && Array.isArray((savedResponse as any).data.items)) {
              savedJobsArray = (savedResponse as any).data.items;
            } else if (Array.isArray(savedResponse)) {
              savedJobsArray = savedResponse;
            }

            // Mark saved jobs
            const jobsWithSavedStatus = jobs.map(job => {
              const isSaved = savedJobsArray.some((item: any) => {
                if (item.jobId === job.id) return true;
                if (item.job && item.job.id === job.id) return true;
                if (item.id === job.id && !item.jobId) return true;
                return false;
              });
              return { ...job, isSaved };
            });

            setSimilarJobs(jobsWithSavedStatus);
          } catch (error) {
            console.error('Failed to fetch saved jobs for similar jobs:', error);
            setSimilarJobs(jobs);
          }
        } else {
          setSimilarJobs(jobs);
        }
      } catch (error) {
        console.error('Failed to fetch similar jobs:', error);
        setSimilarJobs([]);
      } finally {
        setIsLoadingSimilar(false);
      }
    };

    fetchSimilarJobs();
  }, [job, id, user]);

  // Check if job is saved (only for candidates)
  useEffect(() => {
    const checkSavedStatus = async () => {
      // Only check if user is a candidate
      if (!user || user.role !== UserRole.CANDIDATE || !id) {
        setIsSaved(false);
        return;
      }

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

        const isJobSaved = savedJobsArray.some((item: any) => {
          if (item.jobId === id) return true;
          if (item.job && item.job.id === id) return true;
          if (item.id === id && !item.jobId) return true;
          return false;
        });

        setIsSaved(isJobSaved);
      } catch (error) {
        console.error('Failed to check saved status:', error);
        setIsSaved(false);
      }
    };

    checkSavedStatus();
  }, [user, id]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Spin indicator={<LoadingOutlined style={{ fontSize: 48 }} spin />} />
      </div>
    );
  }

  if (!job || !company) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card style={{ maxWidth: 400 }}>
          <div className="text-center p-6">
            <p className="text-gray-600 mb-4">Không tìm thấy công việc</p>
            <Button type="primary" onClick={() => navigate('/jobs')}>
              Quay lại danh sách
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  const formatSalary = (job: Job) => {
    if (!job.salary) return 'Thỏa thuận';
    if (job.salary.hideAmount || job.salary.isNegotiable) return 'Thỏa thuận';
    if (!job.salary.minAmount && !job.salary.maxAmount) return 'Thỏa thuận';

    const format = (val: number) => `${(val / 1000000).toFixed(0)}tr`;
    const currency = job.salary.currency || 'VND';
    const min = job.salary.minAmount;
    const max = job.salary.maxAmount;

    if (min && max) return `${format(min)} - ${format(max)} ${currency}`;
    if (min) return `Từ ${format(min)} ${currency}`;
    if (max) return `Lên đến ${format(max)} ${currency}`;
    return 'Thỏa thuận';
  };

  const handleApply = async () => {
    if (!user) {
      navigate('/login');
      return;
    }

    if (user.role !== UserRole.CANDIDATE) {
      message.error('Chỉ ứng viên mới có thể ứng tuyển');
      return;
    }

    if (!selectedCVId) {
      message.error('Vui lòng chọn CV');
      return;
    }

    if (!id) {
      message.error('Không tìm thấy công việc');
      return;
    }

    try {
      setIsApplying(true);
      await applicationService.applyForJob({
        jobId: id,
        cvId: selectedCVId,
        coverLetter: coverLetter || undefined,
      });
      message.success('Đã gửi đơn ứng tuyển thành công!');
      setIsApplyDialogOpen(false);
      setSelectedCVId('');
      setCoverLetter('');
    } catch (error: any) {
      console.error('Failed to apply:', error);
      message.error(error.message || 'Không thể gửi đơn ứng tuyển. Vui lòng thử lại.');
    } finally {
      setIsApplying(false);
    }
  };

  const handleSave = async () => {
    if (!user) {
      navigate('/login');
      return;
    }

    if (!id) {
      return;
    }

    try {
      setIsSaving(true);
      if (isSaved) {
        await jobService.unsaveJob(id);
        setIsSaved(false);
        message.success('Đã bỏ lưu công việc');
      } else {
        await jobService.saveJob(id);
        setIsSaved(true);
        message.success('Đã lưu công việc');
      }
    } catch (error: any) {
      console.error('Failed to save/unsave job:', error);
      message.error(error.message || 'Không thể lưu công việc. Vui lòng thử lại.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleShare = () => {
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(window.location.href)
          .then(() => {
            message.success('Đã sao chép link công việc');
          })
          .catch(() => {
            fallbackCopyTextToClipboard(window.location.href);
          });
      } else {
        fallbackCopyTextToClipboard(window.location.href);
      }
    } catch (err) {
      fallbackCopyTextToClipboard(window.location.href);
    }
  };

  const fallbackCopyTextToClipboard = (text: string) => {
    const textArea = document.createElement('textarea');
    textArea.value = text;
    textArea.style.position = 'fixed';
    textArea.style.top = '0';
    textArea.style.left = '0';
    textArea.style.opacity = '0';
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    try {
      document.execCommand('copy');
      message.success('Đã sao chép link công việc');
    } catch (err) {
      message.error('Không thể sao chép link');
    }
    document.body.removeChild(textArea);
  };

  const handleSaveSimilarJob = async (jobId: string) => {
    try {
      const jobToToggle = similarJobs.find(j => j.id === jobId);
      if (!jobToToggle) return;

      if (jobToToggle.isSaved) {
        await jobService.unsaveJob(jobId);
      } else {
        await jobService.saveJob(jobId);
      }

      // Update the similar jobs list
      setSimilarJobs(prev => prev.map(j =>
        j.id === jobId ? { ...j, isSaved: !j.isSaved } : j
      ));
    } catch (error) {
      console.error('Failed to save/unsave similar job:', error);
      message.error('Không thể lưu công việc');
    }
  };

  return (
    <div className="min-h-screen py-4 sm:py-6 lg:py-8">
      <div className="max-w-6xl mx-auto px-3 sm:px-4 lg:px-6">
        <Button
          type="text"
          icon={<ArrowLeftOutlined />}
          onClick={() => navigate(-1)}
          className="mb-8"
          size="small"
        >
          <span className="hidden sm:inline">Quay lại</span>
        </Button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-4 sm:space-y-6 min-w-0">
            {/* Job Header */}
            <Card className="glassmorphism">
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                <div className="flex-shrink-0">
                  <div className="h-16 w-16 sm:h-20 sm:w-20 bg-gray-100 rounded-lg flex items-center justify-center">
                    {company.logoUrl ? (
                      <img src={company.logoUrl} alt={company.name} className="h-full w-full object-cover rounded-lg" />
                    ) : (
                      <BankOutlined className="text-2xl sm:text-3xl text-gray-400" />
                    )}
                  </div>
                </div>

                <div className="flex-1 min-w-0">
                  <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 mb-2 break-words">{job.title}</h1>
                  <Link to={`/companies/${company.id}`}>
                    <p className="text-base sm:text-lg text-gray-600 hover:text-blue-600 mb-3 truncate">
                      {company.name}
                    </p>
                  </Link>

                  <div className="flex flex-wrap gap-2 sm:gap-4 text-sm sm:text-base text-gray-600 mb-4">
                    <div className="flex items-center gap-1">
                      <EnvironmentOutlined />
                      <span className="truncate">{job.location || 'Không xác định'}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <DollarOutlined />
                      <span className="truncate">{formatSalary(job)}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <ProjectOutlined />
                      <span className="truncate">
                        {(job.jobType || job.type) === 'FULL_TIME' ? 'Toàn thời gian' :
                          (job.jobType || job.type) === 'PART_TIME' ? 'Bán thời gian' :
                            (job.jobType || job.type) === 'CONTRACT' ? 'Hợp đồng' :
                              (job.jobType || job.type) === 'INTERNSHIP' ? 'Thực tập' :
                                'Freelance'}
                      </span>
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
                    <Button
                      type="primary"
                      size="large"
                      onClick={() => setIsApplyDialogOpen(true)}
                      className="w-full sm:w-auto"
                    >
                      Ứng tuyển ngay
                    </Button>

                    <Button
                      type={isSaved ? "primary" : "default"}
                      size="large"
                      icon={<BookOutlined />}
                      onClick={handleSave}
                      loading={isSaving}
                      className="w-full sm:w-auto"
                    >
                      {isSaved ? 'Đã lưu' : 'Lưu'}
                    </Button>

                    <Button
                      size="large"
                      icon={<ShareAltOutlined />}
                      onClick={handleShare}
                      className="w-full sm:w-auto"
                    >
                      Chia sẻ
                    </Button>
                  </div>
                </div>
              </div>
            </Card>

            {/* Job Description */}
            <Card className="glassmorphism" title={<span className="text-base sm:text-lg">Mô tả công việc</span>}>
              <div className="space-y-4 sm:space-y-6">
                <div>
                  <p className="text-sm sm:text-base text-gray-700 whitespace-pre-line leading-relaxed">{job.description}</p>
                </div>

                <Divider />

                {job.requirements && job.requirements.length > 0 && (
                  <div>
                    <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-3">Yêu cầu công việc</h3>
                    <ul className="space-y-2 sm:space-y-3">
                      {job.requirements.map((req, index) => (
                        <li key={index} className="flex gap-2 sm:gap-3">
                          <CheckCircleOutlined className="text-green-500 flex-shrink-0 mt-0.5" style={{ fontSize: 18 }} />
                          <div className="min-w-0 flex-1">
                            <p className="text-sm sm:text-base text-gray-900 font-medium break-words">{typeof req === 'string' ? req : req.title || req}</p>
                            {typeof req === 'object' && req.description && (
                              <p className="text-sm sm:text-base text-gray-600 break-words">{req.description}</p>
                            )}
                          </div>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {job.requirements && job.requirements.length > 0 && <Divider />}

                {job.benefits && job.benefits.length > 0 && (
                  <div>
                    <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-3">Quyền lợi</h3>
                    <ul className="space-y-2 sm:space-y-3">
                      {job.benefits.map((benefit, index) => (
                        <li key={index} className="flex gap-2 sm:gap-3">
                          <CheckCircleOutlined className="text-blue-500 flex-shrink-0 mt-0.5" style={{ fontSize: 18 }} />
                          <div className="min-w-0 flex-1">
                            <p className="text-sm sm:text-base text-gray-900 font-medium break-words">{typeof benefit === 'string' ? benefit : benefit.title || benefit}</p>
                            {typeof benefit === 'object' && benefit.description && (
                              <p className="text-sm sm:text-base text-gray-600 break-words">{benefit.description}</p>
                            )}
                          </div>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {job.benefits && job.benefits.length > 0 && <Divider />}

                {job.skills && job.skills.length > 0 && (
                  <div>
                    <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-3">Kỹ năng yêu cầu</h3>
                    <div className="flex flex-wrap gap-2">
                      {job.skills.map((skill, index) => (
                        <Badge
                          key={index}
                          count={
                            <span className="text-xs sm:text-sm">
                              {typeof skill === 'string' ? skill : skill.skillName || (skill as any).name || skill}
                              {typeof skill === 'object' && skill.level && (
                                <span className="ml-1 text-xs text-black-500">
                                  ({skillLevelLabels[skill.level] || skill.level})
                                </span>
                              )}
                            </span>
                          }
                          style={{ backgroundColor: '#E5E7EB', color: '#374151', padding: '4px 8px' }}
                        />
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-4 sm:space-y-6 min-w-0">
            {/* Job Stats */}
            <Card className="glassmorphism" title={<span className="text-base sm:text-lg">Thông tin chung</span>}>
              <div className="space-y-3 sm:space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-sm sm:text-base text-gray-600">
                    <UserOutlined />
                    <span>Ứng viên</span>
                  </div>
                  <span className="text-sm sm:text-base font-semibold">{job.applicationCount}</span>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-sm sm:text-base text-gray-600">
                    <ClockCircleOutlined />
                    <span>Đăng</span>
                  </div>
                  <span className="text-xs sm:text-sm truncate">
                    {formatDistanceToNow(new Date(job.createdAt), {
                      addSuffix: true,
                      locale: vi
                    })}
                  </span>
                </div>

                <Divider />

                {job.experienceLevel && (
                  <div>
                    <p className="text-xs sm:text-sm text-gray-600 mb-1">Kinh nghiệm</p>
                    <p className="text-sm sm:text-base font-medium capitalize break-words">{job.experienceLevel.toLowerCase().replace('_', ' ')}</p>
                  </div>
                )}

                {job.expiresAt && (
                  <div>
                    <p className="text-xs sm:text-sm text-gray-600 mb-1">Hạn nộp</p>
                    <p className="text-sm sm:text-base font-medium">{new Date(job.expiresAt).toLocaleDateString('vi-VN')}</p>
                  </div>
                )}
              </div>
            </Card>

            {/* Company Info */}
            <Card className="glassmorphism" title={<span className="text-base sm:text-lg">Về công ty</span>}>
              <div className="space-y-3 sm:space-y-4">
                <div className="text-center">
                  <div className="h-16 w-16 sm:h-20 sm:w-20 bg-gray-100 rounded-lg flex items-center justify-center mx-auto mb-2 sm:mb-3">
                    {company.logoUrl ? (
                      <img src={company.logoUrl} alt={company.name} className="h-full w-full object-cover rounded-lg" />
                    ) : (
                      <BankOutlined className="text-2xl sm:text-3xl text-gray-400" />
                    )}
                  </div>
                  <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-1 break-words">{company.name}</h3>
                  <p className="text-sm sm:text-base text-gray-600 break-words">{company.industry}</p>
                </div>

                <Divider />

                <div className="space-y-2 text-sm sm:text-base text-gray-700">
                  <p className="break-words"><strong>Quy mô:</strong> {
                    company.companySize === 'STARTUP' ? 'Startup' :
                      company.companySize === 'SMALL' ? '1-50 nhân viên' :
                        company.companySize === 'MEDIUM' ? '51-200 nhân viên' :
                          company.companySize === 'LARGE' ? '201-1000 nhân viên' :
                            company.companySize === 'ENTERPRISE' ? '1000+ nhân viên' :
                              company.companySize || 'Không xác định'
                  }</p>
                  <p className="break-words"><strong>Địa điểm:</strong> {company.address}</p>
                </div>

                <Link to={`/companies/${company.id}`}>
                  <Button type="default" block size="middle">
                    Xem trang công ty
                  </Button>
                </Link>
              </div>
            </Card>

            {/* Company Jobs */}
            {isLoadingCompanyJobs ? (
              <Card className="glassmorphism">
                <div className="flex justify-center p-4 sm:p-6">
                  <Spin />
                </div>
              </Card>
            ) : companyJobs.length > 0 && (
              <Card className="glassmorphism" title={<span className="text-base sm:text-lg">Việc làm cùng công ty</span>}>
                <div className="space-y-2 sm:space-y-3">
                  {companyJobs.map(companyJob => (
                    <Link
                      key={companyJob.id}
                      to={`/jobs/${companyJob.id}`}
                      className="block p-3 sm:p-4 rounded-lg border border-white/30 hover:border-blue-300 hover:bg-white/40 transition-colors"
                    >
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <h4 className="text-sm sm:text-base text-gray-900 font-semibold line-clamp-2 hover:text-blue-600 flex-1 break-words">
                          {companyJob.title}
                        </h4>
                        {companyJob.urgent && (
                          <Badge count="Gấp" style={{ backgroundColor: '#DC2626', fontSize: '10px' }} />
                        )}
                      </div>

                      {companyJob.salary && (
                        <div className="flex items-center gap-1 mb-1 sm:mb-2">
                          <DollarOutlined className="text-green-600 text-xs sm:text-sm" />
                          <span className="text-green-600 font-medium text-xs sm:text-sm truncate">
                            {formatSalary(companyJob)}
                          </span>
                        </div>
                      )}

                      {companyJob.type && (
                        <div className="flex items-center gap-1 text-gray-600 text-xs sm:text-sm mb-1 sm:mb-2">
                          <ProjectOutlined className="text-xs" />
                          <span className="truncate">
                            {(companyJob.jobType || companyJob.type) === 'FULL_TIME' ? 'Toàn thời gian' :
                              (companyJob.jobType || companyJob.type) === 'PART_TIME' ? 'Bán thời gian' :
                                (companyJob.jobType || companyJob.type) === 'CONTRACT' ? 'Hợp đồng' :
                                  (companyJob.jobType || companyJob.type) === 'INTERNSHIP' ? 'Thực tập' :
                                    'Freelance'}
                          </span>
                        </div>
                      )}

                      {companyJob.experienceLevel && (
                        <div className="text-gray-500 text-xs truncate">
                          Kinh nghiệm: {companyJob.experienceLevel.toLowerCase().replace('_', ' ')}
                        </div>
                      )}
                    </Link>
                  ))}
                  {companyJobs.length >= 5 && (
                    <Link to={`/companies/${company.id}`}>
                      <Button type="default" block className="mt-2">
                        Xem tất cả việc làm
                      </Button>
                    </Link>
                  )}
                </div>
              </Card>
            )}
          </div>
        </div>

        {/* Similar Jobs Section */}
        {isLoadingSimilar ? (
          <div className="mt-6 sm:mt-8 flex justify-center">
            <Spin size="large" />
          </div>
        ) : similarJobs.length > 0 && (
          <div className="mt-6 sm:mt-8">
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4 sm:mb-6">Việc làm tương tự</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {similarJobs.map(similarJob => (
                <JobCard
                  key={similarJob.id}
                  job={similarJob}
                  showSaveButton={user?.role === UserRole.CANDIDATE}
                  isSaved={(similarJob as any).isSaved}
                  onSaveToggle={handleSaveSimilarJob}
                />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Apply Dialog */}
      <Modal
        title={`Ứng tuyển: ${job.title}`}
        open={isApplyDialogOpen}
        onCancel={() => setIsApplyDialogOpen(false)}
        footer={[
          <Button key="cancel" onClick={() => setIsApplyDialogOpen(false)} disabled={isApplying}>
            Hủy
          </Button>,
          <Button
            key="submit"
            type="primary"
            loading={isApplying}
            disabled={!selectedCVId}
            onClick={handleApply}
          >
            Gửi đơn ứng tuyển
          </Button>,
        ]}
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Chọn CV</label>
            <Select
              value={selectedCVId}
              onChange={setSelectedCVId}
              placeholder="Chọn CV của bạn"
              style={{ width: '100%' }}
              loading={isLoadingCVs}
            >
              {userCVs.map(cv => (
                <Option key={cv.id} value={cv.id}>
                  {cv.title} {cv.isMain && '(Chính)'}
                </Option>
              ))}
            </Select>
            {!isLoadingCVs && userCVs.length === 0 && (
              <p className="text-orange-600 text-sm mt-2">
                Bạn chưa có CV nào. <Link to="/candidate/cvs/new" className="text-blue-600 hover:underline">Tạo CV mới</Link>
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Thư xin việc (không bắt buộc)</label>
            <TextArea
              placeholder="Giới thiệu bản thân và lý do bạn phù hợp với vị trí này..."
              value={coverLetter}
              onChange={(e) => setCoverLetter(e.target.value)}
              rows={6}
            />
          </div>
        </div>
      </Modal>
    </div>
  );
}
