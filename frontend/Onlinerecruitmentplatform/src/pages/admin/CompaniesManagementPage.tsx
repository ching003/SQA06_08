import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { Card, Input, Button, Badge, Avatar, Table, Select, Modal, message, Tag, Typography, Spin, Descriptions, Divider } from 'antd';
import {
  SearchOutlined, EyeOutlined, CheckOutlined, CloseOutlined,
  LockOutlined, UnlockOutlined, ReloadOutlined, FileTextOutlined,
  GlobalOutlined, MailOutlined, PhoneOutlined, EnvironmentOutlined,
  CalendarOutlined, TeamOutlined, LinkOutlined
} from '@ant-design/icons';
import { companyService } from '../../api/services';
import { Company, CompanyStatus, CompanySize, Status } from '../../lib/types';

const { Text } = Typography;

// Map API Status to CompanyStatus for display
const mapStatusToCompanyStatus = (status: string): CompanyStatus => {
  // API uses Status enum (ACTIVE, PENDING, LOCKED, SUSPENDED, INACTIVE)
  // Frontend uses CompanyStatus enum (PENDING, APPROVED, REJECTED, LOCKED)
  switch (status) {
    case Status.PENDING:
      return CompanyStatus.PENDING;
    case Status.ACTIVE:
      return CompanyStatus.APPROVED;
    case Status.LOCKED:
      return CompanyStatus.LOCKED;
    case Status.SUSPENDED:
      return CompanyStatus.REJECTED;
    case Status.INACTIVE:
      return CompanyStatus.REJECTED;
    default:
      return CompanyStatus.PENDING;
  }
};

// Map CompanyStatus to Status for API
const mapCompanyStatusToStatus = (status: CompanyStatus): Status => {
  switch (status) {
    case CompanyStatus.PENDING:
      return Status.PENDING;
    case CompanyStatus.APPROVED:
      return Status.ACTIVE;
    case CompanyStatus.LOCKED:
      return Status.LOCKED;
    case CompanyStatus.REJECTED:
      return Status.SUSPENDED;
    default:
      return Status.PENDING;
  }
};

const statusLabels = {
  [CompanyStatus.PENDING]: 'Chờ duyệt',
  [CompanyStatus.APPROVED]: 'Đã duyệt',
  [CompanyStatus.REJECTED]: 'Từ chối',
  [CompanyStatus.LOCKED]: 'Đã khóa',
};

const statusColors = {
  [CompanyStatus.PENDING]: 'warning',
  [CompanyStatus.APPROVED]: 'success',
  [CompanyStatus.REJECTED]: 'error',
  [CompanyStatus.LOCKED]: 'default',
};

const companySizeLabels = {
  [CompanySize.STARTUP]: '1-10',
  [CompanySize.SMALL]: '11-50',
  [CompanySize.MEDIUM]: '51-200',
  [CompanySize.LARGE]: '201-500',
  [CompanySize.ENTERPRISE]: '500+',
};

