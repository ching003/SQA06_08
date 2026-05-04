// Mock CV Template Data (matching Prisma schema)

import { CVTemplate as BaseCVTemplate } from './types';

export interface CVTemplate extends BaseCVTemplate {
  description?: string;
  sections?: string[];
  usageCount?: number;
}

export const availableSections = [
  { id: 'personal', label: 'Thông tin cá nhân', required: true },
  { id: 'summary', label: 'Giới thiệu bản thân', required: false },
  { id: 'education', label: 'Học vấn', required: false },
  { id: 'experience', label: 'Kinh nghiệm làm việc', required: false },
  { id: 'skills', label: 'Kỹ năng', required: false },
  { id: 'projects', label: 'Dự án', required: false },
  { id: 'certifications', label: 'Chứng chỉ', required: false },
  { id: 'languages', label: 'Ngôn ngữ', required: false },
  { id: 'achievements', label: 'Thành tích', required: false },
  { id: 'activities', label: 'Hoạt động', required: false },
  { id: 'references', label: 'Người tham chiếu', required: false },
  { id: 'social', label: 'Mạng xã hội', required: false },
];

export const mockCVTemplates: CVTemplate[] = [
  {
    id: 'template-1',
    name: 'Modern',
    description: 'Mẫu CV hiện đại với thiết kế sạch sẽ, phù hợp cho các ngành công nghệ',
    sections: ['Thông tin cá nhân', 'Giới thiệu', 'Kinh nghiệm', 'Học vấn', 'Kỹ năng', 'Dự án'],
    htmlUrl: '/templates/modern.html',
    previewUrl: 'https://images.unsplash.com/photo-1586281380349-632531db7ed4?w=400&h=600&fit=crop',
    isActive: true,
    usageCount: 45,
    createdAt: new Date('2024-01-15T10:00:00Z'),
    updatedAt: new Date('2024-11-15T10:00:00Z'),
  },
  {
    id: 'template-2',
    name: 'Classic',
    description: 'Mẫu CV cổ điển, chuyên nghiệp, phù hợp với mọi ngành nghề',
    sections: ['Thông tin cá nhân', 'Mục tiêu', 'Kinh nghiệm', 'Học vấn', 'Kỹ năng'],
    htmlUrl: '/templates/classic.html',
    previewUrl: 'https://images.unsplash.com/photo-1586281380614-fa134c78c8e1?w=400&h=600&fit=crop',
    isActive: true,
    usageCount: 38,
    createdAt: new Date('2024-01-10T10:00:00Z'),
    updatedAt: new Date('2024-10-20T10:00:00Z'),
  },
  {
    id: 'template-3',
    name: 'Creative',
    description: 'Mẫu CV sáng tạo với màu sắc nổi bật, phù hợp cho ngành thiết kế, marketing',
    sections: ['Thông tin cá nhân', 'Giới thiệu', 'Kinh nghiệm', 'Dự án', 'Kỹ năng', 'Thành tích'],
    htmlUrl: '/templates/creative.html',
    previewUrl: 'https://images.unsplash.com/photo-1586281380117-5a60ae2050cc?w=400&h=600&fit=crop',
    isActive: true,
    usageCount: 32,
    createdAt: new Date('2024-02-01T10:00:00Z'),
    updatedAt: new Date('2024-11-10T10:00:00Z'),
  },
  {
    id: 'template-4',
    name: 'Minimal',
    description: 'Mẫu CV tối giản, đơn giản nhưng hiệu quả, dễ đọc và tạo ấn tượng',
    sections: ['Thông tin cá nhân', 'Kinh nghiệm', 'Học vấn', 'Kỹ năng'],
    htmlUrl: '/templates/minimal.html',
    previewUrl: 'https://images.unsplash.com/photo-1586281380923-93e59a84c15d?w=400&h=600&fit=crop',
    isActive: true,
    usageCount: 28,
    createdAt: new Date('2024-02-15T10:00:00Z'),
    updatedAt: new Date('2024-09-30T10:00:00Z'),
  },
  {
    id: 'template-5',
    name: 'Professional',
    description: 'Mẫu CV chuyên nghiệp cao cấp, phù hợp cho vị trí quản lý và cấp cao',
    sections: ['Thông tin cá nhân', 'Tóm tắt', 'Kinh nghiệm', 'Học vấn', 'Chứng chỉ', 'Kỹ năng', 'Ngôn ngữ'],
    htmlUrl: '/templates/professional.html',
    previewUrl: 'https://images.unsplash.com/photo-1586281380426-54f0300f5c64?w=400&h=600&fit=crop',
    isActive: false,
    usageCount: 15,
    createdAt: new Date('2024-03-01T10:00:00Z'),
    updatedAt: new Date('2024-08-15T10:00:00Z'),
  },
];