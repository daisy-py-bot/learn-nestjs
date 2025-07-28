import { IsEmail, IsEnum, IsNotEmpty } from 'class-validator';

export class ResendOtpDto {
  @IsEmail()
  email: string;

  @IsEnum(['signup', 'signin'])
  purpose: 'signup' | 'signin';
} 