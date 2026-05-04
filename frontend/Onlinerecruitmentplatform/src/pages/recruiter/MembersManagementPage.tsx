import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { Card, Button, Input, Tag, Modal, Select, Dropdown, Menu, Avatar, Spin, Typography } from 'antd';
import type { MenuProps } from 'antd';
import { ExclamationCircleOutlined } from '@ant-design/icons';
import {
  RightOutlined, UserAddOutlined, MoreOutlined, MailOutlined, SafetyOutlined, DeleteOutlined,
  UserOutlined, WarningOutlined, SearchOutlined, ProjectOutlined,
  ClockCircleOutlined, CloseCircleOutlined, CheckCircleOutlined
} from '@ant-design/icons';
import { useAuth } from '../../contexts/AuthContext';
import { useCompanyRealtime } from '../../contexts/CompanyRealtimeContext';
import { CompanyRole, User, CompanyMemberInvitation, InvitationStatus } from '../../lib/types';
import { COMPANY_ROLES, getCompanyRoleLabel } from '../../lib/constants';
import { toast } from 'sonner';
import { companyService } from '../../api/services';
import { formatDistanceToNow } from 'date-fns';
import { vi } from 'date-fns/locale';

const { Option } = Select;

interface CompanyMemberWithUser {
  id: string;
  userId: string;
  companyRole: CompanyRole;
  user: User;
  createdAt: Date;
}

