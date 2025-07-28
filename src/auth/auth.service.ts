import { Injectable, UnauthorizedException, BadRequestException, ConflictException, NotFoundException } from '@nestjs/common';
import { UsersService } from 'src/users/users.service';
import { AdminService } from 'src/admin/admin.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { ActivityLogsService } from '../activity-logs/activity-logs.service';
import { ActionType } from '../activity-logs/activity-log.entity';
import { OtpService } from './otp.service';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private adminService: AdminService,
    private jwtService: JwtService,
    private activityLogsService: ActivityLogsService,
    private otpService: OtpService,
  ) {}

  async register(data: RegisterDto) {
    const hashedPassword = await bcrypt.hash(data.password, 10);
    
    // Check if user already exists
    const existingUser = await this.usersService.findByEmail(data.email);
    const existingAdmin = await this.adminService.findOneByEmail(data.email);
    
    if (existingUser || existingAdmin) {
      throw new ConflictException('User with this email already exists');
    }
    
    // Check if this is an admin registration
    if (data.isAdmin) {
      const admin = await this.adminService.create({
        ...data,
        password: hashedPassword,
        isEmailVerified: false, // Add email verification status
      });
      
      // Send OTP for email verification
      try {
        await this.otpService.sendOTP(data.email, 'signup');
        return {
          message: 'Account created. Please verify your email with the OTP sent.',
          email: data.email,
        };
      } catch (error) {
        console.error('Failed to send OTP for admin:', error);
        return {
          message: 'Account created but email verification failed. Please contact support.',
          email: data.email,
          error: 'OTP_SEND_FAILED'
        };
      }
    } else {
      const user = await this.usersService.create({
        ...data,
        password: hashedPassword,
        isEmailVerified: false, // Add email verification status
      });
      
      // Send OTP for email verification
      try {
        await this.otpService.sendOTP(data.email, 'signup');
        return {
          message: 'Account created. Please verify your email with the OTP sent.',
          email: data.email,
        };
      } catch (error) {
        console.error('Failed to send OTP for user:', error);
        return {
          message: 'Account created but email verification failed. Please contact support.',
          email: data.email,
          error: 'OTP_SEND_FAILED'
        };
      }
    }
  }

  async login(data: LoginDto) {
    // Only try user login for regular login endpoint
    const user = await this.usersService.findByEmail(data.email);
    if (!user || !(await bcrypt.compare(data.password, user.password))) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Check if email is verified
    if (!user.isEmailVerified) {
      throw new UnauthorizedException('Email not verified. Please verify before signing in.');
    }

    // Update last login timestamp
    await this.usersService.updateLastLogin(user.id);

    // Log login activity
    await this.activityLogsService.create({
      userId: user.id,
      actionType: ActionType.LOGIN,
      metadata: { email: user.email, isAdmin: false },
    });

    const payload = { sub: user.id, email: user.email, isAdmin: false };
    return {
      access_token: this.jwtService.sign(payload),
    };
  }

  async adminLogin(data: LoginDto) {
    // Only try admin login for admin login endpoint
    console.log('Admin login attempt for email:', data.email);
    const admin = await this.adminService.findOneByEmail(data.email);
    console.log('Admin found:', admin);
    if (!admin || !(await bcrypt.compare(data.password, admin.password))) {
      throw new UnauthorizedException('Invalid admin credentials');
    }

    // Check if email is verified
    if (!admin.isEmailVerified) {
      throw new UnauthorizedException('Email not verified. Please verify before signing in.');
    }

    await this.adminService.update(admin.id, { lastLogin: new Date() });

    // // Log login activity
    // await this.activityLogsService.create({
    //   userId: admin.id,
    //   actionType: ActionType.LOGIN,
    //   metadata: { email: admin.email, isAdmin: true },
    // });

    const payload = { sub: admin.id, email: admin.email, role: admin.role, isAdmin: true };
    return {
      access_token: this.jwtService.sign(payload),
    };
  }

  async verifySignupOTP(email: string, otp: string): Promise<{ message: string; access_token?: string; user?: any }> {
    await this.otpService.verifyOTP(email, otp);

    const user = await this.usersService.findByEmail(email);
    const admin = await this.adminService.findOneByEmail(email);

    if (!user && !admin) {
      throw new NotFoundException('User not found');
    }

    if (user && user.isEmailVerified) {
      // User already verified, return token
      const payload = { sub: user.id, email: user.email, isAdmin: false };
      return { 
        message: 'Email is already verified. Welcome back!',
        access_token: this.jwtService.sign(payload),
        user: { id: user.id, email: user.email, isAdmin: false }
      };
    }

    if (admin && admin.isEmailVerified) {
      // Admin already verified, return token
      const payload = { sub: admin.id, email: admin.email, role: admin.role, isAdmin: true };
      return { 
        message: 'Email is already verified. Welcome back!',
        access_token: this.jwtService.sign(payload),
        user: { id: admin.id, email: admin.email, role: admin.role, isAdmin: true }
      };
    }

    if (user) {
      await this.usersService.update(user.id, { isEmailVerified: true });
      const payload = { sub: user.id, email: user.email, isAdmin: false };
      return { 
        message: 'Email verified successfully. Welcome!',
        access_token: this.jwtService.sign(payload),
        user: { id: user.id, email: user.email, isAdmin: false }
      };
    } else if (admin) {
      await this.adminService.update(admin.id, { isEmailVerified: true });
      const payload = { sub: admin.id, email: admin.email, role: admin.role, isAdmin: true };
      return { 
        message: 'Email verified successfully. Welcome!',
        access_token: this.jwtService.sign(payload),
        user: { id: admin.id, email: admin.email, role: admin.role, isAdmin: true }
      };
    }

    // This should never be reached due to the earlier checks, but TypeScript requires it
    throw new NotFoundException('User not found');
  }

  async resendOTP(email: string, purpose: 'signup' | 'signin'): Promise<{ message: string }> {
    await this.otpService.sendOTP(email, purpose);
    
    return {
      message: 'New verification code sent to your email'
    };
  }

  async requestPasswordReset(email: string): Promise<{ message: string }> {
    const user = await this.usersService.findByEmail(email);
    const admin = await this.adminService.findOneByEmail(email);

    if (!user && !admin) {
      throw new NotFoundException('No user found with this email');
    }

    await this.otpService.sendOTP(email, 'reset');

    return { message: 'Password reset OTP sent to your email' };
  }

  async verifyResetOTP(email: string, otp: string): Promise<{ message: string }> {
    await this.otpService.verifyOTP(email, otp);
    return { message: 'OTP verified. You can now reset your password' };
  }

  async resetPassword(email: string, newPassword: string): Promise<{ message: string }> {
    const user = await this.usersService.findByEmail(email);
    const admin = await this.adminService.findOneByEmail(email);

    if (!user && !admin) {
      throw new NotFoundException('User not found');
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    if (user) {
      await this.usersService.update(user.id, { password: hashedPassword });
    } else if (admin) {
      await this.adminService.update(admin.id, { password: hashedPassword });
    }

    return { message: 'Password reset successful' };
  }
}
