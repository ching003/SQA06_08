import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router';
import { Card, Button, Badge, Divider, Spin, Tag } from 'antd';
import {
  ShopOutlined, EnvironmentOutlined, TeamOutlined, GlobalOutlined,
  MailOutlined, PhoneOutlined, ProjectOutlined, ArrowLeftOutlined,
  LinkOutlined, LoadingOutlined
} from '@ant-design/icons';
import { formatDistanceToNow } from 'date-fns';
import { vi } from 'date-fns/locale';
import { Company, Job } from '../lib/types';
import { companyService, jobService } from '../api/services';
import { toast } from 'sonner';
import { VerifiedAvatar } from '../components/VerifiedAvatar';
import { CompanyCard } from '../components/CompanyCard';

export function CompanyDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [company, setCompany] = useState<Company | null>(null);
  const [companyJobs, setCompanyJobs] = useState<Job[]>([]);
  const [relatedCompanies, setRelatedCompanies] = useState<Company[]>([]);
  const [isLoadingCompany, setIsLoadingCompany] = useState(true);
  const [isLoadingJobs, setIsLoadingJobs] = useState(true);
  const [isLoadingRelated, setIsLoadingRelated] = useState(false);
  const [relatedJobCounts, setRelatedJobCounts] = useState<Record<string, number>>({});

  // Fetch company data
  useEffect(() => {
    const fetchCompany = async () => {
      if (!id) return;

      try {
        setIsLoadingCompany(true);
        const companyData = await companyService.getCompanyById(id);
        setCompany(companyData);
      } catch (error) {
        console.error('Failed to fetch company:', error);
        toast.error('Không thể tải thông tin công ty');
        setCompany(null);
      } finally {
        setIsLoadingCompany(false);
      }
    };

    fetchCompany();
  }, [id]);

  // Fetch company jobs
  useEffect(() => {
    const fetchJobs = async () => {
      if (!id) return;

      try {
        setIsLoadingJobs(true);
        const response = await jobService.getJobsByCompany(id, { page: 1, limit: 50 });
        // API returns { jobs: [...], pagination: {...} } or { items: [...], pagination: {...} }
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
        // Filter only ACTIVE jobs
        setCompanyJobs(jobs.filter(job => job.status === 'ACTIVE'));
      } catch (error) {
        console.error('Failed to fetch company jobs:', error);
        setCompanyJobs([]);
      } finally {
        setIsLoadingJobs(false);
      }
    };

    if (company) {
      fetchJobs();
    }
  }, [id, company]);

  // Fetch related companies from same industry
  useEffect(() => {
    const fetchRelatedCompanies = async () => {
      if (!company || !company.industry) return;

      try {
        setIsLoadingRelated(true);
        const response = await companyService.getCompanies({
          page: 1,
          limit: 6,
          status: 'ACTIVE',
          industry: company.industry,
        });

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

        // Filter out the current company
        const filtered = companiesData.filter(c => c.id !== id);
        setRelatedCompanies(filtered);

        // Fetch job counts for related companies
        const counts: Record<string, number> = {};
        await Promise.all(
          filtered.map(async (relatedCompany: Company) => {
            try {
              const jobsResponse = await jobService.getJobsByCompany(relatedCompany.id, { page: 1, limit: 1 });
              const jobs = (jobsResponse as any).jobs || jobsResponse.items || [];
              counts[relatedCompany.id] = (jobsResponse as any).pagination?.total || jobs.length;
            } catch (error) {
              console.error(`Failed to fetch jobs for company ${relatedCompany.id}:`, error);
              counts[relatedCompany.id] = 0;
            }
          })
        );
        setRelatedJobCounts(counts);
      } catch (error) {
        console.error('Failed to fetch related companies:', error);
        setRelatedCompanies([]);
      } finally {
        setIsLoadingRelated(false);
      }
    };

    fetchRelatedCompanies();
  }, [company, id]);

  if (isLoadingCompany) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Spin indicator={<LoadingOutlined style={{ fontSize: 32 }} spin />} />
      </div>
    );
  }

  if (!company) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card style={{ maxWidth: 400 }}>
          <div className="p-12 text-center">
            <ShopOutlined style={{ fontSize: 64, color: '#9ca3af', marginBottom: 16 }} />
            <p className="text-gray-600 mb-4">Không tìm thấy công ty</p>
            <Button type="primary" onClick={() => navigate('/jobs')}>
              Quay lại tìm việc
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  const formatSalary = (job: Job) => {
    if (!job.salary) return 'Thỏa thuận';
    if (job.salary.hideAmount) return 'Thỏa thuận';
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

  const handleCopyLink = () => {
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(window.location.href)
          .then(() => {
            // Success - could add toast notification here
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
      // Success
    } catch (err) {
      // Failed
    }
    document.body.removeChild(textArea);
  };

  return (
    <div className="min-h-screen">
      {/* Banner with Logo Overlay */}
      <div className="relative">
        {/* Banner */}
        <div className="h-48 sm:h-56 lg:h-64 bg-gradient-to-r from-blue-600 to-blue-800 relative overflow-hidden">
          <img
            src={company.bannerUrl || '/1.jpg'}
            alt=""
            className="w-full h-full object-cover"
            onError={(e) => {
              // Fallback nếu cả bannerUrl và 1.jpg đều lỗi
              (e.target as HTMLImageElement).src = '/1.jpg';
            }}
          />
          <div className="absolute inset-0 bg-black/20" />
        </div>

        {/* Company Info Overlay */}
        <div className="max-w-6xl mx-auto px-3 sm:px-4">
          <div className="relative -mt-12 sm:-mt-16 lg:-mt-20">
            <Card className="glassmorphism">
              <div className="p-4 sm:p-6">
                <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 items-start">
                  {/* Logo with Verified Badge */}
                  <div className="shrink-0 mx-auto sm:mx-0">
                    <VerifiedAvatar
                      src={company.logoUrl || undefined}
                      alt={company.name}
                      size={window.innerWidth >= 1024 ? 128 : window.innerWidth >= 640 ? 112 : 96}
                      isVerified={company.status === 'APPROVED' || company.status === 'ACTIVE'}
                      type="company"
                      name={company.name}
                    />
                  </div>

                  {/* Company Header Info */}
                  <div className="flex-1 min-w-0 pt-0 sm:pt-2 w-full sm:w-auto">
                    <div className="mb-3">
                      <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 mb-2 wrap-break-word">{company.name}</h1>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 text-sm sm:text-base text-gray-700">
                      <div className="flex items-center gap-2 min-w-0">
                        <ShopOutlined className="text-base flex-shrink-0" style={{ color: '#9ca3af' }} />
                        <span className="truncate break-words">{company.industry}</span>
                      </div>
                      <div className="flex items-center gap-2 min-w-0">
                        <TeamOutlined className="text-base flex-shrink-0" style={{ color: '#9ca3af' }} />
                        <span className="truncate break-words">
                          {company.companySize === 'STARTUP' ? 'Startup' :
                            company.companySize === 'SMALL' ? '1-50 nhân viên' :
                              company.companySize === 'MEDIUM' ? '51-200 nhân viên' :
                                company.companySize === 'LARGE' ? '201-1000 nhân viên' :
                                  company.companySize === 'ENTERPRISE' ? '1000+ nhân viên' :
                                    company.companySize || 'Không xác định'}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 min-w-0 sm:col-span-2 lg:col-span-1">
                        <EnvironmentOutlined className="text-base flex-shrink-0" style={{ color: '#9ca3af' }} />
                        <span className="truncate break-words">{company.address}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-3 sm:px-4 lg:px-6 py-6 sm:py-8">
        <div className="grid lg:grid-cols-3 gap-4 sm:gap-6">
          {/* Left Column - Main Content */}
          <div className="lg:col-span-2 space-y-4 sm:space-y-6">
            {/* Company Description */}
            <Card className="glassmorphism" title={<span className="text-base sm:text-lg">Giới thiệu công ty</span>}>
              {company.description ? (
                <p className="text-sm sm:text-base text-gray-700 whitespace-pre-line leading-relaxed break-words">
                  {company.description}
                </p>
              ) : (
                <div className="text-center py-6 sm:py-8">
                  <ShopOutlined className="text-3xl sm:text-4xl text-gray-300 mb-3" />
                  <p className="text-sm sm:text-base text-gray-500">Chưa có thông tin giới thiệu công ty</p>
                </div>
              )}
            </Card>

            {/* Jobs Section */}
            <div>
              <div className="flex items-center justify-between mb-3 sm:mb-4 mt-2">
                <h2 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900">
                  Tuyển dụng ({companyJobs.length})
                </h2>
              </div>

              {isLoadingJobs ? (
                <div className="flex justify-center items-center py-8 sm:py-12">
                  <Spin indicator={<LoadingOutlined className="text-2xl sm:text-3xl" spin />} />
                </div>
              ) : companyJobs.length === 0 ? (
                <Card className="glassmorphism">
                  <div className="p-8 sm:p-12 text-center">
                    <ProjectOutlined className="text-3xl sm:text-4xl text-gray-300 mb-3" />
                    <p className="text-sm sm:text-base text-gray-600 mb-4">Hiện tại công ty chưa có tin tuyển dụng nào</p>
                    <Button type="primary" onClick={() => navigate('/jobs')} size="middle">
                      Xem việc làm khác
                    </Button>
                  </div>
                </Card>
              ) : (
                <div className="space-y-3 sm:space-y-4">
                  {companyJobs.map(job => {
                    return (
                      <Card key={job.id} className="glassmorphism hover:shadow-lg transition-shadow">
                        <div className="p-4 sm:p-6">
                          <div className="flex flex-col sm:flex-row items-start justify-between gap-3 sm:gap-4">
                            <div className="flex-1 min-w-0 w-full sm:w-auto">
                              <Link to={`/jobs/${job.id}`}>
                                <h3 className="text-base sm:text-lg lg:text-xl font-semibold text-gray-900 hover:text-blue-600 mb-2 sm:mb-3 break-words">
                                  {job.title}
                                </h3>
                              </Link>

                              <div className="flex flex-wrap gap-2 sm:gap-4 text-xs sm:text-sm text-gray-600 mb-2 sm:mb-3">
                                {job.location && (
                                  <div className="flex items-center gap-1 min-w-0">
                                    <EnvironmentOutlined className="text-xs flex-shrink-0" />
                                    <span className="truncate">{job.location}</span>
                                  </div>
                                )}
                                {job.type && (
                                  <div className="flex items-center gap-1 min-w-0">
                                    <ProjectOutlined className="text-xs flex-shrink-0" />
                                    <span className="capitalize truncate">
                                      {(job.jobType || job.type) === 'FULL_TIME' ? 'Toàn thời gian' :
                                        (job.jobType || job.type) === 'PART_TIME' ? 'Bán thời gian' :
                                          (job.jobType || job.type) === 'CONTRACT' ? 'Hợp đồng' :
                                            (job.jobType || job.type) === 'INTERNSHIP' ? 'Thực tập' :
                                              'Freelance'}
                                    </span>
                                  </div>
                                )}
                                {job.salary && (
                                  <div className="flex items-center gap-1 min-w-0">
                                    <span className="text-green-600 truncate">
                                      💰 {formatSalary(job)}
                                    </span>
                                  </div>
                                )}
                              </div>

                              <p className="text-xs sm:text-sm text-gray-600 line-clamp-2 mb-2 sm:mb-3 break-words">
                                {job.description}
                              </p>

                              <div className="flex flex-wrap items-center gap-2 sm:gap-4 text-xs sm:text-sm text-gray-500">
                                <span className="truncate">
                                  {formatDistanceToNow(new Date(job.createdAt), {
                                    addSuffix: true,
                                    locale: vi
                                  })}
                                </span>
                                {job.applicationCount > 0 && (
                                  <span className="truncate">👤 {job.applicationCount} ứng viên</span>
                                )}
                                {job.urgent && (
                                  <Badge color="red" className="text-xs">Gấp</Badge>
                                )}
                              </div>
                            </div>

                            <Link to={`/jobs/${job.id}`} className="w-full sm:w-auto">
                              <Button type="primary" size="middle" block className="sm:block-none">
                                Ứng tuyển
                              </Button>
                            </Link>
                          </div>
                        </div>
                      </Card>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Right Column - Sidebar */}
          <div className="space-y-4 sm:space-y-6">
            {/* Google Maps - Đưa lên đầu */}
            {company.address && (
              <Card
                className="glassmorphism"
                title={
                  <span className="flex items-center gap-2 text-sm sm:text-base">
                    <EnvironmentOutlined />
                    Vị trí trên bản đồ
                  </span>
                }
              >
                <div className="p-0">
                  <div className="aspect-[4/3] w-full overflow-hidden rounded-b-lg">
                    <iframe
                      title="Company Location"
                      src={`https://maps.google.com/maps?q=${encodeURIComponent(company.address)}&t=&z=15&ie=UTF8&iwloc=B&output=embed`}
                      width="100%"
                      height="100%"
                      style={{ border: 0 }}
                      allowFullScreen
                      loading="lazy"
                    />
                  </div>
                  
                </div>
              </Card>
            )}

            {/* Contact Info */}
            <Card className="glassmorphism" title={<span className="text-base sm:text-lg">Thông tin liên hệ</span>}>
              <div className="space-y-3 sm:space-y-4">
                <div>
                  <div className="flex items-start gap-2 text-gray-700">
                    <EnvironmentOutlined className="text-base sm:text-lg flex-shrink-0 mt-0.5" style={{ color: '#2563eb' }} />
                    <div className="min-w-0 flex-1">
                      <p className="text-sm sm:text-base font-medium text-gray-900 mb-1">Địa chỉ công ty</p>
                      <p className="text-xs sm:text-sm break-words">{company.address || 'Chưa cập nhật'}</p>
                    </div>
                  </div>
                </div>

                {company.website && (
                  <div>
                    <div className="flex items-start gap-2">
                      <GlobalOutlined className="text-base sm:text-lg flex-shrink-0 mt-0.5" style={{ color: '#2563eb' }} />
                      <div className="min-w-0 flex-1">
                        <p className="text-sm sm:text-base font-medium text-gray-900 mb-1">Xem trang web</p>
                        <a
                          href={company.website}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs sm:text-sm text-blue-600 hover:underline flex items-center gap-1 break-all"
                        >
                          {company.website}
                          <LinkOutlined className="text-xs" />
                        </a>
                      </div>
                    </div>
                  </div>
                )}

                {company.email && (
                  <div>
                    <div className="flex items-start gap-2">
                      <MailOutlined className="text-base sm:text-lg flex-shrink-0 mt-0.5" style={{ color: '#2563eb' }} />
                      <div className="min-w-0 flex-1">
                        <p className="text-sm sm:text-base font-medium text-gray-900 mb-1">Email</p>
                        <a href={`mailto:${company.email}`} className="text-xs sm:text-sm text-blue-600 hover:underline break-all">
                          {company.email}
                        </a>
                      </div>
                    </div>
                  </div>
                )}

                {company.phone && (
                  <div>
                    <div className="flex items-start gap-2">
                      <PhoneOutlined className="text-base sm:text-lg flex-shrink-0 mt-0.5" style={{ color: '#2563eb' }} />
                      <div className="min-w-0 flex-1">
                        <p className="text-sm sm:text-base font-medium text-gray-900 mb-1">Số điện thoại</p>
                        <a href={`tel:${company.phone}`} className="text-xs sm:text-sm text-blue-600 hover:underline break-words">
                          {company.phone}
                        </a>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </Card>

            {/* Company Stats */}
            <Card className="glassmorphism" title={<span className="text-base sm:text-lg">Chia sẻ công ty</span>}>
              <div>
                <div className="space-y-2 sm:space-y-3">
                  <p className="text-xs sm:text-sm text-gray-600">Sao chép đường dẫn</p>
                  <div className="flex flex-col sm:flex-row gap-2">
                    <input
                      type="text"
                      value={window.location.href}
                      readOnly
                      className="flex-1 px-2 sm:px-3 py-1.5 sm:py-2 border border-white/30 rounded-lg text-xs sm:text-sm text-gray-600 bg-white/50"
                    />
                    <Button
                      onClick={() => {
                        handleCopyLink();
                        toast.success('Đã sao chép đường dẫn');
                      }}
                      type="primary"
                      className="w-full sm:w-auto"
                    >
                      Copy
                    </Button>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </div>

        {/* Related Companies Section */}
        {relatedCompanies.length > 0 && (
          <div className="mt-8 sm:mt-12">
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4 sm:mb-6">
              Công ty cùng ngành
            </h2>

            {isLoadingRelated ? (
              <div className="flex justify-center items-center py-8 sm:py-12">
                <Spin indicator={<LoadingOutlined className="text-2xl sm:text-3xl" spin />} />
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                {relatedCompanies.map((relatedCompany) => (
                  <CompanyCard
                    key={relatedCompany.id}
                    company={relatedCompany}
                    jobCount={relatedJobCounts[relatedCompany.id] || 0}
                  />
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}