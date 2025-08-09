import { IsEmail, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class BootstrapAdminDto {
  @IsOptional()
  @IsString()
  secret?: string;

  @IsString()
  @IsNotEmpty()
  firstname: string;

  @IsString()
  @IsNotEmpty()
  lastname: string;

  @IsEmail()
  email: string;

  @IsString()
  @IsNotEmpty()
  password: string;

  @IsOptional()
  @IsString()
  avatar?: string;
}

