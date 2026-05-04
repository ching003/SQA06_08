import { UserRole, Gender, UserStatus } from '../../domain/enums/index.js';

export interface UpdateProfileInputDTO {
  id: string;
  fullName?: string;
  phoneNumber?: string | null;
  gender?: Gender | null;
  dateOfBirth?: Date | null;
}

export interface UpdateProfileOutputDTO {
  id: string;
  email: string;
  fullName: string | null;
  phoneNumber: string | null;
  gender: Gender | null;
  role: UserRole;
  dateOfBirth: Date | null;
  status: UserStatus;
  avatarUrl: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface ChangePasswordInputDTO {
  id: string;
  oldPassword: string;
  newPassword: string;
}

export interface ChangePasswordOutputDTO {
  success: boolean;
  message: string;
}

export interface UploadAvatarInputDTO {
  id: string;
  file: {
    buffer: Buffer;
    originalname: string;
    mimetype: string;
  };
}

export interface UploadAvatarOutputDTO {
  avatarUrl: string;
}

export interface UpdateUserStatusInputDTO {
  id: string;
  status: UserStatus;
}

export interface UpdateUserStatusOutputDTO {
  id: string;
  status: UserStatus;
  updatedAt: Date;
}

export interface LockUserInputDTO {
  userId: string;
  adminId: string;
}

export interface UnlockUserInputDTO {
  userId: string;
  adminId: string;
}

export interface LockUnlockUserOutputDTO {
  id: string;
  status: UserStatus;
  updatedAt: Date;
}

export interface CreateUserInputDTO {
  email: string;
  password: string;
  fullName: string;
  phoneNumber?: string | null;
  gender?: Gender | null;
  role?: UserRole;
  dateOfBirth?: Date | null;
  status?: UserStatus;
  avatarUrl?: string | null;
}

export interface CreateUserOutputDTO {
  id: string;
  email: string;
  fullName: string | null;
  phoneNumber: string | null;
  gender: Gender | null;
  role: UserRole;
  dateOfBirth: Date | null;
  status: UserStatus;
  avatarUrl: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface UpdateUserInputDTO {
  id: string;
  email?: string;
  fullName?: string;
  phoneNumber?: string | null;
  gender?: Gender | null;
  role?: UserRole;
  dateOfBirth?: Date | null;
  status?: UserStatus;
  avatarUrl?: string | null;
}

export interface UpdateUserOutputDTO {
  id: string;
  email: string;
  fullName: string | null;
  phoneNumber: string | null;
  gender: Gender | null;
  role: UserRole;
  dateOfBirth: Date | null;
  status: UserStatus;
  avatarUrl: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface DeleteUserInputDTO {
  id: string;
}

export interface DeleteUserOutputDTO {
  success: boolean;
  message: string;
}
