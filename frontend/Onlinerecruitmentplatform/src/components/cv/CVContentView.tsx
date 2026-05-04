import React from 'react';
import { Card, Tag, Divider } from 'antd';
import {
  MailOutlined,
  PhoneOutlined,
  EnvironmentOutlined,
  CalendarOutlined,
  ProjectOutlined,
  BookOutlined,
  TrophyOutlined,
  GlobalOutlined,
  LinkOutlined,
  UserOutlined,
} from '@ant-design/icons';
import { CV, SkillLevel, LanguageLevel } from '../../lib/types';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';

// Enum label mappings
const skillLevelLabels: Record<string, string> = {
  BEGINNER: 'Cơ bản',
  INTERMEDIATE: 'Trung bình',
  ADVANCED: 'Nâng cao',
  EXPERT: 'Chuyên gia',
};

const languageLevelLabels: Record<string, string> = {
  BASIC: 'Cơ bản',
  INTERMEDIATE: 'Trung bình',
  ADVANCED: 'Nâng cao',
  NATIVE: 'Bản ngữ',
};

interface CVContentViewProps {
  cv: CV;
  showHeader?: boolean;
}

export function CVContentView({ cv, showHeader = true }: CVContentViewProps) {
  const formatDate = (date: Date | string | null | undefined) => {
    if (!date) return 'Hiện tại';
    return format(new Date(date), 'MM/yyyy', { locale: vi });
  };

  return (
    <Card styles={{ body: { padding: '24px 32px' } }}>
        {/* Personal Info */}
        {showHeader && (
          <>
            <div className="text-center mb-6">
              <h1 className="text-xl font-bold text-gray-900 mb-1">
                {cv.fullName || cv.user?.fullName || 'Chưa cập nhật'}
              </h1>
              {cv.currentPosition && (
                <p className="text-blue-600 mb-3">{cv.currentPosition}</p>
              )}

              <div className="flex flex-wrap justify-center gap-3 text-sm text-gray-600">
                {cv.email && (
                  <div className="flex items-center gap-1">
                    <MailOutlined className="text-base" />
                    <span>{cv.email}</span>
                  </div>
                )}
                {cv.phoneNumber && (
                  <div className="flex items-center gap-1">
                    <PhoneOutlined className="text-base" />
                    <span>{cv.phoneNumber}</span>
                  </div>
                )}
                {cv.address && (
                  <div className="flex items-center gap-1">
                    <EnvironmentOutlined className="text-base" />
                    <span>{cv.address}</span>
                  </div>
                )}
              </div>
            </div>
            <Divider className="my-6" />
          </>
        )}

        {/* Summary */}
        {cv.summary && (
          <>
            <div className="mb-6">
              <h2 className="font-semibold text-gray-900 mb-2">Giới thiệu</h2>
              <p className="text-gray-700 whitespace-pre-line text-sm">{cv.summary}</p>
            </div>
            <Divider className="my-6" />
          </>
        )}

        {/* Objective */}
        {cv.objective && (
          <>
            <div className="mb-6">
              <h2 className="font-semibold text-gray-900 mb-2">Mục tiêu nghề nghiệp</h2>
              <p className="text-gray-700 whitespace-pre-line text-sm">{cv.objective}</p>
            </div>
            <Divider className="my-6" />
          </>
        )}

        {/* Work Experience */}
        {cv.workExperiences && cv.workExperiences.length > 0 && (
          <>
            <div className="mb-6">
              <h2 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <ProjectOutlined className="text-base" />
                Kinh nghiệm làm việc
              </h2>
              <div className="space-y-4">
                {cv.workExperiences.map((work) => (
                  <div key={work.id} className="pl-3 border-l-2 border-blue-600">
                    <h3 className="font-medium text-gray-900">{(work as any).jobTitle || (work as any).title}</h3>
                    <p className="text-sm text-gray-600">{(work as any).companyName || (work as any).company}</p>
                    <p className="text-xs text-gray-500 mb-1">
                      {formatDate(work.startDate)} - {formatDate(work.endDate)}
                    </p>
                    {work.description && (
                      <p className="text-sm text-gray-700 whitespace-pre-line">{work.description}</p>
                    )}
                  </div>
                ))}
              </div>
            </div>
            <Divider className="my-6" />
          </>
        )}

        {/* Education */}
        {cv.educations && cv.educations.length > 0 && (
          <>
            <div className="mb-6">
              <h2 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <BookOutlined className="text-base" />
                Học vấn
              </h2>
              <div className="space-y-4">
                {cv.educations.map((edu) => (
                  <div key={edu.id} className="pl-3 border-l-2 border-green-600">
                    <h3 className="font-medium text-gray-900">{edu.degree}</h3>
                    <p className="text-sm text-gray-600">{edu.institution}</p>
                    <p className="text-xs text-gray-500 mb-1">
                      {formatDate(edu.startDate)} - {formatDate(edu.endDate)}
                    </p>
                    {edu.description && (
                      <p className="text-sm text-gray-700 whitespace-pre-line">{edu.description}</p>
                    )}
                  </div>
                ))}
              </div>
            </div>
            <Divider className="my-6" />
          </>
        )}

        {/* Skills */}
        {cv.skills && cv.skills.length > 0 && (
          <>
            <div className="mb-6">
              <h2 className="font-semibold text-gray-900 mb-3">Kỹ năng</h2>
              <div className="flex flex-wrap gap-2">
                {cv.skills.map((skill) => (
                  <Tag key={skill.id} className="text-sm">
                    {skill.skillName}
                    {skill.level && (
                      <span className="ml-1 text-xs text-gray-500">
                        ({skillLevelLabels[skill.level] || skill.level})
                      </span>
                    )}
                  </Tag>
                ))}
              </div>
            </div>
            <Divider className="my-6" />
          </>
        )}

        {/* Projects */}
        {cv.projects && cv.projects.length > 0 && (
          <>
            <div className="mb-6">
              <h2 className="font-semibold text-gray-900 mb-3">Dự án</h2>
              <div className="space-y-4">
                {cv.projects.map((project) => (
                  <div key={project.id} className="p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-start justify-between mb-1">
                      <h3 className="font-medium text-gray-900">{project.name}</h3>
                      {project.url && (
                        <a href={project.url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                          <LinkOutlined className="text-base" />
                        </a>
                      )}
                    </div>
                    {project.role && (
                      <p className="text-sm text-gray-600 mb-1">{project.role}</p>
                    )}
                    <p className="text-xs text-gray-500 mb-1">
                      {formatDate(project.startDate)} - {formatDate(project.endDate)}
                    </p>
                    {project.description && (
                      <p className="text-sm text-gray-700 whitespace-pre-line">{project.description}</p>
                    )}
                  </div>
                ))}
              </div>
            </div>
            <Divider className="my-6" />
          </>
        )}

        {/* Certifications */}
        {cv.certifications && cv.certifications.length > 0 && (
          <>
            <div className="mb-6">
              <h2 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <TrophyOutlined className="text-base" />
                Chứng chỉ
              </h2>
              <div className="space-y-3">
                {cv.certifications.map((cert) => (
                  <div key={cert.id} className="p-3 bg-gray-50 rounded-lg">
                    <h3 className="font-medium text-gray-900">{cert.name}</h3>
                    <p className="text-sm text-gray-600">{cert.issuer}</p>
                    <p className="text-xs text-gray-500">
                      Cấp: {formatDate(cert.acquiredAt)}
                    </p>
                  </div>
                ))}
              </div>
            </div>
            <Divider className="my-6" />
          </>
        )}

        {/* Languages */}
        {cv.languages && cv.languages.length > 0 && (
          <>
            <div className="mb-6">
              <h2 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <GlobalOutlined className="text-base" />
                Ngôn ngữ
              </h2>
              <div className="flex flex-wrap gap-2">
                {cv.languages.map((lang) => (
                  <Tag key={lang.id} className="text-sm">
                    {lang.name}
                    {lang.level && (
                      <span className="ml-1 text-xs text-gray-500">
                        ({languageLevelLabels[lang.level] || lang.level})
                      </span>
                    )}
                  </Tag>
                ))}
              </div>
            </div>
            <Divider className="my-6" />
          </>
        )}

        {/* Achievements */}
        {cv.achievements && cv.achievements.length > 0 && (
          <>
            <div className="mb-6">
              <h2 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <TrophyOutlined className="text-base" />
                Thành tựu
              </h2>
              <div className="space-y-3">
                {cv.achievements.map((achievement) => (
                  <div key={achievement.id} className="p-3 bg-gray-50 rounded-lg">
                    <h3 className="font-medium text-gray-900">{achievement.title}</h3>
                    {achievement.acquiredAt && (
                      <p className="text-xs text-gray-500 mb-1">
                        Đạt được: {formatDate(achievement.acquiredAt)}
                      </p>
                    )}
                    {achievement.description && (
                      <p className="text-sm text-gray-700 whitespace-pre-line">{achievement.description}</p>
                    )}
                  </div>
                ))}
              </div>
            </div>
            <Divider className="my-6" />
          </>
        )}

        {/* Activities */}
        {cv.activities && cv.activities.length > 0 && (
          <>
            <div className="mb-6">
              <h2 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <CalendarOutlined className="text-base" />
                Hoạt động
              </h2>
              <div className="space-y-4">
                {cv.activities.map((activity) => (
                  <div key={activity.id} className="pl-3 border-l-2 border-purple-600">
                    <h3 className="font-medium text-gray-900">{activity.title}</h3>
                    {activity.organization && (
                      <p className="text-sm text-gray-600">{activity.organization}</p>
                    )}
                    <p className="text-xs text-gray-500 mb-1">
                      {formatDate(activity.startDate)} - {formatDate(activity.endDate)}
                    </p>
                    {activity.description && (
                      <p className="text-sm text-gray-700 whitespace-pre-line">{activity.description}</p>
                    )}
                  </div>
                ))}
              </div>
            </div>
            <Divider className="my-6" />
          </>
        )}

        {/* References */}
        {cv.references && cv.references.length > 0 && (
          <div className="mb-6">
            <h2 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <UserOutlined className="text-base" />
              Người tham khảo
            </h2>
            <div className="grid md:grid-cols-2 gap-3">
              {cv.references.map((ref) => (
                <div key={ref.id} className="p-3 bg-gray-50 rounded-lg">
                  <h3 className="font-medium text-gray-900">{ref.name}</h3>
                  {ref.position && (
                    <p className="text-sm text-gray-600">{ref.position}</p>
                  )}
                  {ref.company && (
                    <p className="text-sm text-gray-600">{ref.company}</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Footer - Last updated */}
        <div className="text-center text-xs text-gray-500 pt-4 border-t">
          Cập nhật: {format(new Date(cv.updatedAt || cv.createdAt), 'dd/MM/yyyy HH:mm', { locale: vi })}
        </div>
    </Card>
  );
}
