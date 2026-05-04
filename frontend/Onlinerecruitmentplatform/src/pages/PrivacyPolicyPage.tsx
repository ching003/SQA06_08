import React from 'react';
import { Card } from 'antd';
import { SafetyOutlined } from '@ant-design/icons';

export function PrivacyPolicyPage() {
    return (
        <div className="min-h-screen bg-gray-50">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="mb-8">
                    <div className="h-16 w-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <SafetyOutlined className="text-3xl text-blue-600" />
                    </div>
                    <h1 className="text-3xl font-bold text-gray-900 mb-2 text-center">
                        Chính sách bảo mật
                    </h1>
                    <p className="text-gray-600 text-center">
                        Cập nhật lần cuối: 01/01/2026
                    </p>
                </div>

                <Card>
                    <div className="prose max-w-none">
                        <section className="mb-8">
                            <h2 className="text-xl font-semibold text-gray-900 mb-4">1. Thu thập thông tin</h2>
                            <p className="text-gray-600 mb-3">
                                Chúng tôi thu thập các loại thông tin sau:
                            </p>
                            <ul className="list-disc pl-6 text-gray-600 space-y-2">
                                <li>Thông tin cá nhân: họ tên, email, số điện thoại, địa chỉ</li>
                                <li>Thông tin CV: học vấn, kinh nghiệm làm việc, kỹ năng</li>
                                <li>Thông tin công ty: tên công ty, địa chỉ, giấy phép kinh doanh</li>
                                <li>Thông tin sử dụng: lịch sử tìm kiếm, ứng tuyển, tương tác với nền tảng</li>
                            </ul>
                        </section>

                        <section className="mb-8">
                            <h2 className="text-xl font-semibold text-gray-900 mb-4">2. Sử dụng thông tin</h2>
                            <p className="text-gray-600 mb-3">
                                Thông tin được sử dụng để:
                            </p>
                            <ul className="list-disc pl-6 text-gray-600 space-y-2">
                                <li>Cung cấp và cải thiện dịch vụ tuyển dụng</li>
                                <li>Kết nối ứng viên với nhà tuyển dụng</li>
                                <li>Gợi ý công việc và ứng viên phù hợp</li>
                                <li>Gửi thông báo về cơ hội việc làm và hoạt động tài khoản</li>
                                <li>Phân tích và thống kê để cải thiện trải nghiệm người dùng</li>
                            </ul>
                        </section>

                        <section className="mb-8">
                            <h2 className="text-xl font-semibold text-gray-900 mb-4">3. Bảo vệ thông tin</h2>
                            <p className="text-gray-600 mb-3">
                                Chúng tôi cam kết bảo vệ thông tin của bạn bằng cách:
                            </p>
                            <ul className="list-disc pl-6 text-gray-600 space-y-2">
                                <li>Mã hóa dữ liệu trong quá trình truyền tải và lưu trữ</li>
                                <li>Sử dụng tường lửa và các biện pháp bảo mật tiên tiến</li>
                                <li>Giới hạn quyền truy cập chỉ cho nhân viên được ủy quyền</li>
                                <li>Thường xuyên kiểm tra và cập nhật hệ thống bảo mật</li>
                            </ul>
                        </section>

                        <section className="mb-8">
                            <h2 className="text-xl font-semibold text-gray-900 mb-4">4. Chia sẻ thông tin</h2>
                            <p className="text-gray-600 mb-3">
                                Chúng tôi chỉ chia sẻ thông tin khi:
                            </p>
                            <ul className="list-disc pl-6 text-gray-600 space-y-2">
                                <li>Có sự đồng ý của bạn (ví dụ: khi ứng tuyển công việc)</li>
                                <li>Theo yêu cầu của pháp luật hoặc cơ quan có thẩm quyền</li>
                                <li>Với các đối tác dịch vụ được ủy quyền (tuân thủ nghiêm ngặt bảo mật)</li>
                            </ul>
                            <p className="text-gray-600 mt-3">
                                Chúng tôi không bán thông tin cá nhân của bạn cho bên thứ ba.
                            </p>
                        </section>

                        <section className="mb-8">
                            <h2 className="text-xl font-semibold text-gray-900 mb-4">5. Cookies và công nghệ theo dõi</h2>
                            <p className="text-gray-600">
                                Chúng tôi sử dụng cookies và các công nghệ tương tự để cải thiện trải nghiệm người dùng,
                                phân tích lưu lượng truy cập và cá nhân hóa nội dung. Bạn có thể quản lý cài đặt cookies
                                trong trình duyệt của mình.
                            </p>
                        </section>

                        <section className="mb-8">
                            <h2 className="text-xl font-semibold text-gray-900 mb-4">6. Quyền của người dùng</h2>
                            <p className="text-gray-600 mb-3">
                                Bạn có quyền:
                            </p>
                            <ul className="list-disc pl-6 text-gray-600 space-y-2">
                                <li>Truy cập và xem thông tin cá nhân của mình</li>
                                <li>Yêu cầu chỉnh sửa hoặc cập nhật thông tin</li>
                                <li>Xóa tài khoản và dữ liệu cá nhân</li>
                                <li>Từ chối nhận email marketing</li>
                                <li>Yêu cầu xuất dữ liệu cá nhân</li>
                            </ul>
                        </section>

                        <section className="mb-8">
                            <h2 className="text-xl font-semibold text-gray-900 mb-4">7. Lưu trữ dữ liệu</h2>
                            <p className="text-gray-600">
                                Chúng tôi lưu trữ thông tin của bạn trong thời gian cần thiết để cung cấp dịch vụ
                                hoặc theo yêu cầu của pháp luật. Khi bạn xóa tài khoản, dữ liệu sẽ được xóa hoặc
                                ẩn danh hóa trong vòng 30 ngày.
                            </p>
                        </section>

                        <section className="mb-8">
                            <h2 className="text-xl font-semibold text-gray-900 mb-4">8. Thay đổi chính sách</h2>
                            <p className="text-gray-600">
                                Chúng tôi có thể cập nhật Chính sách Bảo mật này theo thời gian. Các thay đổi
                                quan trọng sẽ được thông báo qua email hoặc thông báo trên nền tảng.
                            </p>
                        </section>

                        <section className="mb-8">
                            <h2 className="text-xl font-semibold text-gray-900 mb-4">9. Liên hệ</h2>
                            <p className="text-gray-600 mb-3">
                                Nếu có câu hỏi về Chính sách Bảo mật, vui lòng liên hệ:
                            </p>
                            <div className="bg-gray-50 p-4 rounded-lg">
                                <p className="text-gray-600 mb-2">
                                    <strong>Email:</strong> contact@jobsconnect.vn
                                </p>
                                <p className="text-gray-600 mb-2">
                                    <strong>Điện thoại:</strong> 1900 1099
                                </p>
                                <p className="text-gray-600">
                                    <strong>Địa chỉ:</strong> Học viện Công nghệ Bưu chính Viễn thông, Hà Nội, Việt Nam
                                </p>
                            </div>
                        </section>

                        <div className="mt-8 pt-8 border-t border-gray-200">
                            <p className="text-sm text-gray-500 text-center">
                                Bằng việc sử dụng JobsConnect, bạn xác nhận đã đọc và hiểu Chính sách Bảo mật này.
                            </p>
                        </div>
                    </div>
                </Card>
            </div>
        </div>
    );
}