export function MembersManagementPage() {
  const { user } = useAuth();
  const navigate = useNavigate();

  // Use global realtime context for Firestore updates
  const {
    members: contextMembers,
    invitations: contextInvitations,
    isLoading: contextLoading,
    refreshMembers,
    refreshInvitations
  } = useCompanyRealtime();

  const [invitationStatusFilter, setInvitationStatusFilter] = useState<string>('PENDING');
  const [localLoading, setLocalLoading] = useState(false);

  // Get company ID and user role
  // API returns company.id (nested) but frontend type expects companyId (flat)
  const companyId = user?.companyMember?.companyId || user?.companyMember?.company?.id;
  // API returns "role" but frontend type expects "companyRole"
  const currentUserRole = user?.companyMember?.companyRole || (user?.companyMember as any)?.role;
  const canManageMembers = currentUserRole === CompanyRole.OWNER || currentUserRole === CompanyRole.MANAGER;

  // Transform members for local use
  const members: CompanyMemberWithUser[] = contextMembers.map(m => ({
    id: m.id,
    userId: m.userId,
    companyRole: m.companyRole,
    user: m.user!,
    createdAt: new Date(m.createdAt),
  }));

  const invitations = contextInvitations;
  const isLoading = contextLoading || localLoading;

  // Refresh invitations when filter changes
  useEffect(() => {
    if (canManageMembers) {
      refreshInvitations(invitationStatusFilter);
    }
  }, [invitationStatusFilter, canManageMembers, refreshInvitations]);

  const [searchQuery, setSearchQuery] = useState('');
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [showEditRoleModal, setShowEditRoleModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedMember, setSelectedMember] = useState<CompanyMemberWithUser | null>(null);

  // Invite form
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState<CompanyRole>(CompanyRole.RECRUITER);

  // Edit role form
  const [newRole, setNewRole] = useState<CompanyRole>(CompanyRole.RECRUITER);

  const roleConfig = {
    [CompanyRole.OWNER]: {
      label: 'Chủ sở hữu',
      color: 'red',
      description: 'Toàn quyền quản lý công ty',
    },
    [CompanyRole.MANAGER]: {
      label: 'Quản lý',
      color: 'blue',
      description: 'Quản lý thành viên và tin tuyển dụng',
    },
    [CompanyRole.RECRUITER]: {
      label: 'Nhà tuyển dụng',
      color: 'green',
      description: 'Đăng tin và xem đơn ứng tuyển',
    },
  };

  const filteredMembers = members.filter(member => {
    if (!searchQuery) return true;
    const searchLower = searchQuery.toLowerCase();
    return (
      member.user.fullName.toLowerCase().includes(searchLower) ||
      member.user.email.toLowerCase().includes(searchLower)
    );
  });

  const handleInviteMember = async () => {
    if (!inviteEmail.trim()) {
      toast.error('Vui lòng nhập email');
      return;
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(inviteEmail)) {
      toast.error('Email không hợp lệ');
      return;
    }

    if (!companyId) {
      toast.error('Không tìm thấy thông tin công ty');
      return;
    }

    try {
      setLocalLoading(true);
      await companyService.inviteMember(companyId, {
        email: inviteEmail,
        role: inviteRole,
      });

      toast.success(`Đã gửi lời mời đến ${inviteEmail}`);
      setShowInviteModal(false);
      setInviteEmail('');
      setInviteRole(CompanyRole.RECRUITER);

      // Refresh via context (Firestore will also trigger update)
      await refreshInvitations(invitationStatusFilter);
    } catch (error: any) {
      console.error('Failed to invite member:', error);
      toast.error(error?.message || 'Không thể gửi lời mời');
    } finally {
      setLocalLoading(false);
    }
  };

  const handleEditRole = async () => {
    if (!selectedMember || !companyId) return;

    // Validation: Can't change owner role if you're not owner
    if (selectedMember.companyRole === CompanyRole.OWNER && currentUserRole !== CompanyRole.OWNER) {
      toast.error('Không thể thay đổi quyền của Chủ sở hữu');
      return;
    }

    // Validation: Can't demote yourself if you're the only owner
    if (selectedMember.userId === user?.id && currentUserRole === CompanyRole.OWNER) {
      const ownerCount = members.filter(m => m.companyRole === CompanyRole.OWNER).length;
      if (ownerCount === 1 && newRole !== CompanyRole.OWNER) {
        toast.error('Không thể hạ quyền khi bạn là Chủ sở hữu duy nhất');
        return;
      }
    }

    try {
      setLocalLoading(true);
      await companyService.updateMemberRole(companyId, selectedMember.id, newRole);

      // Refresh via context (Firestore will also trigger update)
      await refreshMembers();

      toast.success('Đã cập nhật quyền thành công');
      setShowEditRoleModal(false);
      setSelectedMember(null);
    } catch (error: any) {
      console.error('Failed to update member role:', error);
      toast.error(error?.message || 'Không thể cập nhật quyền');
    } finally {
      setLocalLoading(false);
    }
  };

  const handleDeleteMember = async () => {
    if (!selectedMember || !companyId) return;

    // Validation: Can't delete owner
    if (selectedMember.companyRole === CompanyRole.OWNER) {
      toast.error('Không thể xóa Chủ sở hữu khỏi công ty');
      return;
    }

    // Validation: Can't delete yourself
    if (selectedMember.userId === user?.id) {
      toast.error('Không thể xóa chính mình');
      return;
    }

    try {
      setLocalLoading(true);
      await companyService.removeMember(companyId, selectedMember.id);

      // Refresh via context (Firestore will also trigger update)
      await refreshMembers();

      toast.success(`Đã xóa ${selectedMember.user.fullName} khỏi công ty`);
      setShowDeleteModal(false);
      setSelectedMember(null);
    } catch (error: any) {
      console.error('Failed to remove member:', error);
      toast.error(error?.message || 'Không thể xóa thành viên');
    } finally {
      setLocalLoading(false);
    }
  };

  const handleCancelInvitation = async (invitationId: string) => {
    if (!companyId) return;

    try {
      setLocalLoading(true);
      await companyService.cancelInvitation(companyId, invitationId);

      // Switch to CANCELLED tab to show the canceled invitation
      setInvitationStatusFilter('CANCELLED');

      // Refresh via context (Firestore will also trigger update)
      await refreshInvitations('CANCELLED');

      toast.success('Đã hủy lời mời');
    } catch (error: any) {
      console.error('Failed to cancel invitation:', error);
      toast.error(error?.message || 'Không thể hủy lời mời');
    } finally {
      setLocalLoading(false);
    }
  };

  const invitationStatusConfig = {
    [InvitationStatus.PENDING]: {
      label: 'Chờ phản hồi',
      color: 'orange',
      icon: ClockCircleOutlined,
    },
    [InvitationStatus.ACCEPTED]: {
      label: 'Đã chấp nhận',
      color: 'green',
      icon: CheckCircleOutlined,
    },
    [InvitationStatus.REJECTED]: {
      label: 'Đã từ chối',
      color: 'red',
      icon: CloseCircleOutlined,
    },
    [InvitationStatus.CANCELLED]: {
      label: 'Đã hủy',
      color: 'default',
      icon: CloseCircleOutlined,
    },
    [InvitationStatus.EXPIRED]: {
      label: 'Hết hạn',
      color: 'orange',
      icon: CloseCircleOutlined,
    },
  };

  if (!companyId) {
    return (
      <div className="min-h-screen py-8">
        <div className="max-w-6xl mx-auto px-4">
          <Card className="glassmorphism" styles={{ body: { padding: '48px', textAlign: 'center' } }}>
            <ProjectOutlined className="text-4xl text-gray-400 mb-4" />
            <h2 className="text-lg text-gray-900 mb-2">Không tìm thấy công ty</h2>
            <p className="text-base text-gray-600">Bạn chưa thuộc công ty nào.</p>
          </Card>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen py-8">
        <div className="max-w-6xl mx-auto px-4">
          <Card className="text-center" styles={{ body: { padding: '48px' } }}>
            <Spin size="large" />
            <p className="text-gray-600 mt-4">Đang tải danh sách thành viên...</p>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-8">
      <div className="max-w-6xl mx-auto px-4">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-gray-600 mb-6">
          <button onClick={() => navigate('/recruiter/dashboard')} className="hover:text-blue-600">
            Dashboard
          </button>
          <RightOutlined className="text-base" />
          <span className="text-gray-900">Quản lý thành viên</span>
        </div>

        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Quản lý thành viên</h1>
            <p className="text-base text-gray-600">
              Mời và quản lý các thành viên trong công ty
            </p>
          </div>
          {canManageMembers && (
            <Button type="primary" icon={<UserAddOutlined />} onClick={() => setShowInviteModal(true)}>
              Mời HR mới
            </Button>
          )}
        </div>

        {/* Search */}
        <Card className="glassmorphism mb-6" styles={{ body: { padding: '16px' } }}>
          <Input
            placeholder="Tìm kiếm theo tên hoặc email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            prefix={<SearchOutlined className="text-gray-400" />}
            size="middle"
          />
        </Card>

        {/* Members List */}
        {filteredMembers.length > 0 ? (
          <div className="space-y-4">
            {filteredMembers.map((member) => {
              const isCurrentUser = member.userId === user?.id;
              const canEdit = canManageMembers && (
                !isCurrentUser || currentUserRole === CompanyRole.OWNER
              );
              const canDelete = canManageMembers &&
                !isCurrentUser &&
                member.companyRole !== CompanyRole.OWNER;

              return (
                <Card key={member.id} className="glassmorphism" styles={{ body: { padding: '24px' } }}>
                  <div className="flex items-center gap-4">
                    {/* Avatar */}
                    <Avatar
                      size={48}
                      className="bg-blue-100 text-blue-600 flex-shrink-0"
                    >
                      {member.user.fullName.charAt(0).toUpperCase()}
                    </Avatar>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="text-base text-gray-900">{member.user.fullName}</p>
                        {isCurrentUser && (
                          <Tag color="blue">Bạn</Tag>
                        )}
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <MailOutlined className="text-base" />
                        <span>{member.user.email}</span>
                      </div>
                    </div>

                    {/* Role */}
                    <Tag color={roleConfig[member.companyRole].color} icon={<SafetyOutlined />}>
                      {roleConfig[member.companyRole].label}
                    </Tag>

                    {/* Actions */}
                    {(canEdit || canDelete) && (
                      <Dropdown
                        menu={{
                          items: [
                            ...(canEdit ? [{
                              key: 'edit',
                              label: 'Chỉnh sửa quyền',
                              icon: <SafetyOutlined />,
                              onClick: () => {
                                setSelectedMember(member);
                                setNewRole(member.companyRole);
                                setShowEditRoleModal(true);
                              },
                            }] : []),
                            ...(canDelete ? [{
                              key: 'delete',
                              label: 'Xóa khỏi công ty',
                              icon: <DeleteOutlined />,
                              danger: true,
                              onClick: () => {
                                setSelectedMember(member);
                                setShowDeleteModal(true);
                              },
                            }] : []),
                          ] as MenuProps['items'],
                        }}
                        trigger={['click']}
                        placement="bottomRight"
                      >
                        <Button type="text" size="small" icon={<MoreOutlined />} />
                      </Dropdown>
                    )}
                  </div>
                </Card>
              );
            })}
          </div>
        ) : (
          <Card className="glassmorphism" styles={{ body: { padding: '48px', textAlign: 'center' } }}>
            <UserOutlined className="text-5xl text-gray-400 mb-4" />
            <h3 className="text-lg text-gray-900 mb-2">
              {searchQuery ? 'Không tìm thấy thành viên nào' : 'Chưa có thành viên nào'}
            </h3>
            <p className="text-base text-gray-600 mb-6">
              {searchQuery
                ? 'Thử tìm kiếm với từ khóa khác'
                : 'Mời các HR vào công ty để cùng quản lý tuyển dụng'}
            </p>
            {canManageMembers && !searchQuery && (
              <Button type="primary" icon={<UserAddOutlined />} onClick={() => setShowInviteModal(true)}>
                Mời HR mới
              </Button>
            )}
          </Card>
        )}

        {/* Invitations Section */}
        {canManageMembers && (
          <div className="mt-8">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-gray-900 mb-1">Lời mời đã gửi</h2>
                <p className="text-gray-600">Quản lý các lời mời tham gia công ty</p>
              </div>
              <Select
                value={invitationStatusFilter}
                onChange={setInvitationStatusFilter}
                style={{ width: 200 }}
              >
                <Option value="PENDING">Chờ phản hồi</Option>
                <Option value="ACCEPTED">Đã chấp nhận</Option>
                <Option value="REJECTED">Đã từ chối</Option>
                <Option value="CANCELLED">Đã hủy</Option>
                <Option value="EXPIRED">Hết hạn</Option>
              </Select>
            </div>

            {invitations.length > 0 ? (
              <div className="space-y-3">
                {invitations.map((invitation) => {
                  const StatusIcon = invitationStatusConfig[invitation.status].icon;
                  const isExpired = invitation.expiresAt && new Date(invitation.expiresAt) < new Date();

                  return (
                    <Card key={invitation.id} className="glassmorphism" styles={{ body: { padding: '16px' } }}>
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <div>
                              <p className="text-base text-gray-900 font-medium">
                                {invitation.user?.fullName || invitation.user?.email || 'Chưa cập nhật'}
                              </p>
                              <p className="text-sm text-gray-600">{invitation.user?.email}</p>
                            </div>
                            <Tag color={invitationStatusConfig[invitation.status].color} icon={<StatusIcon />}>
                              {invitationStatusConfig[invitation.status].label}
                            </Tag>
                            <Tag color={roleConfig[invitation.role].color}>
                              {roleConfig[invitation.role].label}
                            </Tag>
                          </div>
                          <div className="flex items-center gap-4 text-sm text-gray-600">
                            <span>
                              Mời bởi: {invitation.inviter?.fullName || invitation.inviter?.email || 'N/A'}
                            </span>
                            <span>
                              Gửi {formatDistanceToNow(new Date(invitation.createdAt), {
                                addSuffix: true,
                                locale: vi
                              })}
                            </span>
                            {invitation.expiresAt && (
                              <span className={isExpired ? 'text-red-600' : ''}>
                                Hết hạn {formatDistanceToNow(new Date(invitation.expiresAt), {
                                  addSuffix: true,
                                  locale: vi
                                })}
                              </span>
                            )}
                          </div>
                        </div>
                        {invitation.status === InvitationStatus.PENDING && (
                          <Button
                            size="small"
                            danger
                            icon={<CloseCircleOutlined />}
                            onClick={() => handleCancelInvitation(invitation.id)}
                          >
                            Hủy lời mời
                          </Button>
                        )}
                      </div>
                    </Card>
                  );
                })}
              </div>
            ) : (
              <Card className="glassmorphism" styles={{ body: { padding: '48px', textAlign: 'center' } }}>
                <MailOutlined className="text-5xl text-gray-400 mb-4" />
                <h3 className="text-lg text-gray-900 mb-2">
                  {invitationStatusFilter === 'PENDING'
                    ? 'Chưa có lời mời nào đang chờ'
                    : 'Không có lời mời nào'}
                </h3>
                <p className="text-base text-gray-600">
                  {invitationStatusFilter === 'PENDING'
                    ? 'Các lời mời đang chờ phản hồi sẽ hiển thị ở đây'
                    : 'Các lời mời sẽ hiển thị ở đây'}
                </p>
              </Card>
            )}
          </div>
        )}

        {/* Invite Member Modal */}
        <Modal
          open={showInviteModal}
          onCancel={() => {
            setShowInviteModal(false);
            setInviteEmail('');
            setInviteRole(CompanyRole.RECRUITER);
          }}
          onOk={handleInviteMember}
          okText="Gửi lời mời"
          cancelText="Hủy"
          confirmLoading={localLoading}
          title="Mời thành viên mới"
        >
          <div className="space-y-4">
            <Typography.Text>
              Gửi lời mời tham gia công ty qua email. Người nhận sẽ nhận được email với link để tham gia.
            </Typography.Text>
            <div>
              <Typography.Text strong>
                Email <span className="text-red-500">*</span>
              </Typography.Text>
              <Input
                type="email"
                placeholder="hr@example.com"
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
                prefix={<MailOutlined className="text-gray-400" />}
                className="mt-1"
              />
              <Typography.Text type="secondary" className="text-sm block mt-1">
                Nhập email của người bạn muốn mời vào công ty
              </Typography.Text>
            </div>

            <div>
              <Typography.Text strong>Vai trò</Typography.Text>
              <Select
                value={inviteRole}
                onChange={(value: CompanyRole) => setInviteRole(value)}
                className="mt-1 w-full"
              >
                <Option value={CompanyRole.RECRUITER}>
                  <div>
                    <div className="font-medium">{roleConfig[CompanyRole.RECRUITER].label}</div>
                    <div className="text-xs text-gray-500">{roleConfig[CompanyRole.RECRUITER].description}</div>
                  </div>
                </Option>
                {currentUserRole === CompanyRole.OWNER && (
                  <Option value={CompanyRole.MANAGER}>
                    <div>
                      <div className="font-medium">{roleConfig[CompanyRole.MANAGER].label}</div>
                      <div className="text-xs text-gray-500">{roleConfig[CompanyRole.MANAGER].description}</div>
                    </div>
                  </Option>
                )}
              </Select>
              <Typography.Text type="secondary" className="text-sm block mt-1">
                Chọn vai trò phù hợp với công việc của thành viên
              </Typography.Text>
            </div>

            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex gap-2">
                <WarningOutlined className="text-lg text-blue-600 flex-shrink-0 mt-0.5" />
                <div className="text-sm text-gray-700">
                  <p className="mb-1 font-medium">Lưu ý:</p>
                  <ul className="list-disc list-inside space-y-1">
                    <li>Người nhận sẽ nhận được email lời mời</li>
                    <li>Họ cần có tài khoản hoặc tạo tài khoản mới</li>
                    <li>Bạn có thể thay đổi vai trò sau khi họ tham gia</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </Modal>

        {/* Edit Role Modal */}
        <Modal
          open={showEditRoleModal}
          onCancel={() => setShowEditRoleModal(false)}
          onOk={handleEditRole}
          okText="Lưu"
          cancelText="Hủy"
          confirmLoading={localLoading}
          title={`Chỉnh sửa quyền - ${selectedMember?.user.fullName}`}
        >
          <div className="space-y-4">
            <Typography.Text>
              Thay đổi vai trò của thành viên trong công ty
            </Typography.Text>
            {selectedMember?.userId === user?.id && currentUserRole === CompanyRole.OWNER && (
              <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg flex gap-2">
                <WarningOutlined className="text-lg text-yellow-600 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-gray-700">
                  Bạn đang thay đổi quyền của chính mình. Hãy chắc chắn có Chủ sở hữu khác trước khi hạ quyền.
                </p>
              </div>
            )}

            <div>
              <Typography.Text strong>Vai trò mới</Typography.Text>
              <Select
                value={newRole}
                onChange={(value: CompanyRole) => setNewRole(value)}
                className="mt-1 w-full"
              >
                {Object.entries(roleConfig).map(([value, config]) => {
                  // Manager can't assign Owner role
                  if (value === CompanyRole.OWNER && currentUserRole !== CompanyRole.OWNER) {
                    return null;
                  }
                  return (
                    <Option key={value} value={value}>
                      <div>
                        <p>{config.label}</p>
                        <p className="text-xs text-gray-500">{config.description}</p>
                      </div>
                    </Option>
                  );
                })}
              </Select>
            </div>
          </div>
        </Modal>

        {/* Delete Member Modal */}
        <Modal
          open={showDeleteModal}
          onCancel={() => setShowDeleteModal(false)}
          onOk={handleDeleteMember}
          okText="Xác nhận xóa"
          cancelText="Hủy"
          okType="danger"
          confirmLoading={localLoading}
          title="Xác nhận xóa thành viên"
        >
          <div className="space-y-4">
            <Typography.Text>
              Thao tác này không thể hoàn tác
            </Typography.Text>
            <p className="text-base text-gray-700">
              Bạn có chắc muốn xóa <strong>{selectedMember?.user.fullName}</strong> khỏi công ty?
            </p>

            {selectedMember?.companyRole === CompanyRole.MANAGER && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg flex gap-2">
                <WarningOutlined className="text-lg text-red-600 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-gray-700">
                  Đây là Quản lý. Việc xóa có thể ảnh hưởng đến quy trình quản lý công ty.
                </p>
              </div>
            )}
          </div>
        </Modal>
      </div>
    </div>
  );
}