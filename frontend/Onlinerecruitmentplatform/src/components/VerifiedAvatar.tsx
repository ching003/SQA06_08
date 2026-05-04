import React from 'react';
import { CheckCircleFilled, ShopOutlined, UserOutlined } from '@ant-design/icons';

interface VerifiedAvatarProps {
  src?: string;
  alt?: string;
  size?: number;
  isVerified?: boolean;
  type?: 'company' | 'user';
  name?: string;
  className?: string;
  showBorder?: boolean;
}

export function VerifiedAvatar({
  src,
  alt,
  size = 128,
  isVerified = false,
  type = 'company',
  name,
  className = '',
  showBorder = true,
}: VerifiedAvatarProps) {
  const borderClass = showBorder
    ? 'border-2 sm:border-4 border-white shadow-lg'
    : '';

  const avatarContent = src ? (
    <img
      src={src}
      alt={alt || name}
      className="h-full w-full object-contain rounded"
    />
  ) : type === 'company' ? (
    <ShopOutlined className="text-3xl sm:text-4xl lg:text-5xl text-gray-400" />
  ) : (
    <UserOutlined className="text-3xl sm:text-4xl lg:text-5xl text-gray-400" />
  );

  return (
    <div className={`relative inline-block ${className}`}>
      <div
        className={`bg-white rounded-lg flex items-center justify-center ${borderClass}`}
        style={{ height: size, width: size }}
      >
        {avatarContent}
      </div>

      {isVerified && (
        <div className="absolute -bottom-1 -right-1 bg-white rounded-full p-0.5">
          <CheckCircleFilled
            style={{
              fontSize: size > 100 ? 24 : 20,
              color: '#52c41a',
            }}
          />
        </div>
      )}
    </div>
  );
}
