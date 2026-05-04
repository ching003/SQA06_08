import { React, useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { Card, Button, Tag, Tabs, Spin } from 'antd';
import {
  BellOutlined, BellFilled, ProjectOutlined, CheckCircleOutlined, CloseCircleOutlined, UserAddOutlined,
  UserDeleteOutlined, ShopOutlined, FileTextOutlined, CheckOutlined, DeleteOutlined, RightOutlined,
  WarningOutlined, MailOutlined, UserOutlined, ThunderboltOutlined
} from '@ant-design/icons';
import { useAuth } from '../../contexts/AuthContext';
import { UserRole, Notification as NotificationType, NotificationType as NotificationTypeEnum } from '../../lib/types';
import { notificationService } from '../../api/services';
import { toast } from 'sonner';

// Mock notification functions removed - now using real API

const getNotificationIcon = (type: NotificationTypeEnum) => {
  switch (type) {
    case NotificationTypeEnum.APPLICATION_RECEIVED:
    case NotificationTypeEnum.APPLICATION_STATUS_CHANGED:
      return <ProjectOutlined className="text-lg" />;
    case NotificationTypeEnum.COMPANY_REGISTRATION:
    case NotificationTypeEnum.COMPANY_UPDATE_PENDING:
      return <ShopOutlined className="text-lg" />;
    case NotificationTypeEnum.COMPANY_APPROVED:
      return <CheckCircleOutlined className="text-lg" />;
    case NotificationTypeEnum.COMPANY_REJECTED:
    case NotificationTypeEnum.JOB_REJECTED:
      return <CloseCircleOutlined className="text-lg" />;
    case NotificationTypeEnum.COMPANY_INVITATION:
      return <MailOutlined className="text-lg" />;
    case NotificationTypeEnum.MEMBER_JOINED:
      return <UserAddOutlined className="text-lg" />;
    case NotificationTypeEnum.MEMBER_REMOVED:
      return <UserDeleteOutlined className="text-lg" />;
    case NotificationTypeEnum.JOB_POSTED:
    case NotificationTypeEnum.JOB_UPDATE_PENDING:
      return <FileTextOutlined className="text-lg" />;
    case NotificationTypeEnum.JOB_APPROVED:
      return <CheckCircleOutlined className="text-lg" />;
    case NotificationTypeEnum.WELCOME:
      return <ThunderboltOutlined className="text-lg" />;
    default:
      return <BellOutlined className="text-lg" />;
  }
};

const getNotificationIconColor = (type: NotificationTypeEnum) => {
  switch (type) {
    case NotificationTypeEnum.APPLICATION_RECEIVED:
    case NotificationTypeEnum.APPLICATION_STATUS_CHANGED:
      return 'bg-blue-100 text-blue-600';
    case NotificationTypeEnum.COMPANY_APPROVED:
    case NotificationTypeEnum.JOB_APPROVED:
    case NotificationTypeEnum.MEMBER_JOINED:
      return 'bg-green-100 text-green-600';
    case NotificationTypeEnum.COMPANY_REJECTED:
    case NotificationTypeEnum.JOB_REJECTED:
    case NotificationTypeEnum.MEMBER_REMOVED:
      return 'bg-red-100 text-red-600';
    case NotificationTypeEnum.COMPANY_REGISTRATION:
    case NotificationTypeEnum.COMPANY_UPDATE_PENDING:
    case NotificationTypeEnum.JOB_POSTED:
    case NotificationTypeEnum.JOB_UPDATE_PENDING:
      return 'bg-yellow-100 text-yellow-600';
    case NotificationTypeEnum.COMPANY_INVITATION:
      return 'bg-purple-100 text-purple-600';
    case NotificationTypeEnum.WELCOME:
      return 'bg-pink-100 text-pink-600';
    default:
      return 'bg-gray-100 text-gray-600';
  }
};

const getTimeAgo = (date: Date) => {
  const seconds = Math.floor((Date.now() - date.getTime()) / 1000);

  if (seconds < 60) return 'Vừa xong';
  if (seconds < 3600) return `${Math.floor(seconds / 60)} phút trước`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)} giờ trước`;
  if (seconds < 604800) return `${Math.floor(seconds / 86400)} ngày trước`;
  return `${Math.floor(seconds / 604800)} tuần trước`;
};

// Get action URL based on notification type and user role
const getActionUrl = (notification: NotificationType, userRole: UserRole): string | null => {
  const { type } = notification;

  // Extract IDs from notification relations
  const jobId = (notification as any).job?.id || (notification as any).application?.jobId;
  const applicationId = (notification as any).application?.id;
  const companyId = (notification as any).company?.id;

  switch (type) {
    case NotificationTypeEnum.APPLICATION_RECEIVED:
      return jobId
        ? `/recruiter/jobs/${jobId}/applications`
        : '/recruiter/applications';

    case NotificationTypeEnum.APPLICATION_STATUS_CHANGED:
      return '/candidate/applications';

    case NotificationTypeEnum.COMPANY_REGISTRATION:
    case NotificationTypeEnum.COMPANY_UPDATE_PENDING:
      return '/admin/companies';

    case NotificationTypeEnum.COMPANY_APPROVED:
    case NotificationTypeEnum.COMPANY_REJECTED:
      return '/recruiter/company';

    case NotificationTypeEnum.MEMBER_JOINED:
      return '/recruiter/team-members';

    case NotificationTypeEnum.JOB_POSTED:
    case NotificationTypeEnum.JOB_UPDATE_PENDING:
      return '/admin/jobs';

    case NotificationTypeEnum.JOB_APPROVED:
    case NotificationTypeEnum.JOB_REJECTED:
      return '/recruiter/jobs';

    // COMPANY_INVITATION and MEMBER_REMOVED don't have direct action URLs
    default:
      return null;
  }
};

export function NotificationsPage() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [notifications, setNotifications] = useState<NotificationType[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [unreadCount, setUnreadCount] = useState(0);
  const [activeTab, setActiveTab] = useState<'all' | 'unread' | 'read'>('all');

  // Fetch notifications from API
  useEffect(() => {
    const fetchNotifications = async () => {
      if (!user) return;

      try {
        setIsLoading(true);
        const params: any = { page: 1, limit: 100 };

        // Filter by read status based on active tab
        if (activeTab === 'unread') {
          params.isRead = false;
        } else if (activeTab === 'read') {
          params.isRead = true;
        }

        const response = await notificationService.getMyNotifications(params);

        // Handle different response structures
        let notificationsList: NotificationType[] = [];
        if (response && response.items && Array.isArray(response.items)) {
          notificationsList = response.items;
        } else if (response && (response as any).data?.items && Array.isArray((response as any).data.items)) {
          notificationsList = (response as any).data.items;
        } else if (Array.isArray(response)) {
          notificationsList = response;
        }

        setNotifications(notificationsList);

        // Fetch unread count separately
        try {
          const countResponse = await notificationService.getUnreadCount();
          setUnreadCount(countResponse.unreadCount || 0);
        } catch (error) {
          // Fallback: calculate from notifications list
          setUnreadCount(notificationsList.filter(n => !n.isRead).length);
        }
      } catch (error) {
        console.error('Failed to fetch notifications:', error);
        toast.error('Không thể tải thông báo');
        setNotifications([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchNotifications();
  }, [user, activeTab]);

  // Notifications are already filtered by API based on activeTab
  // But we still filter client-side as a fallback
  const filteredNotifications = notifications.filter(notif => {
    if (activeTab === 'unread') return !notif.isRead;
    if (activeTab === 'read') return notif.isRead;
    return true;
  });

  const handleMarkAsRead = async (id: string) => {
    try {
      await notificationService.markAsRead(id);
      setNotifications(prev =>
        prev.map(notif => notif.id === id ? { ...notif, isRead: true } : notif)
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error: any) {
      console.error('Failed to mark notification as read:', error);
      toast.error(error.message || 'Không thể đánh dấu đã đọc');
    }
  };

  const handleMarkAsUnread = (id: string) => {
    // Note: API might not support marking as unread, so we just update local state
    setNotifications(prev =>
      prev.map(notif => notif.id === id ? { ...notif, isRead: false } : notif)
    );
    setUnreadCount(prev => prev + 1);
  };

  const handleMarkAllAsRead = async () => {
    try {
      await notificationService.markAllAsRead();
      setNotifications(prev => prev.map(notif => ({ ...notif, isRead: true })));
      setUnreadCount(0);
      toast.success('Đã đánh dấu tất cả là đã đọc');
    } catch (error: any) {
      console.error('Failed to mark all as read:', error);
      toast.error(error.message || 'Không thể đánh dấu tất cả là đã đọc');
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await notificationService.deleteNotification(id);
      const deletedNotif = notifications.find(n => n.id === id);
      if (deletedNotif && !deletedNotif.isRead) {
        setUnreadCount(prev => Math.max(0, prev - 1));
      }
      setNotifications(prev => prev.filter(notif => notif.id !== id));
      toast.success('Đã xóa thông báo');
    } catch (error: any) {
      console.error('Failed to delete notification:', error);
      toast.error(error.message || 'Không thể xóa thông báo');
    }
  };

  const handleNotificationClick = async (notif: NotificationType) => {
    // Mark as read if not already read
    if (!notif.isRead) {
      await handleMarkAsRead(notif.id);
    }

    // Special handling for COMPANY_INVITATION
    if (notif.type === NotificationTypeEnum.COMPANY_INVITATION) {
      // TODO: Open invitation modal instead of navigating
      alert('Chức năng chấp nhận/từ chối lời mời sẽ được hiển thị ở đây');
      return;
    }

    const actionUrl = getActionUrl(notif, user?.role || UserRole.CANDIDATE);
    if (actionUrl) {
      navigate(actionUrl);
    }
  };

  return (
    <div className="min-h-screen py-8">
      <div className="max-w-6xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-gray-900 mb-2">Thông báo</h1>
              {unreadCount > 0 && (
                <Tag color="blue">{unreadCount} mới</Tag>
              )}
            </div>
            {unreadCount > 0 && (
              <Button
                size="small"
                icon={<CheckOutlined />}
                onClick={handleMarkAllAsRead}
              >
                Đánh dấu đã đọc tất cả
              </Button>
            )}
          </div>
          <p className="text-base text-gray-600">
            Theo dõi các hoạt động và cập nhật mới nhất
          </p>
        </div>

        {/* Tabs */}
        <Tabs
          activeKey={activeTab}
          onChange={(v) => setActiveTab(v as any)}
          className="mb-6"
          items={[
            { key: 'all', label: `Tất cả (${notifications.length})` },
            { key: 'unread', label: `Chưa đọc (${unreadCount})` },
            { key: 'read', label: `Đã đọc (${notifications.length - unreadCount})` },
          ]}
        />

        {/* Notifications List */}
        {isLoading ? (
          <Card className="glassmorphism" styles={{ body: { padding: '48px', textAlign: 'center' } }}>
            <Spin size="large" className="mb-4" />
            <p className="text-base text-gray-600">Đang tải thông báo...</p>
          </Card>
        ) : filteredNotifications.length === 0 ? (
          <Card className="glassmorphism" styles={{ body: { padding: '48px', textAlign: 'center' } }}>
            <BellOutlined className="text-5xl text-gray-300 mb-4" />
            <p className="text-base text-gray-600 mb-2">Không có thông báo nào</p>
            <p className="text-sm text-gray-500">
              {activeTab === 'unread'
                ? 'Bạn đã đọc hết tất cả thông báo'
                : 'Các thông báo của bạn sẽ hiển thị ở đây'}
            </p>
          </Card>
        ) : (
          <div className="space-y-3">
            {filteredNotifications.map((notif) => {
              const actionUrl = getActionUrl(notif, user?.role || UserRole.CANDIDATE);
              const hasAction = actionUrl || notif.type === NotificationTypeEnum.COMPANY_INVITATION;

              return (
                <Card
                  key={notif.id}
                  className={`glassmorphism transition-all hover:shadow-md ${hasAction ? 'cursor-pointer' : ''
                    } ${!notif.isRead ? 'border-l-4 border-l-blue-500 bg-blue-50' : ''
                    }`}
                  styles={{ body: { padding: 0 } }}
                >
                  <div className="flex items-start gap-4 p-4">
                    {/* Icon */}
                    <div className={`h-10 w-10 rounded-full flex items-center justify-center flex-shrink-0 ${getNotificationIconColor(notif.type)}`}>
                      {getNotificationIcon(notif.type)}
                    </div>

                    {/* Content */}
                    <div
                      className="flex-1 min-w-0"
                      onClick={() => hasAction && handleNotificationClick(notif)}
                    >
                      <div className="flex items-start justify-between gap-2 mb-1">
                        <h3 className={`text-base ${!notif.isRead ? 'text-gray-900 font-semibold' : 'text-gray-700'}`}>
                          {notif.title}
                        </h3>
                        {hasAction && (
                          <RightOutlined className="text-base text-gray-400 flex-shrink-0" />
                        )}
                      </div>
                      <p className="text-sm text-gray-600 mb-2">{notif.message}</p>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-sm text-gray-500">{getTimeAgo(notif.createdAt)}</span>
                        {!notif.isRead && (
                          <Tag color="blue" className="text-xs">Mới</Tag>
                        )}
                        {notif.expiresAt && new Date(notif.expiresAt) > new Date() && (
                          <Tag color="orange" className="text-xs">
                            Hết hạn {getTimeAgo(notif.expiresAt)}
                          </Tag>
                        )}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-1 flex-shrink-0">
                      {notif.isRead ? (
                        <Button
                          type="text"
                          size="small"
                          icon={<BellOutlined />}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleMarkAsUnread(notif.id);
                          }}
                          title="Đánh dấu chưa đọc"
                        />
                      ) : (
                        <Button
                          type="text"
                          size="small"
                          icon={<CheckOutlined />}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleMarkAsRead(notif.id);
                          }}
                          title="Đánh dấu đã đọc"
                        />
                      )}
                      <Button
                        type="text"
                        size="small"
                        danger
                        icon={<DeleteOutlined />}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDelete(notif.id);
                        }}
                        title="Xóa"
                      />
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
