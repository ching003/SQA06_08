import { Link } from 'react-router';
import { Button } from 'antd';
import { HomeOutlined } from '@ant-design/icons';

export function NotFoundPage() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="text-center">
        <h1 className="text-6xl font-bold text-gray-900 mb-4">404</h1>
        <h2 className="text-2xl font-semibold text-gray-900 mb-4">Không tìm thấy trang</h2>
        <p className="text-base text-gray-600 mb-8">
          Trang bạn đang tìm kiếm không tồn tại hoặc đã bị di chuyển.
        </p>
        <Link to="/">
          <Button type="primary" size="large" icon={<HomeOutlined />}>
            Về trang chủ
          </Button>
        </Link>
      </div>
    </div>
  );
}
