import { Controller, Post, Body, UnauthorizedException, ConflictException } from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { VerifyEmailDto } from './dto/verify-email.dto';
import { ResendOtpDto } from './dto/resend-otp.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { VerifyResetOtpDto } from './dto/verify-reset-otp.dto';
import { BootstrapAdminDto } from './dto/bootstrap-admin.dto';
import { AdminRole } from 'src/admin/admin.entity';
import * as bcrypt from 'bcrypt';
import { AdminService } from 'src/admin/admin.service';
import { ResetPasswordDto } from './dto/reset-password.dto';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService, private adminService: AdminService) {}

  @Post('register')
  register(@Body() data: RegisterDto) {
    return this.authService.register(data);
  }

  @Post('admin/register')
  registerAdmin(@Body() data: RegisterDto) {
    return this.authService.register({ ...data, isAdmin: true });
  }

  @Post('login')
  login(@Body() data: LoginDto) {
    return this.authService.login(data);
  }

  @Post('admin/login')
  adminLogin(@Body() data: LoginDto) {
    return this.authService.adminLogin(data);
  }

  @Post('verify-email')
  async verifyEmail(@Body() body: VerifyEmailDto) {
    return this.authService.verifySignupOTP(body.email, body.otp);
  }

  @Post('resend-otp')
  async resendOtp(@Body() resendOtpDto: ResendOtpDto) {
    return this.authService.resendOTP(resendOtpDto.email, resendOtpDto.purpose);
  }

  @Post('forgot-password')
  async forgotPassword(@Body() body: ForgotPasswordDto) {
    return this.authService.requestPasswordReset(body.email);
  }

  @Post('verify-reset-otp')
  async verifyResetOtp(@Body() body: VerifyResetOtpDto) {
    return this.authService.verifyResetOTP(body.email, body.otp);
  }

  @Post('reset-password')
  async resetPassword(@Body() body: ResetPasswordDto) {
    return this.authService.resetPassword(body.email, body.newPassword);
  }

  // Bootstrap endpoint to create a super admin directly (bypassing OTP)
  @Post('bootstrap-super-admin')
  async bootstrapSuperAdmin(@Body() body: BootstrapAdminDto) {
    // fail if email already exists
    const existing = await this.adminService.findOneByEmail(body.email);
    if (existing) {
      throw new ConflictException('Admin with this email already exists');
    }

    const hashed = await bcrypt.hash(body.password, 10);
    const admin = await this.adminService.create({
      firstname: body.firstname,
      lastname: body.lastname,
      email: body.email,
      password: hashed,
      role: AdminRole.SUPER_ADMIN,
      avatar: body.avatar,
      isEmailVerified: true,
    });
    return { message: 'Super admin created', admin: { id: admin.id, email: admin.email, role: admin.role } };
  }
}
