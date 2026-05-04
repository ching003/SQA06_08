import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { Card, Button, Input, Badge, Dropdown, Modal, message, Spin } from 'antd';
import type { MenuProps } from 'antd';
import {
  RightOutlined, PlusOutlined, SearchOutlined, MoreOutlined, EyeOutlined,
  EditOutlined, DeleteOutlined, CopyOutlined, PoweroffOutlined,
  FileTextOutlined, CalendarOutlined, LoadingOutlined
} from '@ant-design/icons';
import { cvTemplateService } from '../../api/services';
import { CVTemplate } from '../../lib/types';
import { formatDistanceToNow } from 'date-fns';
import { vi } from 'date-fns/locale';

export function CVTemplateListPage() {
  const navigate = useNavigate();
  const [templates, setTemplates] = useState<CVTemplate[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const [deleteDialog, setDeleteDialog] = useState<{
    open: boolean;
    templateId: string | null;
    templateName: string;
  }>({
    open: false,
    templateId: null,
    templateName: '',
  });
  const [previewModal, setPreviewModal] = useState<{
    open: boolean;
    url: string | null;
    name: string;
  }>({
    open: false,
    url: null,
    name: '',
  });

  // Fetch templates from API
  useEffect(() => {
    const fetchTemplates = async () => {
      try {
        setIsLoading(true);
        const response = await cvTemplateService.getTemplates({
          page: 1,
          limit: 100,
          isActive: statusFilter === 'all' ? undefined : statusFilter === 'active',
        });

        setTemplates(response.items || []);
      } catch (error: any) {
        console.error('Failed to fetch templates:', error);
        message.error(error?.message || 'Không thể tải danh sách mẫu CV');
      } finally {
        setIsLoading(false);
      }
    };

    fetchTemplates();
  }, [statusFilter]);

  // Filter templates
  const filteredTemplates = templates.filter(template => {
    // Search filter
    if (searchQuery) {
      const searchLower = searchQuery.toLowerCase();
      if (!template.name.toLowerCase().includes(searchLower) &&
        !(template.description || '').toLowerCase().includes(searchLower)) {
        return false;
      }
    }

    // Status filter
    if (statusFilter === 'active' && !template.isActive) return false;
    if (statusFilter === 'inactive' && template.isActive) return false;

    return true;
  });

  const handleToggleStatus = async (templateId: string) => {
    const template = templates.find(t => t.id === templateId);
    if (!template) return;

    try {
      setIsProcessing(true);
      const updatedTemplate = template.isActive
        ? await cvTemplateService.deactivateTemplate(templateId)
        : await cvTemplateService.activateTemplate(templateId);

      setTemplates(templates.map(t =>
        t.id === templateId ? updatedTemplate : t
      ));
      message.success(`Đã ${template.isActive ? 'vô hiệu hóa' : 'kích hoạt'} mẫu CV`);
    } catch (error: any) {
      console.error('Failed to toggle template status:', error);
      message.error(error?.message || 'Không thể thay đổi trạng thái mẫu CV');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDeleteClick = (templateId: string, templateName: string) => {
    setDeleteDialog({
      open: true,
      templateId,
      templateName,
    });
  };

  const confirmDelete = async () => {
    if (!deleteDialog.templateId) return;

    try {
      setIsProcessing(true);
      await cvTemplateService.deleteTemplate(deleteDialog.templateId);
      setTemplates(templates.filter(t => t.id !== deleteDialog.templateId));
      message.success('Đã xóa mẫu CV');
      setDeleteDialog({ open: false, templateId: null, templateName: '' });
    } catch (error: any) {
      console.error('Failed to delete template:', error);
      message.error(error?.message || 'Không thể xóa mẫu CV');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDuplicate = async (templateId: string) => {
    const template = templates.find(t => t.id === templateId);
    if (!template) return;

    try {
      setIsProcessing(true);
      // Create a copy with modified name
      const newTemplate = await cvTemplateService.createTemplate({
        name: `${template.name} (Bản sao)`,
        isActive: false,
        htmlUrl: template.htmlUrl,
        previewUrl: template.previewUrl,
      });

      setTemplates([newTemplate, ...templates]);
      message.success('Đã tạo bản sao mẫu CV');
    } catch (error: any) {
      console.error('Failed to duplicate template:', error);
      message.error(error?.message || 'Không thể tạo bản sao mẫu CV');
    } finally {
      setIsProcessing(false);
    }
  };

  const getDropdownItems = (template: CVTemplate): MenuProps['items'] => [
    {
      key: 'view',
      icon: <EyeOutlined />,
      label: 'Xem chi tiết',
      onClick: () => navigate(`/admin/cv-templates/${template.id}`),
    },
    {
      key: 'edit',
      icon: <EditOutlined />,
      label: 'Chỉnh sửa',
      onClick: () => navigate(`/admin/cv-templates/${template.id}/edit`),
    },
    {
      key: 'duplicate',
      icon: <CopyOutlined />,
      label: 'Nhân bản',
      onClick: () => handleDuplicate(template.id),
    },
    {
      type: 'divider',
    },
    {
      key: 'toggle',
      icon: template.isActive ? <PoweroffOutlined /> : <PoweroffOutlined />,
      label: template.isActive ? 'Vô hiệu hóa' : 'Kích hoạt',
      onClick: () => handleToggleStatus(template.id),
      disabled: isProcessing,
    },
    {
      type: 'divider',
    },
    {
      key: 'delete',
      icon: <DeleteOutlined />,
      label: 'Xóa',
      danger: true,
      onClick: () => handleDeleteClick(template.id, template.name),
      disabled: isProcessing,
    },
  ];

  const activeCount = templates.filter(t => t.isActive).length;

  return (
    <div className="min-h-screen py-8">
      <div className="max-w-6xl mx-auto px-4">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-gray-600 mb-6">
          <button onClick={() => navigate('/admin/dashboard')} className="hover:text-blue-600">
            Admin Dashboard
          </button>
          <RightOutlined style={{ fontSize: 12 }} />
          <span className="text-gray-900">Quản lý mẫu CV</span>
        </div>

        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Quản lý mẫu CV</h1>
            <p className="text-gray-600">
              Tạo và quản lý các mẫu CV cho người dùng
            </p>
          </div>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => navigate('/admin/cv-templates/new')}
          >
            Thêm mẫu mới
          </Button>
        </div>

        {/* Stats */}
        

        {/* Filters */}
        <Card className="mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search */}
            <div className="flex-1">
              <Input
                placeholder="Tìm kiếm theo tên hoặc mô tả..."
                prefix={<SearchOutlined />}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            {/* Status Filter */}
            <div className="flex gap-2">
              <Button
                type={statusFilter === 'all' ? 'primary' : 'default'}
                onClick={() => setStatusFilter('all')}
              >
                Tất cả ({templates.length})
              </Button>
              <Button
                type={statusFilter === 'active' ? 'primary' : 'default'}
                onClick={() => setStatusFilter('active')}
              >
                Đang hoạt động ({activeCount})
              </Button>
              <Button
                type={statusFilter === 'inactive' ? 'primary' : 'default'}
                onClick={() => setStatusFilter('inactive')}
              >
                Lưu nháp ({templates.length - activeCount})
              </Button>
            </div>
          </div>

          {/* Filter Summary */}
          {(searchQuery || statusFilter !== 'all') && (
            <div className="mt-4 pt-4 border-t flex items-center justify-between">
              <span className="text-gray-600">
                Hiển thị <strong>{filteredTemplates.length}</strong> mẫu CV
              </span>
              <Button
                type="text"
                size="small"
                onClick={() => {
                  setSearchQuery('');
                  setStatusFilter('all');
                }}
              >
                Xóa bộ lọc
              </Button>
            </div>
          )}
        </Card>

        {/* Templates Grid */}
        {isLoading ? (
          <div className="text-center py-12">
            <Spin size="large" />
            <p className="text-gray-600 mt-4">Đang tải danh sách mẫu CV...</p>
          </div>
        ) : filteredTemplates.length > 0 ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredTemplates.map(template => (
              <Card key={template.id} className="hover:shadow-lg transition-shadow">
                {/* Template Preview */}
                <div className="relative">
                  <div className="aspect-3/4 bg-gray-100 rounded-t-lg overflow-hidden">
                    {template.previewUrl ? (
                      <img
                        src={template.previewUrl}
                        alt={template.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <FileTextOutlined style={{ fontSize: 64, color: '#9ca3af' }} />
                      </div>
                    )}
                  </div>

                  {/* Status Badge */}
                  <div className="absolute top-3 right-3">
                    <Badge
                      color={template.isActive ? 'green' : 'gold'}
                      text={template.isActive ? 'Đang hoạt động' : 'Lưu nháp'}
                    />
                  </div>

                  {/* Actions Dropdown */}
                  <div className="absolute top-3 left-3">
                    <Dropdown menu={{ items: getDropdownItems(template) }} trigger={['click']}>
                      <Button icon={<MoreOutlined />} />
                    </Dropdown>
                  </div>
                </div>

                {/* Template Info */}
                <div className="p-6">
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <h3 className="text-gray-900 flex-1">{template.name}</h3>
                  </div>
                  {template.description && (
                    <p className="text-gray-600 mb-4 line-clamp-2">
                      {template.description}
                    </p>
                  )}

                  {/* Stats */}
                  <div className="flex items-center text-gray-600 mb-4">
                    <div className="flex items-center gap-1">
                      <CalendarOutlined />
                      <span>
                        {formatDistanceToNow(
                          template.createdAt instanceof Date
                            ? template.createdAt
                            : new Date(template.createdAt),
                          {
                            addSuffix: true,
                            locale: vi
                          }
                        )}
                      </span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2">
                    <Button
                      size="small"
                      className="flex-1"
                      onClick={() => setPreviewModal({
                        open: true,
                        url: template.previewUrl,
                        name: template.name
                      })}
                      disabled={!template.previewUrl}
                      icon={<EyeOutlined />}
                    >
                      Xem
                    </Button>
                    <Button
                      type="primary"
                      size="small"
                      className="flex-1"
                      onClick={() => navigate(`/admin/cv-templates/${template.id}/edit`)}
                      icon={<EditOutlined />}
                    >
                      Sửa
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <Card>
            <div className="p-12 text-center">
              <FileTextOutlined style={{ fontSize: 64, color: '#9ca3af' }} className="mb-4" />
              <h3 className="text-gray-900 mb-2">
                {searchQuery || statusFilter !== 'all'
                  ? 'Không tìm thấy mẫu CV nào'
                  : 'Chưa có mẫu CV nào'}
              </h3>
              <p className="text-gray-600 mb-6">
                {searchQuery || statusFilter !== 'all'
                  ? 'Thử thay đổi bộ lọc hoặc tìm kiếm khác'
                  : 'Tạo mẫu CV đầu tiên để người dùng có thể sử dụng'}
              </p>
              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={() => navigate('/admin/cv-templates/new')}
              >
                Thêm mẫu mới
              </Button>
            </div>
          </Card>
        )}

        {/* Delete Confirmation Dialog */}
        <Modal
          open={deleteDialog.open}
          onCancel={() => setDeleteDialog({ open: false, templateId: null, templateName: '' })}
          onOk={confirmDelete}
          title="Xóa mẫu CV"
          okText="Xóa"
          cancelText="Hủy"
          okButtonProps={{ danger: true }}
          confirmLoading={isProcessing}
        >
          <p>
            Bạn có chắc chắn muốn xóa mẫu CV "{deleteDialog.templateName}"?
            Hành động này không thể hoàn tác.
          </p>
        </Modal>

        {/* Preview Modal */}
        <Modal
          open={previewModal.open}
          onCancel={() => setPreviewModal({ open: false, url: null, name: '' })}
          title={`Xem trước: ${previewModal.name}`}
          footer={null}
          width={800}
        >
          <div className="mt-4 overflow-auto max-h-[70vh] rounded-lg border">
            {previewModal.url && (
              <img
                src={previewModal.url}
                alt={previewModal.name}
                className="w-full h-auto"
              />
            )}
          </div>
        </Modal>
      </div>
    </div>
  );
}
