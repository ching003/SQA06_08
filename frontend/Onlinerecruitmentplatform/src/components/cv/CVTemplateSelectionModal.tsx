import React, { useState, useEffect } from 'react';
import { Modal, Card, Button, Tag, message, Spin } from 'antd';
import { LoadingOutlined, CheckOutlined, FileTextOutlined } from '@ant-design/icons';
import { cvTemplateService } from '../../api/services';

interface CVTemplate {
  id: string;
  name: string;
  description?: string;
  thumbnailUrl?: string;
  previewUrl?: string;
  category?: string;
  isActive?: boolean;
}

interface CVTemplateSelectionModalProps {
  open: boolean;
  onClose: () => void;
  onSelect: (templateId: string) => void;
  selectedTemplateId?: string;
}

export function CVTemplateSelectionModal({
  open,
  onClose,
  onSelect,
  selectedTemplateId
}: CVTemplateSelectionModalProps) {
  const [templates, setTemplates] = useState<CVTemplate[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(selectedTemplateId || null);

  useEffect(() => {
    if (open) {
      fetchTemplates();
    }
  }, [open]);

  const fetchTemplates = async () => {
    try {
      setIsLoading(true);
      const response = await cvTemplateService.getActiveTemplates();

      let templatesList: CVTemplate[] = [];
      if (response.items && Array.isArray(response.items)) {
        templatesList = response.items;
      } else if ((response as any).data?.items && Array.isArray((response as any).data.items)) {
        templatesList = (response as any).data.items;
      } else if (Array.isArray(response)) {
        templatesList = response;
      }

      setTemplates(templatesList);
    } catch (error: any) {
      console.error('Failed to fetch templates:', error);
      message.error(error?.message || 'Không thể tải danh sách mẫu CV');
      setTemplates([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectTemplate = (templateId: string) => {
    setSelectedTemplate(templateId);
  };

  const handleConfirm = () => {
    if (selectedTemplate) {
      onSelect(selectedTemplate);
      onClose();
    } else {
      message.error('Vui lòng chọn một mẫu CV');
    }
  };

  const handleSkip = () => {
    onSelect(''); // No template selected
    onClose();
  };

  return (
    <Modal
      open={open}
      onCancel={handleSkip}
      onOk={handleConfirm}
      okText="Lưu"
      cancelText="Bỏ qua (Dùng mặc định)"
      okButtonProps={{ disabled: !selectedTemplate }}
      width={1000}
      title="Chọn mẫu CV"
    >
      <div className="mb-4 text-gray-600">
        Chọn một mẫu CV phù hợp với phong cách và ngành nghề của bạn
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <Spin indicator={<LoadingOutlined className="text-2xl text-green-600" spin />} />
        </div>
      ) : templates.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 py-4">
          {templates.map((template) => (
            <Card
              key={template.id}
              className={`cursor-pointer transition-all duration-200 hover:shadow-lg ${
                selectedTemplate === template.id
                  ? 'ring-2 ring-green-600 shadow-lg'
                  : 'hover:ring-2 hover:ring-gray-300'
              }`}
              onClick={() => handleSelectTemplate(template.id)}
              styles={{ body: { padding: '16px' } }}
            >
              {/* Template Preview */}
              <div className="relative aspect-[3/4] bg-gray-100 rounded-lg mb-3 overflow-hidden">
                {template.thumbnailUrl || template.previewUrl ? (
                  <img
                    src={template.thumbnailUrl || template.previewUrl}
                    alt={template.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="flex items-center justify-center h-full">
                    <FileTextOutlined className="text-4xl text-gray-400" />
                  </div>
                )}

                {/* Selected Indicator */}
                {selectedTemplate === template.id && (
                  <div className="absolute top-2 right-2 bg-green-600 text-white rounded-full p-1.5">
                    <CheckOutlined className="text-base" />
                  </div>
                )}
              </div>

              {/* Template Info */}
              <div className="space-y-2">
                <h3 className="font-semibold text-gray-900 line-clamp-1">
                  {template.name}
                </h3>
                {template.description && (
                  <p className="text-xs text-gray-600 line-clamp-2">
                    {template.description}
                  </p>
                )}
                {template.category && (
                  <Tag className="text-xs">
                    {template.category}
                  </Tag>
                )}
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <FileTextOutlined className="text-4xl text-gray-400 mb-4" />
          <p className="text-gray-600 mb-4">Chưa có mẫu CV nào khả dụng</p>
        </div>
      )}
    </Modal>
  );
}
