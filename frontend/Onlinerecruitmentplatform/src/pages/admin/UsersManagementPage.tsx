import React, { useState, useEffect, useMemo } from 'react';
import { Card, Button, Input, Tag, Avatar, Table, Modal, Spin, message, Select, Typography } from 'antd';
import {
  SearchOutlined,
  UserOutlined,
  LockOutlined,
  UnlockOutlined,
  EditOutlined,
  DeleteOutlined,
  PlusOutlined,
  ReloadOutlined,
} from '@ant-design/icons';
import { UserRole, User } from '../../lib/types';
import { userService, CreateUserRequest, UpdateUserRequest, GetUsersParams } from '../../api/services';

const { Option } = Select;
const { Text } = Typography;

interface UserWithStatus extends User {
  totalApplications?: number;
  totalJobs?: number;
}

const roleLabels = {
  [UserRole.CANDIDATE]: 'Ứng viên',
  [UserRole.RECRUITER]: 'Nhà tuyển dụng',
  [UserRole.ADMIN]: 'Admin',
};

const roleColors = {
  [UserRole.CANDIDATE]: 'blue',
  [UserRole.RECRUITER]: 'green',
  [UserRole.ADMIN]: 'purple',
};

const statusLabels: Record<string, string> = {
  'ACTIVE': 'Hoạt động',
  'INACTIVE': 'Không hoạt động',
  'LOCKED': 'Đã khóa',
  'PENDING': 'Chờ xác nhận',
  'SUSPENDED': 'Tạm ngưng',
};

const statusColors: Record<string, string> = {
  'ACTIVE': 'success',
  'INACTIVE': 'default',
  'LOCKED': 'error',
  'PENDING': 'warning',
  'SUSPENDED': 'warning',
};

// Initial form state
const initialFormState = {
  email: '',
  password: '',
  fullName: '',
  role: 'CANDIDATE' as 'CANDIDATE' | 'RECRUITER' | 'ADMIN',
  status: 'ACTIVE' as 'ACTIVE' | 'INACTIVE' | 'LOCKED' | 'PENDING' | 'SUSPENDED',
  phoneNumber: '',
  gender: '' as '' | 'MALE' | 'FEMALE' | 'OTHER',
  dateOfBirth: '',
};

