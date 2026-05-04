import React, { useState, useEffect } from 'react';
import { Application, AppStatus, CV } from '../../lib/types';
import { formatDistanceToNow } from 'date-fns';
import { vi } from 'date-fns/locale';
import { message, Modal, Button, Tag, Avatar, Divider, Spin } from 'antd';
import {
  MailOutlined,
  PhoneOutlined,
  CalendarOutlined,
  FileTextOutlined,
  ExportOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  ClockCircleOutlined,
  EyeOutlined,
  ReloadOutlined,
  UserOutlined,
} from '@ant-design/icons';
import { cvService, applicationService } from '../../api/services';

interface ApplicationWithCandidate extends Application {
  candidate?: {
    id: string;
    name: string;
    email: string;
    phone?: string;
    avatar?: string;
  };
  cvTitle?: string;
  job?: {
    id: string;
    title: string;
  };
}

interface CandidateProfileModalProps {
  application: ApplicationWithCandidate;
  jobTitle?: string;
  isOpen: boolean;
  onClose: () => void;
  onUpdateStatus?: (appId: string, newStatus: AppStatus) => void;
}

export function CandidateProfileModal({
  application,
  jobTitle: propJobTitle,
  isOpen,
  onClose,
  onUpdateStatus,
}: CandidateProfileModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [isDataLoading, setIsDataLoading] = useState(false);
  const [cv, setCv] = useState<CV | null>(null);
  // Local state để track status sau khi update - tránh gọi API 2 lần
  const [localStatus, setLocalStatus] = useState<AppStatus>(application.status);

  // Sync localStatus khi application prop thay đổi
  useEffect(() => {
    setLocalStatus(application.status);
  }, [application.status, application.id]);

  // Fetch CV details when modal opens
  useEffect(() => {
    const fetchData = async () => {
      if (!isOpen || !application) return;
      
      setIsDataLoading(true);
      try {
        // Fetch CV details if we have cvId and no CV data yet
        if (application.cvId && !cv) {
          try {
            const cvData = await cvService.getCVById(application.cvId);
            setCv(cvData);
          } catch (error) {
            console.error('Failed to fetch CV:', error);
          }
        }
      } finally {
        setIsDataLoading(false);
      }
    };
    
    fetchData();
  }, [isOpen, application?.cvId]);

  // Use data from props - candidate info is already in application.candidate or application.user
  const candidate = application.candidate || (application as any).user;
  const jobTitle = propJobTitle || application.job?.title || 'Vị trí không xác định';

  const statusConfig = {
    [AppStatus.PENDING]: {
      label: 'Chờ xử lý',
      color: 'orange',
      icon: <ClockCircleOutlined />,
    },
    [AppStatus.REVIEWING]: {
      label: 'Đang xem xét',
      color: 'blue',
      icon: <EyeOutlined />,
    },
    [AppStatus.ACCEPTED]: {
      label: 'Đã chấp nhận',
      color: 'green',
      icon: <CheckCircleOutlined />,
    },
    [AppStatus.REJECTED]: {
      label: 'Đã từ chối',
      color: 'red',
      icon: <CloseCircleOutlined />,
    },
    [AppStatus.CANCELLED]: {
      label: 'Đã rút đơn',
      color: 'default',
      icon: <CloseCircleOutlined />,
    },
  };

  const statusInfo = statusConfig[localStatus] || statusConfig[AppStatus.PENDING];

  const handleStatusUpdate = async (newStatus: AppStatus) => {
    // Prevent duplicate calls
    if (isLoading || localStatus === newStatus) return;
    
    setIsLoading(true);
    try {
      // Call API to update status
      await applicationService.updateApplicationStatus(application.id, { status: newStatus });
      
      // Update local status immediately to prevent duplicate calls
      setLocalStatus(newStatus);
      
      // Call callback if provided
      if (onUpdateStatus) {
        onUpdateStatus(application.id, newStatus);
      }
      
      const messages: Record<string, string> = {
        [AppStatus.REVIEWING]: 'Đã chuyển sang trạng thái đang xem xét',
        [AppStatus.ACCEPTED]: 'Đã chấp nhận đơn ứng tuyển',
        [AppStatus.REJECTED]: 'Đã từ chối đơn ứng tuyển',
        [AppStatus.PENDING]: 'Đã chuyển về trạng thái chờ xử lý',
      };
      
      message.success(messages[newStatus] || 'Đã cập nhật trạng thái');
      
      // Close modal after accepting or rejecting
      if (newStatus === AppStatus.ACCEPTED || newStatus === AppStatus.REJECTED) {
        setTimeout(() => onClose(), 1000);
      }
    } catch (error: any) {
      console.error('Failed to update status:', error);
      message.error(error?.message || 'Có lỗi xảy ra. Vui lòng thử lại.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleViewCV = () => {
    if (cv?.pdfUrl) {
      window.open(cv.pdfUrl, '_blank');
    } else if (application.cvId) {
      window.open(`/recruiter/cvs/${application.cvId}`, '_blank');
    }
  };

  // Get candidate name and other details
  const candidateName = candidate?.name || candidate?.fullName || (application as any).user?.fullName || 'Chưa cập nhật';
  const candidateEmail = candidate?.email || (application as any).user?.email || '';
  const candidatePhone = candidate?.phone || candidate?.phoneNumber || (application as any).user?.phoneNumber || '';
  const candidateAvatar = candidate?.avatar || candidate?.avatarUrl || (application as any).user?.avatarUrl || '';
  const cvTitle = application.cvTitle || cv?.title || 'CV ứng tuyển';

  // Get avatar initials
  const getAvatarInitials = () => {
    const names = candidateName.split(' ');
    if (names.length >= 2) {
      return (names[0][0] + names[names.length - 1][0]).toUpperCase();
    }
    return candidateName.charAt(0).toUpperCase();
  };

  return (
    <Modal
      open={isOpen}
      onCancel={onClose}
      footer={null}
      width={800}
      title="Hồ sơ ứng viên"
    >
      {isDataLoading ? (
        <div className="flex items-center justify-center py-12">
          <Spin size="large" />
          <span className="ml-2 text-gray-600">Đang tải thông tin...</span>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Header with avatar and basic info */}
          <div className="flex items-start gap-4">
            <Avatar 
              size={80}
              src={candidateAvatar || undefined}
              className="flex-shrink-0"
            >
              {!candidateAvatar && getAvatarInitials()}
            </Avatar>

            <div className="flex-1 min-w-0">
              <h2 className="text-xl font-semibold text-gray-900 mb-2">
                {candidateName}
              </h2>
              
              <div className="flex items-center gap-2 mb-3">
                <Tag color={statusInfo.color} icon={statusInfo.icon}>
                  {statusInfo.label}
                </Tag>
              </div>

              <div className="space-y-2 text-gray-600">
                {candidateEmail && (
                  <div className="flex items-center gap-2">
                    <MailOutlined className="text-base flex-shrink-0" />
                    <a href={`mailto:${candidateEmail}`} className="hover:text-blue-600 truncate">
                      {candidateEmail}
                    </a>
                  </div>
                )}
                {candidatePhone && (
                  <div className="flex items-center gap-2">
                    <PhoneOutlined className="text-base flex-shrink-0" />
                    <a href={`tel:${candidatePhone}`} className="hover:text-blue-600">
                      {candidatePhone}
                    </a>
                  </div>
                )}
                <div className="flex items-center gap-2">
                  <CalendarOutlined className="text-base flex-shrink-0" />
                  <span>
                    Ứng tuyển {formatDistanceToNow(new Date(application.createdAt), {
                      addSuffix: true,
                      locale: vi
                    })}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <Divider />

          {/* Job Info */}
          <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
            <h3 className="font-medium text-gray-900 mb-1">Vị trí ứng tuyển</h3>
            <p className="text-gray-700">{jobTitle}</p>
          </div>

          {/* Cover Letter */}
          {application.coverLetter && (
            <div>
              <h3 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
                <FileTextOutlined className="text-lg" />
                Thư giới thiệu
              </h3>
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-gray-700 whitespace-pre-wrap">
                  {application.coverLetter}
                </p>
              </div>
            </div>
          )}

          {/* CV Section */}
          <div>
            <h3 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
              <FileTextOutlined className="text-lg" />
              Hồ sơ CV
            </h3>
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-6 border border-blue-200">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h4 className="font-medium text-gray-900 mb-2">{cvTitle}</h4>
                  {cv?.updatedAt && (
                    <p className="text-sm text-gray-600">
                      Cập nhật {formatDistanceToNow(new Date(cv.updatedAt), {
                        addSuffix: true,
                        locale: vi
                      })}
                    </p>
                  )}
                </div>
                <FileTextOutlined className="text-4xl text-blue-600 flex-shrink-0" />
              </div>

              <Button 
                onClick={handleViewCV} 
                className="w-full" 
                size="large"
                icon={<ExportOutlined />}
              >
                Xem CV đầy đủ
              </Button>
            </div>
          </div>

          <Divider />

          {/* Action Buttons */}
          <div>
            <h3 className="font-medium text-gray-900 mb-3">Cập nhật trạng thái</h3>
            {localStatus === AppStatus.CANCELLED ? (
              <div className="bg-gray-50 rounded-lg p-4 text-center border border-gray-200">
                <CloseCircleOutlined className="text-3xl text-gray-400 mb-2" />
                <p className="text-gray-600">Ứng viên đã rút đơn ứng tuyển</p>
                <p className="text-sm text-gray-500 mt-1">Không thể thao tác với đơn này</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-3">
                {/* Row 1: Main actions */}
                {/* Chỉ hiển thị "Đang xem xét" khi status là PENDING */}
                {localStatus === AppStatus.PENDING && (
                  <Button
                    onClick={() => handleStatusUpdate(AppStatus.REVIEWING)}
                    disabled={isLoading}
                    icon={<EyeOutlined />}
                    className="border-yellow-300 text-yellow-700 hover:bg-yellow-50"
                  >
                    Đang xem xét
                  </Button>
                )}
                
                {/* Row 2: Final actions */}
                {localStatus !== AppStatus.ACCEPTED && localStatus !== AppStatus.REJECTED && (
                  <Button
                    onClick={() => handleStatusUpdate(AppStatus.ACCEPTED)}
                    disabled={isLoading}
                    type="primary"
                    icon={<CheckCircleOutlined />}
                    className="bg-green-600 hover:bg-green-700 border-green-600"
                  >
                    Phê duyệt
                  </Button>
                )}
                
                {localStatus !== AppStatus.REJECTED && localStatus !== AppStatus.ACCEPTED && (
                  <Button
                    onClick={() => handleStatusUpdate(AppStatus.REJECTED)}
                    disabled={isLoading}
                    danger
                    icon={<CloseCircleOutlined />}
                  >
                    Từ chối
                  </Button>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </Modal>
  );
}
