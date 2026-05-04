import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router';
import { Card, Button, Tag, Modal, Dropdown, Spin } from 'antd';
import type { MenuProps } from 'antd';
import {
  FileTextOutlined, PlusOutlined, MoreOutlined, EyeOutlined, EditOutlined, DeleteOutlined, DownloadOutlined,
  StarOutlined, CopyOutlined, ClockCircleOutlined,
  StarFilled
} from '@ant-design/icons';
import { useAuth } from '../contexts/AuthContext';
import { CV, CVTemplate } from '../lib/types';
import { cvService, cvTemplateService } from '../api/services';
import { toast } from 'sonner';
import { formatDistanceToNow } from 'date-fns';
import { vi } from 'date-fns/locale';

export function CVManagementPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [cvs, setCvs] = useState<CV[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [processingCVs, setProcessingCVs] = useState<Set<string>>(new Set());
  const [templateMap, setTemplateMap] = useState<Record<string, string>>({});

  // Preview modal state
  const [previewCV, setPreviewCV] = useState<CV | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isLoadingPreview, setIsLoadingPreview] = useState(false);

  // Fetch templates to build template name map
  useEffect(() => {
    const fetchTemplates = async () => {
      try {
        const response = await cvTemplateService.getActiveTemplates({ page: 1, limit: 100 });
        let templates: CVTemplate[] = [];

        if (response.items && Array.isArray(response.items)) {
          templates = response.items;
        } else if ((response as any).data?.items && Array.isArray((response as any).data.items)) {
          templates = (response as any).data.items;
        } else if (Array.isArray(response)) {
          templates = response;
        }

        // Build template map: templateId -> template name
        const map: Record<string, string> = {};
        templates.forEach(template => {
          map[template.id] = template.name;
        });
        setTemplateMap(map);
      } catch (error) {
        console.error('Failed to fetch templates:', error);
        // Don't show error toast, just use empty map
      }
    };

    fetchTemplates();
  }, []);

  // Fetch user CVs
  useEffect(() => {
    const fetchCVs = async () => {
      if (!user?.id) {
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        const userCVs = await cvService.getCVsByUser(user.id);
        setCvs(userCVs);
      } catch (error) {
        console.error('Failed to fetch CVs:', error);
        toast.error('Không thể tải danh sách CV');
        setCvs([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCVs();
  }, [user]);

  const handleSetPrimary = async (cvId: string) => {
    if (processingCVs.has(cvId)) return;

    try {
      setProcessingCVs(prev => new Set(prev).add(cvId));
      const updatedCV = await cvService.setCVAsMain(cvId);

      // Update local state
      setCvs(cvs.map(cv => ({
        ...cv,
        isMain: cv.id === cvId,
      })));

      toast.success('Đã đặt làm CV chính');
    } catch (error: any) {
      console.error('Failed to set CV as main:', error);
      toast.error(error.message || 'Không thể đặt CV chính');
    } finally {
      setProcessingCVs(prev => {
        const newSet = new Set(prev);
        newSet.delete(cvId);
        return newSet;
      });
    }
  };

  const handleDelete = async (cvId: string) => {
    if (!confirm('Bạn có chắc muốn xóa CV này?')) {
      return;
    }

    if (processingCVs.has(cvId)) return;

    try {
      setProcessingCVs(prev => new Set(prev).add(cvId));
      await cvService.deleteCV(cvId);
      setCvs(cvs.filter(cv => cv.id !== cvId));
      toast.success('Đã xóa CV');
    } catch (error: any) {
      console.error('Failed to delete CV:', error);
      toast.error(error.message || 'Không thể xóa CV');
    } finally {
      setProcessingCVs(prev => {
        const newSet = new Set(prev);
        newSet.delete(cvId);
        return newSet;
      });
    }
  };

  const handleDuplicate = async (cvId: string) => {
    if (processingCVs.has(cvId)) return;

    const cv = cvs.find(c => c.id === cvId);
    if (!cv) return;

    try {
      setProcessingCVs(prev => new Set(prev).add(cvId));

      // Use duplicate API - backend will copy all nested data automatically
      const newCV = await cvService.duplicateCV(cvId, {
        newTitle: `${cv.title} (Bản sao)`,
      });

      setCvs([...cvs, newCV]);
      toast.success('Đã tạo bản sao CV');
    } catch (error: any) {
      console.error('Failed to duplicate CV:', error);
      toast.error(error.message || 'Không thể tạo bản sao CV');
    } finally {
      setProcessingCVs(prev => {
        const newSet = new Set(prev);
        newSet.delete(cvId);
        return newSet;
      });
    }
  };

  const handleExport = async (cvId: string, format: 'pdf') => {
    if (processingCVs.has(cvId)) return;

    const cv = cvs.find(c => c.id === cvId);
    if (!cv) return;

    // If CV already has pdfUrl, open it directly
    if (cv.pdfUrl) {
      window.open(cv.pdfUrl, '_blank');
      toast.success('Đã mở CV trong tab mới');
      return;
    }

    // Otherwise, generate PDF by calling export API, then fetch updated CV
    try {
      setProcessingCVs(prev => new Set(prev).add(cvId));

      // Call export API to generate PDF (backend saves file and updates CV with pdfUrl)
      await cvService.exportCV(cvId);

      // Fetch updated CV to get the new pdfUrl
      const updatedCV = await cvService.getCVById(cvId);

      // Update CV in local state
      setCvs(cvs.map(c => c.id === cvId ? updatedCV : c));

      // Open the PDF if pdfUrl is available
      if (updatedCV.pdfUrl) {
        window.open(updatedCV.pdfUrl, '_blank');
        toast.success('Đã mở CV trong tab mới');
      } else {
        toast.error('Không thể tạo file PDF');
      }
    } catch (error: any) {
      console.error('Failed to export CV:', error);
      toast.error(error.message || 'Không thể xuất CV');
    } finally {
      setProcessingCVs(prev => {
        const newSet = new Set(prev);
        newSet.delete(cvId);
        return newSet;
      });
    }
  };

  const handlePreview = async (cv: CV) => {
    setPreviewCV(cv);

    // If CV already has pdfUrl, use it directly
    if (cv.pdfUrl) {
      setPreviewUrl(cv.pdfUrl);
      return;
    }

    // Otherwise, generate PDF by calling export API, then fetch updated CV
    try {
      setIsLoadingPreview(true);

      // Call export API to generate PDF (backend saves file and updates CV with pdfUrl)
      await cvService.exportCV(cv.id);

      // Fetch updated CV to get the new pdfUrl
      const updatedCV = await cvService.getCVById(cv.id);

      // Update CV in local state
      setCvs(cvs.map(c => c.id === cv.id ? updatedCV : c));

      // Set preview URL if available
      if (updatedCV.pdfUrl) {
        setPreviewUrl(updatedCV.pdfUrl);
      } else {
        toast.error('Không thể tạo file PDF');
        setPreviewCV(null);
      }
    } catch (error: any) {
      console.error('Failed to load CV preview:', error);
      toast.error('Không thể tải xem trước CV');
      setPreviewCV(null);
    } finally {
      setIsLoadingPreview(false);
    }
  };

  const closePreview = () => {
    // No need to cleanup URLs since we're using direct pdfUrl from backend
    setPreviewCV(null);
    setPreviewUrl(null);
  };

  const getTemplateName = (cv: CV): string => {
    // First, try to get from nested template object (if API includes it)
    if ((cv as any).template?.name) {
      return (cv as any).template.name;
    }

    // Second, try to get from templateMap using templateId
    if (cv.templateId && templateMap[cv.templateId]) {
      return templateMap[cv.templateId];
    }

    // If no templateId or template not found, return "Mặc định"
    if (!cv.templateId) {
      return 'Mặc định';
    }

    // If templateId exists but not in map (maybe template was deleted), show "Không xác định"
    return 'Không xác định';
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8 flex items-center justify-center">
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div className="min-h-screen py-4 sm:py-6 lg:py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 sm:gap-0 mb-6 sm:mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Quản lý CV</h1>
            <p className="text-base sm:text-lg text-gray-600">
              Tạo, chỉnh sửa và quản lý các CV của bạn
            </p>
          </div>
          <Link to="/candidate/cvs/new">
            <Button size="large" icon={<PlusOutlined />}>
              Tạo CV mới
            </Button>
          </Link>
        </div>

        {/* CVs Grid */}
        {cvs.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {cvs.map(cv => {
              const menuItems: MenuProps['items'] = [
                {
                  key: 'preview',
                  label: 'Xem trước',
                  icon: <EyeOutlined />,
                  onClick: () => handlePreview(cv),
                },
                {
                  key: 'edit',
                  label: (
                    <Link to={`/candidate/cvs/${cv.id}/edit`}>
                      Chỉnh sửa
                    </Link>
                  ),
                  icon: <EditOutlined />,
                },
                ...(!cv.isMain ? [{
                  key: 'set-primary',
                  label: 'Đặt làm CV chính',
                  icon: processingCVs.has(cv.id) ? <Spin size="small" /> : <StarOutlined />,
                  onClick: () => handleSetPrimary(cv.id),
                  disabled: processingCVs.has(cv.id),
                }] : []),
                {
                  key: 'duplicate',
                  label: 'Nhân bản',
                  icon: processingCVs.has(cv.id) ? <Spin size="small" /> : <CopyOutlined />,
                  onClick: () => handleDuplicate(cv.id),
                  disabled: processingCVs.has(cv.id),
                },
                { type: 'divider' },
                {
                  key: 'export',
                  label: 'Xuất PDF',
                  icon: processingCVs.has(cv.id) ? <Spin size="small" /> : <DownloadOutlined />,
                  onClick: () => handleExport(cv.id, 'pdf'),
                  disabled: processingCVs.has(cv.id),
                },
                { type: 'divider' },
                {
                  key: 'delete',
                  label: 'Xóa',
                  icon: processingCVs.has(cv.id) ? <Spin size="small" /> : <DeleteOutlined />,
                  onClick: () => handleDelete(cv.id),
                  disabled: processingCVs.has(cv.id),
                  danger: true,
                },
              ];

              return (
                <Card
                  key={cv.id}
                  className="glassmorphism relative hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col border-white/30"
                  style={{ minHeight: '200px' }}
                  title={
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <div className="mb-2 flex items-center gap-2 text-base sm:text-lg">
                          <span className="truncate font-semibold">{cv.title}</span>
                          {cv.isMain && (
                            <StarFilled className="!text-yellow-400" />
                          )}
                        </div>
                        <Tag className="text-sm sm:text-base">
                          {getTemplateName(cv)}
                        </Tag>
                      </div>
                      <Dropdown menu={{ items: menuItems }} trigger={['click']}>
                        <Button type="text" icon={<MoreOutlined />} className="h-8 w-8 flex-shrink-0" />
                      </Dropdown>
                    </div>
                  }
                  styles={{
                    header: { padding: '12px 16px' },
                    body: { padding: '10px 16px', display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0 }
                  }}
                >
                  {/* Tags */}
                  <div className="flex flex-wrap gap-2 mb-3 flex-shrink-0">
                    {cv.isOpenForJob && (
                      <Tag color="green" className="text-sm sm:text-base">
                        Đang tìm việc
                      </Tag>
                    )}
                  </div>

                  {/* CV Info */}
                  <div className="flex items-center text-sm sm:text-base text-gray-500 mb-4 flex-shrink-0">
                    <ClockCircleOutlined className="mr-1.5 flex-shrink-0" />
                    <span className="truncate">
                      Cập nhật {formatDistanceToNow(new Date(cv.updatedAt || cv.createdAt), {
                        addSuffix: false,
                        locale: vi
                      })} trước
                    </span>
                  </div>

                  {/* Spacer to push buttons to bottom */}
                  <div className="flex-1"></div>

                  {/* Actions - Fixed at bottom */}
                  <div className="flex gap-2 flex-shrink-0">
                    <Button
                      className="flex-1"
                      onClick={() => handlePreview(cv)}
                      icon={<EyeOutlined />}
                    >
                      Xem
                    </Button>
                    <Link to={`/candidate/cvs/${cv.id}/edit`} className="flex-1">
                      <Button className="w-full" icon={<EditOutlined />}>
                        Sửa
                      </Button>
                    </Link>
                  </div>
                </Card>
              );
            })}
          </div>
        ) : (
          <Card styles={{ body: { padding: '32px 48px', textAlign: 'center' } }}>
            <FileTextOutlined className="text-4xl sm:text-5xl text-gray-400 mb-4" />
            <h3 className="text-base sm:text-lg text-gray-900 mb-2">Chưa có CV nào</h3>
            <p className="text-sm sm:text-base text-gray-600 mb-4 sm:mb-6">
              Tạo CV đầu tiên của bạn để bắt đầu ứng tuyển
            </p>
            <Link to="/candidate/cvs/new">
              <Button size="large" icon={<PlusOutlined />}>
                Tạo CV mới
              </Button>
            </Link>
          </Card>
        )}
      </div>

      {/* CV Preview Modal */}
      <Modal
        open={!!previewCV}
        onCancel={closePreview}
        title={
          <div className="flex items-center gap-2 text-sm sm:text-base">
            <FileTextOutlined />
            <span className="truncate">{previewCV?.title || 'Xem trước CV'}</span>
            {previewCV?.isMain && (
              <StarOutlined className="text-yellow-500 flex-shrink-0" />
            )}
          </div>
        }
        footer={
          <Link to={`/candidate/cvs/${previewCV?.id}/edit`}>
            <Button type="primary" icon={<EditOutlined />}>
              Chỉnh sửa
            </Button>
          </Link>
        }
        width={1400}
        style={{ maxWidth: '95vw' }}
        styles={{ body: { padding: 0, height: 'calc(90vh - 80px)', overflow: 'hidden' } }}
      >
        <div className="flex-1 bg-gray-100 overflow-hidden" style={{ height: 'calc(90vh - 80px)' }}>
          {isLoadingPreview ? (
            <div className="h-full flex items-center justify-center">
              <div className="text-center">
                <Spin size="large" className="mb-2" />
                <p className="text-gray-600">Đang tải xem trước...</p>
              </div>
            </div>
          ) : previewUrl ? (
            <iframe
              src={previewUrl}
              className="w-full h-full border-0"
              title="CV Preview"
            />
          ) : (
            <div className="h-full flex items-center justify-center">
              <div className="text-center">
                <FileTextOutlined className="text-6xl text-gray-400 mb-4" />
                <p className="text-gray-600">Không thể tải xem trước CV</p>
              </div>
            </div>
          )}
        </div>
      </Modal>
    </div>
  );
}