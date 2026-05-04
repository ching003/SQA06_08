import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { Card, Button, Badge, Tabs, Modal, Spin } from 'antd';
import {
  BellOutlined, BellFilled, ProjectOutlined, CheckCircleOutlined,
  CloseCircleOutlined, UserAddOutlined, UserDeleteOutlined, BankOutlined,
  FileTextOutlined, CheckOutlined, MailOutlined, TeamOutlined,
  StarOutlined, DeleteOutlined, RightOutlined, ExclamationCircleOutlined,
  LoadingOutlined
} from '@ant-design/icons';
import { useAuth } from '../contexts/AuthContext';
import { UserRole, Notification as NotificationType, NotificationType as NotificationTypeEnum } from '../lib/types';
import { notificationService, companyService } from '../api/services';
import { getCompanyRoleLabel } from '../lib/constants';
import { message } from 'antd';

// Helper to extract role from notification message
const extractRoleFromMessage = (messageText: string): string | null => {
  const roleMatch = messageText.match(/với vai trò (\w+)/);
  if (roleMatch) {
    return roleMatch[1];
  }
  return null;
};

const getNotificationIcon = (type: NotificationTypeEnum) => {
  switch (type) {
    case NotificationTypeEnum.APPLICATION_RECEIVED:
    case NotificationTypeEnum.APPLICATION_STATUS_CHANGED:
      return <ProjectOutlined />;
    case NotificationTypeEnum.COMPANY_REGISTRATION:
    case NotificationTypeEnum.COMPANY_UPDATE_PENDING:
      return <BankOutlined />;
    case NotificationTypeEnum.COMPANY_APPROVED:
      return <CheckCircleOutlined />;
    case NotificationTypeEnum.COMPANY_REJECTED:
    case NotificationTypeEnum.JOB_REJECTED:
      return <CloseCircleOutlined />;
    case NotificationTypeEnum.COMPANY_INVITATION:
      return <MailOutlined />;
    case NotificationTypeEnum.MEMBER_JOINED:
      return <UserAddOutlined />;
    case NotificationTypeEnum.MEMBER_REMOVED:
      return <UserDeleteOutlined />;
    case NotificationTypeEnum.JOB_POSTED:
    case NotificationTypeEnum.JOB_UPDATE_PENDING:
      return <FileTextOutlined />;
    case NotificationTypeEnum.JOB_APPROVED:
      return <CheckCircleOutlined />;
    case NotificationTypeEnum.WELCOME:
      return <StarOutlined />;
    default:
      return <BellOutlined />;
  }
};

const getNotificationIconColor = (type: NotificationTypeEnum) => {
  switch (type) {
    case NotificationTypeEnum.APPLICATION_RECEIVED:
    case NotificationTypeEnum.APPLICATION_STATUS_CHANGED:
      return '#3B82F6';
    case NotificationTypeEnum.COMPANY_APPROVED:
    case NotificationTypeEnum.JOB_APPROVED:
    case NotificationTypeEnum.MEMBER_JOINED:
      return '#10B981';
    case NotificationTypeEnum.COMPANY_REJECTED:
    case NotificationTypeEnum.JOB_REJECTED:
    case NotificationTypeEnum.MEMBER_REMOVED:
      return '#EF4444';
    case NotificationTypeEnum.COMPANY_REGISTRATION:
    case NotificationTypeEnum.COMPANY_UPDATE_PENDING:
    case NotificationTypeEnum.JOB_POSTED:
    case NotificationTypeEnum.JOB_UPDATE_PENDING:
      return '#F59E0B';
    case NotificationTypeEnum.COMPANY_INVITATION:
      return '#8B5CF6';
    case NotificationTypeEnum.WELCOME:
      return '#EC4899';
    default:
      return '#6B7280';
  }
};

