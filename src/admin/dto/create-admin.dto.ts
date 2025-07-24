import { IsEmail, IsEnum, IsOptional, IsString, MinLength } from 'class-validator';
import { AdminRole } from '../admin.entity';

export class CreateAdminDto {
  firstname: string;
  lastname: string;
  email: string;
  password: string;
  role?: AdminRole;
  avatar?: string;
}
