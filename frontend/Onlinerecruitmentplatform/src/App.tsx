import React from 'react';
import { RouterProvider } from 'react-router';
import { ConfigProvider, theme } from 'antd';
import viVN from 'antd/locale/vi_VN';
import { AuthProvider } from './contexts/AuthContext';
import { NotificationProvider } from './contexts/NotificationContext';
import { CompanyRealtimeProvider } from './contexts/CompanyRealtimeContext';
import { router } from './utils/routes.tsx';

export default function App() {
  return (
    <ConfigProvider
      locale={viVN}
      theme={{
        token: {
          colorPrimary: '#1890ff',
          colorSuccess: '#52c41a',
          colorWarning: '#faad14',
          colorError: '#ff4d4f',
          colorInfo: '#1890ff',
          borderRadius: 6,
          fontSize: 14,
        },
        algorithm: theme.defaultAlgorithm,
      }}
    >
      <AuthProvider>
        <NotificationProvider>
          <CompanyRealtimeProvider>
            <RouterProvider router={router} />
          </CompanyRealtimeProvider>
        </NotificationProvider>
      </AuthProvider>
    </ConfigProvider>
  );
}
