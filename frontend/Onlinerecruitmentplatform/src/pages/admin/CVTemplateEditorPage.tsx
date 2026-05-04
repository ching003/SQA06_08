import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router';
import { useForm, Controller } from 'react-hook-form';
import { Card, Button, Input, Checkbox, message, Spin } from 'antd';
import {
  RightOutlined, UploadOutlined, CloseOutlined, SaveOutlined,
  PictureOutlined, CodeOutlined, LoadingOutlined
} from '@ant-design/icons';
import { cvTemplateService } from '../../api/services';
import { CVTemplate } from '../../lib/types';

interface TemplateFormData {
  name: string;
  isActive: boolean;
  previewImage?: File;
  htmlTemplate?: File;
}

export function CVTemplateEditorPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingTemplate, setIsLoadingTemplate] = useState(false);
  const [existingTemplate, setExistingTemplate] = useState<CVTemplate | null>(null);
  const [previewImageUrl, setPreviewImageUrl] = useState<string | null>(null);
  const [previewImageFile, setPreviewImageFile] = useState<File | null>(null);
  const [previewImageObjectUrl, setPreviewImageObjectUrl] = useState<string | null>(null);
  const [htmlFile, setHtmlFile] = useState<File | null>(null);

  const isEditMode = !!id;

  const { control, handleSubmit, watch, setValue, reset, formState: { errors } } = useForm<TemplateFormData>({
    defaultValues: {
      name: '',
      isActive: true,
    }
  });

  // Fetch template data when in edit mode
  useEffect(() => {
    const fetchTemplate = async () => {
      if (!id) return;

      try {
        setIsLoadingTemplate(true);
        const templateData = await cvTemplateService.getTemplateById(id);
        setExistingTemplate(templateData);

        if (templateData.previewUrl) {
          setPreviewImageUrl(templateData.previewUrl);
        }
      } catch (error: any) {
        console.error('Failed to fetch template:', error);
        message.error(error?.message || 'Không thể tải thông tin mẫu CV');
        navigate('/admin/cv-templates');
      } finally {
        setIsLoadingTemplate(false);
      }
    };

    fetchTemplate();
  }, [id, navigate]);

  // Populate form when template data is loaded
  useEffect(() => {
    if (existingTemplate) {
      reset({
        name: existingTemplate.name || '',
        isActive: existingTemplate.isActive || false,
      });
    }
  }, [existingTemplate, reset]);

  // Cleanup object URL on unmount
  useEffect(() => {
    return () => {
      if (previewImageObjectUrl) {
        URL.revokeObjectURL(previewImageObjectUrl);
      }
    };
  }, [previewImageObjectUrl]);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        message.error('Ảnh không được vượt quá 5MB');
        return;
      }

      if (!file.type.startsWith('image/')) {
        message.error('File phải là hình ảnh');
        return;
      }

      setPreviewImageFile(file);
      const objectUrl = URL.createObjectURL(file);
      setPreviewImageObjectUrl(objectUrl);
      setValue('previewImage', file);
    }
  };

  const handleHtmlUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 1024 * 1024) {
        message.error('File HTML không được vượt quá 1MB');
        return;
      }
      setHtmlFile(file);
      setValue('htmlTemplate', file);
      message.success(`Đã tải lên: ${file.name}`);
    }
  };

  const onSubmit = async (data: TemplateFormData) => {
    try {
      setIsLoading(true);

      if (isEditMode && id) {
        const updateData: any = {
          name: data.name,
          isActive: data.isActive,
        };

        if (previewImageFile) {
          updateData.preview = previewImageFile;
        } else if (existingTemplate?.previewUrl) {
          updateData.previewUrl = existingTemplate.previewUrl;
        }

        if (htmlFile) {
          updateData.template = htmlFile;
        } else if (existingTemplate?.htmlUrl) {
          updateData.htmlUrl = existingTemplate.htmlUrl;
        }

        await cvTemplateService.updateTemplate(id, updateData);
        message.success('Đã cập nhật mẫu CV');
      } else {
        if (!previewImageFile) {
          message.error('Vui lòng tải ảnh xem trước');
          setIsLoading(false);
          return;
        }

        if (!htmlFile) {
          message.error('Vui lòng tải file HTML template');
          setIsLoading(false);
          return;
        }

        await cvTemplateService.createTemplate({
          name: data.name,
          preview: previewImageFile,
          template: htmlFile,
          isActive: data.isActive,
        });
        message.success('Đã tạo mẫu CV mới');
      }

      navigate('/admin/cv-templates');
    } catch (error: any) {
      console.error('Failed to save template:', error);
      message.error(error?.message || 'Không thể lưu mẫu CV');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveDraft = async () => {
    const formData = watch();
    if (!formData.name.trim()) {
      message.error('Vui lòng nhập tên mẫu');
      return;
    }

    try {
      setIsLoading(true);
      const submitData: any = {
        name: formData.name,
        isActive: false,
      };

      if (previewImageFile) {
        submitData.preview = previewImageFile;
      } else if (existingTemplate?.previewUrl) {
        submitData.previewUrl = existingTemplate.previewUrl;
      }

      if (htmlFile) {
        submitData.template = htmlFile;
      } else if (existingTemplate?.htmlUrl) {
        submitData.htmlUrl = existingTemplate.htmlUrl;
      }

      if (isEditMode && id) {
        await cvTemplateService.updateTemplate(id, submitData);
        message.success('Đã lưu nháp');
      } else {
        if (!previewImageFile && !existingTemplate?.previewUrl) {
          message.error('Vui lòng tải ảnh xem trước');
          setIsLoading(false);
          return;
        }
        if (!htmlFile && !existingTemplate?.htmlUrl) {
          message.error('Vui lòng tải file HTML template');
          setIsLoading(false);
          return;
        }
        await cvTemplateService.createTemplate(submitData);
        message.success('Đã tạo mẫu CV (lưu nháp)');
      }

      navigate('/admin/cv-templates');
    } catch (error: any) {
      console.error('Failed to save draft:', error);
      message.error(error?.message || 'Không thể lưu nháp');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoadingTemplate) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Spin size="large" />
          <p className="text-gray-600 mt-4">Đang tải...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-gray-600 mb-6">
          <button onClick={() => navigate('/admin/dashboard')} className="hover:text-blue-600">
            Dashboard
          </button>
          <RightOutlined style={{ fontSize: 12 }} />
          <button onClick={() => navigate('/admin/cv-templates')} className="hover:text-blue-600">
            Mẫu CV
          </button>
          <RightOutlined style={{ fontSize: 12 }} />
          <span className="text-gray-900">
            {isEditMode ? 'Chỉnh sửa' : 'Thêm mới'}
          </span>
        </div>

        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-gray-900">
            {isEditMode ? 'Chỉnh sửa mẫu CV' : 'Thêm mẫu CV mới'}
          </h1>
          <Button icon={<CloseOutlined />} onClick={() => navigate('/admin/cv-templates')}>
            Hủy
          </Button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Basic Information */}
          <Card title="Thông tin cơ bản">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tên mẫu CV *
              </label>
              <Controller
                name="name"
                control={control}
                rules={{ required: 'Vui lòng nhập tên mẫu' }}
                render={({ field }) => (
                  <Input
                    {...field}
                    placeholder="Nhập tên mẫu CV"
                    status={errors.name ? 'error' : ''}
                  />
                )}
              />
              {errors.name && (
                <p className="text-red-600 text-sm mt-1">{errors.name.message}</p>
              )}
            </div>
          </Card>

          {/* Preview Image */}
          <Card title="Ảnh xem trước *">
            {(previewImageUrl || previewImageFile) ? (
              <div className="flex gap-4">
                <div className="relative">
                  <img
                    src={previewImageUrl || previewImageObjectUrl || ''}
                    alt="Preview"
                    className="w-48 h-64 object-cover border rounded-lg"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      if (previewImageObjectUrl) {
                        URL.revokeObjectURL(previewImageObjectUrl);
                      }
                      setPreviewImageUrl(null);
                      setPreviewImageFile(null);
                      setPreviewImageObjectUrl(null);
                      setValue('previewImage', undefined);
                    }}
                    className="absolute -top-2 -right-2 h-6 w-6 bg-red-600 text-white rounded-full flex items-center justify-center hover:bg-red-700"
                  >
                    <CloseOutlined style={{ fontSize: 12 }} />
                  </button>
                </div>
                <div className="flex-1">
                  <label className="flex items-center justify-center gap-2 w-full p-3 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50">
                    <UploadOutlined />
                    <span className="text-gray-700">Thay đổi ảnh</span>
                    <input
                      type="file"
                      className="hidden"
                      accept="image/png,image/jpeg,image/jpg"
                      onChange={handleImageUpload}
                    />
                  </label>
                  <p className="text-sm text-gray-500 mt-2">PNG, JPG (Tối đa 5MB)</p>
                </div>
              </div>
            ) : (
              <label className="flex flex-col items-center justify-center w-full h-48 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
                <PictureOutlined style={{ fontSize: 40, color: '#9ca3af' }} className="mb-2" />
                <p className="text-gray-700 mb-1">Click để tải ảnh xem trước</p>
                <p className="text-sm text-gray-500">PNG, JPG (Tối đa 5MB)</p>
                <input
                  type="file"
                  className="hidden"
                  accept="image/png,image/jpeg,image/jpg"
                  onChange={handleImageUpload}
                />
              </label>
            )}
          </Card>

          {/* HTML Template */}
          <Card title="File HTML template *">
            {htmlFile || (isEditMode && existingTemplate?.htmlUrl) ? (
              <div className="space-y-3">
                <div className="flex items-center justify-between p-4 bg-blue-50 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 bg-blue-100 rounded-lg flex items-center justify-center">
                      <CodeOutlined style={{ fontSize: 20, color: '#2563eb' }} />
                    </div>
                    <div>
                      <p className="text-gray-900 font-medium">
                        {htmlFile ? htmlFile.name : 'File HTML đã tải lên'}
                      </p>
                      {htmlFile && (
                        <p className="text-sm text-gray-600">
                          {(htmlFile.size / 1024).toFixed(2)} KB
                        </p>
                      )}
                      {existingTemplate?.htmlUrl && !htmlFile && (
                        <a
                          href={existingTemplate.htmlUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:underline text-sm"
                        >
                          Xem file hiện tại
                        </a>
                      )}
                    </div>
                  </div>
                  <Button
                    type="text"
                    danger
                    icon={<CloseOutlined />}
                    onClick={() => {
                      setHtmlFile(null);
                      setValue('htmlTemplate', undefined);
                    }}
                  />
                </div>
                <label className="flex items-center justify-center gap-2 w-full p-3 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50">
                  <UploadOutlined />
                  <span className="text-gray-700">Tải lên file khác</span>
                  <input
                    type="file"
                    className="hidden"
                    accept=".html,.htm"
                    onChange={handleHtmlUpload}
                  />
                </label>
              </div>
            ) : (
              <label className="flex flex-col items-center justify-center h-40 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
                <UploadOutlined style={{ fontSize: 40, color: '#9ca3af' }} className="mb-2" />
                <span className="text-gray-700 mb-1">Tải file HTML template</span>
                <span className="text-sm text-gray-500">HTML, HTM (Tối đa 1MB)</span>
                <input
                  type="file"
                  className="hidden"
                  accept=".html,.htm"
                  onChange={handleHtmlUpload}
                />
              </label>
            )}
          </Card>

          {/* Status & Actions */}
          <Card>
            <div className="space-y-4">
              {/* isActive checkbox */}
              <div className="pb-4 border-b">
                <Controller
                  name="isActive"
                  control={control}
                  render={({ field }) => (
                    <Checkbox
                      checked={field.value}
                      onChange={(e) => field.onChange(e.target.checked)}
                    >
                      Kích hoạt mẫu này (hiển thị cho người dùng)
                    </Checkbox>
                  )}
                />
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-between">
                <Button
                  onClick={() => navigate('/admin/cv-templates')}
                  disabled={isLoading}
                >
                  Hủy
                </Button>

                <div className="flex gap-3">
                  <Button
                    onClick={handleSaveDraft}
                    disabled={isLoading}
                    loading={isLoading}
                  >
                    Lưu nháp
                  </Button>

                  <Button
                    type="primary"
                    htmlType="submit"
                    disabled={isLoading}
                    loading={isLoading}
                    icon={<SaveOutlined />}
                  >
                    {isEditMode ? 'Lưu thay đổi' : 'Tạo mẫu'}
                  </Button>
                </div>
              </div>
            </div>
          </Card>
        </form>
      </div>
    </div>
  );
}