export function CompaniesManagementPage() {
  const navigate = useNavigate();
  const [companies, setCompanies] = useState<Company[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [searchInput, setSearchInput] = useState('');
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedSize, setSelectedSize] = useState<string>('all');
  const [selectedIndustry, setSelectedIndustry] = useState<string>('all');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalResults, setTotalResults] = useState(0);
  const [actionDialog, setActionDialog] = useState<{
    open: boolean;
    action: 'approve' | 'reject' | 'lock' | 'unlock' | null;
    companyId: string | null;
    companyName: string;
  }>({
    open: false,
    action: null,
    companyId: null,
    companyName: '',
  });
  const [detailModal, setDetailModal] = useState<{
    open: boolean;
    company: Company | null;
  }>({
    open: false,
    company: null,
  });

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchInput);
      setPage(1);
    }, 500);
    return () => clearTimeout(timer);
  }, [searchInput]);

  // Fetch companies
  useEffect(() => {
    const fetchCompanies = async () => {
      try {
        setIsLoading(true);
        const params: any = {
          page,
          limit: 20,
        };

        // Add search if provided
        if (debouncedSearchTerm.trim()) {
          params.search = debouncedSearchTerm.trim();
        }

        // Add status filter if not 'all'
        if (selectedStatus !== 'all') {
          params.status = selectedStatus;
        }

        // Add size filter if not 'all'
        if (selectedSize !== 'all') {
          params.size = selectedSize;
        }

        // Add industry filter if not 'all'
        if (selectedIndustry !== 'all') {
          params.industry = selectedIndustry;
        }

        const response = await companyService.getCompanies(params);

        setCompanies(response.items || []);
        setTotalPages(response.pagination?.totalPages || 1);
        setTotalResults(response.pagination?.total || 0);
      } catch (error: any) {
        console.error('Failed to fetch companies:', error);
        message.error(error?.message || 'Không thể tải danh sách công ty');
      } finally {
        setIsLoading(false);
      }
    };

    fetchCompanies();
  }, [page, debouncedSearchTerm, selectedStatus, selectedSize, selectedIndustry]);

  const handleAction = (action: 'approve' | 'reject' | 'lock' | 'unlock', companyId: string, companyName: string) => {
    setActionDialog({
      open: true,
      action,
      companyId,
      companyName,
    });
  };

  const handleViewDetails = (company: Company) => {
    setDetailModal({
      open: true,
      company,
    });
  };

  const confirmAction = async () => {
    if (!actionDialog.companyId || !actionDialog.action) return;

    try {
      setIsProcessing(true);
      let updatedCompany: Company;

      switch (actionDialog.action) {
        case 'approve':
          updatedCompany = await companyService.approveCompany(actionDialog.companyId);
          break;
        case 'reject':
          updatedCompany = await companyService.rejectCompany(actionDialog.companyId);
          break;
        case 'lock':
          updatedCompany = await companyService.lockCompany(actionDialog.companyId);
          console.log('[CompaniesManagementPage] Lock company response:', {
            companyId: updatedCompany.id,
            status: updatedCompany.status,
            mappedStatus: mapStatusToCompanyStatus(updatedCompany.status as string)
          });
          break;
        case 'unlock':
          updatedCompany = await companyService.unlockCompany(actionDialog.companyId);
          console.log('[CompaniesManagementPage] Unlock company response:', {
            companyId: updatedCompany.id,
            status: updatedCompany.status,
            mappedStatus: mapStatusToCompanyStatus(updatedCompany.status as string)
          });
          break;
        default:
          return;
      }

      const messages = {
        approve: 'Đã duyệt công ty',
        reject: 'Đã từ chối công ty',
        lock: 'Đã khóa công ty',
        unlock: 'Đã mở khóa công ty',
      };

      message.success(messages[actionDialog.action]);
      setActionDialog({ open: false, action: null, companyId: null, companyName: '' });

      // Refetch the current page to get fresh data from backend
      const params: any = {
        page,
        limit: 20,
      };

      if (debouncedSearchTerm.trim()) {
        params.search = debouncedSearchTerm.trim();
      }

      if (selectedStatus !== 'all') {
        params.status = selectedStatus;
      }

      if (selectedSize !== 'all') {
        params.size = selectedSize;
      }

      if (selectedIndustry !== 'all') {
        params.industry = selectedIndustry;
      }

      const response = await companyService.getCompanies(params);
      setCompanies(response.items || []);
    } catch (error: any) {
      console.error('Failed to process action:', error);
      message.error(error?.message || 'Không thể thực hiện thao tác');
    } finally {
      setIsProcessing(false);
    }
  };

  const getActionDialogContent = () => {
    const messages = {
      approve: {
        title: 'Duyệt công ty',
        description: `Bạn có chắc chắn muốn duyệt công ty "${actionDialog.companyName}"? Công ty sẽ có thể đăng tin tuyển dụng và sử dụng đầy đủ chức năng.`,
        action: 'Duyệt',
      },
      reject: {
        title: 'Từ chối công ty',
        description: `Bạn có chắc chắn muốn từ chối công ty "${actionDialog.companyName}"? Công ty sẽ không thể sử dụng hệ thống.`,
        action: 'Từ chối',
      },
      lock: {
        title: 'Khóa công ty',
        description: `Bạn có chắc chắn muốn khóa công ty "${actionDialog.companyName}"? Công ty sẽ không thể đăng tin hoặc quản lý ứng viên.`,
        action: 'Khóa',
      },
      unlock: {
        title: 'Mở khóa công ty',
        description: `Bạn có chắc chắn muốn mở khóa công ty "${actionDialog.companyName}"? Công ty sẽ có thể hoạt động trở lại.`,
        action: 'Mở khóa',
      },
    };

    return actionDialog.action ? messages[actionDialog.action] : null;
  };

  const dialogContent = getActionDialogContent();

  const columns = [
    {
      title: 'Công ty',
      dataIndex: 'name',
      key: 'name',
      width: 250,
      render: (_: any, company: Company) => (
        <div className="flex items-center gap-3">
          <Avatar src={company.logoUrl || undefined} size={40}>
            {company.name.substring(0, 2).toUpperCase()}
          </Avatar>
          <div className="min-w-0 flex-1">
            <div className="text-gray-900 truncate">{company.name}</div>
            <div className="text-gray-500 truncate text-sm">{company.email || 'N/A'}</div>
          </div>
        </div>
      ),
    },
    {
      title: 'Ngành nghề',
      dataIndex: 'industry',
      key: 'industry',
      render: (industry: string) => <span className="text-gray-600">{industry || 'N/A'}</span>,
    },
    {
      title: 'Địa chỉ',
      dataIndex: 'address',
      key: 'address',
      render: (address: string) => (
        <span className="text-gray-600 max-w-[200px] truncate block">
          {address ? address.split(',').slice(-2).join(',').trim() : 'N/A'}
        </span>
      ),
    },
    {
      title: 'Quy mô',
      dataIndex: 'companySize',
      key: 'companySize',
      render: (size: CompanySize) => (
        <span className="text-gray-600">
          {size ? companySizeLabels[size] : 'N/A'}
        </span>
      ),
    },
    {
      title: 'Việc làm',
      dataIndex: 'jobs',
      key: 'jobs',
      render: (jobs: any[]) => <span className="text-gray-600">{jobs?.length || 0}</span>,
    },
    {
      title: 'Ngày đăng ký',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (createdAt: Date | string) => {
        const date = createdAt instanceof Date ? createdAt : new Date(createdAt);
        return <span className="text-gray-600">{date.toLocaleDateString('vi-VN')}</span>;
      },
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => {
        const displayStatus = mapStatusToCompanyStatus(status);
        return (
          <Badge color={statusColors[displayStatus]} text={statusLabels[displayStatus]} />
        );
      },
    },
    {
      title: 'Thao tác',
      key: 'actions',
      align: 'right' as const,
      render: (_: any, company: Company) => {
        const displayStatus = mapStatusToCompanyStatus(company.status as string);
        return (
          <div className="flex justify-end gap-2">
            <Button
              type="text"
              size="small"
              icon={<EyeOutlined />}
              onClick={() => handleViewDetails(company)}
              title="Xem chi tiết"
            />

            {displayStatus === CompanyStatus.PENDING && (
              <>
                <Button
                  type="text"
                  size="small"
                  className="text-green-600 hover:text-green-700 hover:bg-green-50"
                  icon={<CheckOutlined />}
                  onClick={() => handleAction('approve', company.id, company.name)}
                  disabled={isProcessing}
                />
                <Button
                  type="text"
                  size="small"
                  className="text-red-600 hover:text-red-700 hover:bg-red-50"
                  icon={<CloseOutlined />}
                  onClick={() => handleAction('reject', company.id, company.name)}
                  disabled={isProcessing}
                />
              </>
            )}

            {displayStatus === CompanyStatus.APPROVED && (
              <Button
                type="text"
                size="small"
                className="text-red-600 hover:text-red-700 hover:bg-red-50"
                icon={<LockOutlined />}
                onClick={() => handleAction('lock', company.id, company.name)}
                disabled={isProcessing}
              />
            )}

            {displayStatus === CompanyStatus.LOCKED && (
              <Button
                type="text"
                size="small"
                className="text-green-600 hover:text-green-700 hover:bg-green-50"
                icon={<UnlockOutlined />}
                onClick={() => handleAction('unlock', company.id, company.name)}
                disabled={isProcessing}
              />
            )}
          </div>
        );
      },
    },
  ];

  // Status labels for filter dropdown
  const statusFilterLabels = {
    'all': 'Tất cả trạng thái',
    [Status.PENDING]: 'Chờ duyệt',
    [Status.ACTIVE]: 'Đã duyệt',
    [Status.LOCKED]: 'Đã khóa',
    [Status.SUSPENDED]: 'Từ chối',
    [Status.INACTIVE]: 'Không hoạt động',
  };

  // Size labels for filter dropdown
  const sizeFilterLabels = {
    'all': 'Tất cả quy mô',
    [CompanySize.STARTUP]: 'Startup (1-10)',
    [CompanySize.SMALL]: 'Nhỏ (11-50)',
    [CompanySize.MEDIUM]: 'Vừa (51-200)',
    [CompanySize.LARGE]: 'Lớn (201-500)',
    [CompanySize.ENTERPRISE]: 'Siêu lớn (500+)',
  };

  return (
    <div className="min-h-screen py-8">
      <div className="max-w-6xl mx-auto px-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Quản lý công ty</h1>
            <p className="text-base text-gray-600">
              Duyệt, khóa và quản lý các công ty trên hệ thống
            </p>
          </div>
          <div className="flex gap-2">
            <Button icon={<ReloadOutlined />} onClick={() => setPage(1)} disabled={isLoading}>
              Làm mới
            </Button>
          </div>
        </div>

        {/* Filters */}
        <Card className="mb-6 glassmorphism" styles={{ body: { padding: '16px 20px' } }}>
          {/* Search Bar */}
          <div className="flex gap-2 mb-3">
            <Input
              placeholder="Tìm kiếm theo tên, ngành, mô tả..."
              prefix={<SearchOutlined className="text-gray-400" />}
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="flex-1"
              size="middle"
              allowClear
            />
          </div>

          {/* Filters Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
            {/* Status Filter */}
            <Select
              value={selectedStatus}
              onChange={(value) => { setSelectedStatus(value); setPage(1); }}
              placeholder="Trạng thái"
              size="middle"
              className="text-sm"
            >
              <Select.Option value="all">Tất cả trạng thái</Select.Option>
              <Select.Option value={Status.PENDING}>Chờ duyệt</Select.Option>
              <Select.Option value={Status.ACTIVE}>Đã duyệt</Select.Option>
              <Select.Option value={Status.LOCKED}>Đã khóa</Select.Option>
              <Select.Option value={Status.SUSPENDED}>Từ chối</Select.Option>
              <Select.Option value={Status.INACTIVE}>Không hoạt động</Select.Option>
            </Select>

            {/* Size Filter */}
            <Select
              value={selectedSize}
              onChange={(value) => { setSelectedSize(value); setPage(1); }}
              placeholder="Quy mô"
              size="middle"
              className="text-sm"
            >
              <Select.Option value="all">Tất cả quy mô</Select.Option>
              <Select.Option value={CompanySize.STARTUP}>Startup (1-10)</Select.Option>
              <Select.Option value={CompanySize.SMALL}>Nhỏ (11-50)</Select.Option>
              <Select.Option value={CompanySize.MEDIUM}>Vừa (51-200)</Select.Option>
              <Select.Option value={CompanySize.LARGE}>Lớn (201-500)</Select.Option>
              <Select.Option value={CompanySize.ENTERPRISE}>Siêu lớn (500+)</Select.Option>
            </Select>

            {/* Industry Filter */}
            <Select
              value={selectedIndustry}
              onChange={(value) => { setSelectedIndustry(value); setPage(1); }}
              placeholder="Ngành nghề"
              size="middle"
              className="text-sm"
            >
              <Select.Option value="all">Tất cả ngành nghề</Select.Option>
              <Select.Option value="Technology">Technology</Select.Option>
              <Select.Option value="Finance">Finance</Select.Option>
              <Select.Option value="Healthcare">Healthcare</Select.Option>
              <Select.Option value="Retail">Retail</Select.Option>
              <Select.Option value="Manufacturing">Manufacturing</Select.Option>
              <Select.Option value="Education">Education</Select.Option>
              <Select.Option value="Other">Other</Select.Option>
            </Select>
          </div>

          {/* Active Filters Tags */}
          {(selectedStatus !== 'all' || selectedSize !== 'all' || selectedIndustry !== 'all') && (
            <div className="mt-4">
              <div className="bg-blue-50/50 rounded-xl p-3 border border-blue-100 flex flex-wrap items-center gap-3">
                <span className="text-sm text-blue-800 font-medium px-1">Đang lọc:</span>
                <div className="flex flex-wrap gap-2">
                  {selectedStatus !== 'all' && (
                    <Tag
                      closable
                      onClose={() => setSelectedStatus('all')}
                      className="cursor-pointer m-0 bg-white border-blue-200 text-blue-700 hover:border-blue-300 rounded-lg px-3 py-1 text-sm flex items-center shadow-sm"
                    >
                      {statusFilterLabels[selectedStatus as keyof typeof statusFilterLabels] || selectedStatus}
                    </Tag>
                  )}
                  {selectedSize !== 'all' && (
                    <Tag
                      closable
                      onClose={() => setSelectedSize('all')}
                      className="cursor-pointer m-0 bg-white border-blue-200 text-blue-700 hover:border-blue-300 rounded-lg px-3 py-1 text-sm flex items-center shadow-sm"
                    >
                      {sizeFilterLabels[selectedSize as keyof typeof sizeFilterLabels] || selectedSize}
                    </Tag>
                  )}
                  {selectedIndustry !== 'all' && (
                    <Tag
                      closable
                      onClose={() => setSelectedIndustry('all')}
                      className="cursor-pointer m-0 bg-white border-blue-200 text-blue-700 hover:border-blue-300 rounded-lg px-3 py-1 text-sm flex items-center shadow-sm"
                    >
                      {selectedIndustry}
                    </Tag>
                  )}
                  <Button
                    type="link"
                    size="small"
                    onClick={() => {
                      setSelectedStatus('all');
                      setSelectedSize('all');
                      setSelectedIndustry('all');
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
            Tìm thấy <span className="font-semibold text-gray-900">{totalResults}</span> công ty
          </p>
        </div>

        {/* Companies Table */}
        <Card>
          <Table
            columns={columns}
            dataSource={companies}
            rowKey="id"
            loading={isLoading}
            pagination={false}
            scroll={{ x: 1200 }}
            locale={{
              emptyText: 'Không tìm thấy công ty nào',
            }}
          />
        </Card>

        {/* Pagination */}
        {!isLoading && totalPages > 1 && (
          <div className="flex items-center justify-between mt-6">
            <div className="text-gray-600">
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
        onCancel={() => setActionDialog({ open: false, action: null, companyId: null, companyName: '' })}
        onOk={confirmAction}
        title={dialogContent?.title}
        okText={isProcessing ? 'Đang xử lý...' : dialogContent?.action}
        cancelText="Hủy"
        confirmLoading={isProcessing}
      >
        <p>{dialogContent?.description}</p>
      </Modal>

      {/* Company Detail Modal */}
      <Modal
        open={detailModal.open}
        onCancel={() => setDetailModal({ open: false, company: null })}
        footer={[
          <Button key="close" onClick={() => setDetailModal({ open: false, company: null })}>
            Đóng
          </Button>,
        ]}
        title={
          <div className="flex items-center gap-3">
            <Avatar src={detailModal.company?.logoUrl || undefined} size={48}>
              {detailModal.company?.name.substring(0, 2).toUpperCase()}
            </Avatar>
            <div>
              <div className="text-lg font-semibold">{detailModal.company?.name}</div>
              <Badge
                color={statusColors[mapStatusToCompanyStatus(detailModal.company?.status as string)]}
                text={statusLabels[mapStatusToCompanyStatus(detailModal.company?.status as string)]}
              />
            </div>
          </div>
        }
        width={800}
      >
        {detailModal.company && (
          <div className="space-y-6">
            {/* Basic Information */}
            <div>
              <Divider orientation="left" className="text-base font-semibold">
                <FileTextOutlined className="mr-2" />
                Thông tin cơ bản
              </Divider>
              <Descriptions column={1} bordered size="small">
                <Descriptions.Item label={<><MailOutlined className="mr-2" />Email</>}>
                  {detailModal.company.email || 'N/A'}
                </Descriptions.Item>
                <Descriptions.Item label={<><PhoneOutlined className="mr-2" />Số điện thoại</>}>
                  {detailModal.company.phone || 'N/A'}
                </Descriptions.Item>
                <Descriptions.Item label={<><GlobalOutlined className="mr-2" />Website</>}>
                  {detailModal.company.website ? (
                    <a
                      href={detailModal.company.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-700"
                    >
                      {detailModal.company.website}
                    </a>
                  ) : 'N/A'}
                </Descriptions.Item>
                <Descriptions.Item label={<><EnvironmentOutlined className="mr-2" />Địa chỉ</>}>
                  {detailModal.company.address || 'N/A'}
                </Descriptions.Item>
                <Descriptions.Item label="Ngành nghề">
                  {detailModal.company.industry || 'N/A'}
                </Descriptions.Item>
                <Descriptions.Item label={<><TeamOutlined className="mr-2" />Quy mô</>}>
                  {detailModal.company.companySize ? companySizeLabels[detailModal.company.companySize] : 'N/A'}
                </Descriptions.Item>
                <Descriptions.Item label={<><CalendarOutlined className="mr-2" />Năm thành lập</>}>
                  {detailModal.company.foundedYear || 'N/A'}
                </Descriptions.Item>
                <Descriptions.Item label="Số lượng việc làm">
                  {detailModal.company.jobs?.length || 0}
                </Descriptions.Item>
                <Descriptions.Item label="Ngày đăng ký">
                  {new Date(detailModal.company.createdAt).toLocaleString('vi-VN')}
                </Descriptions.Item>
                <Descriptions.Item label="Cập nhật lần cuối">
                  {new Date(detailModal.company.updatedAt).toLocaleString('vi-VN')}
                </Descriptions.Item>
              </Descriptions>
            </div>

            {/* Description */}
            {detailModal.company.description && (
              <div>
                <Divider orientation="left" className="text-base font-semibold">
                  <FileTextOutlined className="mr-2" />
                  Mô tả công ty
                </Divider>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <Text className="whitespace-pre-wrap text-sm text-gray-700">
                    {detailModal.company.description}
                  </Text>
                </div>
              </div>
            )}

            {/* Document URL */}
            {detailModal.company.documentUrl && (
              <div>
                <Divider orientation="left" className="text-base font-semibold">
                  <LinkOutlined className="mr-2" />
                  Tài liệu đính kèm
                </Divider>
                <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                  <a
                    href={detailModal.company.documentUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:text-blue-700 flex items-center gap-2"
                  >
                    <FileTextOutlined />
                    <span>Xem tài liệu công ty</span>
                  </a>
                </div>
              </div>
            )}

            {/* Banner URL */}
            {detailModal.company.bannerUrl && (
              <div>
                <Divider orientation="left" className="text-base font-semibold">
                  Banner công ty
                </Divider>
                <div className="rounded-lg overflow-hidden border border-gray-200">
                  <img
                    src={detailModal.company.bannerUrl}
                    alt={`${detailModal.company.name} banner`}
                    className="w-full h-auto"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                    }}
                  />
                </div>
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
}