const getTimeAgo = (dateInput: Date | string) => {
  const date = new Date(dateInput);
  if (isNaN(date.getTime())) return '';

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

  const jobId = (notification as any).job?.id || (notification as any).metadata?.jobId;
  const applicationId = (notification as any).application?.id || (notification as any).metadata?.applicationId;
  const companyId = (notification as any).company?.id || (notification as any).metadata?.companyId;

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
  const [invitationModal, setInvitationModal] = useState<{
    open: boolean;
    notification: NotificationType | null;
  }>({ open: false, notification: null });

  // Fetch notifications from API
  useEffect(() => {
    const fetchNotifications = async () => {
      if (!user) return;

      try {
        setIsLoading(true);
        const params: any = { page: 1, limit: 100 };

        if (activeTab === 'unread') {
          params.isRead = false;
        } else if (activeTab === 'read') {
          params.isRead = true;
        }

        const response = await notificationService.getMyNotifications(params);

        let notificationsList: NotificationType[] = [];
        if (response && response.items && Array.isArray(response.items)) {
          notificationsList = response.items;
        } else if (response && (response as any).data?.items && Array.isArray((response as any).data.items)) {
          notificationsList = (response as any).data.items;
        } else if (Array.isArray(response)) {
          notificationsList = response;
        }

        setNotifications(notificationsList);

        try {
          const countResponse = await notificationService.getUnreadCount();
          setUnreadCount(countResponse.unreadCount || 0);
        } catch (error) {
          setUnreadCount(notificationsList.filter(n => !n.isRead).length);
        }
      } catch (error) {
        console.error('Failed to fetch notifications:', error);
        message.error('Không thể tải thông báo');
        setNotifications([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchNotifications();
  }, [user, activeTab]);

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
      message.error(error.message || 'Không thể đánh dấu đã đọc');
    }
  };

  const handleMarkAsUnread = (id: string) => {
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
      message.success('Đã đánh dấu tất cả là đã đọc');
    } catch (error: any) {
      console.error('Failed to mark all as read:', error);
      message.error(error.message || 'Không thể đánh dấu tất cả là đã đọc');
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
      message.success('Đã xóa thông báo');
    } catch (error: any) {
      console.error('Failed to delete notification:', error);
      message.error(error.message || 'Không thể xóa thông báo');
    }
  };

  const handleAcceptInvitation = async () => {
    if (!invitationModal.notification) return;

    const invitationId = invitationModal.notification.invitation?.id || invitationModal.notification.metadata?.invitationId;
    if (!invitationId) {
      message.error('Không tìm thấy thông tin lời mời');
      console.error('Notification:', invitationModal.notification);
      return;
    }

    try {
      await companyService.acceptInvitation(invitationId);

      message.success('Đã chấp nhận lời mời tham gia công ty');
      handleDelete(invitationModal.notification.id);
      setInvitationModal({ open: false, notification: null });

      window.location.reload();
      navigate('/recruiter/team-members');
    } catch (error: any) {
      console.error('Failed to accept invitation:', error);
      message.error(error?.message || 'Không thể chấp nhận lời mời');
    }
  };

  const handleRejectInvitation = async () => {
    if (!invitationModal.notification) return;

    const invitationId = invitationModal.notification.invitation?.id || invitationModal.notification.metadata?.invitationId;
    if (!invitationId) {
      message.error('Không tìm thấy thông tin lời mời');
      console.error('Notification:', invitationModal.notification);
      return;
    }

    try {
      await companyService.rejectInvitation(invitationId);

      message.success('Đã từ chối lời mời');
      handleDelete(invitationModal.notification.id);
      setInvitationModal({ open: false, notification: null });
    } catch (error: any) {
      console.error('Failed to reject invitation:', error);
      message.error(error?.message || 'Không thể từ chối lời mời');
    }
  };

  const handleNotificationClick = async (notif: NotificationType) => {
    if (!notif.isRead) {
      await handleMarkAsRead(notif.id);
    }

    if (notif.type === NotificationTypeEnum.COMPANY_INVITATION) {
      setInvitationModal({ open: true, notification: notif });
      return;
    }

    const actionUrl = getActionUrl(notif, user?.role || UserRole.CANDIDATE);
    if (actionUrl) {
      navigate(actionUrl);
    }
  };

  const tabItems = [
    {
      key: 'all',
      label: `Tất cả (${notifications.length})`,
    },
    {
      key: 'unread',
      label: `Chưa đọc (${unreadCount})`,
    },
    {
      key: 'read',
      label: `Đã đọc (${notifications.length - unreadCount})`,
    },
  ];

  return (
    <div className="min-h-screen py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-bold text-gray-900">Thông báo</h1>
              {unreadCount > 0 && (
                <Badge count={`${unreadCount} mới`} style={{ backgroundColor: '#3B82F6' }} />
              )}
            </div>
            {unreadCount > 0 && (
              <Button
                icon={<CheckOutlined />}
                onClick={handleMarkAllAsRead}
              >
                Đánh dấu đã đọc tất cả
              </Button>
            )}
          </div>
          <p className="text-gray-600">
            Theo dõi các hoạt động và cập nhật mới nhất
          </p>
        </div>

        {/* Tabs */}
        <Tabs
          activeKey={activeTab}
          onChange={(key) => setActiveTab(key as any)}
          items={tabItems}
          className="mb-6"
        />

        {/* Notifications List */}
        {isLoading ? (
          <Card>
            <div className="text-center p-12">
              <Spin indicator={<LoadingOutlined style={{ fontSize: 48 }} spin />} />
              <p className="text-gray-600 mt-4">Đang tải thông báo...</p>
            </div>
          </Card>
        ) : filteredNotifications.length === 0 ? (
          <Card>
            <div className="text-center p-12">
              <BellOutlined style={{ fontSize: 64, color: '#D1D5DB' }} />
              <p className="text-gray-600 mt-4 mb-2 text-lg font-medium">Không có thông báo nào</p>
              <p className="text-gray-500">
                {activeTab === 'unread'
                  ? 'Bạn đã đọc hết tất cả thông báo'
                  : 'Các thông báo của bạn sẽ hiển thị ở đây'}
              </p>
            </div>
          </Card>
        ) : (
          <div className="space-y-3">
            {filteredNotifications.map((notif) => {
              const actionUrl = getActionUrl(notif, user?.role || UserRole.CANDIDATE);
              const hasAction = actionUrl || notif.type === NotificationTypeEnum.COMPANY_INVITATION;

              return (
                <Card
                  key={notif.id}
                  hoverable={!!hasAction}
                  className={!notif.isRead ? 'border-l-4 border-l-blue-500 bg-blue-50' : ''}
                  styles={{ body: { padding: 0 } }}
                >
                  <div className="flex items-start gap-4 p-4">
                    {/* Icon */}
                    <div
                      className="h-10 w-10 rounded-full flex items-center justify-center flex-shrink-0"
                      style={{ backgroundColor: `${getNotificationIconColor(notif.type)}20` }}
                    >
                      <span style={{ color: getNotificationIconColor(notif.type), fontSize: 20 }}>
                        {getNotificationIcon(notif.type)}
                      </span>
                    </div>

                    {/* Content */}
                    <div
                      className="flex-1 min-w-0"
                      onClick={() => hasAction && handleNotificationClick(notif)}
                      style={{ cursor: hasAction ? 'pointer' : 'default' }}
                    >
                      <div className="flex items-start justify-between gap-2 mb-1">
                        <h3 className={`text-base font-semibold ${!notif.isRead ? 'text-gray-900' : 'text-gray-700'}`}>
                          {notif.title}
                        </h3>
                        {hasAction && (
                          <RightOutlined style={{ color: '#9CA3AF', fontSize: 16 }} />
                        )}
                      </div>
                      <p className="text-gray-600 mb-2 text-sm">{notif.message}</p>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-gray-500 text-xs">{getTimeAgo(notif.createdAt)}</span>
                        {!notif.isRead && (
                          <Badge count="Mới" style={{ backgroundColor: '#3B82F6' }} />
                        )}
                        {notif.expiresAt && new Date(notif.expiresAt) > new Date() && (
                          <Badge
                            count={`Hết hạn sau ${Math.ceil((new Date(notif.expiresAt).getTime() - Date.now()) / (1000 * 60 * 60 * 24))} ngày`}
                            style={{ backgroundColor: '#F59E0B', color: '#78350F' }}
                          />
                        )}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-1 flex-shrink-0">
                      {notif.isRead ? (
                        <Button
                          type="text"
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

        {/* Company Invitation Modal */}
        <Modal
          title="Lời mời tham gia công ty"
          open={invitationModal.open}
          onCancel={() => setInvitationModal({ open: false, notification: null })}
          footer={[
            <Button
              key="reject"
              danger
              onClick={handleRejectInvitation}
            >
              Từ chối
            </Button>,
            <Button
              key="accept"
              type="primary"
              onClick={handleAcceptInvitation}
            >
              Chấp nhận
            </Button>,
          ]}
        >
          <p className="text-gray-600 mb-4">
            Bạn đã được mời tham gia công ty. Vui lòng xác nhận hoặc từ chối lời mời.
          </p>

          {invitationModal.notification && (
            <div className="space-y-4">
              <div className="p-4 bg-purple-50 border border-purple-200 rounded-lg">
                <div className="flex items-start gap-3">
                  <div className="h-12 w-12 rounded-lg bg-purple-100 flex items-center justify-center flex-shrink-0">
                    <BankOutlined style={{ fontSize: 24, color: '#8B5CF6' }} />
                  </div>
                  <div className="flex-1">
                    <p className="text-gray-900 font-semibold mb-1">
                      {invitationModal.notification.invitation?.company?.name || invitationModal.notification.metadata?.companyName || 'Công ty'}
                    </p>
                    <p className="text-sm text-gray-600">
                      Vai trò: <span className="font-medium text-gray-900">
                        {getCompanyRoleLabel(
                          invitationModal.notification.invitation?.role ||
                          invitationModal.notification.metadata?.role ||
                          extractRoleFromMessage(invitationModal.notification.message || '')
                        )}
                      </span>
                    </p>
                    {(invitationModal.notification.invitation?.inviter ||
                      invitationModal.notification.metadata?.inviterName ||
                      invitationModal.notification.metadata?.inviterEmail) && (
                        <p className="text-sm text-gray-600 mt-1">
                          Người mời: <span className="font-medium text-gray-900">
                            {invitationModal.notification.invitation?.inviter?.fullName ||
                              invitationModal.notification.invitation?.inviter?.email ||
                              invitationModal.notification.metadata?.inviterName ||
                              invitationModal.notification.metadata?.inviterEmail}
                          </span>
                        </p>
                      )}
                  </div>
                </div>
              </div>

              <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg flex gap-2">
                <ExclamationCircleOutlined style={{ color: '#3B82F6', fontSize: 16, marginTop: 2 }} />
                <p className="text-gray-700 text-sm">
                  Khi chấp nhận lời mời, bạn sẽ trở thành thành viên của công ty và có thể tham gia quản lý tuyển dụng.
                </p>
              </div>
            </div>
          )}
        </Modal>
      </div>
    </div>
  );
}
