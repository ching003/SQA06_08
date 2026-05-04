import React from 'react';
import { Modal, Card, Tag, Divider } from 'antd';
import {
  MailOutlined,
  PhoneOutlined,
  EnvironmentOutlined,
  CalendarOutlined,
  UserOutlined,
} from '@ant-design/icons';
import { CV } from '../../lib/types';

interface CVPreviewModalProps {
  open: boolean;
  onClose: () => void;
  cvData: Partial<CV>;
}

export function CVPreviewModal({ open, onClose, cvData }: CVPreviewModalProps) {
  const formatDate = (dateString?: string) => {
    if (!dateString) return '';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('vi-VN', { year: 'numeric', month: '2-digit' });
    } catch {
      return dateString;
    }
  };

  const levelLabels: Record<string, string> = {
    BEGINNER: 'Cơ bản',
    INTERMEDIATE: 'Trung bình',
    ADVANCED: 'Nâng cao',
    EXPERT: 'Chuyên gia',
    NATIVE: 'Bản ngữ',
  };

  return (
    <Modal
      open={open}
      onCancel={onClose}
      footer={null}
      width={900}
      title="Xem trước CV"
      className="cv-preview-modal"
    >
      <div className="max-h-[80vh] overflow-y-auto p-6 bg-white">
        {/* Header */}
        <div className="text-center mb-8">
          {cvData.avatarUrl && (
            <img
              src={cvData.avatarUrl}
              alt="Avatar"
              className="w-32 h-32 rounded-full mx-auto mb-4 object-cover border-4 border-blue-500"
            />
          )}
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {cvData.fullName || 'Họ và tên'}
          </h1>
          {cvData.currentPosition && (
            <p className="text-xl text-gray-600 mb-4">{cvData.currentPosition}</p>
          )}

          <div className="flex flex-wrap justify-center gap-4 text-sm text-gray-600">
            {cvData.email && (
              <span className="flex items-center gap-1">
                <MailOutlined /> {cvData.email}
              </span>
            )}
            {cvData.phone && (
              <span className="flex items-center gap-1">
                <PhoneOutlined /> {cvData.phone}
              </span>
            )}
            {cvData.address && (
              <span className="flex items-center gap-1">
                <EnvironmentOutlined /> {cvData.address}
              </span>
            )}
            {cvData.dateOfBirth && (
              <span className="flex items-center gap-1">
                <CalendarOutlined /> {formatDate(cvData.dateOfBirth)}
              </span>
            )}
          </div>
        </div>

        {/* Summary */}
        {cvData.summary && (
          <div className="mb-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <UserOutlined /> Giới thiệu
            </h2>
            <p className="text-gray-700 whitespace-pre-wrap">{cvData.summary}</p>
          </div>
        )}

        {/* Objective */}
        {cvData.objective && (
          <div className="mb-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-3">Mục tiêu nghề nghiệp</h2>
            <p className="text-gray-700 whitespace-pre-wrap">{cvData.objective}</p>
          </div>
        )}

        {/* Work Experience */}
        {cvData.workExperience && cvData.workExperience.length > 0 && (
          <div className="mb-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-3">Kinh nghiệm làm việc</h2>
            <div className="space-y-4">
              {cvData.workExperience.map((work, index) => (
                <Card key={index} className="bg-gray-50" size="small">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h3 className="font-semibold text-lg text-gray-900">{work.jobTitle}</h3>
                      <p className="text-gray-700">{work.companyName}</p>
                    </div>
                    <span className="text-sm text-gray-600">
                      {formatDate(work.startDate)} - {work.endDate ? formatDate(work.endDate) : 'Hiện tại'}
                    </span>
                  </div>
                  {work.description && (
                    <p className="text-gray-600 text-sm mt-2 whitespace-pre-wrap">{work.description}</p>
                  )}
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Education */}
        {cvData.education && cvData.education.length > 0 && (
          <div className="mb-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-3">Học vấn</h2>
            <div className="space-y-4">
              {cvData.education.map((edu, index) => (
                <Card key={index} className="bg-gray-50" size="small">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h3 className="font-semibold text-lg text-gray-900">{edu.institution}</h3>
                      {edu.degree && <p className="text-gray-700">{edu.degree}</p>}
                    </div>
                    <span className="text-sm text-gray-600">
                      {formatDate(edu.startDate)} - {formatDate(edu.endDate)}
                    </span>
                  </div>
                  {edu.description && (
                    <p className="text-gray-600 text-sm mt-2 whitespace-pre-wrap">{edu.description}</p>
                  )}
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Skills */}
        {cvData.skills && cvData.skills.length > 0 && (
          <div className="mb-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-3">Kỹ năng</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {cvData.skills.map((skill, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                  <span className="font-medium text-gray-900">{skill.name}</span>
                  <div className="flex items-center gap-2">
                    <Tag color="blue">{levelLabels[skill.level || ''] || skill.level}</Tag>
                    {skill.yearsOfExperience && skill.yearsOfExperience > 0 && (
                      <span className="text-sm text-gray-600">{skill.yearsOfExperience} năm</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Projects */}
        {cvData.projects && cvData.projects.length > 0 && (
          <div className="mb-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-3">Dự án</h2>
            <div className="space-y-4">
              {cvData.projects.map((project, index) => (
                <Card key={index} className="bg-gray-50" size="small">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h3 className="font-semibold text-lg text-gray-900">{project.name}</h3>
                      {project.role && <p className="text-gray-700">{project.role}</p>}
                    </div>
                    <span className="text-sm text-gray-600">
                      {formatDate(project.startDate)} - {formatDate(project.endDate)}
                    </span>
                  </div>
                  {project.description && (
                    <p className="text-gray-600 text-sm mt-2 whitespace-pre-wrap">{project.description}</p>
                  )}
                  {project.url && (
                    <a href={project.url} target="_blank" rel="noopener noreferrer" className="text-blue-600 text-sm mt-2 block">
                      {project.url}
                    </a>
                  )}
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Certifications */}
        {cvData.certifications && cvData.certifications.length > 0 && (
          <div className="mb-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-3">Chứng chỉ</h2>
            <div className="space-y-3">
              {cvData.certifications.map((cert, index) => (
                <Card key={index} className="bg-gray-50" size="small">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-semibold text-gray-900">{cert.name}</h3>
                      {cert.issuer && <p className="text-gray-700 text-sm">{cert.issuer}</p>}
                      {cert.description && (
                        <p className="text-gray-600 text-sm mt-1">{cert.description}</p>
                      )}
                    </div>
                    {cert.acquiredDate && (
                      <span className="text-sm text-gray-600">{formatDate(cert.acquiredDate)}</span>
                    )}
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Languages */}
        {cvData.languages && cvData.languages.length > 0 && (
          <div className="mb-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-3">Ngôn ngữ</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {cvData.languages.map((lang, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                  <span className="font-medium text-gray-900">{lang.name}</span>
                  <Tag color="green">{levelLabels[lang.proficiency || ''] || lang.proficiency}</Tag>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Achievements */}
        {cvData.achievements && cvData.achievements.length > 0 && (
          <div className="mb-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-3">Thành tích</h2>
            <div className="space-y-3">
              {cvData.achievements.map((achievement, index) => (
                <Card key={index} className="bg-gray-50" size="small">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-semibold text-gray-900">{achievement.title}</h3>
                      {achievement.description && (
                        <p className="text-gray-600 text-sm mt-1">{achievement.description}</p>
                      )}
                    </div>
                    {achievement.acquiredDate && (
                      <span className="text-sm text-gray-600">{formatDate(achievement.acquiredDate)}</span>
                    )}
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Activities */}
        {cvData.activities && cvData.activities.length > 0 && (
          <div className="mb-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-3">Hoạt động</h2>
            <div className="space-y-3">
              {cvData.activities.map((activity, index) => (
                <Card key={index} className="bg-gray-50" size="small">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h3 className="font-semibold text-gray-900">{activity.title}</h3>
                      {activity.organization && (
                        <p className="text-gray-700 text-sm">{activity.organization}</p>
                      )}
                    </div>
                    <span className="text-sm text-gray-600">
                      {formatDate(activity.startDate)} - {formatDate(activity.endDate)}
                    </span>
                  </div>
                  {activity.description && (
                    <p className="text-gray-600 text-sm mt-1">{activity.description}</p>
                  )}
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* References */}
        {cvData.references && cvData.references.length > 0 && (
          <div className="mb-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-3">Người tham chiếu</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {cvData.references.map((ref, index) => (
                <Card key={index} className="bg-gray-50" size="small">
                  <h3 className="font-semibold text-gray-900">{ref.name}</h3>
                  {ref.position && <p className="text-gray-700 text-sm">{ref.position}</p>}
                  {ref.company && <p className="text-gray-600 text-sm">{ref.company}</p>}
                  {ref.contact && (
                    <p className="text-blue-600 text-sm mt-1">{ref.contact}</p>
                  )}
                </Card>
              ))}
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
}
