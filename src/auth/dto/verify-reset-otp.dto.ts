import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class VerifyResetOtpDto {
  @IsEmail()
  email: string;

  @IsString()
  @IsNotEmpty()
  otp: string;
} 