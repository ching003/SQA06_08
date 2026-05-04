import React from 'react';
import { Card } from 'antd';
import { FileTextOutlined } from '@ant-design/icons';

export function TermsOfServicePage() {
    return (
        <div className="min-h-screen bg-gray-50">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="mb-8">
                    <div className="h-16 w-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <FileTextOutlined className="text-3xl text-blue-600" />
                    </div>
                    <h1 className="text-3xl font-bold text-gray-900 mb-2 text-center">
                        Điều khoản sử dụng
                    </h1>
                    <p className="text-gray-600 text-center">
                        Cập nhật lần cuối: 01/01/2026
                    </p>
                </div>

                <Card>
                    <div className="prose max-w-none">
                        <section className="mb-8">
                            <h2 className="text-xl font-semibold text-gray-900 mb-4">1. Giới thiệu</h2>
                            <p className="text-gray-600">
                                Chào mừng bạn đến với JobsConnect. Bằng việc sử dụng nền tảng, bạn đồng ý tuân thủ các điều khoản sau.
                            </p>
                        </section>

                        <section className="mb-8">
                            <h2 className="text-xl font-semibold text-gray-900 mb-4">2. Tài khoản người dùng</h2>
                            <p className="text-gray-600 mb-3">Khi đăng ký tài khoản, bạn cam kết:</p>
                            <ul className="list-disc pl-6 text-gray-600 space-y-2">
                                <li>Cung cấp thông tin chính xác và trung thực</li>
                                <li>Bảo mật thông tin đăng nhập</li>
                                <li>Chịu trách nhiệm về mọi hoạt động dưới tài khoản</li>
                            </ul>
                        </section>

                        <section className="mb-8">
                            <h2 className="text-xl font-semibold text-gray-900 mb-4">3. Quyền và trách nhiệm</h2>
                            <p className="text-gray-600">
                                Người dùng có quyền sử dụng các tính năng của nền tảng và phải tuân thủ các quy định về nội dung,
                                không đăng tải thông tin gian lận hoặc vi phạm pháp luật.
                            </p>
                        </section>

                        <section className="mb-8">
                            <h2 className="text-xl font-semibold text-gray-900 mb-4">4. Liên hệ</h2>
                            <div className="bg-gray-50 p-4 rounded-lg">
                                <p className="text-gray-600">Email: contact@jobsconnect.vn</p>
                                <p className="text-gray-600">Điện thoại: 1900 1099</p>
                            </div>
                        </section>
                    </div>
                </Card>
            </div>
        </div>
    );
}
