import React from 'react';
import { Card, Tag } from 'antd';
import { Link } from 'react-router';
import { Company } from '../lib/types';
import { ShopOutlined } from '@ant-design/icons';

type CompanyCardProps = {
  company: Company;
  jobCount?: number;
  href?: string;
  className?: string;
};

export function CompanyCard({
  company,
  jobCount = 0,
  href = `/companies/${company.id}`,
  className = '',
}: CompanyCardProps) {
  const address = company.address
    ? company.address.split(',').slice(-2).join(',').trim()
    : '';

  return (
    <Link to={href} className="block h-full">
      <Card 
        className={`glassmorphism hover:shadow-md transition-all hover:-translate-y-1 w-full h-full flex flex-col ${className}`} 
        styles={{ 
          body: { padding: 0, display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0 }
        }}
      >
        {/* Banner */}
        <div className="h-16 sm:h-20 bg-gradient-to-r from-blue-500 to-blue-600 rounded-t-lg overflow-hidden flex-shrink-0">
          <img 
            src={company.bannerUrl || '/1.jpg'} 
            alt="" 
            className="w-full h-full object-cover" 
            onError={(e) => {
              // Fallback nếu cả bannerUrl và 1.jpg đều lỗi
              (e.target as HTMLImageElement).src = '/1.jpg';
            }}
          />
        </div>

        {/* Content Area */}
        <div className="p-4 flex flex-col flex-1">
          {/* Logo and Company Name Row */}
          <div className="flex items-start gap-3 mb-3">
            {/* Logo */}
            <div className="h-12 w-12 sm:h-14 sm:w-14 bg-white rounded-lg shadow-sm flex items-center justify-center border border-gray-200 overflow-hidden flex-shrink-0">
              {company.logoUrl ? (
                <img src={company.logoUrl} alt={company.name} className="h-full w-full object-cover" />
              ) : (
                <ShopOutlined className="h-6 w-6 sm:h-7 sm:w-7 text-gray-400" />
              )}
            </div>

            {/* Company Name */}
            <div className="flex-1 min-w-0">
              <h3 className="text-base sm:text-lg font-semibold text-gray-900 line-clamp-2 mb-2">
                {company.name}
              </h3>

              {/* Industry, Location and Job Count Tags */}
              <div className="flex flex-wrap gap-2 items-center">
                {company.industry && (
                  <Tag color="blue" className="text-xs sm:text-sm whitespace-nowrap">
                    {company.industry}
                  </Tag>
                )}
                {address && (
                  <Tag className="text-xs sm:text-sm text-gray-600">
                    {address}
                  </Tag>
                )}
                <Tag className="text-xs sm:text-sm text-gray-600">
                  {jobCount} vị trí
                </Tag>
              </div>
            </div>
          </div>
        </div>
      </Card>
    </Link>
  );
}

