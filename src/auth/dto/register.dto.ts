import { IsEmail, IsEnum, IsOptional, IsString, MinLength, IsBoolean } from 'class-validator';
import { AdminRole } from '../../admin/admin.entity';

export class RegisterDto {
    firstname: string;
    lastname: string;
    email: string;
    password: string;
    isAdmin?: boolean;
    role?: AdminRole;
    avatar?: string;
  }
  