import React from 'react';
import { Card, Form, Input, Button, Space } from 'antd';
import { MailOutlined, PhoneOutlined, EnvironmentOutlined } from '@ant-design/icons';
import { toast } from 'sonner';

const { TextArea } = Input;

export function ContactPage() {
    const [form] = Form.useForm();

    const handleSubmit = (values: any) => {
        // In a real application, this would send the contact form to an API
        console.log('Contact form submitted:', values);
        toast.success('Cảm ơn bạn đã liên hệ! Chúng tôi sẽ phản hồi trong thời gian sớm nhất.');
        form.resetFields();
    };

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">Liên hệ với chúng tôi</h1>
                    <p className="text-gray-600">
                        Có câu hỏi hoặc cần hỗ trợ? Chúng tôi luôn sẵn sàng giúp đỡ bạn.
                    </p>
                </div>

                <div className="grid md:grid-cols-3 gap-6 mb-8">
                    {/* Contact Information Cards */}
                    <Card>
                        <div className="text-center">
                            <div className="h-12 w-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                                <MailOutlined className="text-2xl text-blue-600" />
                            </div>
                            <h3 className="font-semibold text-gray-900 mb-2">Email</h3>
                            <p className="text-gray-600 text-sm">contact@jobsconnect.vn</p>
                        </div>
                    </Card>

                    <Card>
                        <div className="text-center">
                            <div className="h-12 w-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                                <PhoneOutlined className="text-2xl text-blue-600" />
                            </div>
                            <h3 className="font-semibold text-gray-900 mb-2">Điện thoại</h3>
                            <p className="text-gray-600 text-sm">Hotline: 1900 1099</p>
                            <p className="text-gray-600 text-sm">Thứ 2 - Thứ 6: 8:00 - 18:00</p>
                        </div>
                    </Card>

                    <Card>
                        <div className="text-center">
                            <div className="h-12 w-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                                <EnvironmentOutlined className="text-2xl text-blue-600" />
                            </div>
                            <h3 className="font-semibold text-gray-900 mb-2">Địa chỉ</h3>
                            <p className="text-gray-600 text-sm">
                                Học viện Công nghệ Bưu chính Viễn thông
                            </p>
                            <p className="text-gray-600 text-sm">Hà Nội, Việt Nam</p>
                        </div>
                    </Card>
                </div>

                {/* Contact Form */}
                <Card>
                    <h2 className="text-xl font-semibold text-gray-900 mb-6">Gửi tin nhắn cho chúng tôi</h2>
                    <Form
                        form={form}
                        layout="vertical"
                        onFinish={handleSubmit}
                        autoComplete="off"
                    >
                        <div className="grid md:grid-cols-2 gap-4">
                            <Form.Item
                                label="Họ và tên"
                                name="name"
                                rules={[
                                    { required: true, message: 'Vui lòng nhập họ và tên' },
                                    { min: 2, message: 'Họ và tên phải có ít nhất 2 ký tự' }
                                ]}
                            >
                                <Input placeholder="Nhập họ và tên của bạn" />
                            </Form.Item>

                            <Form.Item
                                label="Email"
                                name="email"
                                rules={[
                                    { required: true, message: 'Vui lòng nhập email' },
                                    { type: 'email', message: 'Email không hợp lệ' }
                                ]}
                            >
                                <Input placeholder="email@example.com" />
                            </Form.Item>
                        </div>

                        <Form.Item
                            label="Chủ đề"
                            name="subject"
                            rules={[
                                { required: true, message: 'Vui lòng nhập chủ đề' },
                                { min: 5, message: 'Chủ đề phải có ít nhất 5 ký tự' }
                            ]}
                        >
                            <Input placeholder="Nhập chủ đề tin nhắn" />
                        </Form.Item>

                        <Form.Item
                            label="Nội dung"
                            name="message"
                            rules={[
                                { required: true, message: 'Vui lòng nhập nội dung' },
                                { min: 20, message: 'Nội dung phải có ít nhất 20 ký tự' }
                            ]}
                        >
                            <TextArea
                                rows={6}
                                placeholder="Nhập nội dung tin nhắn của bạn"
                            />
                        </Form.Item>

                        <Form.Item>
                            <Button type="primary" htmlType="submit" size="large">
                                Gửi tin nhắn
                            </Button>
                        </Form.Item>
                    </Form>
                </Card>
            </div>
        </div>
    );
}
