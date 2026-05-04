import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router';
import { Card, Input, Button, Modal, Tabs, Typography } from 'antd';
import {
  ProjectOutlined, EyeOutlined, EyeInvisibleOutlined, CopyOutlined, CheckOutlined,
  UserOutlined, SafetyOutlined, TeamOutlined, UnorderedListOutlined
} from '@ant-design/icons';
import { useAuth } from '../contexts/AuthContext';
import { UserRole } from '../lib/types';
import { toast } from 'sonner';

const { Title, Text } = Typography;
const { Password } = Input;

// Demo accounts data
const demoAccounts = {
  admin: [
    { email: 'admin@jobsconnect.com', password: 'admin123', name: 'Admin 1' },
    { email: 'admin2@jobsconnect.com', password: 'admin123', name: 'Admin 2' },
  ],
  recruiter: [
    { email: 'hr.manager@fpt.com.vn', password: 'password123', name: 'FPT Software' },
    { email: 'recruitment@vng.com.vn', password: 'password123', name: 'VNG Corporation' },
    { email: 'talent@techcombank.com.vn', password: 'password123', name: 'Techcombank' },
    { email: 'hr@shopee.vn', password: 'password123', name: 'Shopee' },
    { email: 'founder@abcsolutions.vn', password: 'password123', name: 'ABC Solutions' },
  ],
  candidate: [
    { email: 'nguyenvanan@gmail.com', password: 'password123', name: 'Nguyễn Văn An' },
    { email: 'tranthimai@gmail.com', password: 'password123', name: 'Trần Thị Mai' },
    { email: 'levantung@gmail.com', password: 'password123', name: 'Lê Văn Tùng' },
    { email: 'phamthihuong@gmail.com', password: 'password123', name: 'Phạm Thị Hương' },
    { email: 'hoangvanduc@gmail.com', password: 'password123', name: 'Hoàng Văn Đức' },
    { email: 'ngothilan@gmail.com', password: 'password123', name: 'Ngô Thị Lan' },
    { email: 'dangvanhieu@gmail.com', password: 'password123', name: 'Đặng Văn Hiếu' },
    { email: 'buithithanh@gmail.com', password: 'password123', name: 'Bùi Thị Thanh' },
    { email: 'vovannam@gmail.com', password: 'password123', name: 'Võ Văn Nam' },
    { email: 'doanthikim@gmail.com', password: 'password123', name: 'Đoàn Thị Kim' },
  ],
};

