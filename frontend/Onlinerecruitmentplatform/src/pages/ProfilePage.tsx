import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { useAuth } from '../contexts/AuthContext';
import { Card, Button, Input, Avatar, Tabs, Tag, Select, Spin, Typography } from 'antd';
import {
  UserOutlined, MailOutlined, PhoneOutlined, CalendarOutlined, UploadOutlined,
  SaveOutlined, RightOutlined, SafetyOutlined, LockOutlined, EyeOutlined, EyeInvisibleOutlined
} from '@ant-design/icons';
import { toast } from 'sonner';
import { Gender } from '../lib/types';

const { Text } = Typography;
const { Password } = Input;
const { Option } = Select;

export function ProfilePage() {
  const { user, updateUser, isLoading: authLoading } = useAuth();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState('personal');
  const [isEditing, setIsEditing] = useState(false);
  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Personal Info State - Update when user changes
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phoneNumber: '',
    dateOfBirth: '',
    gender: Gender.MALE,
  });

  // Update formData when user is loaded
  useEffect(() => {
    if (user) {
      setFormData({
        fullName: user.fullName || '',
        email: user.email || '',
        phoneNumber: user.phoneNumber || '',
        dateOfBirth: user.dateOfBirth ? new Date(user.dateOfBirth).toISOString().split('T')[0] : '',
        gender: user.gender || Gender.MALE,
      });
    }
  }, [user]);

  // Password State
  const [passwordData, setPasswordData] = useState({
    oldPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const [isSaving, setIsSaving] = useState(false);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  const handleSaveProfile = async () => {
    if (!user) return;

    setIsSaving(true);
    try {
      await updateUser({
        fullName: formData.fullName,
        phoneNumber: formData.phoneNumber,
        dateOfBirth: formData.dateOfBirth ? new Date(formData.dateOfBirth) : null,
        gender: formData.gender as Gender,
      });

      setIsEditing(false);
      toast.success('Cập nhật thông tin thành công!');
    } catch (error) {
      toast.error('Cập nhật thông tin thất bại. Vui lòng thử lại.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleChangePassword = async () => {
    if (!user) return;

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error('Mật khẩu xác nhận không khớp!');
      return;
    }

    if (passwordData.newPassword.length < 8) {
      toast.error('Mật khẩu phải có ít nhất 8 ký tự!');
      return;
    }

    if (!passwordData.oldPassword) {
      toast.error('Vui lòng nhập mật khẩu hiện tại!');
      return;
    }

    setIsChangingPassword(true);
    try {
      const { userService } = await import('../api/services');
      await userService.changePassword(
        user.id,
        passwordData.oldPassword,
        passwordData.newPassword
      );

      toast.success('Đổi mật khẩu thành công!');
      setPasswordData({
        oldPassword: '',
        newPassword: '',
        confirmPassword: '',
      });
    } catch (error: any) {
      toast.error(error.message || 'Đổi mật khẩu thất bại. Vui lòng thử lại.');
    } finally {
      setIsChangingPassword(false);
    }
  };

  const handleAvatarUpload = async () => {
    if (!user) return;

    // Create file input element
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/jpeg,image/png,image/webp';
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Kích thước file không được vượt quá 5MB');
        return;
      }

      // Validate file type
      const validTypes = ['image/jpeg', 'image/png', 'image/webp'];
      if (!validTypes.includes(file.type)) {
        toast.error('Chỉ chấp nhận file ảnh (JPEG, PNG, WebP)');
        return;
      }

      setIsUploadingAvatar(true);
      try {
        const { userService } = await import('../api/services');
        const result = await userService.uploadAvatar(user.id, file);

        // Update user in context
        await updateUser({ avatarUrl: result.avatarUrl });

        toast.success('Upload avatar thành công!');
      } catch (error) {
        toast.error('Upload avatar thất bại. Vui lòng thử lại.');
        console.error('Failed to upload avatar:', error);
      } finally {
        setIsUploadingAvatar(false);
      }
    };
    input.click();
  };

  // Show loading while auth is initializing
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Spin size="large" className="mb-4" />
          <p className="text-gray-600">Đang tải...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 mb-4">Vui lòng đăng nhập để xem hồ sơ</p>
          <Button onClick={() => navigate('/login')}>Đăng nhập</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-4 sm:py-6 lg:py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm sm:text-base text-gray-600 mb-4 sm:mb-6">
          <button
            onClick={() => navigate('/candidate/dashboard')}
            className="hover:text-blue-600"
          >
            Dashboard
          </button>
          <RightOutlined className="text-sm" />
          <span className="text-gray-900">Hồ sơ cá nhân</span>
        </div>

        {/* Header */}
        <div className="mb-4 sm:mb-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Hồ sơ cá nhân</h1>
          <p className="text-base sm:text-lg text-gray-600">
            Quản lý thông tin cá nhân và cài đặt tài khoản của bạn
          </p>
        </div>

        {/* Profile Card */}
        <Card className="glassmorphism mb-4 sm:mb-6" styles={{ body: { padding: '16px 24px' } }}>
          <div className="flex flex-col md:flex-row items-center md:items-start gap-4 sm:gap-6">
            <div
              className="relative group cursor-pointer"
              onClick={isUploadingAvatar ? undefined : handleAvatarUpload}
            >
              <Avatar
                size={128}
                src={user.avatarUrl || undefined}
                icon={<UserOutlined />}
                className="text-2xl sm:text-3xl transition-opacity group-hover:opacity-75"
              >
                {!user.avatarUrl && (user.fullName?.charAt(0).toUpperCase() || 'U')}
              </Avatar>

              {/* Hover Overlay */}
              <div className="absolute inset-0 bg-black/50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                {isUploadingAvatar ? (
                  <Spin className="text-white" />
                ) : (
                  <div className="text-center text-white">
                    <UploadOutlined className="text-2xl mb-1" />
                    <div className="text-xs">Tải ảnh lên</div>
                  </div>
                )}
              </div>
            </div>

            <div className="flex-1 text-center md:text-left w-full md:w-auto">
              <div className="flex flex-col md:flex-row md:items-center gap-2 sm:gap-3 mb-2">
                <h2 className="text-xl sm:text-2xl text-gray-900">{user.fullName}</h2>
                <Tag className="w-fit mx-auto md:mx-0 text-sm sm:text-base">
                  {user.role === 'CANDIDATE' ? 'Ứng viên' : user.role === 'RECRUITER' ? 'Nhà tuyển dụng' : 'Admin'}
                </Tag>
              </div>

              <div className="space-y-1 sm:space-y-2 text-sm sm:text-base text-gray-600">
                <div className="flex items-center justify-center md:justify-start gap-2">
                  <MailOutlined className="flex-shrink-0" />
                  <span className="truncate">{user.email}</span>
                </div>

                {user.phoneNumber && (
                  <div className="flex items-center justify-center md:justify-start gap-2">
                    <PhoneOutlined className="flex-shrink-0" />
                    <span className="truncate">{user.phoneNumber}</span>
                  </div>
                )}

                <div className="flex items-center justify-center md:justify-start gap-2">
                  <CalendarOutlined className="flex-shrink-0" />
                  <span>
                    Tham gia: {new Date(user.createdAt).toLocaleDateString('vi-VN')}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </Card>

        {/* Tabs */}
        <Tabs activeKey={activeTab} onChange={setActiveTab} className="mb-4 sm:mb-6">

          <Tabs.TabPane
            tab={
              <span>
                <UserOutlined className="mr-1 sm:mr-2" />
                <span className="hidden sm:inline">Thông tin cá nhân</span>
                <span className="sm:hidden">Cá nhân</span>
              </span>
            }
            key="personal"
          >
            <Card
              className="glassmorphism"
              title={
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-0">
                  <div>
                    <div className="text-lg sm:text-xl">Thông tin cá nhân</div>
                    <Text type="secondary" className="text-sm sm:text-base">
                      Cập nhật thông tin cá nhân của bạn
                    </Text>
                  </div>
                  {!isEditing ? (
                    <Button onClick={() => setIsEditing(true)}>
                      Chỉnh sửa
                    </Button>
                  ) : (
                    <div className="flex gap-2">
                      <Button onClick={() => setIsEditing(false)}>
                        Hủy
                      </Button>
                      <Button type="primary" onClick={handleSaveProfile} disabled={isSaving} icon={<SaveOutlined />}>
                        {isSaving ? 'Đang lưu...' : 'Lưu'}
                      </Button>
                    </div>
                  )}
                </div>
              }
              styles={{ body: { padding: '16px 24px' } }}
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                <div>
                  <Text className="text-sm sm:text-base block mb-2 font-medium">Họ và tên *</Text>
                  <Input
                    value={formData.fullName}
                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                    disabled={!isEditing}
                    placeholder="Nguyễn Văn A"
                    size="large"
                  />
                </div>

                <div>
                  <Text className="text-sm sm:text-base block mb-2 font-medium">Email *</Text>
                  <Input
                    type="email"
                    value={formData.email}
                    disabled
                    placeholder="email@example.com"
                    size="large"
                  />
                  <Text type="secondary" className="text-sm sm:text-base block mt-1">
                    Email không thể thay đổi
                  </Text>
                </div>

                <div>
                  <Text className="text-sm sm:text-base block mb-2 font-medium">Số điện thoại</Text>
                  <Input
                    value={formData.phoneNumber}
                    onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                    disabled={!isEditing}
                    placeholder="0123456789"
                    size="large"
                  />
                </div>

                <div>
                  <Text className="text-sm sm:text-base block mb-2 font-medium">Ngày sinh</Text>
                  <Input
                    type="date"
                    value={formData.dateOfBirth}
                    onChange={(e) => {
                      const selectedDate = e.target.value;
                      if (!selectedDate) {
                        setFormData({ ...formData, dateOfBirth: selectedDate });
                        return;
                      }

                      const inputDate = new Date(selectedDate);
                      const today = new Date();
                      today.setHours(0, 0, 0, 0);

                      if (inputDate > today) {
                        toast.error('Ngày sinh không được lớn hơn ngày hiện tại');
                        // Optionally reset to previous value or just not update
                        // Here we don't update the state to prevent invalid input
                        return;
                      }

                      setFormData({ ...formData, dateOfBirth: selectedDate });
                    }}
                    disabled={!isEditing}
                    size="large"
                  />
                </div>

                <div>
                  <Text className="text-sm sm:text-base block mb-2 font-medium">Giới tính</Text>
                  <Select
                    value={formData.gender}
                    onChange={(value) => setFormData({ ...formData, gender: value })}
                    disabled={!isEditing}
                    className="w-full"
                    size="large"
                  >
                    <Option value={Gender.MALE}>Nam</Option>
                    <Option value={Gender.FEMALE}>Nữ</Option>
                    <Option value={Gender.OTHER}>Khác</Option>
                  </Select>
                </div>
              </div>
            </Card>
          </Tabs.TabPane>

          <Tabs.TabPane
            tab={
              <span>
                <SafetyOutlined className="mr-1 sm:mr-2" />
                Bảo mật
              </span>
            }
            key="security"
          >
            <Card
              className="glassmorphism"
              title={
                <div>
                  <div className="text-lg sm:text-xl">Bảo mật tài khoản</div>
                  <Text type="secondary" className="text-sm sm:text-base">
                    Quản lý mật khẩu và cài đặt bảo mật
                  </Text>
                </div>
              }
              styles={{ body: { padding: '16px 24px' } }}
            >
              <div className="space-y-3 sm:space-y-4">
                <h3 className="text-base sm:text-lg text-gray-900 font-semibold">Đổi mật khẩu</h3>

                <div>
                  <Text className="text-sm sm:text-base block mb-2 font-medium">Mật khẩu hiện tại *</Text>
                  <Password
                    value={passwordData.oldPassword}
                    onChange={(e) => setPasswordData({ ...passwordData, oldPassword: e.target.value })}
                    placeholder="••••••••"
                    size="large"
                    iconRender={(visible) => (visible ? <EyeOutlined /> : <EyeInvisibleOutlined />)}
                  />
                </div>

                <div>
                  <Text className="text-sm sm:text-base block mb-2 font-medium">Mật khẩu mới *</Text>
                  <Password
                    value={passwordData.newPassword}
                    onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                    placeholder="••••••••"
                    size="large"
                    iconRender={(visible) => (visible ? <EyeOutlined /> : <EyeInvisibleOutlined />)}
                  />
                  <Text type="secondary" className="text-sm sm:text-base block mt-1">
                    Mật khẩu phải có ít nhất 6 ký tự
                  </Text>
                </div>

                <div>
                  <Text className="text-sm sm:text-base block mb-2 font-medium">Xác nhận mật khẩu mới *</Text>
                  <Password
                    value={passwordData.confirmPassword}
                    onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                    placeholder="••••••••"
                    size="large"
                    iconRender={(visible) => (visible ? <EyeOutlined /> : <EyeInvisibleOutlined />)}
                  />
                </div>

                <Button onClick={handleChangePassword} disabled={isChangingPassword} icon={<LockOutlined />}>
                  {isChangingPassword ? 'Đang đổi mật khẩu...' : 'Đổi mật khẩu'}
                </Button>
              </div>

              <div className="border-t border-white/30 pt-4 sm:pt-6 mt-4 sm:mt-6">
                <h3 className="text-base sm:text-lg text-gray-900 mb-3 sm:mb-4 font-semibold">Phiên đăng nhập</h3>
                <div className="space-y-2 sm:space-y-3">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 sm:gap-0 p-3 sm:p-4 border border-white/30 rounded-lg">
                    <div className="flex-1 min-w-0">
                      <p className="text-base sm:text-lg text-gray-900 font-medium">Thiết bị hiện tại</p>
                      <p className="text-sm sm:text-base text-gray-600">
                        {user.lastLoginAt
                          ? `${new Date(user.lastLoginAt).toLocaleDateString('vi-VN')} lúc ${new Date(user.lastLoginAt).toLocaleTimeString('vi-VN')}`
                          : 'Chưa đăng nhập lần nào'}
                      </p>
                    </div>
                    <Tag className="flex-shrink-0 text-sm">Đang hoạt động</Tag>
                  </div>
                </div>
              </div>
            </Card>
          </Tabs.TabPane>
        </Tabs>

        {/* Danger Zone */}
        <Card
          className="!mt-4 glassmorphism sm:mt-6 border-red-200"
          title={<span className="text-lg sm:text-xl text-red-600 font-semibold">Vùng nguy hiểm</span>}
          styles={{ body: { padding: '16px 24px' } }}
        >
          <Text type="secondary" className="text-sm sm:text-base block mb-4">
            Các hành động không thể hoàn tác
          </Text>
          <Button
            danger
            onClick={() => toast.error('Chức năng xóa tài khoản đang được phát triển')}
          >
            Xóa tài khoản
          </Button>
        </Card>
      </div>
    </div>
  );
}