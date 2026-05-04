import React from 'react';
import { useNavigate } from 'react-router';
import { Card, Button, Tag } from 'antd';
import { ShopOutlined, StarOutlined, StarFilled } from '@ant-design/icons';
import { Job } from '../lib/types';
import { formatSalaryRange } from '../lib/constants';

interface JobCardProps {
  job: Job;
  showSaveButton?: boolean;
  isSaved?: boolean;
  onSaveToggle?: (jobId: string) => void;
  matchingSkills?: string[];
  className?: string;
}

export function JobCard({
  job,
  showSaveButton = false,
  isSaved = false,
  onSaveToggle,
  matchingSkills,
  className = '',
}: JobCardProps) {
  const navigate = useNavigate();
  const company = job.company;
  
  const isNew = new Date(job.createdAt) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  const isFeatured = job.urgent || false;

  if (!company) return null;

  const handleCardClick = () => {
    navigate(`/jobs/${job.id}`);
  };

  return (
    <Card 
      className={`glassmorphism hover:shadow-lg transition-all cursor-pointer w-full max-w-full h-full flex flex-col ${className}`}
      onClick={handleCardClick}
      styles={{ 
        body: { 
          padding: '12px', 
          display: 'flex', 
          flexDirection: 'column', 
          flex: 1, 
          minHeight: 0, 
          overflow: 'hidden' 
        }
      }}
    >
      <div className="flex gap-2 sm:gap-3 min-w-0 flex-1 overflow-hidden">
        {/* Company Logo */}
        <div className="flex-shrink-0">
          <div className="h-10 w-10 sm:h-12 sm:w-12 bg-gray-100 rounded-lg flex items-center justify-center overflow-hidden">
            {company.logoUrl ? (
              <img
                src={company.logoUrl}
                alt={company.name}
                className="h-full w-full object-cover"
              />
            ) : (
              <ShopOutlined className="text-lg sm:text-xl text-gray-400" />
            )}
          </div>
        </div>

        {/* Job Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2 mb-1.5">
            <div className="flex-1 min-w-0">
              {/* Tags */}
              <div className="flex flex-wrap gap-1 mb-1.5">
                {isNew && (
                  <Tag color="blue" className="text-xs sm:text-sm flex-shrink-0">
                    TIN MỚI
                  </Tag>
                )}
                {isFeatured && (
                  <Tag color="orange" className="text-xs sm:text-sm flex-shrink-0">
                    TUYỂN GẤP
                  </Tag>
                )}
              </div>
              <h3 className="font-semibold text-gray-900 line-clamp-2 text-sm sm:text-base lg:text-lg leading-snug mb-1 break-words">
                {job.title}
              </h3>
            </div>
            {showSaveButton && (
              <Button
                type="text"
                icon={isSaved ? <StarFilled className="text-yellow-500" /> : <StarOutlined className="text-gray-400" />}
                className="flex-shrink-0"
                onClick={(e) => {
                  e.stopPropagation();
                  onSaveToggle?.(job.id);
                }}
              />
            )}
          </div>

          {company && (
            <p className="text-xs sm:text-sm text-gray-600 mb-2 line-clamp-1 truncate">
              {company.name}
            </p>
          )}

          {/* Job Details - Tags */}
          <div className="flex flex-wrap gap-1.5 sm:gap-2 mt-2 overflow-hidden">
            {/* Salary */}
            {job.salary && (
              <Tag className="text-xs sm:text-sm flex-shrink-0">
                {formatSalaryRange(
                  job.salary.minAmount || 0,
                  job.salary.maxAmount || 0,
                  job.salary.currency || 'VND',
                  job.salary.hideAmount || false,
                  job.salary.isNegotiable || false
                )}
              </Tag>
            )}

            {/* Location */}
            {job.location && (
              <Tag className="text-xs sm:text-sm truncate max-w-[calc(100%-4rem)] sm:max-w-full">
                {job.location}
              </Tag>
            )}
          </div>

          {/* Matching Skills */}
          {matchingSkills && matchingSkills.length > 0 && (
            <div className="mt-2">
              <div className="flex flex-wrap gap-1">
                {matchingSkills.slice(0, 3).map((skill, idx) => (
                  <Tag key={idx} color="blue" className="text-sm">
                    {skill}
                  </Tag>
                ))}
                {matchingSkills.length > 3 && (
                  <Tag className="text-sm">
                    +{matchingSkills.length - 3}
                  </Tag>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </Card>
  );
}