export function UsersManagementPage() {
  const [users, setUsers] = useState<UserWithStatus[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [searchInput, setSearchInput] = useState('');
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
  const [selectedRole, setSelectedRole] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalResults, setTotalResults] = useState(0);

  // Modal states
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [actionDialog, setActionDialog] = useState<{
    open: boolean;
    action: 'lock' | 'unlock' | null;
    userId: string | null;
    userName: string;
  }>({
    open: false,
    action: null,
    userId: null,
    userName: '',
  });

  // Form state
  const [formData, setFormData] = useState(initialFormState);
  const [selectedUser, setSelectedUser] = useState<UserWithStatus | null>(null);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchInput);
      setPage(1);
    }, 500);
    return () => clearTimeout(timer);
  }, [searchInput]);

  // Fetch users from API
  const fetchUsers = async () => {
    setIsLoading(true);
    try {
      const params: GetUsersParams = {
        page,
        limit: 20,
        orderBy: 'createdAt:desc'
      };

      // Add role filter if not 'all'
      if (selectedRole !== 'all') {
        params.role = selectedRole.toUpperCase() as 'CANDIDATE' | 'RECRUITER' | 'ADMIN';
      }

      // Add search if provided
      if (debouncedSearchTerm.trim()) {
        params.search = debouncedSearchTerm.trim();
      }

      // Add status filter if not 'all'
      if (selectedStatus !== 'all') {
        params.status = selectedStatus;
      }

      const response = await userService.getAllUsers(params);
      setUsers(response.users || []);
      setTotalPages(response.pagination?.totalPages || 1);
      setTotalResults(response.pagination?.total || 0);
    } catch (error: any) {
      message.error(error?.message || 'Không thể tải danh sách người dùng');
      console.error('Failed to fetch users:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [page, selectedRole, debouncedSearchTerm, selectedStatus]);

  // Validate form
  const validateForm = (isEdit = false): boolean => {
    const errors: Record<string, string> = {};

    if (isEdit) {
      // When editing, only validate role and status
      if (!formData.role) {
        errors.role = 'Vai trò là bắt buộc';
      }
      if (!formData.status) {
        errors.status = 'Trạng thái là bắt buộc';
      }
    } else {
      // When creating, validate all required fields
      if (!formData.email.trim()) {
        errors.email = 'Email là bắt buộc';
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
        errors.email = 'Email không hợp lệ';
      }

      if (!formData.password.trim()) {
        errors.password = 'Mật khẩu là bắt buộc';
      } else if (formData.password.length < 8) {
        errors.password = 'Mật khẩu phải có ít nhất 8 ký tự';
      }
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Handle create user
  const handleCreateUser = async () => {
    if (!validateForm()) return;

    try {
      setIsProcessing(true);
      const createData: CreateUserRequest = {
        email: formData.email,
        password: formData.password,
        fullName: formData.fullName || undefined,
        role: formData.role,
        status: formData.status,
        phoneNumber: formData.phoneNumber || undefined,
        gender: formData.gender || undefined,
        dateOfBirth: formData.dateOfBirth || undefined,
      };

      await userService.createUser(createData);
      message.success('Tạo người dùng thành công');
      setCreateModalOpen(false);
      setFormData(initialFormState);
      fetchUsers();
    } catch (error: any) {
      message.error(error?.message || 'Không thể tạo người dùng');
    } finally {
      setIsProcessing(false);
    }
  };

  // Handle edit user
  const handleEditUser = async () => {
    if (!selectedUser || !validateForm(true)) return;

    try {
      setIsProcessing(true);
      // When editing, only allow updating role and status
      const updateData: UpdateUserRequest = {
        role: formData.role,
        status: formData.status,
      };

      await userService.updateUser(selectedUser.id, updateData);
      message.success('Cập nhật người dùng thành công');
      setEditModalOpen(false);
      setSelectedUser(null);
      setFormData(initialFormState);
      fetchUsers();
    } catch (error: any) {
      message.error(error?.message || 'Không thể cập nhật người dùng');
    } finally {
      setIsProcessing(false);
    }
  };

  // Handle delete user
  const handleDeleteUser = async () => {
    if (!selectedUser) return;

    try {
      setIsProcessing(true);
      await userService.deleteUser(selectedUser.id);
      message.success('Xóa người dùng thành công');
      setDeleteDialogOpen(false);
      setSelectedUser(null);
      fetchUsers();
    } catch (error: any) {
      message.error(error?.message || 'Không thể xóa người dùng');
    } finally {
      setIsProcessing(false);
    }
  };

  // Handle lock/unlock
  const handleLockUnlock = (action: 'lock' | 'unlock', user: UserWithStatus) => {
    setActionDialog({
      open: true,
      action,
      userId: user.id,
      userName: user.fullName || user.email,
    });
  };

  const confirmLockUnlock = async () => {
    if (!actionDialog.userId || !actionDialog.action) return;

    try {
      setIsProcessing(true);

      if (actionDialog.action === 'lock') {
        await userService.lockUser(actionDialog.userId);
        message.success('Đã khóa tài khoản người dùng');
      } else {
        await userService.unlockUser(actionDialog.userId);
        message.success('Đã mở khóa tài khoản người dùng');
      }

      setActionDialog({ open: false, action: null, userId: null, userName: '' });
      fetchUsers();
    } catch (error: any) {
      message.error(error?.message || 'Không thể thực hiện thao tác');
    } finally {
      setIsProcessing(false);
    }
  };

  // Open edit modal
  const openEditModal = (user: UserWithStatus) => {
    setSelectedUser(user);
    setFormData({
      email: user.email,
      password: '',
      fullName: user.fullName || '',
      role: user.role as 'CANDIDATE' | 'RECRUITER' | 'ADMIN',
      status: (user.status || 'ACTIVE') as typeof formData.status,
      phoneNumber: user.phoneNumber || '',
      gender: (user.gender || '') as typeof formData.gender,
      dateOfBirth: user.dateOfBirth ? new Date(user.dateOfBirth).toISOString().split('T')[0] : '',
    });
    setFormErrors({});
    setEditModalOpen(true);
  };

  // Open delete dialog
  const openDeleteDialog = (user: UserWithStatus) => {
    setSelectedUser(user);
    setDeleteDialogOpen(true);
  };

  const getActionDialogContent = () => {
    const messages = {
      lock: {
        title: 'Khóa tài khoản',
        description: `Bạn có chắc chắn muốn khóa tài khoản "${actionDialog.userName}"? Người dùng sẽ không thể đăng nhập và sử dụng hệ thống.`,
        action: 'Khóa',
      },
      unlock: {
        title: 'Mở khóa tài khoản',
        description: `Bạn có chắc chắn muốn mở khóa tài khoản "${actionDialog.userName}"? Người dùng sẽ có thể đăng nhập trở lại.`,
        action: 'Mở khóa',
      },
    };
    return actionDialog.action ? messages[actionDialog.action] : null;
  };

  const dialogContent = getActionDialogContent();

  const getAvatarInitials = (name: string, email: string) => {
    if (name) {
      const names = name.split(' ');
      if (names.length >= 2) {
        return (names[0][0] + names[names.length - 1][0]).toUpperCase();
      }
      return name.charAt(0).toUpperCase();
    }
    return email.charAt(0).toUpperCase();
  };

  const columns = [
    {
      title: 'Người dùng',
      key: 'user',
      render: (_: any, record: UserWithStatus) => (
        <div className="flex items-center gap-3">
          <Avatar
            size={40}
            src={record.avatarUrl || undefined}
          >
            {getAvatarInitials(record.fullName || '', record.email)}
          </Avatar>
          <div>
            <div className="font-medium text-gray-900">{record.fullName || 'Chưa cập nhật'}</div>
            <div className="text-sm text-gray-500">{record.phoneNumber || ''}</div>
          </div>
        </div>
      ),
    },
    {
      title: 'Vai trò',
      dataIndex: 'role',
      key: 'role',
      render: (role: UserRole) => (
        <Tag color={roleColors[role]}>
          {roleLabels[role]}
        </Tag>
      ),
    },
    {
      title: 'Email',
      dataIndex: 'email',
      key: 'email',
      render: (email: string) => <span className="text-gray-600">{email}</span>,
    },
    {
      title: 'Ngày đăng ký',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (date: string | Date) => {
        const dateObj = date instanceof Date ? date : new Date(date);
        return <span className="text-gray-600">{dateObj.toLocaleDateString('vi-VN')}</span>;
      },
    },
    {
      title: 'Đăng nhập gần nhất',
      dataIndex: 'lastLoginAt',
      key: 'lastLoginAt',
      render: (date: string | Date | null) => {
        if (!date) return <span className="text-gray-600">-</span>;
        const dateObj = date instanceof Date ? date : new Date(date);
        return <span className="text-gray-600">{dateObj.toLocaleDateString('vi-VN')}</span>;
      },
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => {
        const userStatus = status || 'ACTIVE';
        return (
          <Tag color={statusColors[userStatus] || 'default'}>
            {statusLabels[userStatus] || 'Hoạt động'}
          </Tag>
        );
      },
    },
    {
      title: 'Thao tác',
      key: 'action',
      align: 'right' as const,
      render: (_: any, record: UserWithStatus) => {
        const userStatus = record.status || 'ACTIVE';
        const isLocked = userStatus === 'LOCKED' || userStatus === 'SUSPENDED';

        return (
          <div className="flex justify-end gap-1">
            <Button
              type="text"
              size="small"
              icon={<EditOutlined />}
              onClick={() => openEditModal(record)}
              title="Chỉnh sửa"
            />
            {isLocked ? (
              <Button
                type="text"
                size="small"
                icon={<UnlockOutlined />}
                className="text-green-600 hover:text-green-700"
                onClick={() => handleLockUnlock('unlock', record)}
                title="Mở khóa"
              />
            ) : (
              <Button
                type="text"
                size="small"
                icon={<LockOutlined />}
                className="text-yellow-600 hover:text-yellow-700"
                onClick={() => handleLockUnlock('lock', record)}
                title="Khóa"
              />
            )}
            <Button
              type="text"
              size="small"
              icon={<DeleteOutlined />}
              danger
              onClick={() => openDeleteDialog(record)}
              title="Xóa"
            />
          </div>
        );
      },
    },
  ];

  // Form component
  const UserForm = ({ isEdit = false }: { isEdit?: boolean }) => useMemo(() => (
    <div className="grid gap-4 py-4">
      {isEdit ? (
        // Edit mode: Only show role and status (editable), other fields are readonly
        <>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Text strong>Email</Text>
              <Input
                value={formData.email}
                disabled
                className="bg-gray-100"
              />
            </div>

            <div className="space-y-2">
              <Text strong>Họ tên</Text>
              <Input
                value={formData.fullName}
                disabled
                className="bg-gray-100"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Text strong>Số điện thoại</Text>
              <Input
                value={formData.phoneNumber || ''}
                disabled
                className="bg-gray-100"
              />
            </div>

            <div className="space-y-2">
              <Text strong>Giới tính</Text>
              <Select
                value={formData.gender || ''}
                disabled
                className="w-full"
              >
                <Option value="MALE">Nam</Option>
                <Option value="FEMALE">Nữ</Option>
                <Option value="OTHER">Khác</Option>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Text strong>Ngày sinh</Text>
            <Input
              type="date"
              value={formData.dateOfBirth || ''}
              disabled
              className="bg-gray-100"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Text strong>Vai trò *</Text>
              <Select
                value={formData.role}
                onChange={(v) => setFormData({ ...formData, role: v as typeof formData.role })}
                className="w-full"
                status={formErrors.role ? 'error' : ''}
              >
                <Option value="CANDIDATE">Ứng viên</Option>
                <Option value="RECRUITER">Nhà tuyển dụng</Option>
                <Option value="ADMIN">Admin</Option>
              </Select>
              {formErrors.role && <Text type="danger" className="text-sm">{formErrors.role}</Text>}
            </div>

            <div className="space-y-2">
              <Text strong>Trạng thái *</Text>
              <Select
                value={formData.status}
                onChange={(v) => setFormData({ ...formData, status: v as typeof formData.status })}
                className="w-full"
                status={formErrors.status ? 'error' : ''}
              >
                <Option value="ACTIVE">Hoạt động</Option>
                <Option value="INACTIVE">Không hoạt động</Option>
                <Option value="PENDING">Chờ xác nhận</Option>
                <Option value="LOCKED">Đã khóa</Option>
                <Option value="SUSPENDED">Tạm ngưng</Option>
              </Select>
              {formErrors.status && <Text type="danger" className="text-sm">{formErrors.status}</Text>}
            </div>
          </div>
        </>
      ) : (
        // Create mode: Show all fields
        <>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Text strong>Email *</Text>
              <Input
                type="email"
                placeholder="user@example.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                status={formErrors.email ? 'error' : ''}
              />
              {formErrors.email && <Text type="danger" className="text-sm">{formErrors.email}</Text>}
            </div>

            <div className="space-y-2">
              <Text strong>Mật khẩu *</Text>
              <Input.Password
                placeholder="Tối thiểu 8 ký tự"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                status={formErrors.password ? 'error' : ''}
              />
              {formErrors.password && <Text type="danger" className="text-sm">{formErrors.password}</Text>}
            </div>
          </div>

          <div className="space-y-2">
            <Text strong>Họ tên</Text>
            <Input
              placeholder="Nguyễn Văn A"
              value={formData.fullName}
              onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Text strong>Vai trò</Text>
              <Select
                value={formData.role}
                onChange={(v) => setFormData({ ...formData, role: v as typeof formData.role })}
                className="w-full"
              >
                <Option value="CANDIDATE">Ứng viên</Option>
                <Option value="RECRUITER">Nhà tuyển dụng</Option>
                <Option value="ADMIN">Admin</Option>
              </Select>
            </div>

            <div className="space-y-2">
              <Text strong>Trạng thái</Text>
              <Select
                value={formData.status}
                onChange={(v) => setFormData({ ...formData, status: v as typeof formData.status })}
                className="w-full"
              >
                <Option value="ACTIVE">Hoạt động</Option>
                <Option value="INACTIVE">Không hoạt động</Option>
                <Option value="PENDING">Chờ xác nhận</Option>
                <Option value="LOCKED">Đã khóa</Option>
                <Option value="SUSPENDED">Tạm ngưng</Option>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Text strong>Số điện thoại</Text>
              <Input
                placeholder="0123456789"
                value={formData.phoneNumber}
                onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Text strong>Giới tính</Text>
              <Select
                value={formData.gender}
                onChange={(v) => setFormData({ ...formData, gender: v as typeof formData.gender })}
                className="w-full"
                placeholder="Chọn giới tính"
              >
                <Option value="MALE">Nam</Option>
                <Option value="FEMALE">Nữ</Option>
                <Option value="OTHER">Khác</Option>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Text strong>Ngày sinh</Text>
            <Input
              type="date"
              value={formData.dateOfBirth}
              onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
            />
          </div>
        </>
      )}
    </div>
  ), [formData, formErrors, isEdit]);

  return (
    <div className="min-h-screen py-8">
      <div className="max-w-6xl mx-auto px-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Quản lý người dùng</h1>
            <p className="text-gray-600">
              Quản lý tài khoản người dùng trên hệ thống
            </p>
          </div>
          <div className="flex gap-2">
            <Button icon={<ReloadOutlined />} onClick={fetchUsers} disabled={isLoading}>
              Làm mới
            </Button>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => { setFormData(initialFormState); setFormErrors({}); setCreateModalOpen(true); }}
            >
              Thêm người dùng
            </Button>
          </div>
        </div>

        {/* Stats */}
        {/* <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <Card styles={{ body: { padding: '16px' } }}>
            <p className="text-sm text-gray-600 mb-1">Tổng số</p>
            <p className="text-2xl font-bold text-gray-900">{counts.all}</p>
          </Card>
          <Card styles={{ body: { padding: '16px' } }}>
            <p className="text-sm text-gray-600 mb-1">Ứng viên</p>
            <p className="text-2xl font-bold text-blue-600">{counts.candidate}</p>
          </Card>
          <Card styles={{ body: { padding: '16px' } }}>
            <p className="text-sm text-gray-600 mb-1">Nhà tuyển dụng</p>
            <p className="text-2xl font-bold text-green-600">{counts.recruiter}</p>
          </Card>
          <Card styles={{ body: { padding: '16px' } }}>
            <p className="text-sm text-gray-600 mb-1">Admin</p>
            <p className="text-2xl font-bold text-purple-600">{counts.admin}</p>
          </Card>
        </div> */}

        {/* Filters */}
        <Card className="mb-6 glassmorphism" styles={{ body: { padding: '16px 20px' } }}>
          {/* Search Bar */}
          <div className="flex gap-2 mb-3">
            <Input
              placeholder="Tìm kiếm theo email hoặc tên..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              prefix={<SearchOutlined className="text-gray-400" />}
              size="middle"
              className="flex-1"
              allowClear
            />
          </div>

          {/* Filters Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
            {/* Role Filter */}
            <Select
              value={selectedRole}
              onChange={(value) => { setSelectedRole(value); setPage(1); }}
              placeholder="Vai trò"
              size="middle"
              className="text-sm"
            >
              <Select.Option value="all">Tất cả vai trò</Select.Option>
              <Select.Option value="CANDIDATE">Ứng viên</Select.Option>
              <Select.Option value="RECRUITER">Nhà tuyển dụng</Select.Option>
              <Select.Option value="ADMIN">Admin</Select.Option>
            </Select>

            {/* Status Filter */}
            <Select
              value={selectedStatus}
              onChange={(value) => { setSelectedStatus(value); setPage(1); }}
              placeholder="Trạng thái"
              size="middle"
              className="text-sm"
            >
              <Select.Option value="all">Tất cả trạng thái</Select.Option>
              <Select.Option value="ACTIVE">Hoạt động</Select.Option>
              <Select.Option value="INACTIVE">Không hoạt động</Select.Option>
              <Select.Option value="LOCKED">Đã khóa</Select.Option>
            </Select>
          </div>

          {/* Active Filters Tags */}
          {(selectedRole !== 'all' || selectedStatus !== 'all') && (
            <div className="mt-4">
              <div className="bg-blue-50/50 rounded-xl p-3 border border-blue-100 flex flex-wrap items-center gap-3">
                <span className="text-sm text-blue-800 font-medium px-1">Đang lọc:</span>
                <div className="flex flex-wrap gap-2">
                  {selectedRole !== 'all' && (
                    <Tag
                      closable
                      onClose={() => setSelectedRole('all')}
                      className="cursor-pointer m-0 bg-white border-blue-200 text-blue-700 hover:border-blue-300 rounded-lg px-3 py-1 text-sm flex items-center shadow-sm"
                    >
                      {roleLabels[selectedRole as UserRole]}
                    </Tag>
                  )}
                  {selectedStatus !== 'all' && (
                    <Tag
                      closable
                      onClose={() => setSelectedStatus('all')}
                      className="cursor-pointer m-0 bg-white border-blue-200 text-blue-700 hover:border-blue-300 rounded-lg px-3 py-1 text-sm flex items-center shadow-sm"
                    >
                      {statusLabels[selectedStatus] || selectedStatus}
                    </Tag>
                  )}
                  <Button
                    type="link"
                    size="small"
                    onClick={() => {
                      setSelectedRole('all');
                      setSelectedStatus('all');
                      setSearchInput('');
                      setPage(1);
                    }}
                    className="text-red-500 hover:text-red-700 text-xs ml-2"
                  >
                    Xóa tất cả
                  </Button>
                </div>
              </div>
            </div>
          )}
        </Card>

        {/* Results Count */}
        <div className="mb-4">
          <p className="text-sm text-gray-600">
            Tìm thấy <span className="font-semibold text-gray-900">{totalResults}</span> người dùng
          </p>
        </div>

        {/* Users Table */}
        <Card styles={{ body: { padding: 0 } }}>
          {isLoading ? (
            <div className="p-12 text-center">
              <Spin size="large" className="mb-4" />
              <p className="text-gray-600">Đang tải danh sách người dùng...</p>
            </div>
          ) : users.length === 0 ? (
            <div className="p-12 text-center">
              <UserOutlined className="text-5xl text-gray-300 mb-4" />
              <p className="text-gray-600">Không tìm thấy người dùng nào</p>
            </div>
          ) : (
            <Table
              columns={columns}
              dataSource={users}
              rowKey="id"
              pagination={false}
            />
          )}
        </Card>

        {/* Pagination */}
        {!isLoading && totalPages > 1 && (
          <div className="flex items-center justify-between mt-6">
            <div className="text-sm text-gray-600">
              Trang {page} / {totalPages}
            </div>
            <div className="flex gap-2">
              <Button
                onClick={() => setPage(prev => Math.max(1, prev - 1))}
                disabled={page === 1}
              >
                Trước
              </Button>
              <Button
                onClick={() => setPage(prev => Math.min(totalPages, prev + 1))}
                disabled={page === totalPages}
              >
                Sau
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Create User Modal */}
      <Modal
        open={createModalOpen}
        onCancel={() => setCreateModalOpen(false)}
        onOk={handleCreateUser}
        title="Thêm người dùng mới"
        okText="Tạo người dùng"
        cancelText="Hủy"
        confirmLoading={isProcessing}
        width={600}
      >
        <UserForm />
      </Modal>

      {/* Edit User Modal */}
      <Modal
        open={editModalOpen}
        onCancel={() => setEditModalOpen(false)}
        onOk={handleEditUser}
        title="Chỉnh sửa người dùng"
        okText="Lưu thay đổi"
        cancelText="Hủy"
        confirmLoading={isProcessing}
        width={600}
      >
        <UserForm isEdit />
      </Modal>

      {/* Delete Confirmation Dialog */}
      <Modal
        open={deleteDialogOpen}
        onCancel={() => setDeleteDialogOpen(false)}
        onOk={handleDeleteUser}
        title="Xóa người dùng"
        okText="Xóa"
        cancelText="Hủy"
        okButtonProps={{ danger: true }}
        confirmLoading={isProcessing}
      >
        <p>
          Bạn có chắc chắn muốn xóa người dùng "{selectedUser?.fullName || selectedUser?.email}"?
          Hành động này không thể hoàn tác và sẽ xóa tất cả dữ liệu liên quan.
        </p>
      </Modal>

      {/* Lock/Unlock Confirmation Dialog */}
      <Modal
        open={actionDialog.open}
        onCancel={() => setActionDialog({ open: false, action: null, userId: null, userName: '' })}
        onOk={confirmLockUnlock}
        title={dialogContent?.title}
        okText={isProcessing ? 'Đang xử lý...' : dialogContent?.action}
        cancelText="Hủy"
        confirmLoading={isProcessing}
      >
        <p>{dialogContent?.description}</p>
      </Modal>
    </div>
  );
}
