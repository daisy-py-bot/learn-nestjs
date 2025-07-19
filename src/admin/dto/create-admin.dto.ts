import { IsEmail, IsEnum, IsOptional, IsString, MinLength } from 'class-validator';
import { AdminRole } from '../admin.entity';

export class CreateAdminDto {
  @IsString()
  firstname: string;

  @IsString()
  lastname: string;

  @IsEmail()
  email: string;

  @IsString()
  @MinLength(6)
  password: string;

  @IsOptional()
  @IsEnum(AdminRole)
  role?: AdminRole;
}
