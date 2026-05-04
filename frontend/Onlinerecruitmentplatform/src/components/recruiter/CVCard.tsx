import React from 'react';
import { useNavigate } from 'react-router';
import { Card, Button, Dropdown, Menu } from 'antd';
import {
  EyeOutlined,
  DownloadOutlined,
  MoreOutlined,
  BookOutlined,
  BookFilled,
  EditOutlined,
  LoadingOutlined,
  FileTextOutlined,
} from '@ant-design/icons';
import type { MenuProps } from 'antd';
import { CV } from '../../lib/types';

export interface CVCardData {
  id: string;
  cvId?: string;
  candidateName: string;
  title: string;
  summary?: string;
  notes?: string;
}

export interface CVCardProps {
  data: CVCardData;
  isSaved?: boolean;
  isSaving?: boolean;
  onToggleSave?: (cvId: string) => void;
  showNotes?: boolean;
  onEditNotes?: () => void;
  onUnsave?: () => void;
  onViewProfile?: (cvId: string) => void;
  onDownload?: (cvId: string) => void;
  customActions?: React.ReactNode;
}

// Helper function to transform CV data to CVCardData
export function cvToCardData(cv: CV): CVCardData {
  return {
    id: cv.id,
    candidateName: cv.fullName || cv.user?.fullName || 'Chưa cập nhật',
    title: cv.title || 'Chưa đặt tên',
    summary: cv.summary || '',
  };
}

export function CVCard({
  data,
  isSaved = false,
  isSaving = false,
  onToggleSave,
  showNotes = false,
  onEditNotes,
  onUnsave,
  onViewProfile,
  onDownload,
  customActions,
}: CVCardProps) {
  const navigate = useNavigate();
  const cvId = data.cvId || data.id;

  const handleViewProfile = () => {
    if (onViewProfile) {
      onViewProfile(cvId);
    } else {
      navigate(`/recruiter/cvs/${cvId}`);
    }
  };

  const showDropdownMenu = onEditNotes || onUnsave;

  const menuItems: MenuProps['items'] = [
    {
      key: 'view',
      label: 'Xem chi tiết',
      icon: <EyeOutlined />,
      onClick: handleViewProfile,
    },
    ...(onEditNotes ? [{
      key: 'edit',
      label: 'Sửa ghi chú',
      icon: <EditOutlined />,
      onClick: onEditNotes,
    }] : []),
    ...(onUnsave ? [{
      key: 'unsave',
      label: 'Bỏ lưu',
      icon: <BookOutlined />,
      onClick: onUnsave,
      danger: true,
    }] : []),
  ];

  return (
    <Card 
      className="glassmorphism hover:shadow-xl hover:-translate-y-1 transition-all duration-300 border-white/30" 
      styles={{ body: { padding: '20px' } }}
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-3 mb-4">
        <div className="flex-1 min-w-0">
          {/* <h3 className="font-semibold text-gray-900 truncate text-base sm:text-lg mb-1">{data.candidateName}</h3> */}
          <p className="text-sm text-blue-600 truncate font-medium">{data.title}</p>
        </div>

        {/* Actions in header */}
        {showDropdownMenu ? (
          <Dropdown menu={{ items: menuItems }} trigger={['click']}>
            <Button type="text" icon={<MoreOutlined />} className="h-8 w-8 flex-shrink-0" />
          </Dropdown>
        ) : onToggleSave ? (
          <Button
            type="text"
            icon={
              isSaving ? (
                <LoadingOutlined className="text-xl text-gray-400" spin />
              ) : isSaved ? (
                <BookFilled className="text-xl text-blue-500" />
              ) : (
                <BookOutlined className="text-xl text-gray-400" />
              )
            }
            onClick={() => onToggleSave(cvId)}
            disabled={isSaving}
            title={isSaved ? 'Bỏ lưu CV' : 'Lưu CV'}
            className="h-8 w-8 flex-shrink-0"
          />
        ) : null}
      </div>

      {/* Summary */}
      {data.summary && (
        <p className="text-sm text-gray-600 line-clamp-3 mb-4 leading-relaxed">{data.summary}</p>
      )}

      {/* Notes (for saved CVs) */}
      {showNotes && data.notes && (
        <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200/50 rounded-lg p-3 mb-4 shadow-sm">
          <div className="flex items-start gap-2">
            <FileTextOutlined className="text-base text-amber-600 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-amber-800 line-clamp-2 leading-relaxed">{data.notes}</p>
          </div>
        </div>
      )}

      {/* Actions */}
      {customActions ? (
        customActions
      ) : (
        <div className="flex gap-2 mt-auto">
          <Button 
            className="flex-1" 
            size="small" 
            icon={<EyeOutlined />} 
            onClick={handleViewProfile}
            type="primary"
          >
            Xem hồ sơ
          </Button>
          {onEditNotes && (
            <Button 
              type="default" 
              size="small" 
              icon={<FileTextOutlined />} 
              onClick={onEditNotes}
              className="border-gray-300 hover:border-blue-400"
            />
          )}
          {onDownload && (
            <Button 
              type="default" 
              size="small" 
              icon={<DownloadOutlined />} 
              onClick={() => onDownload(cvId)}
              className="border-gray-300 hover:border-blue-400"
            />
          )}
        </div>
      )}
    </Card>
  );
}
