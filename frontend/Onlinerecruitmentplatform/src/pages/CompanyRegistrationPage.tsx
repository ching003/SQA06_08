import { useState } from 'react';
import { useNavigate } from 'react-router';
import { Card, Input, Button, Select, Upload, Alert, Typography } from 'antd';
import {
  ShopOutlined, UploadOutlined, FileTextOutlined, SaveOutlined,
  CheckCircleOutlined, DeleteOutlined, PictureOutlined, RightOutlined
} from '@ant-design/icons';
import { useAuth } from '../contexts/AuthContext';
import { toast } from 'sonner';
import { companyService } from '../api/services';
import { CompanySize } from '../lib/types';

const { Title, Text } = Typography;
const { TextArea } = Input;
const { Option } = Select;

interface CompanyFormData {
  // Basic Information
  name: string;
  industry: string;
  companySize: string;
  foundedYear: string;
  website: string;
  description: string;

  // Contact Information
  address: string;
  phone: string;
  email: string;

  // Documents & Images
  businessLicense?: File;
  logo?: File;
  banner?: File;
}

export function CompanyRegistrationPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);

  const [formData, setFormData] = useState<CompanyFormData>({
    name: '',
    industry: '',
    companySize: '',
    foundedYear: '',
    website: '',
    description: '',
    address: '',
    phone: '',
    email: user?.email || '',
  });

  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [bannerPreview, setBannerPreview] = useState<string | null>(null);
  const [licenseFile, setLicenseFile] = useState<File | null>(null);

  const handleLogoUpload = (file: File) => {
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Logo không được vượt quá 5MB');
      return false;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setLogoPreview(reader.result as string);
    };
    reader.readAsDataURL(file);
    setFormData({ ...formData, logo: file });
    return false;
  };

  const handleBannerUpload = (file: File) => {
    if (file.size > 10 * 1024 * 1024) {
      toast.error('Banner không được vượt quá 10MB');
      return false;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setBannerPreview(reader.result as string);
    };
    reader.readAsDataURL(file);
    setFormData({ ...formData, banner: file });
    return false;
  };

  const handleLicenseUpload = (file: File) => {
    if (file.size > 10 * 1024 * 1024) {
      toast.error('File giấy phép không được vượt quá 10MB');
      return false;
    }
    setLicenseFile(file);
    setFormData({ ...formData, businessLicense: file });
    return false;
  };

  const onSubmit = async (isDraft: boolean = false) => {
    // Validate required fields
    if (!formData.name) {
      toast.error('Vui lòng nhập tên công ty');
      return;
    }

    if (!formData.description) {
      toast.error('Vui lòng nhập giới thiệu công ty');
      return;
    }

    if (!formData.address) {
      toast.error('Vui lòng nhập địa chỉ');
      return;
    }

    if (!formData.phone) {
      toast.error('Vui lòng nhập số điện thoại');
      return;
    }

    if (!formData.email) {
      toast.error('Vui lòng nhập email');
      return;
    }

    // Document is required for registration (not for draft)
    if (!isDraft && !licenseFile) {
      toast.error('Vui lòng tải lên giấy phép kinh doanh');
      return;
    }

    setIsLoading(true);

    try {
      // For draft, we might want to save locally or skip API call
      // For now, we'll still call API but with minimal data
      if (isDraft) {
        toast.info('Chức năng lưu nháp đang được phát triển');
        setIsLoading(false);
        return;
      }

      // Prepare API request
      const registerData: any = {
        name: formData.name,
        description: formData.description,
        address: formData.address,
        phone: formData.phone,
        email: formData.email,
        document: licenseFile!, // Required
      };

      if (formData.website) {
        registerData.website = formData.website;
      }

      if (formData.industry) {
        registerData.industry = formData.industry;
      }

      if (formData.companySize) {
        registerData.companySize = formData.companySize;
      }

      if (formData.foundedYear) {
        registerData.foundedYear = parseInt(formData.foundedYear, 10);
      }

      if (formData.logo) {
        registerData.logo = formData.logo;
      }

      // Call API
      const company = await companyService.registerCompany(registerData);

      toast.success('Đã gửi đăng ký công ty! Vui lòng chờ admin phê duyệt.');
      navigate('/recruiter/dashboard');
    } catch (error: any) {
      console.error('Failed to register company:', error);
      toast.error(error?.message || 'Không thể đăng ký công ty. Vui lòng thử lại.');
    } finally {
      setIsLoading(false);
    }
  };

  const industries = [
    'Công nghệ thông tin',
    'Thương mại điện tử',
    'Tài chính - Ngân hàng',
    'Giáo dục - Đào tạo',
    'Y tế - Sức khỏe',
    'Sản xuất',
    'Xây dựng',
    'Bất động sản',
    'Du lịch - Khách sạn',
    'Truyền thông - Quảng cáo',
    'Logistics - Vận tải',
    'Năng lượng',
    'Nông nghiệp',
    'Dịch vụ khách hàng',
    'Khác',
  ];

  const companySizes = [
    { value: 'STARTUP', label: '1-10 nhân viên (Startup)' },
    { value: 'SMALL', label: '11-50 nhân viên (Small)' },
    { value: 'MEDIUM', label: '51-200 nhân viên (Medium)' },
    { value: 'LARGE', label: '201-500 nhân viên (Large)' },
    { value: 'ENTERPRISE', label: '501+ nhân viên (Enterprise)' },
  ];

  return (
    <div className="min-h-screen py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-gray-600 mb-6">
          <button onClick={() => navigate('/recruiter/dashboard')} className="hover:text-blue-600">
            Dashboard
          </button>
          <RightOutlined className="text-xs" />
          <span className="text-gray-900">Đăng ký công ty</span>
        </div>

        {/* Header */}
        <div className="mb-8">
          <Title level={2} className="mb-2! text-gray-900!">Đăng ký công ty</Title>
          <Text className="text-gray-600">
            Điền đầy đủ thông tin công ty để có thể đăng tin tuyển dụng
          </Text>
        </div>

        {/* Info Alert */}
        

        {/* Basic Information */}
        <Card
          title={
            <div className="flex items-center gap-2">
              <ShopOutlined />
              <span>Thông tin cơ bản</span>
            </div>
          }
          className="glassmorphism mb-6"
        >
          <div className="space-y-6">
            <div>
              <Text className="block mb-2 font-medium">Tên công ty *</Text>
              <Input
                placeholder="VD: Công ty TNHH ABC"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                size="large"
              />
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <Text className="block mb-2 font-medium">Ngành nghề *</Text>
                <Select
                  value={formData.industry || undefined}
                  onChange={(value) => setFormData({ ...formData, industry: value })}
                  placeholder="Chọn ngành nghề"
                  className="w-full"
                  size="large"
                >
                  {industries.map(industry => (
                    <Option key={industry} value={industry}>
                      {industry}
                    </Option>
                  ))}
                </Select>
              </div>

              <div>
                <Text className="block mb-2 font-medium">Quy mô công ty *</Text>
                <Select
                  value={formData.companySize || undefined}
                  onChange={(value) => setFormData({ ...formData, companySize: value })}
                  placeholder="Chọn quy mô"
                  className="w-full"
                  size="large"
                >
                  {companySizes.map(size => (
                    <Option key={size.value} value={size.value}>
                      {size.label}
                    </Option>
                  ))}
                </Select>
              </div>

              <div>
                <Text className="block mb-2 font-medium">Năm thành lập</Text>
                <Input
                  type="number"
                  placeholder="2020"
                  value={formData.foundedYear}
                  onChange={(e) => setFormData({ ...formData, foundedYear: e.target.value })}
                  min="1900"
                  max={new Date().getFullYear()}
                  size="large"
                />
              </div>

              <div>
                <Text className="block mb-2 font-medium">Website</Text>
                <Input
                  type="url"
                  placeholder="https://example.com"
                  value={formData.website}
                  onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                  size="large"
                />
              </div>
            </div>

            <div>
              <Text className="block mb-2 font-medium">Giới thiệu về công ty *</Text>
              <TextArea
                placeholder="Mô tả về lịch sử, văn hóa, sản phẩm/dịch vụ của công ty..."
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={6}
                size="large"
              />
              <Text type="secondary" className="block mt-1">
                Tối thiểu 100 ký tự
              </Text>
            </div>
          </div>
        </Card>

        {/* Contact Information */}
        <Card title="Thông tin liên hệ" className="glassmorphism mb-6">
          <div className="space-y-6">
            <div>
              <Text className="block mb-2 font-medium">Địa chỉ công ty *</Text>
              <Input
                placeholder="Số nhà, đường, quận/huyện, thành phố"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                size="large"
              />
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <Text className="block mb-2 font-medium">Số điện thoại *</Text>
                <Input
                  placeholder="024 1234 5678"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  size="large"
                />
              </div>

              <div>
                <Text className="block mb-2 font-medium">Email liên hệ *</Text>
                <Input
                  type="email"
                  placeholder="contact@company.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  size="large"
                />
              </div>
            </div>
          </div>
        </Card>

        {/* Documents & Images */}
        <Card title="Tài liệu & Hình ảnh" className="glassmorphism mb-6">
          <div className="space-y-6">
            {/* Business License */}
            <div>
              <Text className="block mb-2 font-medium">Giấy phép kinh doanh *</Text>
              {licenseFile ? (
                <div className="flex items-center justify-between p-4 bg-gradient-to-br from-blue-100 via-blue-200 to-blue-300 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <FileTextOutlined className="text-2xl text-blue-600" />
                    <div>
                      <Text strong className="block">{licenseFile.name}</Text>
                      <Text type="secondary">
                        {(licenseFile.size / 1024 / 1024).toFixed(2)} MB
                      </Text>
                    </div>
                  </div>
                  <Button
                    danger
                    onClick={() => {
                      setLicenseFile(null);
                      setFormData({ ...formData, businessLicense: undefined });
                    }}
                    icon={<DeleteOutlined />}
                  >
                    Xóa
                  </Button>
                </div>
              ) : (
                <Upload
                  accept=".pdf,.jpg,.jpeg,.png"
                  beforeUpload={handleLicenseUpload}
                  showUploadList={false}
                  className="w-full"
                >
                  <div className="flex flex-col items-center justify-center h-32 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:bg-gradient-to-br from-blue-100 via-blue-200 to-blue-300 transition-colors">
                    <UploadOutlined className="text-4xl text-gray-400 mb-2" />
                    <Text className="text-gray-600">Tải lên giấy phép kinh doanh</Text>
                    <Text type="secondary">PDF, JPG, PNG (Max 10MB)</Text>
                  </div>
                </Upload>
              )}
              <Text type="secondary" className="block mt-1">
                Giấy phép kinh doanh hoặc giấy đăng ký doanh nghiệp
              </Text>
            </div>

            {/* Company Logo */}
            <div>
              <Text className="block mb-2 font-medium">Logo công ty</Text>
              {logoPreview ? (
                <div className="relative inline-block">
                  <img
                    src={logoPreview}
                    alt="Logo preview"
                    className="h-32 w-32 object-contain border rounded-lg"
                  />
                  <Button
                    danger
                    shape="circle"
                    size="small"
                    className="absolute -top-2 -right-2"
                    onClick={() => {
                      setLogoPreview(null);
                      setFormData({ ...formData, logo: undefined });
                    }}
                    icon={<DeleteOutlined />}
                  />
                </div>
              ) : (
                <Upload
                  accept="image/*"
                  beforeUpload={handleLogoUpload}
                  showUploadList={false}
                >
                  <div className="flex flex-col items-center justify-center h-32 w-32 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:bg-gradient-to-br from-blue-100 via-blue-200 to-blue-300 transition-colors">
                    <PictureOutlined className="text-2xl text-gray-400 mb-2" />
                    <Text className="text-gray-600 text-center px-2">Tải logo</Text>
                  </div>
                </Upload>
              )}
              <Text type="secondary" className="block mt-1">
                Logo vuông, kích thước tối thiểu 200x200px (Max 5MB)
              </Text>
            </div>

            {/* Company Banner */}
            <div>
              <Text className="block mb-2 font-medium">Banner công ty</Text>
              {bannerPreview ? (
                <div className="relative inline-block w-full">
                  <img
                    src={bannerPreview}
                    alt="Banner preview"
                    className="w-full h-48 object-cover border rounded-lg"
                  />
                  <Button
                    danger
                    shape="circle"
                    size="small"
                    className="absolute top-2 right-2"
                    onClick={() => {
                      setBannerPreview(null);
                      setFormData({ ...formData, banner: undefined });
                    }}
                    icon={<DeleteOutlined />}
                  />
                </div>
              ) : (
                <Upload
                  accept="image/*"
                  beforeUpload={handleBannerUpload}
                  showUploadList={false}
                  className="w-full"
                >
                  <div className="flex flex-col items-center justify-center h-48 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:bg-gradient-to-br from-blue-100 via-blue-200 to-blue-300 transition-colors">
                    <PictureOutlined className="text-4xl text-gray-400 mb-2" />
                    <Text className="text-gray-600">Tải banner công ty</Text>
                    <Text type="secondary">1200x400px khuyến nghị (Max 10MB)</Text>
                  </div>
                </Upload>
              )}
              <Text type="secondary" className="block mt-1">
                Banner hiển thị trên trang công ty
              </Text>
            </div>
          </div>
        </Card>

        {/* Action Buttons */}
        <div className="flex items-center justify-between p-6 bg-white border rounded-lg glassmorphism">
          <Button
            onClick={() => navigate('/recruiter/dashboard')}
            disabled={isLoading}
            size="medium"
            icon={<DeleteOutlined />}
          >
            Hủy
          </Button>

          <div className="flex gap-3">
            

            <Button
              type="primary"
              onClick={() => onSubmit(false)}
              loading={isLoading}
              size="medium"
              icon={<CheckCircleOutlined />}
            >
              {isLoading ? 'Đang gửi...' : 'Gửi đăng ký'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
