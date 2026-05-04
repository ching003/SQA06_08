import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { Card, Button, Spin, Typography } from 'antd';
import {
  ShopOutlined, ProjectOutlined, UserOutlined, FileTextOutlined, RiseOutlined,
  WarningOutlined, CheckCircleOutlined, ClockCircleOutlined, RightOutlined, ReloadOutlined
} from '@ant-design/icons';
import { CompanyStatus, JobStatus, UserRole, NotificationType } from '../../lib/types';
import { companyService, jobService, userService, cvTemplateService, notificationService, adminService } from '../../api/services';
import { formatDistanceToNow } from 'date-fns';
import { vi } from 'date-fns/locale';

interface DashboardStats {
  totalCompanies: number;
  pendingCompanies: number;
  totalJobs: number;
  pendingJobs: number;
  totalUsers: number;
  candidateCount: number;
  recruiterCount: number;
  totalCVTemplates: number;
  activeCVTemplates: number;
}

interface RecentActivity {
  id: string;
  type: 'company' | 'job' | 'user' | 'application';
  title: string;
  description: string;
  time: string;
  icon: typeof ShopOutlined;
  color: string;
  action: 'pending' | 'completed';
}

export function AdminDashboard() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [stats, setStats] = useState<DashboardStats>({
    totalCompanies: 0,
    pendingCompanies: 0,
    totalJobs: 0,
    pendingJobs: 0,
    totalUsers: 0,
    candidateCount: 0,
    recruiterCount: 0,
    totalCVTemplates: 0,
    activeCVTemplates: 0,
  });
  const [recentActivities, setRecentActivities] = useState<RecentActivity[]>([]);

  const fetchDashboardData = async (showRefreshIndicator = false) => {
    try {
      if (showRefreshIndicator) {
        setIsRefreshing(true);
      } else {
        setIsLoading(true);
      }

      // Fetch all data in parallel
      const [
        companiesResponse,
        pendingCompaniesResponse,
        jobsResponse,
        pendingJobsResponse,
        usersResponse,
        cvTemplatesResponse,
        notificationsResponse,
      ] = await Promise.all([
        companyService.getCompanies({ page: 1, limit: 1 }).catch(() => ({ items: [], pagination: { total: 0 } })),
        companyService.getCompanies({ page: 1, limit: 10 }).catch(() => ({ items: [], pagination: { total: 0 } })),
        jobService.getJobs({ page: 1, limit: 1 }).catch(() => ({ items: [], pagination: { total: 0 } })),
        jobService.getJobs({ page: 1, limit: 10 }).catch(() => ({ items: [], pagination: { total: 0 } })),
        userService.getAllUsers({ page: 1, limit: 100 }).catch(() => ({ users: [], pagination: { total: 0 } })),
        cvTemplateService.getTemplates({ page: 1, limit: 100 }).catch(() => ({ items: [], pagination: { total: 0 } })),
        notificationService.getMyNotifications({ page: 1, limit: 10 }).catch(() => ({ items: [] })),
      ]);

      // Calculate pending counts from actual data
      const pendingCompanies = pendingCompaniesResponse.items?.filter(
        (c: any) => c.status === CompanyStatus.PENDING
      ).length || 0;

      const pendingJobs = pendingJobsResponse.items?.filter(
        (j: any) => j.status === JobStatus.PENDING
      ).length || 0;

      // Count users by role
      const users = usersResponse.users || [];
      const candidateCount = users.filter((u: any) => u.role === UserRole.CANDIDATE).length;
      const recruiterCount = users.filter((u: any) => u.role === UserRole.RECRUITER).length;

      // CV Templates stats
      const cvTemplates = cvTemplatesResponse.items || [];
      const activeCVTemplates = cvTemplates.filter((t: any) => t.isActive).length;

      setStats({
        totalCompanies: companiesResponse.pagination?.total || companiesResponse.items?.length || 0,
        pendingCompanies,
        totalJobs: jobsResponse.pagination?.total || jobsResponse.items?.length || 0,
        pendingJobs,
        totalUsers: usersResponse.pagination?.total || users.length,
        candidateCount,
        recruiterCount,
        totalCVTemplates: cvTemplates.length,
        activeCVTemplates,
      });

      // Fetch recent activities from API
      try {
        const activitiesResponse = await adminService.getRecentActivities(3);
        const activities: RecentActivity[] = activitiesResponse.activities.map((activity) => {
          let icon = ShopOutlined;
          let color = 'text-blue-600';
          let action: RecentActivity['action'] = 'completed';

          switch (activity.type) {
            case 'company_registered':
              icon = ShopOutlined;
              color = 'text-blue-600';
              action = 'pending';
              break;
            case 'job_posted':
              icon = ProjectOutlined;
              color = 'text-green-600';
              action = 'pending';
              break;
            case 'application':
              icon = FileTextOutlined;
              color = 'text-purple-600';
              action = 'completed';
              break;
            default:
              icon = UserOutlined;
              color = 'text-gray-600';
          }

          return {
            id: activity.id,
            type: 'company', // generic fallback or map correctly if RecentActivity type allows string
            title: activity.title,
            description: activity.description,
            time: activity.timestamp
              ? formatDistanceToNow(new Date(activity.timestamp), { addSuffix: true, locale: vi })
              : '',
            icon,
            color,
            action,
          };
        });
        setRecentActivities(activities);
      } catch (error) {
        console.error('Failed to fetch recent activities:', error);
      }
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const handleRefresh = () => {
    fetchDashboardData(true);
  };

  const statCards = [
    {
      title: 'Công ty',
      value: stats.totalCompanies,
      subtitle: `${stats.pendingCompanies} chờ duyệt`,
      icon: ShopOutlined,
      color: 'bg-blue-100',
      iconColor: 'text-blue-600',
      link: '/admin/companies',
      hasPending: stats.pendingCompanies > 0,
    },
    {
      title: 'Việc làm',
      value: stats.totalJobs,
      subtitle: `${stats.totalJobs} tin tuyển dụng`,
      icon: ProjectOutlined,
      color: 'bg-green-100',
      iconColor: 'text-green-600',
      link: '/admin/jobs',
      hasPending: stats.pendingJobs > 0,
    },
    {
      title: 'Người dùng',
      value: stats.totalUsers,
      subtitle: `${stats.candidateCount} ứng viên, ${stats.recruiterCount} NTD`,
      icon: UserOutlined,
      color: 'bg-purple-100',
      iconColor: 'text-purple-600',
      link: '/admin/users',
      hasPending: false,
    },
    {
      title: 'Mẫu CV',
      value: stats.totalCVTemplates,
      subtitle: `${stats.activeCVTemplates} đang hoạt động`,
      icon: FileTextOutlined,
      color: 'bg-orange-100',
      iconColor: 'text-orange-600',
      link: '/admin/cv-templates',
      hasPending: false,
    },
  ];

  if (isLoading) {
    return (
      <div className="min-h-screen py-8 flex items-center justify-center">
        <div className="text-center">
          <Spin size="large" className="mb-4" />
          <p className="text-base text-gray-600">Đang tải dữ liệu...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-8">
      <div className="max-w-6xl mx-auto px-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Admin Dashboard</h1>
            <p className="text-base text-gray-600">
              Tổng quan và quản lý hệ thống JobsConnect
            </p>
          </div>
          <Button
            icon={<ReloadOutlined spin={isRefreshing} />}
            onClick={handleRefresh}
            loading={isRefreshing}
          >
            Làm mới
          </Button>
        </div>

        {/* Stats Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-3 mb-8">
          {statCards.map((stat) => {
            const Icon = stat.icon;
            return (
              <Card
                key={stat.title}
                className="glassmorphism hover:shadow-md transition-shadow cursor-pointer relative max-w-[150px] mx-auto"
                onClick={() => navigate(stat.link)}
                styles={{ body: { padding: '16px 12px' } }}
              >
                {stat.hasPending && (
                  <div className="absolute top-2 right-2">
                    <span className="flex h-3 w-3">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-yellow-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-3 w-3 bg-yellow-500"></span>
                    </span>
                  </div>
                )}
                <div className="flex flex-col items-center text-center">
                  <div className={`h-10 w-10 ${stat.color} rounded-lg flex items-center justify-center mb-2`}>
                    <Icon className={`text-lg ${stat.iconColor}`} />
                  </div>
                  <p className="text-xs text-gray-600 mb-1">{stat.title}</p>
                  <p className="text-3xl font-bold text-gray-900 mb-1">{stat.value}</p>
                  <p className="text-xs text-gray-500">{stat.subtitle}</p>
                </div>
              </Card>
            );
          })}
        </div>

        {/* Quick Actions */}
        <Card className="glassmorphism mb-20" title={<span className="text-lg font-semibold">Thao tác nhanh</span>} styles={{ body: { padding: '24px' } }}>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div
              className="bg-white rounded-lg p-4 border border-gray-200 hover:shadow-md transition-shadow cursor-pointer"
              onClick={() => navigate('/admin/companies?tab=pending')}
            >
              <div className="flex items-center gap-3 mb-3">
                <div className="h-10 w-10 bg-yellow-50 rounded-lg flex items-center justify-center">
                  <ClockCircleOutlined className="text-lg text-yellow-600" />
                </div>
                <span className="text-base font-semibold text-gray-900">Duyệt công ty</span>
              </div>
              <p className="text-sm text-gray-600">{stats.pendingCompanies} công ty chờ duyệt</p>
            </div>

            <div
              className="bg-white rounded-lg p-4 border border-gray-200 hover:shadow-md transition-shadow cursor-pointer"
              onClick={() => navigate('/admin/jobs')}
            >
              <div className="flex items-center gap-3 mb-3">
                <div className="h-10 w-10 bg-green-50 rounded-lg flex items-center justify-center">
                  <ProjectOutlined className="text-lg text-green-600" />
                </div>
                <span className="text-base font-semibold text-gray-900">Quản lý việc làm</span>
              </div>
              <p className="text-sm text-gray-600">{stats.totalJobs} tin tuyển dụng</p>
            </div>

            <div
              className="bg-white rounded-lg p-4 border border-gray-200 hover:shadow-md transition-shadow cursor-pointer"
              onClick={() => navigate('/admin/users')}
            >
              <div className="flex items-center gap-3 mb-3">
                <div className="h-10 w-10 bg-purple-50 rounded-lg flex items-center justify-center">
                  <UserOutlined className="text-lg text-purple-600" />
                </div>
                <span className="text-base font-semibold text-gray-900">Quản lý người dùng</span>
              </div>
              <p className="text-sm text-gray-600">{stats.totalUsers} người dùng</p>
            </div>

            <div
              className="bg-white rounded-lg p-4 border border-gray-200 hover:shadow-md transition-shadow cursor-pointer"
              onClick={() => navigate('/admin/cv-templates')}
            >
              <div className="flex items-center gap-3 mb-3">
                <div className="h-10 w-10 bg-orange-50 rounded-lg flex items-center justify-center">
                  <FileTextOutlined className="text-lg text-orange-600" />
                </div>
                <span className="text-base font-semibold text-gray-900">Quản lý mẫu CV</span>
              </div>
              <p className="text-sm text-gray-600">{stats.totalCVTemplates} mẫu CV</p>
            </div>
          </div>
        </Card>

        <div className="grid lg:grid-cols-2 gap-8 mt-8">
          {/* Recent Activities */}
          <Card
            className="glassmorphism"
            title={
              <div className="flex items-center justify-between">
                <span className="text-lg font-semibold">Hoạt động gần đây</span>
                <Button type="text" size="small" onClick={() => navigate('/admin/notifications')}>
                  Xem tất cả
                </Button>
              </div>
            }
            styles={{ body: { padding: '24px' } }}
          >
            {recentActivities.length > 0 ? (
              <div className="space-y-4">
                {recentActivities.map((activity) => {
                  const Icon = activity.icon;
                  return (
                    <div key={activity.id} className="flex gap-4">
                      <div className={`h-10 w-10 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0`}>
                        <Icon className={`text-lg ${activity.color}`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between mb-1">
                          <p className="text-base font-medium text-gray-900">{activity.title}</p>
                          {activity.action === 'pending' && (
                            <WarningOutlined className="text-base text-yellow-600 flex-shrink-0 ml-2" />
                          )}
                          {activity.action === 'completed' && (
                            <CheckCircleOutlined className="text-base text-green-600 flex-shrink-0 ml-2" />
                          )}
                        </div>
                        <p className="text-sm text-gray-600 truncate">{activity.description}</p>
                        <p className="text-xs text-gray-500 mt-1">{activity.time}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <WarningOutlined className="text-4xl mx-auto mb-4 text-gray-300" />
                <p className="text-base">Chưa có hoạt động nào</p>
              </div>
            )}
          </Card>

          {/* System Overview */}
          <Card
            className="glassmorphism"
            title={<span className="text-lg font-semibold">Tổng quan hệ thống</span>}
            styles={{ body: { padding: '24px' } }}
          >
            <div className="space-y-6">
              {/* User Distribution */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-600">Phân bố người dùng</span>
                </div>
                <div className="flex gap-2">
                  <div
                    className="h-3 bg-purple-600 rounded-l-full transition-all"
                    style={{ width: `${stats.totalUsers > 0 ? (stats.candidateCount / stats.totalUsers * 100) : 0}%` }}
                    title={`Ứng viên: ${stats.candidateCount}`}
                  />
                  <div
                    className="h-3 bg-blue-600 rounded-r-full transition-all"
                    style={{ width: `${stats.totalUsers > 0 ? (stats.recruiterCount / stats.totalUsers * 100) : 0}%` }}
                    title={`Nhà tuyển dụng: ${stats.recruiterCount}`}
                  />
                </div>
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>Ứng viên: {stats.candidateCount}</span>
                  <span>NTD: {stats.recruiterCount}</span>
                </div>
              </div>

              {/* Company Status */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-600">Trạng thái công ty</span>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-green-50 rounded-lg p-3">
                    <div className="flex items-center gap-2">
                      <CheckCircleOutlined className="text-base text-green-600" />
                      <span className="text-sm text-gray-600">Đã duyệt</span>
                    </div>
                    <p className="text-xl font-bold text-green-600 mt-1">
                      {stats.totalCompanies - stats.pendingCompanies}
                    </p>
                  </div>
                  <div className="bg-yellow-50 rounded-lg p-3">
                    <div className="flex items-center gap-2">
                      <ClockCircleOutlined className="text-base text-yellow-600" />
                      <span className="text-sm text-gray-600">Chờ duyệt</span>
                    </div>
                    <p className="text-xl font-bold text-yellow-600 mt-1">
                      {stats.pendingCompanies}
                    </p>
                  </div>
                </div>
              </div>

              {/* Jobs & CV Templates */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-600">Việc làm & Mẫu CV</span>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-green-50 rounded-lg p-3">
                    <div className="flex items-center gap-2">
                      <ProjectOutlined className="text-base text-green-600" />
                      <span className="text-sm text-gray-600">Tổng số việc làm</span>
                    </div>
                    <p className="text-xl font-bold text-green-600 mt-1">
                      {stats.totalJobs}
                    </p>
                  </div>
                  <div className="bg-yellow-50 rounded-lg p-3">
                    <div className="flex items-center gap-2">
                      <FileTextOutlined className="text-base text-yellow-600" />
                      <span className="text-sm text-gray-600">Tổng số mẫu CV</span>
                    </div>
                    <p className="text-xl font-bold text-yellow-600 mt-1">
                      {stats.totalCVTemplates}
                    </p>
                  </div>
                </div>
              </div>

            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
