import { Link } from 'react-router';

export function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-300 py-12 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* About */}
          <div>
            <h3 className="text-white font-semibold mb-4">Về JobsConnect</h3>
            <p className="text-sm text-gray-400">
              Nền tảng tuyển dụng hiện đại, kết nối ứng viên tài năng với các doanh nghiệp hàng đầu.
            </p>
          </div>

          {/* For Candidates */}
          <div>
            <h3 className="text-white font-semibold mb-4">Ứng viên</h3>
            <ul className="space-y-2 text-sm">
              <li><Link to="/jobs" className="hover:text-white transition-colors">Tìm việc làm</Link></li>
              <li><Link to="/companies" className="hover:text-white transition-colors">Công ty</Link></li>
              <li><Link to="/candidate/cvs" className="hover:text-white transition-colors">Quản lý CV</Link></li>
              <li><Link to="/candidate/applications" className="hover:text-white transition-colors">Việc đã ứng tuyển</Link></li>
            </ul>
          </div>

          {/* For Employers */}
          <div>
            <h3 className="text-white font-semibold mb-4">Nhà tuyển dụng</h3>
            <ul className="space-y-2 text-sm">
              <li><Link to="/recruiter/jobs" className="hover:text-white transition-colors">Đăng tin tuyển dụng</Link></li>
              <li><Link to="/recruiter/candidates" className="hover:text-white transition-colors">Tìm ứng viên</Link></li>
              <li><Link to="/recruiter/company" className="hover:text-white transition-colors">Quản lý công ty</Link></li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h3 className="text-white font-semibold mb-4">Hỗ trợ</h3>
            <ul className="space-y-2 text-sm">
              <li><Link to="/contact" className="hover:text-white transition-colors">Liên hệ</Link></li>
              <li><Link to="/faq" className="hover:text-white transition-colors">Câu hỏi thường gặp</Link></li>
              <li><Link to="/terms" className="hover:text-white transition-colors">Điều khoản sử dụng</Link></li>
              <li><Link to="/privacy" className="hover:text-white transition-colors">Chính sách bảo mật</Link></li>
            </ul>
          </div>
        </div>

        {/* Bottom */}
        <div className="border-t border-gray-800 pt-8 text-center text-sm text-gray-500">
          <p>&copy; 2025 JobsConnect. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