export function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showAccountsDialog, setShowAccountsDialog] = useState(false);
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const { login } = useAuth();
  const navigate = useNavigate();

  const copyToClipboard = (text: string, fieldId: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(fieldId);
    toast.success('Đã copy!');
    setTimeout(() => setCopiedField(null), 2000);
  };

  const fillAndClose = (emailValue: string, passwordValue: string) => {
    setEmail(emailValue);
    setPassword(passwordValue);
    setShowAccountsDialog(false);
    toast.success('Đã điền thông tin đăng nhập');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const result = await login(email, password);

      if (result.success) {
        toast.success('Đăng nhập thành công!');
        // Redirect based on user role
        const storedUser = localStorage.getItem('currentUser');
        if (storedUser) {
          const user = JSON.parse(storedUser);
          if (user.role === 'RECRUITER') {
            navigate('/recruiter/dashboard');
          } else if (user.role === 'ADMIN') {
            navigate('/admin/dashboard');
          } else {
            navigate('/');
          }
        }
      } else {
        toast.error(result.error || 'Email hoặc mật khẩu không đúng');
      }
    } catch (error) {
      toast.error('Đã có lỗi xảy ra. Vui lòng thử lại.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-3 sm:px-4 py-8 sm:py-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-6 sm:mb-8">
          
          <Title level={2} className="!mb-2 !text-gray-900 !text-lg sm:!text-xl md:!text-2xl break-words px-2">
            Đăng nhập vào JobsConnect
          </Title>
          <Text className="text-gray-600 text-sm sm:text-base break-words px-2">
            Chào mừng bạn trở lại!
          </Text>
        </div>

        <Card className="glassmorphism shadow-xl overflow-hidden">
          

          <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5">
            <div>
              <Text className="block mb-2 font-medium text-sm sm:text-base">Email</Text>
              <Input
                type="email"
                placeholder="your@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                size="large"
                prefix={<UserOutlined className="text-gray-400" />}
                className="w-full"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <Text className="font-medium text-sm sm:text-base">Mật khẩu</Text>
                <Link to="/forgot-password" className="text-blue-600 hover:underline text-xs sm:text-sm">
                  Quên mật khẩu?
                </Link>
              </div>
              <Password
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                size="large"
                className="w-full"
                iconRender={(visible) => (visible ? <EyeOutlined /> : <EyeInvisibleOutlined />)}
              />
            </div>

            <Button
              type="primary"
              htmlType="submit"
              block
              size="large"
              loading={isLoading}
              className="mt-1 h-11 sm:h-12 text-base font-medium"
            >
              {isLoading ? 'Đang đăng nhập...' : 'Đăng nhập'}
            </Button>
          </form>

          <div className="mt-5 sm:mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300" />
              </div>
              <div className="relative flex justify-center">
                <span className="px-3 bg-white text-gray-500 text-xs sm:text-sm">
                  Demo accounts
                </span>
              </div>
            </div>

            <div className="mt-4 space-y-3">
              <Text type="secondary" className="block text-center text-xs sm:text-sm break-words px-2">
                Tài khoản demo để test:
              </Text>
              <div className="grid grid-cols-3 gap-2 sm:gap-3 md:gap-4">
                <Button
                  onClick={() => {
                    setEmail('nguyenvanan@gmail.com');
                    setPassword('password123');
                  }}
                  className="flex flex-col items-center justify-center h-24 py-3 sm:py-4 bg-white hover:bg-blue-50 border border-gray-200 hover:border-blue-300 transition-colors min-w-0 w-full"
                  size="middle"
                  style={{ wordBreak: 'break-word', overflow: 'hidden' }}
                >
                  <span className="text-xs sm:text-sm font-semibold leading-tight text-center w-full px-1.5 break-words text-blue-600">
                    Ứng viên
                  </span>
                  {/* <span className="text-[10px] sm:text-xs text-gray-500 mt-1 leading-tight text-center w-full px-1.5 break-words">
                    Nguyễn Văn An
                  </span> */}
                </Button>
                <Button
                  onClick={() => {
                    setEmail('hr.manager@fpt.com.vn');
                    setPassword('password123');
                  }}
                  className="flex flex-col items-center justify-center h-24 py-3 sm:py-4 bg-white hover:bg-blue-50 border border-gray-200 hover:border-blue-300 transition-colors min-w-0 w-full"
                  size="middle"
                  style={{ wordBreak: 'break-word', overflow: 'hidden' }}
                >
                  <span className="text-xs sm:text-sm font-semibold leading-tight text-center w-full px-1.5 break-words text-blue-600">
                    NTD
                  </span>
                  {/* <span className="text-[10px] sm:text-xs text-gray-500 mt-1 leading-tight text-center w-full px-1.5 break-words">
                    FPT Software
                  </span> */}
                </Button>
                <Button
                  onClick={() => {
                    setEmail('admin@jobsconnect.com');
                    setPassword('admin123');
                  }}
                  className="flex flex-col items-center justify-center h-24 py-3 sm:py-4 bg-white hover:bg-blue-50 border border-gray-200 hover:border-blue-300 transition-colors min-w-0 w-full"
                  size="middle"
                  style={{ wordBreak: 'break-word', overflow: 'hidden' }}
                >
                  <span className="text-xs sm:text-sm font-semibold leading-tight text-center w-full px-1.5 break-words text-blue-600">
                    Admin
                  </span>
                  {/* <span className="text-[10px] sm:text-xs text-gray-500 mt-1 leading-tight text-center w-full px-1.5 break-words">
                    Quản trị viên
                  </span> */}
                </Button>
              </div>
              <Button
                type="text"
                block
                size="small"
                className="text-blue-600 hover:text-blue-700 hover:bg-blue-50 mt-2 text-xs sm:text-sm break-words"
                onClick={() => setShowAccountsDialog(true)}
                icon={<UnorderedListOutlined />}
              >
                Xem tất cả tài khoản demo
              </Button>
            </div>
          </div>

          <div className="mt-5 sm:mt-6 text-center pt-4 ">
            <Text type="secondary" className="text-xs sm:text-sm md:text-base break-words px-2">
              Chưa có tài khoản?{' '}
              <Link to="/register" className="text-blue-600 hover:text-blue-700 hover:underline font-medium break-words">
                Đăng ký ngay
              </Link>
            </Text>
          </div>
        </Card>
      </div>

      {/* Demo Accounts Modal */}
      <Modal
        open={showAccountsDialog}
        onCancel={() => setShowAccountsDialog(false)}
        title={
          <div className="flex items-center gap-2">
            <TeamOutlined className="text-blue-600" />
            <span>Danh sách tài khoản demo</span>
          </div>
        }
        footer={null}
        width={800}
        className="max-h-[80vh]"
      >
        <Tabs
          defaultActiveKey="candidate"
          items={[
            {
              key: 'candidate',
              label: (
                <span className="flex items-center gap-2">
                  <UserOutlined />
                  Ứng viên ({demoAccounts.candidate.length})
                </span>
              ),
              children: (
                <div className="space-y-2 max-h-[50vh] overflow-y-auto">
                  {demoAccounts.candidate.map((account, index) => (
                    <div
                      key={`candidate-${index}`}
                      className="flex items-center justify-between p-3 bg-blue-50 rounded-lg border border-blue-100"
                    >
                      <div className="flex-1 min-w-0">
                        <Text strong className="block text-sm">{account.name}</Text>
                        <div className="flex items-center gap-2 mt-1">
                          <code className="text-xs bg-white px-2 py-0.5 rounded border">{account.email}</code>
                          <Button
                            type="text"
                            size="small"
                            onClick={() => copyToClipboard(account.email, `candidate-email-${index}`)}
                            icon={copiedField === `candidate-email-${index}` ? <CheckOutlined className="text-green-600" /> : <CopyOutlined />}
                          />
                        </div>
                        <div className="flex items-center gap-2 mt-1">
                          <code className="text-xs bg-white px-2 py-0.5 rounded border">{account.password}</code>
                          <Button
                            type="text"
                            size="small"
                            onClick={() => copyToClipboard(account.password, `candidate-pass-${index}`)}
                            icon={copiedField === `candidate-pass-${index}` ? <CheckOutlined className="text-green-600" /> : <CopyOutlined />}
                          />
                        </div>
                      </div>
                      <Button
                        size="small"
                        onClick={() => fillAndClose(account.email, account.password)}
                      >
                        Dùng
                      </Button>
                    </div>
                  ))}
                </div>
              ),
            },
            {
              key: 'recruiter',
              label: (
                <span className="flex items-center gap-2">
                  <ProjectOutlined />
                  NTD ({demoAccounts.recruiter.length})
                </span>
              ),
              children: (
                <div className="space-y-2 max-h-[50vh] overflow-y-auto">
                  {demoAccounts.recruiter.map((account, index) => (
                    <div
                      key={`recruiter-${index}`}
                      className="flex items-center justify-between p-3 bg-purple-50 rounded-lg border border-purple-100"
                    >
                      <div className="flex-1 min-w-0">
                        <Text strong className="block text-sm">{account.name}</Text>
                        <div className="flex items-center gap-2 mt-1">
                          <code className="text-xs bg-white px-2 py-0.5 rounded border truncate max-w-[200px]">{account.email}</code>
                          <Button
                            type="text"
                            size="small"
                            onClick={() => copyToClipboard(account.email, `recruiter-email-${index}`)}
                            icon={copiedField === `recruiter-email-${index}` ? <CheckOutlined className="text-green-600" /> : <CopyOutlined />}
                          />
                        </div>
                        <div className="flex items-center gap-2 mt-1">
                          <code className="text-xs bg-white px-2 py-0.5 rounded border">{account.password}</code>
                          <Button
                            type="text"
                            size="small"
                            onClick={() => copyToClipboard(account.password, `recruiter-pass-${index}`)}
                            icon={copiedField === `recruiter-pass-${index}` ? <CheckOutlined className="text-green-600" /> : <CopyOutlined />}
                          />
                        </div>
                      </div>
                      <Button
                        size="small"
                        onClick={() => fillAndClose(account.email, account.password)}
                      >
                        Dùng
                      </Button>
                    </div>
                  ))}
                </div>
              ),
            },
            {
              key: 'admin',
              label: (
                <span className="flex items-center gap-2">
                  <SafetyOutlined />
                  Admin ({demoAccounts.admin.length})
                </span>
              ),
              children: (
                <div className="space-y-2 max-h-[50vh] overflow-y-auto">
                  {demoAccounts.admin.map((account, index) => (
                    <div
                      key={`admin-${index}`}
                      className="flex items-center justify-between p-3 bg-red-50 rounded-lg border border-red-100"
                    >
                      <div className="flex-1 min-w-0">
                        <Text strong className="block text-sm">{account.name}</Text>
                        <div className="flex items-center gap-2 mt-1">
                          <code className="text-xs bg-white px-2 py-0.5 rounded border">{account.email}</code>
                          <Button
                            type="text"
                            size="small"
                            onClick={() => copyToClipboard(account.email, `admin-email-${index}`)}
                            icon={copiedField === `admin-email-${index}` ? <CheckOutlined className="text-green-600" /> : <CopyOutlined />}
                          />
                        </div>
                        <div className="flex items-center gap-2 mt-1">
                          <code className="text-xs bg-white px-2 py-0.5 rounded border">{account.password}</code>
                          <Button
                            type="text"
                            size="small"
                            onClick={() => copyToClipboard(account.password, `admin-pass-${index}`)}
                            icon={copiedField === `admin-pass-${index}` ? <CheckOutlined className="text-green-600" /> : <CopyOutlined />}
                          />
                        </div>
                      </div>
                      <Button
                        size="small"
                        onClick={() => fillAndClose(account.email, account.password)}
                      >
                        Dùng
                      </Button>
                    </div>
                  ))}
                </div>
              ),
            },
          ]}
        />
      </Modal>
    </div>
  );
}
