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
    // Check if user already exists
    const existingUser = await this.usersService.findByEmail(data.email);
    const existingAdmin = await this.adminService.findOneByEmail(data.email);
    
    if (existingUser || existingAdmin) {
      throw new ConflictException('User with this email already exists');
    }
    
    // Hash password for storage
    const hashedPassword = await bcrypt.hash(data.password, 10);
    
    // Store registration data temporarily with OTP
    const registrationData = {
      ...data,
      password: hashedPassword,
      isEmailVerified: false,
    };
    
    // Send OTP for email verification (don't create user yet)
    try {
      await this.otpService.sendOTP(data.email, 'signup', registrationData);
      return {
        message: 'Please check your email and verify with the OTP sent.',
        email: data.email,
      };
    } catch (error) {
      console.error('Failed to send OTP:', error);
      throw new BadRequestException('Failed to send verification email. Please try again.');
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
    const verificationResult = await this.otpService.verifyOTP(email, otp);
    
    if (!verificationResult.isValid) {
      throw new BadRequestException('Invalid OTP');
    }

    // Check if user already exists (in case of duplicate verification attempts)
    const existingUser = await this.usersService.findByEmail(email);
    const existingAdmin = await this.adminService.findOneByEmail(email);

    if (existingUser || existingAdmin) {
      // User already exists, just verify email
      if (existingUser && !existingUser.isEmailVerified) {
        await this.usersService.update(existingUser.id, { isEmailVerified: true });
        const payload = { sub: existingUser.id, email: existingUser.email, isAdmin: false };
        return { 
          message: 'Email verified successfully. Welcome!',
          access_token: this.jwtService.sign(payload),
          user: { id: existingUser.id, email: existingUser.email, isAdmin: false }
        };
      } else if (existingAdmin && !existingAdmin.isEmailVerified) {
        await this.adminService.update(existingAdmin.id, { isEmailVerified: true });
        const payload = { sub: existingAdmin.id, email: existingAdmin.email, role: existingAdmin.role, isAdmin: true };
        return { 
          message: 'Email verified successfully. Welcome!',
          access_token: this.jwtService.sign(payload),
          user: { id: existingAdmin.id, email: existingAdmin.email, role: existingAdmin.role, isAdmin: true }
        };
             } else {
         // Already verified
         const user = existingUser || existingAdmin;
         if (!user) {
           throw new NotFoundException('User not found');
         }
         const payload = { 
           sub: user.id, 
           email: user.email, 
           isAdmin: !!existingAdmin,
           ...(existingAdmin && { role: existingAdmin.role })
         };
         return { 
           message: 'Email is already verified. Welcome back!',
           access_token: this.jwtService.sign(payload),
           user: { 
             id: user.id, 
             email: user.email, 
             isAdmin: !!existingAdmin,
             ...(existingAdmin && { role: existingAdmin.role })
           }
         };
       }
    }

    // Create new user/admin with registration data
    if (verificationResult.registrationData) {
      const { registrationData } = verificationResult;
      
      if (registrationData.isAdmin) {
        const admin = await this.adminService.create({
          ...registrationData,
          isEmailVerified: true, // Mark as verified since OTP was verified
        });
        
        const payload = { sub: admin.id, email: admin.email, role: admin.role, isAdmin: true };
        return { 
          message: 'Account created and email verified successfully. Welcome!',
          access_token: this.jwtService.sign(payload),
          user: { id: admin.id, email: admin.email, role: admin.role, isAdmin: true }
        };
      } else {
        const user = await this.usersService.create({
          ...registrationData,
          isEmailVerified: true, // Mark as verified since OTP was verified
        });
        
        const payload = { sub: user.id, email: user.email, isAdmin: false };
        return { 
          message: 'Account created and email verified successfully. Welcome!',
          access_token: this.jwtService.sign(payload),
          user: { id: user.id, email: user.email, isAdmin: false }
        };
      }
    }

    throw new BadRequestException('Invalid verification data');
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
    const result = await this.otpService.verifyOTP(email, otp);
    if (!result.isValid) {
      throw new BadRequestException('Invalid OTP');
    }
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
