import { React, useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { CompanyMember, CompanyRole } from '../../lib/types';
import { formatDistanceToNow } from 'date-fns';
import { vi } from 'date-fns/locale';
import { toast } from 'sonner';
import { companyService } from '../../api/services';
import { Card, Button, Input, Select, Modal, Avatar, Tag, Spin } from 'antd';
import {
  UserOutlined,
  SearchOutlined,
  UserAddOutlined,
  MailOutlined,
  SafetyOutlined,
  EyeOutlined,
  DeleteOutlined,
  UserSwitchOutlined,
  CrownOutlined,
  WarningOutlined,
} from '@ant-design/icons';

export default function TeamMembersPage() {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [members, setMembers] = useState<CompanyMember[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isChangeRoleModalOpen, setIsChangeRoleModalOpen] = useState(false);
  const [selectedMember, setSelectedMember] = useState<CompanyMember | null>(null);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState<CompanyRole>(CompanyRole.RECRUITER);

  // Get company ID from user's companyMember
  // API returns company.id (nested) but frontend type expects companyId (flat)
  const companyId = user?.companyMember?.companyId || user?.companyMember?.company?.id;

  // Get current user's role in company
  // API returns "role" but frontend type expects "companyRole"
  const currentMemberRole = user?.companyMember?.companyRole || (user?.companyMember as any)?.role;
  const canManageMembers = currentMemberRole === CompanyRole.OWNER || currentMemberRole === CompanyRole.MANAGER;

  // Fetch company members
  useEffect(() => {
    const fetchMembers = async () => {
      if (!companyId) {
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        const membersList = await companyService.getCompanyMembers(companyId);
        setMembers(membersList);
      } catch (error: any) {
        console.error('Failed to fetch members:', error);
        toast.error(error?.message || 'Không thể tải danh sách thành viên');
      } finally {
        setIsLoading(false);
      }
    };

    fetchMembers();
  }, [companyId]);

  // Filter members
  const filteredMembers = members.filter(member => {
    const memberUser = member.user;
    if (!memberUser) return false;

    const matchesSearch =
      memberUser.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      memberUser.email.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesRole = roleFilter === 'all' || member.companyRole === roleFilter;

    return matchesSearch && matchesRole;
  });

  // Stats
  const totalMembers = members.length;
  const ownerCount = members.filter(m => m.companyRole === CompanyRole.OWNER).length;
  const managerCount = members.filter(m => m.companyRole === CompanyRole.MANAGER).length;
  const recruiterCount = members.filter(m => m.companyRole === CompanyRole.RECRUITER).length;

  const roleConfig = {
    [CompanyRole.OWNER]: {
      label: 'Owner',
      color: 'purple',
      icon: CrownOutlined,
      description: 'Toàn quyền quản lý',
    },
    [CompanyRole.MANAGER]: {
      label: 'Manager',
      color: 'blue',
      icon: SafetyOutlined,
      description: 'Quản lý team',
    },
    [CompanyRole.RECRUITER]: {
      label: 'Recruiter',
      color: 'green',
      icon: UserSwitchOutlined,
      description: 'Tuyển dụng',
    },
  };

  const handleInvite = async () => {
    if (!inviteEmail) {
      toast.error('Vui lòng nhập email');
      return;
    }

    if (!companyId) {
      toast.error('Không tìm thấy thông tin công ty');
      return;
    }

    try {
      await companyService.inviteMember(companyId, {
        email: inviteEmail,
        role: inviteRole,
      });

      toast.success(`Đã gửi lời mời đến ${inviteEmail}`);
      setIsInviteModalOpen(false);
      setInviteEmail('');
      setInviteRole(CompanyRole.RECRUITER);

      // Refresh members list
      const membersList = await companyService.getCompanyMembers(companyId);
      setMembers(membersList);
    } catch (error: any) {
      console.error('Failed to invite member:', error);
      toast.error(error?.message || 'Có lỗi xảy ra. Vui lòng thử lại.');
    }
  };

  const handleChangeRole = async (newRole: CompanyRole) => {
    if (!selectedMember || !companyId) return;

    try {
      await companyService.updateMemberRole(companyId, selectedMember.id, newRole);

      // Refresh members list
      const membersList = await companyService.getCompanyMembers(companyId);
      setMembers(membersList);

      const memberUser = selectedMember.user;
      toast.success(`Đã thay đổi vai trò của ${memberUser?.fullName || 'thành viên'} thành ${roleConfig[newRole].label}`);
      setIsChangeRoleModalOpen(false);
      setSelectedMember(null);
    } catch (error: any) {
      console.error('Failed to update member role:', error);
      toast.error(error?.message || 'Có lỗi xảy ra. Vui lòng thử lại.');
    }
  };

  const handleRemoveMember = async () => {
    if (!selectedMember || !companyId) return;

    try {
      await companyService.removeMember(companyId, selectedMember.id);

      // Refresh members list
      const membersList = await companyService.getCompanyMembers(companyId);
      setMembers(membersList);

      const memberUser = selectedMember.user;
      toast.success(`Đã xóa ${memberUser?.fullName || 'thành viên'} khỏi team`);
      setIsDeleteModalOpen(false);
      setSelectedMember(null);
    } catch (error: any) {
      console.error('Failed to remove member:', error);
      toast.error(error?.message || 'Có lỗi xảy ra. Vui lòng thử lại.');
    }
  };

  if (!companyId) {
    return (
      <div className="p-6">
        <div className="max-w-6xl mx-auto">
          <Card className="glassmorphism">
            <div className="p-12 text-center">
              <WarningOutlined className="text-5xl text-gray-400 mx-auto mb-4" />
              <h2 className="text-lg text-gray-900 mb-2">Không tìm thấy công ty</h2>
              <p className="text-base text-gray-600">Bạn chưa thuộc công ty nào.</p>
            </div>
          </Card>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="max-w-6xl mx-auto">
          <Card className="glassmorphism">
            <div className="p-12 text-center">
              <Spin size="large" className="mb-4" />
              <p className="text-base text-gray-600">Đang tải danh sách thành viên...</p>
            </div>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Quản lý thành viên</h1>
            <p className="text-base text-gray-600">Quản lý thành viên và phân quyền trong công ty</p>
          </div>

          {canManageMembers && (
            <Button icon={<UserAddOutlined />} onClick={() => setIsInviteModalOpen(true)}>
              Mời thành viên
            </Button>
          )}
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="glassmorphism" styles={{ body: { padding: '24px' } }}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Tổng thành viên</p>
                <p className="text-xl font-bold text-gray-900">{totalMembers}</p>
              </div>
              <UserOutlined className="text-3xl text-blue-600" />
            </div>
          </Card>

          <Card className="glassmorphism" styles={{ body: { padding: '24px' } }}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Owners</p>
                <p className="text-xl font-bold text-gray-900">{ownerCount}</p>
              </div>
              <CrownOutlined className="text-3xl text-purple-600" />
            </div>
          </Card>

          <Card className="glassmorphism" styles={{ body: { padding: '24px' } }}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Managers</p>
                <p className="text-xl font-bold text-gray-900">{managerCount}</p>
              </div>
              <SafetyOutlined className="text-3xl text-blue-600" />
            </div>
          </Card>

          <Card className="glassmorphism" styles={{ body: { padding: '24px' } }}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Recruiters</p>
                <p className="text-xl font-bold text-gray-900">{recruiterCount}</p>
              </div>
              <UserSwitchOutlined className="text-3xl text-green-600" />
            </div>
          </Card>
        </div>

        {/* Filters */}
        <Card
          className="glassmorphism"
          title={<span className="text-lg font-semibold">Danh sách thành viên</span>}
          styles={{ body: { padding: '24px' } }}
        >
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <Input
              placeholder="Tìm theo tên hoặc email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              prefix={<SearchOutlined className="text-gray-400" />}
              className="flex-1"
              size="large"
            />

            <Select
              value={roleFilter}
              onChange={setRoleFilter}
              className="w-full sm:w-[200px]"
              size="large"
            >
              <Select.Option value="all">Tất cả vai trò</Select.Option>
              <Select.Option value={CompanyRole.OWNER}>Owner</Select.Option>
              <Select.Option value={CompanyRole.MANAGER}>Manager</Select.Option>
              <Select.Option value={CompanyRole.RECRUITER}>Recruiter</Select.Option>
            </Select>
          </div>

          {/* Members List */}
          {filteredMembers.length > 0 ? (
            <div className="space-y-3">
              {filteredMembers.map((member) => {
                const memberUser = member.user;
                if (!memberUser) return null;

                const RoleIcon = roleConfig[member.companyRole].icon;
                const isCurrentUser = memberUser.id === user?.id;
                const canEditMember = canManageMembers && !isCurrentUser && member.companyRole !== CompanyRole.OWNER;

                return (
                  <div
                    key={member.id}
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center gap-4 flex-1 min-w-0">
                      <Avatar
                        size={48}
                        src={memberUser.avatarUrl || undefined}
                        className="flex-shrink-0"
                      >
                        {memberUser.fullName?.split(' ').map(n => n[0]).join('') || '?'}
                      </Avatar>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="text-base font-medium text-gray-900 truncate">
                            {memberUser.fullName || 'Chưa cập nhật'}
                          </h3>
                          {isCurrentUser && (
                            <Tag color="default">Bạn</Tag>
                          )}
                        </div>
                        <p className="text-sm text-gray-600 truncate mb-2">{memberUser.email}</p>
                        <div className="flex items-center gap-2">
                          <Tag color={roleConfig[member.companyRole].color} icon={<RoleIcon />}>
                            {roleConfig[member.companyRole].label}
                          </Tag>
                          <span className="text-xs text-gray-500">
                            Tham gia {formatDistanceToNow(new Date(member.createdAt), {
                              addSuffix: true,
                              locale: vi
                            })}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    {canEditMember && (
                      <div className="flex items-center gap-2 flex-shrink-0 ml-4">
                        <Button
                          size="small"
                          icon={<SafetyOutlined />}
                          onClick={() => {
                            setSelectedMember(member);
                            setIsChangeRoleModalOpen(true);
                          }}
                        >
                          Đổi vai trò
                        </Button>
                        <Button
                          size="small"
                          danger
                          icon={<DeleteOutlined />}
                          onClick={() => {
                            setSelectedMember(member);
                            setIsDeleteModalOpen(true);
                          }}
                        />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-12">
              <UserOutlined className="text-5xl text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg text-gray-900 mb-2">Không tìm thấy thành viên</h3>
              <p className="text-base text-gray-600 mb-4">
                {searchTerm || roleFilter !== 'all'
                  ? 'Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm'
                  : 'Chưa có thành viên nào trong công ty'}
              </p>
            </div>
          )}
        </Card>

        {/* Invite Modal */}
        <Modal
          open={isInviteModalOpen}
          onCancel={() => setIsInviteModalOpen(false)}
          title="Mời thành viên mới"
          footer={[
            <Button key="cancel" onClick={() => setIsInviteModalOpen(false)}>
              Hủy
            </Button>,
            <Button key="invite" type="primary" onClick={handleInvite}>
              Gửi lời mời
            </Button>,
          ]}
          width={500}
        >
          <p className="text-sm text-gray-600 mb-4">Gửi lời mời tham gia công ty qua email</p>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-900 mb-2 block">Email</label>
              <Input
                type="email"
                placeholder="email@example.com"
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
                prefix={<MailOutlined className="text-gray-400" />}
              />
            </div>

            <div>
              <label className="text-sm font-medium text-gray-900 mb-2 block">Vai trò</label>
              <Select
                value={inviteRole}
                onChange={(value) => setInviteRole(value as CompanyRole)}
                className="w-full"
              >
                <Select.Option value={CompanyRole.RECRUITER}>
                  <div className="flex items-center gap-2">
                    <UserSwitchOutlined />
                    <div>
                      <p className="font-medium">Recruiter</p>
                      <p className="text-xs text-gray-500">Quản lý tuyển dụng</p>
                    </div>
                  </div>
                </Select.Option>
                <Select.Option value={CompanyRole.MANAGER}>
                  <div className="flex items-center gap-2">
                    <SafetyOutlined />
                    <div>
                      <p className="font-medium">Manager</p>
                      <p className="text-xs text-gray-500">Quản lý team</p>
                    </div>
                  </div>
                </Select.Option>
              </Select>
            </div>
          </div>
        </Modal>

        {/* Change Role Modal */}
        <Modal
          open={isChangeRoleModalOpen}
          onCancel={() => setIsChangeRoleModalOpen(false)}
          title="Thay đổi vai trò"
          footer={null}
          width={500}
        >
          <p className="text-sm text-gray-600 mb-4">Chọn vai trò mới cho thành viên</p>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Thay đổi vai trò</DialogTitle>
              <DialogDescription>
                Chọn vai trò m���i cho thành viên
              </DialogDescription>
            </DialogHeader>

            {selectedMember && (
              <div className="space-y-4">
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-sm text-gray-600 mb-1">Thành viên</p>
                  <p className="text-base font-medium text-gray-900">
                    {selectedMember.user?.fullName || 'Chưa cập nhật'}
                  </p>
                </div>

                <div className="space-y-2">
                  {Object.entries(roleConfig).map(([role, config]) => {
                    if (role === CompanyRole.OWNER) return null;
                    const RoleIcon = config.icon;

                    return (
                      <button
                        key={role}
                        onClick={() => handleChangeRole(role as CompanyRole)}
                        className={`w-full p-4 border-2 rounded-lg text-left transition-colors hover:border-blue-500 ${selectedMember.companyRole === role ? 'border-blue-500 bg-blue-50' : 'border-gray-200'
                          }`}
                      >
                        <div className="flex items-start gap-3">
                          <RoleIcon className="text-lg mt-0.5" />
                          <div className="flex-1">
                            <p className="text-base font-medium text-gray-900 mb-1">{config.label}</p>
                            <p className="text-sm text-gray-600">{config.description}</p>
                          </div>
                          {selectedMember.companyRole === role && (
                            <Tag color="blue">Hiện tại</Tag>
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
        </Modal>

        {/* Delete Modal */}
        <Modal
          open={isDeleteModalOpen}
          onCancel={() => setIsDeleteModalOpen(false)}
          title="Xóa thành viên"
          footer={[
            <Button key="cancel" onClick={() => setIsDeleteModalOpen(false)}>
              Hủy
            </Button>,
            <Button key="delete" type="primary" danger onClick={handleRemoveMember}>
              Xóa thành viên
            </Button>,
          ]}
          width={500}
        >
          <p className="text-sm text-gray-600 mb-4">Xác nhận xóa thành viên khỏi công ty</p>
          {selectedMember && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex gap-3">
              <WarningOutlined className="text-lg text-red-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-base font-medium text-gray-900 mb-1">Bạn có chắc chắn?</p>
                <p className="text-sm text-gray-600">
                  Thành viên <strong>{selectedMember.user?.fullName || 'thành viên'}</strong> sẽ
                  bị xóa khỏi công ty và mất tất cả quyền truy cập.
                </p>
              </div>
            </div>
          )}
        </Modal>
      </div>
    </div>
  );
}