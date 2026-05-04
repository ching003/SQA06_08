import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router';
import { Button, Dropdown, Avatar, Badge, Modal, Spin, Typography, Drawer } from 'antd';
import type { MenuProps } from 'antd';
import { useAuth } from '../contexts/AuthContext';
import { useNotifications } from '../contexts/NotificationContext';
import { UserRole, CompanyRole, Notification as NotificationType, NotificationType as NotificationTypeEnum } from '../lib/types';
import {
  BellOutlined, UserOutlined, LogoutOutlined, SettingOutlined, FolderOutlined, FileTextOutlined, ShopOutlined, SafetyOutlined,
  CheckCircleOutlined, CloseCircleOutlined, MailOutlined, UserAddOutlined, UserDeleteOutlined, CheckOutlined, DeleteOutlined,
  BellFilled, ExclamationCircleOutlined, HomeOutlined, ThunderboltOutlined, MenuOutlined, CloseOutlined
} from '@ant-design/icons';
import { toast } from 'sonner';
import { companyService } from '../api/services';
import { getCompanyRoleLabel } from '../lib/constants';

const { Text } = Typography;

// Helper functions for notifications
const getNotificationIcon = (type: NotificationTypeEnum) => {
  switch (type) {
    case NotificationTypeEnum.APPLICATION_RECEIVED:
    case NotificationTypeEnum.APPLICATION_STATUS_CHANGED:
      return <FolderOutlined />;
    case NotificationTypeEnum.COMPANY_REGISTRATION:
    case NotificationTypeEnum.COMPANY_UPDATE_PENDING:
      return <ShopOutlined />;
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
      return <BellOutlined />;
    default:
      return <BellOutlined />;
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
  const seconds = Math.floor((Date.now() - new Date(date).getTime()) / 1000);

  if (seconds < 60) return 'Vừa xong';
  if (seconds < 3600) return `${Math.floor(seconds / 60)} phút trước`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)} giờ trước`;
  if (seconds < 604800) return `${Math.floor(seconds / 86400)} ngày trước`;
  return `${Math.floor(seconds / 604800)} tuần trước`;
};

const getActionUrl = (notification: NotificationType, userRole: UserRole): string | null => {
  const { type } = notification;

  // Extract IDs from notification relations
  const jobId = (notification as any).job?.id || (notification as any).application?.jobId;
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

    default:
      return null;
  }
};

// Helper to extract role from notification message
const extractRoleFromMessage = (message: string): string | null => {
  // Try Vietnamese format: "với vai trò RECRUITER"
  const roleMatchVi = message.match(/với vai trò (\w+)/);
  if (roleMatchVi) {
    return roleMatchVi[1];
  }
  // Try English format: "as RECRUITER"
  const roleMatchEn = message.match(/as (RECRUITER|MANAGER|OWNER|VIEWER)/i);
  if (roleMatchEn) {
    return roleMatchEn[1].toUpperCase();
  }
  return null;
};

// Helper to extract company name from notification message
const extractCompanyNameFromMessage = (message: string): string | null => {
  // Try English format: 'join "CompanyName" as'
  const companyMatch = message.match(/join "([^"]+)"/);
  if (companyMatch) {
    return companyMatch[1];
  }
  // Try Vietnamese format: 'công ty "CompanyName"'
  const companyMatchVi = message.match(/công ty "([^"]+)"/);
  if (companyMatchVi) {
    return companyMatchVi[1];
  }
  return null;
};

export function Navbar() {
  const navigate = useNavigate();
  const [invitationModal, setInvitationModal] = useState<{
    open: boolean;
    notification: NotificationType | null;
    invitationId: string | null;
  }>({ open: false, notification: null, invitationId: null });
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Safely get auth context - handle case where it might not be available yet
  let user, logout;
  let notifications, unreadCount, isLoading, markAsRead, markAllAsRead, deleteNotification, refreshNotifications;

  try {
    const auth = useAuth();
    user = auth.user;
    logout = auth.logout;
  } catch (error) {
    // AuthProvider not available yet
    user = null;
    logout = () => { };
  }

  try {
    const notificationContext = useNotifications();
    notifications = notificationContext.notifications;
    unreadCount = notificationContext.unreadCount;
    isLoading = notificationContext.isLoading;
    markAsRead = notificationContext.markAsRead;
    markAllAsRead = notificationContext.markAllAsRead;
    deleteNotification = notificationContext.deleteNotification;
    refreshNotifications = notificationContext.refreshNotifications;
  } catch (error) {
    // NotificationProvider not available yet
    notifications = [];
    unreadCount = 0;
    isLoading = false;
    markAsRead = async () => { };
    markAllAsRead = async () => { };
    deleteNotification = async () => { };
    refreshNotifications = async () => { };
  }

  const handleLogout = () => {
    logout();
    toast.success('Đã đăng xuất thành công');
    navigate('/');
  };

  const getDashboardLink = () => {
    if (!user) return '/';
    switch (user.role) {
      case UserRole.CANDIDATE:
        return '/candidate/dashboard';
      case UserRole.RECRUITER:
        return '/recruiter/dashboard';
      case UserRole.ADMIN:
        return '/admin/dashboard';
      default:
        return '/';
    }
  };

  const getLogoLink = () => {
    if (!user) return '/';
    switch (user.role) {
      case UserRole.CANDIDATE:
        return '/'; // Candidate về trang chủ
      case UserRole.RECRUITER:
        return '/recruiter/dashboard'; // HR về dashboard recruiter
      case UserRole.ADMIN:
        return '/admin/dashboard'; // Admin về dashboard admin
      default:
        return '/';
    }
  };

  return (
    <nav className="sticky top-0 z-100 glassmorphism rounded-none! border-b border-white/30 w-full">
      <div className="w-full px-3 sm:px-4 lg:px-6 relative">
        <div className="flex justify-between items-center h-14 sm:h-16 max-w-6xl mx-auto">
          <Link to={getLogoLink()} className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
            <img src="/logo.jpg" alt="JobsConnect" className="h-8 w-auto sm:h-10 object-contain" />
            <span className="text-blue-500 font-bold text-base sm:text-lg lg:text-xl tracking-tight">JobsConnect</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-3 lg:gap-4 flex-1 justify-center">
            {user ? (
              <>
                {/* Candidate: Xem việc làm và công ty */}
                {user.role === UserRole.CANDIDATE && (
                  <>
                    <Link to="/jobs" className="text-sm lg:text-base text-gray-700 hover:text-blue-600 whitespace-nowrap ml-8">
                      Việc làm
                    </Link>
                    <Link to="/companies" className="text-sm lg:text-base text-gray-700 hover:text-blue-600 whitespace-nowrap">
                      Công ty
                    </Link>
                    <Link to="/candidate/saved-jobs" className="text-sm lg:text-base text-gray-700 hover:text-blue-600 whitespace-nowrap">
                      Việc đã lưu
                    </Link>
                    <Link to="/candidate/recommended" className="text-sm lg:text-base text-gray-700 hover:text-blue-600 whitespace-nowrap">
                      Việc làm gợi ý
                    </Link>
                    <Link to="/candidate/cvs" className="text-sm lg:text-base text-gray-700 hover:text-blue-600 whitespace-nowrap">
                      CV của tôi
                    </Link>
                    <Link to="/candidate/applications" className="text-sm lg:text-base text-gray-700 hover:text-blue-600 whitespace-nowrap">
                      Đơn ứng tuyển
                    </Link>
                  </>
                )}

                {/* Recruiter: Tìm ứng viên */}
                {user.role === UserRole.RECRUITER && (
                  <>
                    <Link to="/recruiter/candidates" className="text-sm lg:text-base text-gray-700 hover:text-blue-600 whitespace-nowrap ml-8">
                      Tìm ứng viên
                    </Link>
                    <Link to="/recruiter/jobs" className="text-sm lg:text-base text-gray-700 hover:text-blue-600 whitespace-nowrap">
                      Quản lý tin
                    </Link>
                  </>
                )}

                {user.role === UserRole.ADMIN && (
                  <>
                    <Link to="/admin/cv-templates" className="text-sm lg:text-base text-gray-700 hover:text-blue-600 whitespace-nowrap ml-8">
                      Mẫu CV
                    </Link>
                    <Link to="/admin/companies" className="text-sm lg:text-base text-gray-700 hover:text-blue-600 whitespace-nowrap">
                      Duyệt công ty
                    </Link>
                  </>
                )}
              </>
            ) : (
              <>
                <Link to="/jobs" className="text-sm lg:text-base text-gray-700 hover:text-blue-600 whitespace-nowrap ml-8">
                  Việc làm
                </Link>
                {/* Spacer to push buttons to the right */}
                <div className="flex-1"></div>
                <Button
                  onClick={() => navigate('/login')}
                  className="hidden sm:flex h-8 px-4 text-sm font-medium hover:scale-105 transition-transform"
                >
                  Đăng nhập
                </Button>
                <Button
                  type="primary"
                  onClick={() => navigate('/register')}
                  className="hidden sm:flex h-8 px-4 text-sm font-semibold shadow-md hover:shadow-lg hover:scale-105 transition-all mr-6"
                >
                  Đăng ký
                </Button>
              </>
            )}
          </div>

          {/* Right Side Actions */}
          <div className="flex items-center gap-1 sm:gap-2">
            {user && (
              <>
                {/* Notification Bell - Always visible */}
                <Dropdown
                  menu={{
                    items: [],
                  }}
                  trigger={['click']}
                  onOpenChange={async (open) => {
                    // When dropdown opens, mark all notifications as read
                    if (open && markAllAsRead) {
                      try {
                        await markAllAsRead();
                        // Refresh notifications to ensure unreadCount is updated
                        if (refreshNotifications) {
                          await refreshNotifications();
                        }
                        toast.success('Đã đánh dấu tất cả thông báo là đã đọc');
                      } catch (error) {
                        console.error('Failed to mark all as read:', error);
                        toast.error('Không thể đánh dấu tất cả là đã đọc');
                      }
                    }
                  }}
                  popupRender={(menu) => (
                    <div className="bg-white rounded-lg shadow-lg w-[280px] sm:w-[300px]">
                      <div className="p-4 border-b">
                        <div className="flex items-center justify-between">
                          <h3 className="font-semibold text-gray-900">Thông báo</h3>
                          {unreadCount > 0 && (
                            <Button
                              type="text"
                              size="small"
                              onClick={async (e) => {
                                e.stopPropagation();
                                try {
                                  await markAllAsRead();
                                  toast.success('Đã đánh dấu tất cả là đã đọc');
                                } catch (error) {
                                  toast.error('Không thể đánh dấu tất cả là đã đọc');
                                }
                              }}
                              className="h-7 gap-1"
                              icon={<CheckOutlined />}
                            >
                              Đánh dấu tất cả đã đọc
                            </Button>
                          )}
                        </div>
                      </div>

                      <div className="max-h-[400px] overflow-y-auto">
                        {isLoading ? (
                          <div className="p-8 text-center">
                            <Spin size="large" className="mb-2" />
                            <p className="text-gray-500 text-base">Đang tải...</p>
                          </div>
                        ) : notifications.length === 0 ? (
                          <div className="p-8 text-center">
                            <BellFilled className="text-5xl text-gray-300 mb-2" />
                            <p className="text-gray-500 text-base">Không có thông báo nào</p>
                          </div>
                        ) : (
                          <div className="divide-y">
                            {notifications.slice(0, 10).map((notif) => {
                              const actionUrl = getActionUrl(notif, user?.role || UserRole.CANDIDATE);
                              const hasAction = actionUrl || notif.type === NotificationTypeEnum.COMPANY_INVITATION;

                              return (
                                <div
                                  key={notif.id}
                                  className={`p-3 hover:bg-gray-50 transition-colors cursor-pointer ${!notif.isRead ? 'bg-blue-500/50' : ''
                                    }`}
                                  onClick={async () => {
                                    if (!notif.isRead) {
                                      try {
                                        await markAsRead(notif.id);
                                      } catch (error) {
                                        // Ignore error
                                      }
                                    }

                                    if (notif.type === NotificationTypeEnum.COMPANY_INVITATION) {
                                      // Try to find invitation ID from various sources
                                      const invId = notif.invitation?.id ||
                                        notif.metadata?.invitationId ||
                                        (notif as any).data?.invitationId ||
                                        (notif as any).invitationId;

                                      setInvitationModal({ open: true, notification: notif, invitationId: invId || null });
                                      return;
                                    }

                                    if (actionUrl) {
                                      navigate(actionUrl);
                                    }
                                  }}
                                >
                                  <div className="flex items-start gap-3">
                                    {/* Icon */}
                                    <div className={`h-8 w-8 rounded-full flex items-center justify-center flex-shrink-0 ${getNotificationIconColor(notif.type)}`}>
                                      {getNotificationIcon(notif.type)}
                                    </div>

                                    {/* Content */}
                                    <div className="flex-1 min-w-0">
                                      <div className="flex items-start justify-between gap-2 mb-1">
                                        <h4 className={`text-base font-medium ${!notif.isRead ? 'text-gray-900' : 'text-gray-700'}`}>
                                          {notif.title}
                                        </h4>
                                        {!notif.isRead && (
                                          <div className="h-2 w-2 rounded-full bg-blue-600 flex-shrink-0 mt-1" />
                                        )}
                                      </div>
                                      <p className="text-sm text-gray-600 line-clamp-2 mb-1">
                                        {notif.message}
                                      </p>
                                      <div className="flex items-center gap-2">
                                        <span className="text-sm text-gray-400">
                                          {getTimeAgo(notif.createdAt)}
                                        </span>
                                      </div>
                                    </div>

                                    {/* Actions */}
                                    <div className="flex items-center gap-1 flex-shrink-0">
                                      <Button
                                        type="text"
                                        size="small"
                                        className="h-6 w-6"
                                        onClick={async (e) => {
                                          e.stopPropagation();
                                          try {
                                            await deleteNotification(notif.id);
                                            toast.success('Đã xóa thông báo');
                                          } catch (error) {
                                            toast.error('Không thể xóa thông báo');
                                          }
                                        }}
                                        icon={<DeleteOutlined />}
                                      />
                                    </div>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>

                      {notifications.length > 10 && (
                        <div className="p-2 border-t text-center">
                          <Button
                            type="text"
                            onClick={() => navigate('/notifications')}
                            className="w-full"
                          >
                            Xem tất cả thông báo
                          </Button>
                        </div>
                      )}
                    </div>
                  )}
                >
                  <Button
                    type="text"
                    className="relative"
                    icon={<BellOutlined className="text-lg" />}
                  >
                    {unreadCount > 0 && (
                      <Badge
                        count={unreadCount > 99 ? 99 : unreadCount}
                        overflowCount={99}
                        className="absolute -top-1 -right-1"
                      />
                    )}
                  </Button>
                </Dropdown>

                {/* User Avatar Dropdown - Always visible */}
                <Dropdown
                  menu={{
                    items: [
                      {
                        key: 'user-info',
                        type: 'group',
                        label: (
                          <div className="px-2 py-2">
                            <p className="text-gray-900 text-base">{user.fullName}</p>
                            <p className="text-gray-500 text-sm">{user.email}</p>
                          </div>
                        ),
                      },
                      {
                        key: 'dashboard',
                        label: 'Dashboard',
                        icon: <FolderOutlined />,
                        onClick: () => navigate(getDashboardLink()),
                      },
                      {
                        key: 'profile',
                        label: 'Hồ sơ cá nhân',
                        icon: <UserOutlined />,
                        onClick: () => navigate('/profile'),
                      },
                      ...(user.role === UserRole.CANDIDATE ? [
                        {
                          key: 'cvs',
                          label: 'CV của tôi',
                          icon: <FileTextOutlined />,
                          onClick: () => navigate('/candidate/cvs'),
                        },
                        {
                          key: 'applications',
                          label: 'Đơn ứng tuyển',
                          icon: <FolderOutlined />,
                          onClick: () => navigate('/candidate/applications'),
                        },
                        {
                          key: 'recommended',
                          label: 'Việc làm gợi ý',
                          icon: <ThunderboltOutlined />,
                          onClick: () => navigate('/candidate/recommended'),
                        },
                        { type: 'divider' },
                        {
                          key: 'register-recruiter',
                          label: 'Đăng ký nhà tuyển dụng',
                          icon: <ShopOutlined />,
                          onClick: () => navigate('/recruiter/company/register'),
                          className: 'text-purple-600',
                        },
                      ] : []),
                      ...(user.role === UserRole.RECRUITER &&
                        ((user.companyMember?.companyRole || (user.companyMember as any)?.role) === CompanyRole.OWNER ||
                          (user.companyMember?.companyRole || (user.companyMember as any)?.role) === CompanyRole.MANAGER) ? [
                        {
                          key: 'company',
                          label: 'Công ty',
                          icon: <ShopOutlined />,
                          onClick: () => navigate('/recruiter/company'),
                        },
                      ] : []),
                      ...(user.role === UserRole.ADMIN ? [
                        {
                          key: 'cv-templates',
                          label: 'Quản lý mẫu CV',
                          icon: <SafetyOutlined />,
                          onClick: () => navigate('/admin/cv-templates'),
                        },
                      ] : []),

                      { type: 'divider' },
                      {
                        key: 'logout',
                        label: 'Đăng xuất',
                        icon: <LogoutOutlined />,
                        onClick: handleLogout,
                        danger: true,
                      },
                    ] as MenuProps['items'],
                  }}
                  trigger={['click']}
                >
                  <Button type="text" className="flex items-center gap-1 sm:gap-2">
                    <Avatar
                      size={32}
                      src={user.avatarUrl || undefined}
                      icon={<UserOutlined />}
                    >
                      {!user.avatarUrl && (user.fullName?.charAt(0).toUpperCase() || 'U')}
                    </Avatar>
                    <span className="hidden xl:inline text-base">{user.fullName}</span>
                  </Button>
                </Dropdown>
              </>
            )}

            {/* Mobile Menu Button - Only show on mobile */}
            <Button
              type="text"
              className="md:!hidden"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              icon={mobileMenuOpen ? <CloseOutlined /> : <MenuOutlined />}
              size="small"
            />

          </div>
        </div>

        {/* Mobile Menu Drawer */}
        <Drawer
          title="Menu"
          placement="left"
          onClose={() => setMobileMenuOpen(false)}
          open={mobileMenuOpen}
          className="md:hidden"
          size={280}
        >
          <div className="space-y-3">
            {user ? (
              <>
                {/* Candidate Mobile Links */}
                {user.role === UserRole.CANDIDATE && (
                  <>
                    <Link
                      to="/jobs"
                      className="block text-gray-700 hover:text-blue-600 py-2 px-3 rounded-lg hover:bg-gray-50 transition-colors"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      Việc làm
                    </Link>
                    <Link
                      to="/companies"
                      className="block text-gray-700 hover:text-blue-600 py-2 px-3 rounded-lg hover:bg-gray-50 transition-colors"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      Công ty
                    </Link>
                    <Link
                      to="/candidate/cvs"
                      className="block text-gray-700 hover:text-blue-600 py-2 px-3 rounded-lg hover:bg-gray-50 transition-colors"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      CV của tôi
                    </Link>
                    <Link
                      to="/candidate/applications"
                      className="block text-gray-700 hover:text-blue-600 py-2 px-3 rounded-lg hover:bg-gray-50 transition-colors"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      Đơn ứng tuyển
                    </Link>
                    <Link
                      to="/candidate/saved-jobs"
                      className="block text-gray-700 hover:text-blue-600 py-2 px-3 rounded-lg hover:bg-gray-50 transition-colors"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      Việc đã lưu
                    </Link>
                    <Link
                      to="/candidate/recommended"
                      className="block text-gray-700 hover:text-blue-600 py-2 px-3 rounded-lg hover:bg-gray-50 transition-colors"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      Việc làm gợi ý
                    </Link>
                    <Link
                      to="/recruiter/company/register"
                      className="block text-gray-700 hover:text-blue-600 py-2 px-3 rounded-lg hover:bg-gray-50 transition-colors"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      Đăng ký nhà tuyển dụng
                    </Link>
                  </>
                )}

                {/* Recruiter Mobile Links */}
                {user.role === UserRole.RECRUITER && (
                  <>
                    <Link
                      to="/recruiter/candidates"
                      className="block text-gray-700 hover:text-blue-600 py-2 px-3 rounded-lg hover:bg-gray-50 transition-colors"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      Tìm ứng viên
                    </Link>
                    <Link
                      to="/recruiter/jobs"
                      className="block text-gray-700 hover:text-blue-600 py-2 px-3 rounded-lg hover:bg-gray-50 transition-colors"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      Quản lý tin tuyển dụng
                    </Link>
                  </>
                )}

                {/* Admin Mobile Links */}
                {user.role === UserRole.ADMIN && (
                  <>
                    <Link
                      to="/admin/cv-templates"
                      className="block text-gray-700 hover:text-blue-600 py-2 px-3 rounded-lg hover:bg-gray-50 transition-colors"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      Quản lý mẫu CV
                    </Link>
                    <Link
                      to="/admin/companies"
                      className="block text-gray-700 hover:text-blue-600 py-2 px-3 rounded-lg hover:bg-gray-50 transition-colors"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      Duyệt công ty
                    </Link>
                  </>
                )}
              </>
            ) : (
              <>
                <Link
                  to="/jobs"
                  className="block text-gray-700 hover:text-blue-600 py-2 px-3 rounded-lg hover:bg-gray-50 transition-colors"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Việc làm
                </Link>
                <Button
                  className="w-full mt-2"
                  onClick={() => {
                    navigate('/login');
                    setMobileMenuOpen(false);
                  }}
                >
                  Đăng nhập
                </Button>
                <Button
                  type="primary"
                  className="w-full mt-2"
                  onClick={() => {
                    navigate('/register');
                    setMobileMenuOpen(false);
                  }}
                >
                  Đăng ký
                </Button>
              </>
            )}
          </div>
        </Drawer>
      </div>

      {/* Company Invitation Modal */}
      <Modal
        open={invitationModal.open}
        onCancel={() => setInvitationModal({ open: false, notification: null, invitationId: null })}
        title="Lời mời tham gia công ty"
        footer={null}
      >
        <Text type="secondary" className="block mb-4">
          Bạn đã được mời tham gia công ty. Vui lòng xác nhận hoặc từ chối lời mời.
        </Text>

        {invitationModal.notification && (
          <div className="space-y-4 mt-4">
            <div className="p-4 bg-purple-50 border border-purple-200 rounded-lg">
              <div className="flex items-start gap-3">
                <div className="h-12 w-12 rounded-lg bg-purple-100 flex items-center justify-center flex-shrink-0">
                  <HomeOutlined className="text-2xl text-purple-600" />
                </div>
                <div className="flex-1">
                  <p className="text-gray-900 font-semibold mb-1">
                    {invitationModal.notification.invitation?.company?.name ||
                      invitationModal.notification.metadata?.companyName ||
                      extractCompanyNameFromMessage(invitationModal.notification.message || '') ||
                      'Công ty'}
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

            {invitationModal.invitationId ? (
              <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg flex gap-2">
                <ExclamationCircleOutlined className="text-blue-600 flex-shrink-0 mt-0.5" />
                <p className="text-gray-700">
                  Khi chấp nhận lời mời, bạn sẽ trở thành thành viên của công ty và có thể tham gia quản lý tuyển dụng.
                </p>
              </div>
            ) : (
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg flex gap-2">
                <ExclamationCircleOutlined className="text-amber-600 flex-shrink-0 mt-0.5" />
                <p className="text-gray-700">
                  Không tìm thấy thông tin lời mời. Vui lòng liên hệ với người đã gửi lời mời để yêu cầu gửi lại.
                </p>
              </div>
            )}

            <div className="flex justify-end gap-3 pt-4 border-t">
              {invitationModal.invitationId ? (
                <>
                  <Button
                    danger
                    onClick={async () => {
                      const invitationId = invitationModal.invitationId;
                      if (!invitationId) return;

                      try {
                        await companyService.rejectInvitation(invitationId);
                        toast.success('Đã từ chối lời mời');
                        setInvitationModal({ open: false, notification: null, invitationId: null });
                        // Refresh notifications
                        window.location.reload();
                      } catch (error: any) {
                        console.error('Failed to reject invitation:', error);
                        toast.error(error?.message || 'Không thể từ chối lời mời');
                      }
                    }}
                  >
                    Từ chối
                  </Button>
                  <Button
                    type="primary"
                    onClick={async () => {
                      const invitationId = invitationModal.invitationId;
                      if (!invitationId) return;

                      try {
                        await companyService.acceptInvitation(invitationId);
                        toast.success('Đã chấp nhận lời mời tham gia công ty');
                        setInvitationModal({ open: false, notification: null, invitationId: null });
                        // Refresh user profile to get updated companyMember
                        window.location.reload();
                        // Navigate to team members page
                        navigate('/recruiter/team-members');
                      } catch (error: any) {
                        console.error('Failed to accept invitation:', error);
                        toast.error(error?.message || 'Không thể chấp nhận lời mời');
                      }
                    }}
                  >
                    Chấp nhận
                  </Button>
                </>
              ) : (
                <Button
                  onClick={() => setInvitationModal({ open: false, notification: null, invitationId: null })}
                >
                  Đóng
                </Button>
              )}
            </div>
          </div>
        )}
      </Modal>
    </nav>
  );
}