import { UserRole, Gender } from '../../domain/enums/index.js';

export interface RegisterUserInputDTO {
  email: string;
  password: string;
  fullName?: string;
  phoneNumber?: string | null;
  gender?: Gender | null;
  role?: UserRole;
  dateOfBirth?: Date | null;
}

export interface RegisterUserOutputDTO {
  id: string;
  email: string;
  fullName: string | null;
  phoneNumber: string | null;
  gender: Gender | null;
  role: UserRole;
  dateOfBirth: Date | null;
  status: string;
  avatarUrl: string | null;
  createdAt: Date;
  updatedAt: Date;
}
