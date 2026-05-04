import { Link, useLocation } from 'react-router';
import {
  DashboardOutlined,
  ProjectOutlined,
  FileTextOutlined,
  BookOutlined,
  TeamOutlined,
  ShopOutlined,
} from '@ant-design/icons';

interface BottomNavItem {
  label: string;
  icon: React.ComponentType<any>;
  path: string;
}

interface BottomNavProps {
  items: BottomNavItem[];
}

export function BottomNav({ items }: BottomNavProps) {
  const location = useLocation();

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-white/70 backdrop-blur-md border-t border-white/30 z-40 w-full">
      <div className="flex items-center justify-around h-20 w-full">
        {items.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path || location.pathname.startsWith(item.path + '/');

          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex flex-col items-center justify-center py-2 px-1 flex-1 h-full transition-all duration-200 ${
                isActive
                  ? 'text-blue-600'
                  : 'text-gray-600 hover:text-gray-900'
              } ${isActive ? 'border-t-4 border-blue-600' : 'border-t-4 border-transparent'}`}
              aria-current={isActive ? 'page' : undefined}
              title={item.label}
            >
              <Icon className={`transition-all duration-200 ${isActive ? 'text-xl' : 'text-lg'}`} />
              <span className="text-[10px] font-medium truncate mt-0.5 max-w-full">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
