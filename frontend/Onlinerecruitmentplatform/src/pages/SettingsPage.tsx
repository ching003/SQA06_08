import React from 'react';
import { useNavigate } from 'react-router';
import { Card, Button, Typography } from 'antd';
import { RightOutlined, SettingOutlined } from '@ant-design/icons';

const { Text } = Typography;

export function SettingsPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-gray-600 mb-8">
          <button
            onClick={() => navigate(-1)}
            className="hover:text-blue-600"
          >
            Quay lại
          </button>
          <RightOutlined className="text-xs" />
          <span className="text-gray-900">Cài đặt</span>
        </div>

        {/* Header */}
        <div className="mb-6">
          <h1 className="text-gray-900 mb-2">Cài đặt</h1>
          <p className="text-gray-600">
            Quản lý các cài đặt của ứng dụng
          </p>
        </div>

        <Card
          title={
            <span className="flex items-center gap-2">
              <SettingOutlined />
              Cài đặt chung
            </span>
          }
          styles={{ body: { padding: '48px', textAlign: 'center' } }}
        >
          <Text type="secondary" className="block mb-4">
            Tính năng đang được phát triển
          </Text>
          <SettingOutlined className="text-6xl text-gray-400 mb-4" />
          <h3 className="text-gray-900 mb-2">Đang phát triển</h3>
          <p className="text-gray-600 mb-6">
            Trang cài đặt đang được phát triển. Vui lòng quay lại sau!
          </p>
          <div className="flex gap-3 justify-center">
            <Button onClick={() => navigate(-1)}>
              Quay lại
            </Button>
            <Button type="primary" onClick={() => navigate('/profile')}>
              Đi đến hồ sơ
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
}
