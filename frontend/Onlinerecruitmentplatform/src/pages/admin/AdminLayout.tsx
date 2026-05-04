import { Link, Outlet, useLocation, useNavigate } from 'react-router';
import { useAuth } from '../../contexts/AuthContext';
import { UserRole } from '../../lib/types';
import { BottomNav } from '../../components/BottomNav';
import {
  DashboardOutlined,
  ShopOutlined,
  ProjectOutlined,
  UserOutlined,
  FileTextOutlined,
  SafetyOutlined,
  SettingOutlined,
  LogoutOutlined,
  DownOutlined,
} from '@ant-design/icons';
import { Dropdown, Avatar } from 'antd';
import { toast } from 'sonner';

export function AdminLayout() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  // Redirect if not admin
  if (user?.role !== UserRole.ADMIN) {
    return null;
  }

  const menuItems = [
    {
      label: 'Dashboard',
      icon: DashboardOutlined,
      path: '/admin/dashboard',
    },
    {
      label: 'Quản lý công ty',
      icon: ShopOutlined,
      path: '/admin/companies',
    },
    {
      label: 'Quản lý việc làm',
      icon: ProjectOutlined,
      path: '/admin/jobs',
    },
    {
      label: 'Quản lý người dùng',
      icon: UserOutlined,
      path: '/admin/users',
    },
    {
      label: 'Mẫu CV',
      icon: FileTextOutlined,
      path: '/admin/cv-templates',
    },
  ];

  const handleLogout = () => {
    logout();
    toast.success('Đã đăng xuất thành công');
    navigate('/');
  };

  return (
    <div className="min-h-screen flex flex-col lg:flex-row">
      {/* Sidebar - Desktop */}
      <aside className="hidden lg:flex lg:flex-col lg:w-64 glassmorphism border-r border-white/30">
        {/* Logo & Admin Badge */}
        <div className="p-6 border-b border-gray-200">
          <Link to="/admin/dashboard" className="flex items-center gap-3 mb-4">
            <div className="h-16 w-16 rounded-lg flex items-center justify-center overflow-hidden flex-shrink-0">
              <img src="/logo.jpg" alt="JobsConnect" className="h-full w-full object-contain" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-gray-900 truncate font-semibold">JobsConnect</p>
              <p className="text-gray-600 truncate text-sm">Quản trị viên</p>
            </div>
          </Link>

          <div className="bg-purple-50 rounded-lg p-3">
            <div className="mb-1">
              <p className="text-base text-gray-900 truncate font-medium">Quản trị viên</p>
            </div>
            <p className="text-sm text-gray-600">Toàn quyền hệ thống</p>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path || location.pathname.startsWith(item.path + '/');

            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors text-base ${isActive
                  ? 'bg-purple-50 text-purple-700'
                  : 'text-gray-700 hover:bg-gradient-to-br from-blue-100 via-blue-200 to-blue-300'
                  }`}
              >
                <Icon className="text-lg" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* User Menu */}
        <div className="p-4 border-t border-gray-200">
          <Dropdown
            menu={{
              items: [
                {
                  key: 'account',
                  label: 'Tài khoản',
                  type: 'group',
                },
                {
                  key: 'settings',
                  label: 'Cài đặt',
                  icon: <SettingOutlined />,
                  onClick: () => navigate('/profile'),
                },
                {
                  type: 'divider',
                },
                {
                  key: 'logout',
                  label: 'Đăng xuất',
                  icon: <LogoutOutlined />,
                  danger: true,
                  onClick: handleLogout,
                },
              ],
            }}
            trigger={['click']}
            placement="topRight"
          >
            <button className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gradient-to-br from-blue-100 via-blue-200 to-blue-300 transition-colors">
              <Avatar
                size={36}
                src={user?.avatarUrl}
                className="bg-purple-600"
              >
                {user?.fullName?.split(' ').map(n => n[0]).join('') || '?'}
              </Avatar>
              <div className="flex-1 text-left min-w-0">
                <p className="text-base text-gray-900 truncate">{user?.fullName || 'Chưa cập nhật'}</p>
                <p className="text-sm text-gray-600 truncate">{user?.email}</p>
              </div>
              <DownOutlined className="text-base text-gray-400" />
            </button>
          </Dropdown>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto lg:pb-0 pb-20">
        <Outlet />
      </main>

      {/* Bottom Navigation for Mobile */}
      <BottomNav items={menuItems} />
    </div>
  );
}
