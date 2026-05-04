import React, { useState } from 'react';
import { Card, Collapse, Input, Button } from 'antd';
import { SearchOutlined, QuestionCircleOutlined, MailOutlined } from '@ant-design/icons';
import { Link } from 'react-router';

const { Panel } = Collapse;

export function FAQPage() {
    const [searchQuery, setSearchQuery] = useState('');

    const faqCategories = [
        {
            category: 'Dành cho Ứng viên',
            icon: '👤',
            questions: [
                {
                    question: 'Làm thế nào để tạo tài khoản trên JobsConnect?',
                    answer: 'Để tạo tài khoản, bạn nhấn vào nút "Đăng ký" ở góc trên bên phải, sau đó điền đầy đủ thông tin cá nhân và xác nhận email. Quá trình đăng ký hoàn toàn miễn phí và chỉ mất vài phút.'
                },
                {
                    question: 'Tôi có thể tạo bao nhiêu CV trên hệ thống?',
                    answer: 'Bạn có thể tạo và quản lý nhiều CV khác nhau trên hệ thống. Tuy nhiên, bạn cần chọn một CV làm CV chính để sử dụng khi ứng tuyển công việc.'
                },
                {
                    question: 'Làm thế nào để ứng tuyển vào một vị trí?',
                    answer: 'Tìm công việc bạn quan tâm, nhấn vào "Ứng tuyển ngay", chọn CV phù hợp và viết thư giới thiệu (nếu cần). Sau đó nhấn "Gửi hồ sơ" để hoàn tất.'
                },
                {
                    question: 'Tôi có thể theo dõi trạng thái đơn ứng tuyển của mình ở đâu?',
                    answer: 'Bạn có thể xem tất cả đơn ứng tuyển và trạng thái của chúng tại trang "Việc đã ứng tuyển" trong bảng điều khiển của ứng viên.'
                },
                {
                    question: 'Làm thế nào để lưu công việc để xem sau?',
                    answer: 'Nhấn vào biểu tượng trái tim hoặc nút "Lưu" trên thẻ công việc. Các công việc đã lưu sẽ được lưu trữ trong trang "Việc làm đã lưu" của bạn.'
                },
                {
                    question: 'Tôi có thể nhận gợi ý công việc phù hợp không?',
                    answer: 'Có, hệ thống AI của chúng tôi sẽ phân tích CV và hồ sơ của bạn để đề xuất các công việc phù hợp nhất. Bạn có thể xem các gợi ý này tại trang "Việc làm gợi ý".'
                }
            ]
        },
        {
            category: 'Dành cho Nhà tuyển dụng',
            icon: '🏢',
            questions: [
                {
                    question: 'Làm thế nào để đăng ký công ty trên JobsConnect?',
                    answer: 'Sau khi đăng ký tài khoản, bạn cần điền đầy đủ thông tin công ty, tải lên các giấy tờ xác minh (giấy phép kinh doanh, v.v.). Đội ngũ của chúng tôi sẽ xem xét và phê duyệt trong vòng 24-48 giờ.'
                },
                {
                    question: 'Mất bao lâu để tin tuyển dụng được phê duyệt?',
                    answer: 'Thông thường, tin tuyển dụng sẽ được xem xét và phê duyệt trong vòng 2-4 giờ làm việc. Bạn sẽ nhận được thông báo qua email khi tin đăng được phê duyệt hoặc cần chỉnh sửa.'
                },
                {
                    question: 'Tôi có thể chỉnh sửa tin tuyển dụng sau khi đã đăng không?',
                    answer: 'Có, bạn có thể chỉnh sửa tin tuyển dụng bất cứ lúc nào tại trang quản lý công việc. Sau khi chỉnh sửa, tin đăng có thể cần được xem xét lại tùy thuộc vào mức độ thay đổi.'
                },
                {
                    question: 'Làm thế nào để tìm kiếm ứng viên phù hợp?',
                    answer: 'Sử dụng tính năng "Tìm ứng viên" với các bộ lọc theo kỹ năng, kinh nghiệm, địa điểm và ngành nghề. Hệ thống AI cũng sẽ gợi ý những ứng viên phù hợp với yêu cầu của bạn.'
                },
                {
                    question: 'Tôi có thể mời thêm thành viên quản lý công ty không?',
                    answer: 'Có, bạn có thể mời các thành viên khác tham gia quản lý công ty với các vai trò khác nhau (Quản lý, Nhà tuyển dụng, Người xem). Vào trang "Quản lý thành viên" để thêm thành viên mới.'
                },
                {
                    question: 'Làm thế nào để theo dõi và quản lý đơn ứng tuyển?',
                    answer: 'Tất cả đơn ứng tuyển sẽ được hiển thị tại trang "Quản lý ứng tuyển". Bạn có thể lọc theo vị trí, trạng thái, và xem chi tiết hồ sơ của từng ứng viên.'
                }
            ]
        },
        {
            category: 'Tài khoản & Bảo mật',
            icon: '🔒',
            questions: [
                {
                    question: 'Làm thế nào để đổi mật khẩu?',
                    answer: 'Vào trang "Cài đặt" > "Bảo mật" và chọn "Đổi mật khẩu". Bạn cần nhập mật khẩu hiện tại và mật khẩu mới để xác nhận thay đổi.'
                },
                {
                    question: 'Tôi quên mật khẩu, phải làm sao?',
                    answer: 'Tại trang đăng nhập, nhấn vào "Quên mật khẩu?", nhập email đã đăng ký và làm theo hướng dẫn trong email để đặt lại mật khẩu.'
                },
                {
                    question: 'Thông tin cá nhân của tôi có được bảo mật không?',
                    answer: 'Chúng tôi cam kết bảo mật tuyệt đối thông tin cá nhân của bạn. Mọi dữ liệu được mã hóa và chỉ được sử dụng cho mục đích tuyển dụng. Xem thêm trong "Chính sách bảo mật".'
                },
                {
                    question: 'Làm thế nào để xóa tài khoản?',
                    answer: 'Vào trang "Cài đặt" > "Tài khoản" và chọn "Xóa tài khoản". Lưu ý rằng hành động này không thể hoàn tác và sẽ xóa tất cả dữ liệu của bạn.'
                }
            ]
        },
        {
            category: 'Phí & Thanh toán',
            icon: '💰',
            questions: [
                {
                    question: 'Việc sử dụng JobsConnect có mất phí không?',
                    answer: 'Đối với ứng viên, tất cả các tính năng đều hoàn toàn miễn phí. Đối với nhà tuyển dụng, chúng tôi có các gói dịch vụ khác nhau phù hợp với nhu cầu của từng doanh nghiệp.'
                },
                {
                    question: 'Có những gói dịch vụ nào dành cho nhà tuyển dụng?',
                    answer: 'Chúng tôi cung cấp gói Miễn phí (giới hạn), gói Cơ bản, gói Chuyên nghiệp và gói Doanh nghiệp. Mỗi gói có các tính năng và giới hạn khác nhau. Liên hệ với chúng tôi để biết thêm chi tiết.'
                },
                {
                    question: 'Các hình thức thanh toán được chấp nhận?',
                    answer: 'Chúng tôi chấp nhận thanh toán qua chuyển khoản ngân hàng, thẻ tín dụng/ghi nợ, ví điện tử (Momo, ZaloPay) và cổng thanh toán trực tuyến.'
                }
            ]
        },
        {
            category: 'Hỗ trợ kỹ thuật',
            icon: '🛠️',
            questions: [
                {
                    question: 'Tôi gặp lỗi khi tải CV lên, làm sao để khắc phục?',
                    answer: 'Đảm bảo file CV của bạn có định dạng được hỗ trợ (PDF, DOC, DOCX) và kích thước không quá 5MB. Nếu vẫn gặp lỗi, hãy thử trình duyệt khác hoặc liên hệ với chúng tôi.'
                },
                {
                    question: 'Website không hiển thị đúng trên thiết bị của tôi?',
                    answer: 'Hãy thử xóa cache và cookies của trình duyệt, hoặc cập nhật trình duyệt lên phiên bản mới nhất. Chúng tôi hỗ trợ các trình duyệt Chrome, Firefox, Safari và Edge phiên bản mới nhất.'
                },
                {
                    question: 'Tôi không nhận được email thông báo?',
                    answer: 'Kiểm tra thư mục spam/junk trong email. Nếu vẫn không thấy, hãy thêm support@jobsconnect.vn vào danh sách liên hệ an toàn và kiểm tra lại cài đặt thông báo trong tài khoản.'
                }
            ]
        }
    ];

    const filteredCategories = faqCategories.map(category => ({
        ...category,
        questions: category.questions.filter(
            q =>
                q.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
                q.answer.toLowerCase().includes(searchQuery.toLowerCase())
        )
    })).filter(category => category.questions.length > 0);

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Header */}
                <div className="mb-8 text-center">
                    <div className="h-16 w-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <QuestionCircleOutlined className="text-3xl text-blue-600" />
                    </div>
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">Câu hỏi thường gặp</h1>
                    <p className="text-gray-600">
                        Tìm câu trả lời cho những thắc mắc phổ biến về JobsConnect
                    </p>
                </div>

                {/* Search */}
                <div className="mb-8">
                    <Input
                        size="large"
                        placeholder="Tìm kiếm câu hỏi..."
                        prefix={<SearchOutlined className="text-gray-400" />}
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>

                {/* FAQ Categories */}
                {filteredCategories.length === 0 ? (
                    <Card>
                        <div className="text-center py-8">
                            <p className="text-gray-500">
                                Không tìm thấy câu hỏi phù hợp. Vui lòng thử từ khóa khác hoặc{' '}
                                <a href="/contact" className="text-blue-600 hover:text-blue-700">
                                    liên hệ với chúng tôi
                                </a>
                            </p>
                        </div>
                    </Card>
                ) : (
                    filteredCategories.map((category, index) => (
                        <div key={index} className="mb-6">
                            <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                                <span className="text-2xl mr-2">{category.icon}</span>
                                {category.category}
                            </h2>
                            <Card>
                                <Collapse
                                    bordered={false}
                                    expandIconPosition="end"
                                    className="bg-transparent"
                                >
                                    {category.questions.map((item, qIndex) => (
                                        <Panel
                                            header={
                                                <span className="font-medium text-gray-900">
                                                    {item.question}
                                                </span>
                                            }
                                            key={qIndex}
                                        >
                                            <p className="text-gray-600">{item.answer}</p>
                                        </Panel>
                                    ))}
                                </Collapse>
                            </Card>
                        </div>
                    ))
                )}

                {/* Still have questions */}
                <Card className="mt-8 bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200">
                    <div className="text-center py-4">
                        <h3 className="text-xl font-semibold text-gray-900 mb-3">
                            Vẫn còn thắc mắc?
                        </h3>
                        <p className="text-gray-600 mb-6">
                            Đội ngũ hỗ trợ của chúng tôi luôn sẵn sàng giúp đỡ bạn
                        </p>
                        <Link to="/contact">
                            <Button
                                type="primary"
                                size="large"
                                icon={<MailOutlined />}
                                className="shadow-md hover:shadow-lg transition-all"
                            >
                                Liên hệ với chúng tôi
                            </Button>
                        </Link>
                    </div>
                </Card>
            </div>
        </div>
    );
}
