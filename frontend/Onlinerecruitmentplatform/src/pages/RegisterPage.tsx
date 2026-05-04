import { useState } from 'react';
import { Link, useNavigate } from 'react-router';
import { Card, Input, Button, Typography } from 'antd';
import { UserOutlined, ProjectOutlined } from '@ant-design/icons';
import { useAuth } from '../contexts/AuthContext';
import { UserRole } from '../lib/types';
import { toast } from 'sonner';

const { Title, Text } = Typography;
const { Password } = Input;

export function RegisterPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      toast.error('Mật khẩu xác nhận không khớp');
      return;
    }

    if (password.length < 6) {
      toast.error('Mật khẩu phải có ít nhất 6 ký tự');
      return;
    }

    setIsLoading(true);

    try {
      const result = await register(email, password, fullName, UserRole.CANDIDATE);
      if (result.success) {
        toast.success('Đăng ký thành công!');
        navigate('/candidate/dashboard');
      } else {
        toast.error(result.error || 'Đăng ký thất bại. Vui lòng thử lại.');
      }
    } catch (error) {
      toast.error('Đã có lỗi xảy ra. Vui lòng thử lại.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">

          <Title level={2} className="mb-2! text-gray-900!">Đăng ký tài khoản</Title>
          <Text className="text-gray-600">Bắt đầu hành trình của bạn</Text>
        </div>

        <Card className="glassmorphism">


          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Text className="block mb-2 font-medium">Họ và tên</Text>
              <Input
                type="text"
                placeholder="Nguyễn Văn A"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
                size="large"
              />
            </div>

            <div>
              <Text className="block mb-2 font-medium">Email</Text>
              <Input
                type="email"
                placeholder="your@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                size="large"
              />
            </div>

            <div>
              <Text className="block mb-2 font-medium">Mật khẩu</Text>
              <Password
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                size="large"
              />
            </div>

            <div>
              <Text className="block mb-2 font-medium">Xác nhận mật khẩu</Text>
              <Password
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                size="large"
              />
            </div>

            <Button
              type="primary"
              htmlType="submit"
              block
              size="large"
              loading={isLoading}
            >
              {isLoading ? 'Đang đăng ký...' : 'Đăng ký'}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <Text type="secondary">
              Đã có tài khoản?{' '}
              <Link to="/login" className="text-blue-600 hover:underline">
                Đăng nhập
              </Link>
            </Text>
          </div>


          <div className="mt-6 p-4 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg text-center">
            <Text type="secondary" className="block mb-2 text-gray-700">
              Bạn là nhà tuyển dụng?
            </Text>
            <Text className="text-gray-600 text-sm">
              Hãy đăng ký tài khoản sau đó đăng ký công ty ngay!
            </Text>
          </div>
        </Card>
      </div>
    </div>
  );
}
