import { UserRole, Gender, UserStatus } from '../../domain/enums/index.js';

export interface LoginUserInputDTO {
  email: string;
  password: string;
}

export interface LoginUserOutputDTO {
  user: {
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
  };
  token: string;
  expiresIn: number;
}
