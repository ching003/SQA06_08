import { useState, useEffect } from 'react';
import { Card, Input, Button, Select, Pagination, Spin } from 'antd';
import { SearchOutlined, ShopOutlined, LoadingOutlined } from '@ant-design/icons';
import { CompanyCard } from '../components/CompanyCard';
import { Company, Status } from '../lib/types';
import { companyService, jobService } from '../api/services';
import { toast } from 'sonner';
import { INDUSTRIES, COMPANY_SIZES } from '../lib/constants';

const { Option } = Select;

export function CompanyListPage() {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchInput, setSearchInput] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [industryFilter, setIndustryFilter] = useState('all');
  const [sizeFilter, setSizeFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [jobCounts, setJobCounts] = useState<Record<string, number>>({});

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      setSearchQuery(searchInput);
      setCurrentPage(1);
    }, 500);
    return () => clearTimeout(timer);
  }, [searchInput]);

  // Fetch companies from API with filters
  useEffect(() => {
    const fetchCompanies = async () => {
      try {
        setIsLoading(true);
        const response = await companyService.getCompanies({
          page: currentPage,
          limit: 12,
          search: searchQuery || undefined,
          industry: industryFilter !== 'all' ? industryFilter : undefined,
          size: sizeFilter !== 'all' ? sizeFilter : undefined,
          status: Status.ACTIVE, // Only show active companies for candidates
          orderBy: 'createdAt:desc',
        });

        const companiesData = response.items || [];
        setCompanies(companiesData);
        setTotalPages(response.pagination?.totalPages || 1);
        setTotal(response.pagination?.total || 0);

        // Fetch job counts for each company
        const counts: Record<string, number> = {};
        await Promise.all(
          companiesData.map(async (company: Company) => {
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
        setJobCounts(counts);
      } catch (error: any) {
        console.error('Failed to fetch companies:', error);
        toast.error(error?.message || 'Không thể tải danh sách công ty');
        setCompanies([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCompanies();
  }, [currentPage, searchQuery, industryFilter, sizeFilter]);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen py-6">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Danh sách công ty</h1>
          <p className="text-gray-600">
            Khám phá các công ty hàng đầu và cơ hội việc làm tốt nhất
          </p>
        </div>

        {/* Filters */}
        <Card className="glassmorphism mb-6" styles={{ body: { padding: '16px 20px' } }}>
          <div className="grid md:grid-cols-4 gap-3">
            {/* Search */}
            <div className="md:col-span-2">
              <Input
                placeholder="Tìm kiếm theo tên công ty..."
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                prefix={<SearchOutlined className="text-gray-400" />}
                size="middle"
              />
            </div>

            {/* Industry Filter */}
            <div>
              <Select
                value={industryFilter}
                onChange={(value) => {
                  setIndustryFilter(value);
                  setCurrentPage(1);
                }}
                placeholder="Ngành nghề"
                size="middle"
                className="w-full"
              >
                <Option value="all">Tất cả</Option>
                {INDUSTRIES.map(industry => (
                  <Option key={industry.value} value={industry.value}>
                    {industry.label}
                  </Option>
                ))}
              </Select>
            </div>

            {/* Size Filter */}
            <div>
              <Select
                value={sizeFilter}
                onChange={(value) => {
                  setSizeFilter(value);
                  setCurrentPage(1);
                }}
                placeholder="Quy mô"
                size="middle"
                className="w-full"
              >
                <Option value="all">Tất cả</Option>
                {COMPANY_SIZES.map(size => (
                  <Option key={size.value} value={size.value}>
                    {size.label}
                  </Option>
                ))}
              </Select>
            </div>
          </div>


          {/* Results count */}
          <div className="mt-4 p-3 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 sm:gap-0 text-sm sm:text-base text-gray-700">
              <span>
                Hiển thị <strong className="text-gray-900">{companies.length}</strong> trong tổng số{' '}
                <strong className="text-gray-900">{total}</strong> công ty
              </span>
              {(searchInput || industryFilter !== 'all' || sizeFilter !== 'all') && (
                <Button
                  onClick={() => {
                    setSearchInput('');
                    setSearchQuery('');
                    setIndustryFilter('all');
                    setSizeFilter('all');
                    setCurrentPage(1);
                  }}
                >
                  Xóa bộ lọc
                </Button>
              )}
            </div>
          </div>
        </Card>

        {/* Companies List */}
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <Spin size="large" />
          </div>
        ) : companies.length > 0 ? (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 mb-6 mt-4">
              {companies.map(company => {
                const jobCount = jobCounts[company.id] || 0;
                return (
                  <CompanyCard
                    key={company.id}
                    company={company}
                    jobCount={jobCount}
                  />
                );
              })}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center">
                <Pagination
                  current={currentPage}
                  total={total}
                  pageSize={12}
                  onChange={handlePageChange}
                  showSizeChanger={false}
                  showQuickJumper
                />
              </div>
            )}
          </>
        ) : (
          <Card className="glassmorphism" styles={{ body: { padding: '48px', textAlign: 'center' } }}>
            <ShopOutlined className="text-4xl sm:text-5xl text-gray-400 mb-4" />
            <h3 className="text-base sm:text-lg text-gray-900 mb-2">
              {searchInput || industryFilter !== 'all' || sizeFilter !== 'all'
                ? 'Không tìm thấy công ty nào'
                : 'Chưa có công ty nào'}
            </h3>
            <p className="text-sm sm:text-base text-gray-600 mb-6">
              {searchInput || industryFilter !== 'all' || sizeFilter !== 'all'
                ? 'Thử thay đổi bộ lọc hoặc tìm kiếm khác'
                : 'Các công ty sẽ được hiển thị ở đây khi có dữ liệu'}
            </p>
            {(searchInput || industryFilter !== 'all' || sizeFilter !== 'all') && (
              <Button
                onClick={() => {
                  setSearchInput('');
                  setSearchQuery('');
                  setIndustryFilter('all');
                  setSizeFilter('all');
                  setCurrentPage(1);
                }}
              >
                Xóa bộ lọc
              </Button>
            )}
          </Card>
        )}
      </div>
    </div>
  );
}

