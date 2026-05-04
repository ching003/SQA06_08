import { React, useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { Card, Button, Input, Select, Typography, Divider, Spin, Upload, Modal } from 'antd';
import {
  RightOutlined, ShopOutlined, UploadOutlined, GlobalOutlined, MailOutlined, PhoneOutlined,
  EnvironmentOutlined, UserOutlined, CalendarOutlined, SaveOutlined, WarningOutlined, CameraOutlined, CloseOutlined, EditOutlined, DeleteOutlined, ExclamationCircleOutlined
} from '@ant-design/icons';

const { TextArea } = Input;
const { Option } = Select;
import { useAuth } from '../../contexts/AuthContext';
import { companyService, userService } from '../../api/services';
import { CompanySize, Company, CompanyRole } from '../../lib/types';
import { INDUSTRIES } from '../../lib/constants';
import { toast } from 'sonner';

export function CompanyManagementPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  // Check if user can manage company (OWNER or MANAGER only)
  // API returns "role" but frontend type expects "companyRole"
  const memberRole = user?.companyMember?.companyRole || (user?.companyMember as any)?.role;
  const canManageCompany = memberRole === CompanyRole.OWNER || memberRole === CompanyRole.MANAGER;
  const isOwner = memberRole === CompanyRole.OWNER;
  
  // Redirect if user doesn't have permission
  useEffect(() => {
    if (user && user.companyMember && !canManageCompany) {
      toast.error('Bạn không có quyền quản lý thông tin công ty');
      navigate('/recruiter/dashboard');
    }
  }, [user, canManageCompany, navigate]);
  
  const [company, setCompany] = useState<Company | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [bannerFile, setBannerFile] = useState<File | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    website: '',
    address: '',
    companySize: CompanySize.SMALL,
    industry: '',
    foundedYear: new Date().getFullYear(),
    description: '',
  });

  // Fetch company data
  useEffect(() => {
    const fetchCompany = async () => {
      if (!user) {
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        
        // Get user profile with companyMember relation
        const userProfile = await userService.getProfile();
        
        // API returns company.id (nested) but frontend type expects companyId (flat)
        const companyId = userProfile.companyMember?.companyId || userProfile.companyMember?.company?.id;
        if (companyId) {
          const companyData = await companyService.getCompanyById(companyId);
          setCompany(companyData);
          
          // Initialize form data
          setFormData({
            name: companyData.name || '',
            email: companyData.email || '',
            phone: companyData.phone || '',
            website: companyData.website || '',
            address: companyData.address || '',
            companySize: companyData.companySize || CompanySize.SMALL,
            industry: companyData.industry || '',
            foundedYear: companyData.foundedYear || new Date().getFullYear(),
            description: companyData.description || '',
          });
        } else {
          toast.error('Bạn chưa thuộc công ty nào. Vui lòng đăng ký công ty trước.');
          navigate('/recruiter/company/register');
        }
      } catch (error: any) {
        console.error('Failed to fetch company:', error);
        toast.error(error?.message || 'Không thể tải thông tin công ty');
      } finally {
        setIsLoading(false);
      }
    };

    fetchCompany();
  }, [user, navigate]);

  const handleInputChange = (field: string, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setIsEditing(true);
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        toast.error('Kích thước file logo không được vượt quá 2MB');
        return;
      }
      
      if (!file.type.startsWith('image/')) {
        toast.error('File phải là hình ảnh');
        return;
      }
      
      setLogoFile(file);
      setIsEditing(true);
    }
  };

  const handleBannerUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Kích thước file banner không được vượt quá 5MB');
        return;
      }
      
      if (!file.type.startsWith('image/')) {
        toast.error('File phải là hình ảnh');
        return;
      }
      
      setBannerFile(file);
      setIsEditing(true);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!company) {
      toast.error('Không tìm thấy thông tin công ty');
      return;
    }

    if (!formData.name.trim()) {
      toast.error('Vui lòng nhập tên công ty');
      return;
    }
    if (!formData.email.trim()) {
      toast.error('Vui lòng nhập email công ty');
      return;
    }

    try {
      setIsSaving(true);

      const updateData: any = {
        name: formData.name,
        email: formData.email,
        phone: formData.phone || undefined,
        website: formData.website || undefined,
        address: formData.address || undefined,
        companySize: formData.companySize,
        industry: formData.industry || undefined,
        foundedYear: formData.foundedYear,
        description: formData.description || undefined,
      };

      if (logoFile) {
        updateData.logo = logoFile;
      }
      if (bannerFile) {
        updateData.banner = bannerFile;
      }

      const updatedCompany = await companyService.updateCompany(company.id, updateData);
      setCompany(updatedCompany);

      if (logoFile) setLogoFile(null);
      if (bannerFile) setBannerFile(null);

      setIsEditing(false);
      toast.success('Cập nhật thông tin công ty thành công!');
    } catch (error: any) {
      console.error('Failed to update company:', error);
      toast.error(error?.message || 'Không thể cập nhật thông tin công ty');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteCompany = async () => {
    if (!company) return;

    try {
      setIsDeleting(true);
      await companyService.deleteCompany(company.id);
      toast.success('Xóa công ty thành công! Đang chuyển về trang chủ...');
      setShowDeleteModal(false);
      // Redirect to home page after deleting company to avoid errors
      // User will no longer have access to recruiter dashboard without a company
      setTimeout(() => {
        navigate('/');
      }, 1000); // Give user time to see the success message
    } catch (error: any) {
      console.error('Failed to delete company:', error);
      toast.error(error?.message || 'Không thể xóa công ty');
    } finally {
      setIsDeleting(false);
    }
  };

  const companySizeLabels = {
    [CompanySize.STARTUP]: '1-10 nhân viên',
    [CompanySize.SMALL]: '11-50 nhân viên',
    [CompanySize.MEDIUM]: '51-200 nhân viên',
    [CompanySize.LARGE]: '201-500 nhân viên',
    [CompanySize.ENTERPRISE]: '500+ nhân viên',
  };

  if (isLoading) {
    return (
      <div className="min-h-screen py-8 flex items-center justify-center">
        <div className="text-center">
          <Spin size="large" className="mb-4" />
          <p className="text-base text-gray-600">Đang tải thông tin công ty...</p>
        </div>
      </div>
    );
  }

  if (!company) {
    return (
      <div className="min-h-screen py-8">
        <div className="max-w-6xl mx-auto px-4">
          <Card className="glassmorphism" styles={{ body: { padding: '32px', textAlign: 'center' } }}>
            <WarningOutlined className="text-4xl text-gray-400 mb-4" />
            <h2 className="text-lg font-semibold text-gray-900 mb-2">Không tìm thấy công ty</h2>
            <p className="text-base text-gray-600 mb-6">Bạn chưa thuộc công ty nào. Vui lòng đăng ký công ty trước.</p>
            <Button type="primary" onClick={() => navigate('/recruiter/company/register')}>
              Đăng ký công ty
            </Button>
          </Card>
        </div>
      </div>
    );
  }

  const logoPreview = logoFile ? URL.createObjectURL(logoFile) : company.logoUrl;
  const bannerPreview = bannerFile ? URL.createObjectURL(bannerFile) : company.bannerUrl;

  return (
    <div className="min-h-screen py-8">
      <div className="max-w-6xl mx-auto px-4">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-gray-600 mb-6">
          <button onClick={() => navigate('/recruiter/dashboard')} className="hover:text-blue-600">
            Dashboard
          </button>
          <RightOutlined className="text-base" />
          <span className="text-gray-900">Thông tin công ty</span>
        </div>

        <form onSubmit={handleSubmit}>
          {/* Company Header Preview Card */}
          <Card className="glassmorphism mb-6 overflow-hidden" styles={{ body: { padding: 0 } }}>
            {/* Banner - Compact height */}
            <div className="relative h-32 sm:h-40 bg-gradient-to-r from-blue-600 to-indigo-700">
              <img 
                src={bannerPreview || '/1.jpg'} 
                alt="Company banner" 
                className="w-full h-full object-cover" 
                onError={(e) => {
                  // Fallback nếu cả bannerPreview và 1.jpg đều lỗi
                  (e.target as HTMLImageElement).src = '/1.jpg';
                }}
              />
              
              {/* Banner Upload Button */}
              <label className="absolute bottom-3 right-3 cursor-pointer">
                <div className="flex items-center gap-2 bg-white/90 hover:bg-white px-3 py-1.5 rounded-md text-sm font-medium text-gray-700 transition-colors shadow-sm">
                  <CameraOutlined className="text-base" />
                  <span className="hidden sm:inline">Đổi banner</span>
                </div>
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleBannerUpload}
                />
              </label>
              
              {bannerFile && (
                <Button
                  type="button"
                  danger
                  size="small"
                  className="absolute top-3 right-3"
                  icon={<CloseOutlined />}
                  onClick={() => { setBannerFile(null); setIsEditing(true); }}
                >
                  Hủy
                </Button>
              )}
            </div>

            {/* Logo & Company Name */}
            <div className="px-6 pb-5">
              <div className="flex items-end gap-4 -mt-12">
                {/* Logo - overlapping banner */}
                <div className="relative flex-shrink-0">
                  <div className="h-24 w-24 bg-white rounded-xl border-4 border-white shadow-lg overflow-hidden">
                    {logoPreview ? (
                      <img src={logoPreview} alt="Company logo" className="h-full w-full object-cover" />
                    ) : (
                      <div className="h-full w-full bg-gray-100 flex items-center justify-center">
                        <ShopOutlined className="text-3xl text-gray-400" />
                      </div>
                    )}
                  </div>
                  
                  {/* Logo Upload Button - small icon at corner */}
                  <label className="absolute bottom-0 right-0 cursor-pointer">
                    <div className="h-7 w-7 bg-white border border-gray-200 hover:bg-gradient-to-br from-blue-100 via-blue-200 to-blue-300 rounded-full flex items-center justify-center shadow-sm transition-colors">
                      <CameraOutlined className="text-sm text-gray-600" />
                    </div>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleLogoUpload}
                    />
                  </label>
                </div>

                {/* Company Info Preview */}
                <div className="flex-1 min-w-0 pb-1">
                  <h1 className="text-lg font-bold text-gray-900 truncate">{formData.name || 'Tên công ty'}</h1>
                  <p className="text-sm text-gray-600 truncate">
                    {INDUSTRIES.find(i => i.value === formData.industry)?.label || 'Ngành nghề'} • {companySizeLabels[formData.companySize]}
                  </p>
                </div>
              </div>
            </div>
          </Card>

          {/* Basic Information */}
          <Card className="glassmorphism mb-6 mt-6" title={<span className="text-lg">Thông tin cơ bản</span>} styles={{ body: { padding: '24px' } }}>
            <div className="space-y-4">
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <Typography.Text strong>
                    Tên công ty <span className="text-red-500">*</span>
                  </Typography.Text>
                  <Input
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    placeholder="VD: Công ty TNHH ABC"
                    className="mt-1"
                    required
                  />
                </div>
                <div>
                  <Typography.Text strong>Ngành nghề</Typography.Text>
                  <Select
                    value={formData.industry}
                    onChange={(value) => handleInputChange('industry', value)}
                    placeholder="Chọn ngành nghề"
                    className="mt-1 w-full"
                  >
                    {INDUSTRIES.filter(i => i.value !== 'all').map((industry) => (
                      <Option key={industry.value} value={industry.value}>
                        {industry.label}
                      </Option>
                    ))}
                  </Select>
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <Typography.Text strong>Quy mô công ty</Typography.Text>
                  <Select
                    value={formData.companySize}
                    onChange={(value) => handleInputChange('companySize', value)}
                    className="mt-1 w-full"
                  >
                    {Object.entries(companySizeLabels).map(([value, label]) => (
                      <Option key={value} value={value}>
                        {label}
                      </Option>
                    ))}
                  </Select>
                </div>
                <div>
                  <Typography.Text strong>Năm thành lập</Typography.Text>
                  <Input
                    type="number"
                    value={formData.foundedYear}
                    onChange={(e) => handleInputChange('foundedYear', parseInt(e.target.value))}
                    placeholder="2020"
                    min={1900}
                    max={new Date().getFullYear()}
                    className="mt-1"
                  />
                </div>
              </div>

              <div>
                <Typography.Text strong>Giới thiệu công ty</Typography.Text>
                <TextArea
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  placeholder="Giới thiệu về công ty, văn hóa làm việc, sứ mệnh và tầm nhìn..."
                  rows={4}
                  className="mt-1"
                />
              </div>
            </div>
          </Card>

          {/* Contact Information */}
          <Card className="glassmorphism mb-6 mt-6" title={<span className="text-lg">Thông tin liên hệ</span>} styles={{ body: { padding: '24px' } }}>
            <div className="space-y-4">
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <Typography.Text strong>
                    Email <span className="text-red-500">*</span>
                  </Typography.Text>
                  <Input
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    placeholder="contact@company.com"
                    prefix={<MailOutlined className="text-gray-400" />}
                    className="mt-1"
                    required
                  />
                </div>
                <div>
                  <Typography.Text strong>Số điện thoại</Typography.Text>
                  <Input
                    value={formData.phone}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                    placeholder="0123456789"
                    prefix={<PhoneOutlined className="text-gray-400" />}
                    className="mt-1"
                  />
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <Typography.Text strong>Website</Typography.Text>
                  <Input
                    value={formData.website}
                    onChange={(e) => handleInputChange('website', e.target.value)}
                    placeholder="https://company.com"
                    prefix={<GlobalOutlined className="text-gray-400" />}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Typography.Text strong>Địa chỉ</Typography.Text>
                  <Input
                    value={formData.address}
                    onChange={(e) => handleInputChange('address', e.target.value)}
                    placeholder="Số nhà, đường, quận, thành phố"
                    prefix={<EnvironmentOutlined className="text-gray-400" />}
                    className="mt-1"
                  />
                </div>
              </div>
            </div>
          </Card>

          {/* Actions */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <p className="text-sm text-gray-500">
                <span className="text-red-500">*</span> Thông tin bắt buộc
              </p>
              {isOwner && (
                <Button
                  danger
                  icon={<DeleteOutlined />}
                  onClick={() => setShowDeleteModal(true)}
                  disabled={isSaving}
                >
                  Xóa công ty
                </Button>
              )}
            </div>
            <div className="flex gap-3">
              <Button
                onClick={() => {
                  if (company) {
                    setFormData({
                      name: company.name || '',
                      email: company.email || '',
                      phone: company.phone || '',
                      website: company.website || '',
                      address: company.address || '',
                      companySize: company.companySize || CompanySize.SMALL,
                      industry: company.industry || '',
                      foundedYear: company.foundedYear || new Date().getFullYear(),
                      description: company.description || '',
                    });
                    setLogoFile(null);
                    setBannerFile(null);
                    setIsEditing(false);
                  }
                }}
                disabled={!isEditing || isSaving}
              >
                Hủy thay đổi
              </Button>
              <Button type="primary" htmlType="submit" icon={<SaveOutlined />} loading={isSaving} disabled={!isEditing}>
                Lưu thông tin
              </Button>
            </div>
          </div>
        </form>

        {/* Delete Confirmation Modal */}
        <Modal
          title={
            <div className="flex items-center gap-2">
              <ExclamationCircleOutlined className="text-red-500 text-xl" />
              <span>Xác nhận xóa công ty</span>
            </div>
          }
          open={showDeleteModal}
          onCancel={() => setShowDeleteModal(false)}
          onOk={handleDeleteCompany}
          okText="Xóa công ty"
          cancelText="Hủy"
          okButtonProps={{ danger: true, loading: isDeleting }}
          cancelButtonProps={{ disabled: isDeleting }}
        >
          <div className="py-4">
            <p className="text-base mb-3">
              Bạn có chắc chắn muốn xóa công ty <strong>{company?.name}</strong> không?
            </p>
            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
              <p className="text-sm text-red-800 font-medium mb-2">⚠️ Cảnh báo:</p>
              <ul className="text-sm text-red-700 space-y-1 list-disc list-inside">
                <li>Tất cả dữ liệu của công ty sẽ bị xóa vĩnh viễn</li>
                <li>Các tin tuyển dụng của công ty sẽ bị xóa</li>
                <li>Thành viên sẽ bị xóa khỏi công ty</li>
                <li>Hành động này không thể hoàn tác</li>
              </ul>
            </div>
          </div>
        </Modal>
      </div>
    </div>
  );
}
