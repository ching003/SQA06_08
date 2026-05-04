import { useState } from 'react';
import { useNavigate, useParams } from 'react-router';
import { Card, Button, Badge, message } from 'antd';
import {
  RightOutlined, EditOutlined, DeleteOutlined, CopyOutlined, EyeOutlined,
  FileTextOutlined, CalendarOutlined, UserOutlined, CheckCircleOutlined,
  PoweroffOutlined, DownloadOutlined, CodeOutlined
} from '@ant-design/icons';
import { mockCVTemplates } from '../../lib/mockTemplateData';
import { formatDistanceToNow } from 'date-fns';
import { vi } from 'date-fns/locale';

export function CVTemplateDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [template, setTemplate] = useState(mockCVTemplates.find(t => t.id === id));

  if (!template) {
    return (
      <div className="min-h-screen py-8">
        <div className="max-w-6xl mx-auto px-4">
          <Card>
            <div className="p-12 text-center">
              <FileTextOutlined style={{ fontSize: 64, color: '#9ca3af' }} className="mb-4" />
              <h3 className="text-gray-900 mb-2">Không tìm thấy mẫu CV</h3>
              <p className="text-gray-600 mb-6">
                Mẫu CV này không tồn tại hoặc đã bị xóa
              </p>
              <Button onClick={() => navigate('/admin/cv-templates')}>
                Quay lại danh sách
              </Button>
            </div>
          </Card>
        </div>
      </div>
    );
  }

  const handleToggleStatus = () => {
    setTemplate({ ...template, isActive: !template.isActive });
    message.success(`Đã ${template.isActive ? 'vô hiệu hóa' : 'kích hoạt'} mẫu CV`);
  };

  const handleDelete = () => {
    if (confirm('Bạn có chắc muốn xóa mẫu CV này? Hành động này không thể hoàn tác.')) {
      message.success('Đã xóa mẫu CV');
      navigate('/admin/cv-templates');
    }
  };

  const handleDuplicate = () => {
    message.success('Đã tạo bản sao mẫu CV');
    navigate('/admin/cv-templates/new');
  };

  const handleExportTemplate = () => {
    message.info('Đang xuất file template...');
  };

  return (
    <div className="min-h-screen py-8">
      <div className="max-w-6xl mx-auto px-4">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-gray-600 mb-8">
          <button onClick={() => navigate('/admin/dashboard')} className="hover:text-blue-600">
            Admin Dashboard
          </button>
          <RightOutlined style={{ fontSize: 12 }} />
          <button onClick={() => navigate('/admin/cv-templates')} className="hover:text-blue-600">
            Quản lý mẫu CV
          </button>
          <RightOutlined style={{ fontSize: 12 }} />
          <span className="text-gray-900">{template.name}</span>
        </div>

        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <h1 className="text-gray-900">{template.name}</h1>
            <Badge
              color={template.isActive ? 'green' : 'default'}
              text={template.isActive ? 'Đang hoạt động' : 'Không hoạt động'}
            />
          </div>

          <div className="flex gap-2">
            <Button
              onClick={() => navigate(`/admin/cv-templates/${template.id}/edit`)}
              icon={<EditOutlined />}
            >
              Chỉnh sửa
            </Button>
            <Button
              onClick={handleDuplicate}
              icon={<CopyOutlined />}
            >
              Nhân bản
            </Button>
            <Button
              onClick={handleToggleStatus}
              icon={template.isActive ? <PoweroffOutlined /> : <CheckCircleOutlined />}
            >
              {template.isActive ? 'Vô hiệu hóa' : 'Kích hoạt'}
            </Button>
            <Button
              onClick={handleDelete}
              danger
              icon={<DeleteOutlined />}
            >
              Xóa
            </Button>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Left Column - Template Info */}
          <div className="lg:col-span-2 space-y-6">
            {/* Preview */}
            <Card
              title="Xem trước mẫu"
              extra={
                <Button size="small" icon={<EyeOutlined />}>
                  Xem toàn màn hình
                </Button>
              }
            >
              <div className="bg-gray-100 rounded-lg overflow-hidden">
                {template.previewImage ? (
                  <img
                    src={template.previewImage}
                    alt={template.name}
                    className="w-full h-auto"
                  />
                ) : (
                  <div className="aspect-[3/4] flex items-center justify-center">
                    <div className="text-center">
                      <FileTextOutlined style={{ fontSize: 64, color: '#9ca3af' }} className="mb-2" />
                      <p className="text-gray-600">Chưa có ảnh xem trước</p>
                    </div>
                  </div>
                )}
              </div>
            </Card>

            {/* Description */}
            <Card title="Mô tả">
              <p className="text-gray-700 leading-relaxed">
                {template.description || 'Chưa có mô tả'}
              </p>
            </Card>

            {/* HTML Template */}
            <Card
              title="File HTML Template"
              extra={
                <Button
                  size="small"
                  onClick={handleExportTemplate}
                  icon={<DownloadOutlined />}
                >
                  Tải về
                </Button>
              }
            >
              <div className="flex items-center gap-3 p-4 bg-gradient-to-br from-blue-100 via-blue-200 to-blue-300 border rounded-lg">
                <CodeOutlined style={{ fontSize: 32, color: '#2563eb' }} />
                <div className="flex-1">
                  <p className="text-gray-900">{template.name.toLowerCase()}.html</p>
                  <p className="text-gray-600">HTML Template File</p>
                </div>
                <Button type="text" icon={<EyeOutlined />} />
              </div>
            </Card>
          </div>

          {/* Right Column - Stats & Info */}
          <div className="space-y-6">
            {/* Usage Stats */}
            <Card title="Thống kê sử dụng">
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-blue-500 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 bg-blue-100 rounded-lg flex items-center justify-center">
                      <UserOutlined style={{ fontSize: 20, color: '#2563eb' }} />
                    </div>
                    <div>
                      <p className="text-gray-600">Lượt sử dụng</p>
                      <p className="text-gray-900">{template.usageCount}</p>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 bg-green-100 rounded-lg flex items-center justify-center">
                      <FileTextOutlined style={{ fontSize: 20, color: '#16a34a' }} />
                    </div>
                    <div>
                      <p className="text-gray-600">CV đang dùng</p>
                      <p className="text-gray-900">{Math.floor(template.usageCount * 0.7)}</p>
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t">
                  <Button block icon={<EyeOutlined />}>
                    Xem CV sử dụng mẫu này
                  </Button>
                </div>
              </div>
            </Card>

            {/* Template Info */}
            <Card title="Thông tin mẫu">
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <CalendarOutlined style={{ fontSize: 20, color: '#9ca3af' }} className="mt-0.5" />
                  <div className="flex-1">
                    <p className="text-gray-600">Ngày tạo</p>
                    <p className="text-gray-900">
                      {new Date(template.createdAt).toLocaleDateString('vi-VN')}
                    </p>
                    <p className="text-gray-600">
                      ({formatDistanceToNow(new Date(template.createdAt), {
                        addSuffix: true,
                        locale: vi
                      })})
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <CalendarOutlined style={{ fontSize: 20, color: '#9ca3af' }} className="mt-0.5" />
                  <div className="flex-1">
                    <p className="text-gray-600">Cập nhật lần cuối</p>
                    <p className="text-gray-900">
                      {new Date(template.updatedAt).toLocaleDateString('vi-VN')}
                    </p>
                    <p className="text-gray-600">
                      ({formatDistanceToNow(new Date(template.updatedAt), {
                        addSuffix: true,
                        locale: vi
                      })})
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <FileTextOutlined style={{ fontSize: 20, color: '#9ca3af' }} className="mt-0.5" />
                  <div className="flex-1">
                    <p className="text-gray-600">ID mẫu</p>
                    <p className="text-gray-900 font-mono">{template.id}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <CheckCircleOutlined style={{ fontSize: 20, color: '#9ca3af' }} className="mt-0.5" />
                  <div className="flex-1">
                    <p className="text-gray-600">Số phần</p>
                    <p className="text-gray-900">{template.sections.length} phần</p>
                  </div>
                </div>
              </div>
            </Card>

            {/* Quick Actions */}
            <Card title="Thao tác nhanh">
              <div className="space-y-2">
                <Button
                  block
                  className="justify-start"
                  onClick={() => navigate(`/admin/cv-templates/${template.id}/edit`)}
                  icon={<EditOutlined />}
                >
                  Chỉnh sửa mẫu
                </Button>

                <Button
                  block
                  className="justify-start"
                  onClick={handleDuplicate}
                  icon={<CopyOutlined />}
                >
                  Nhân bản mẫu
                </Button>

                <Button
                  block
                  className="justify-start"
                  onClick={handleExportTemplate}
                  icon={<DownloadOutlined />}
                >
                  Xuất template
                </Button>

                <Button
                  block
                  className="justify-start"
                  onClick={handleToggleStatus}
                  icon={template.isActive ? <PoweroffOutlined /> : <CheckCircleOutlined />}
                >
                  {template.isActive ? 'Vô hiệu hóa' : 'Kích hoạt'}
                </Button>

                <Button
                  block
                  danger
                  className="justify-start"
                  onClick={handleDelete}
                  icon={<DeleteOutlined />}
                >
                  Xóa mẫu
                </Button>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
