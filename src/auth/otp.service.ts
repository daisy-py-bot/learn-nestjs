import * as sgMail from '@sendgrid/mail';
import { Injectable, BadRequestException, UnauthorizedException, Logger } from '@nestjs/common';
import * as crypto from 'crypto';

interface OtpData {
  email: string;
  otp: string;
  expiresAt: Date;
  attempts: number;
  registrationData?: any; // Store registration data for signup
}

@Injectable()
export class OtpService {
  private readonly logger = new Logger(OtpService.name);
  private otpStorage: Map<string, OtpData> = new Map();
  private readonly OTP_EXPIRY_MINUTES = 10;
  private readonly MAX_ATTEMPTS = 3;

  // constructor() {
  //   sgMail.setApiKey(process.env.SENDGRID_API_KEY || '');
  // }

  constructor() {
    console.log('=== DEBUG INFO ===');
    console.log('API Key exists:', !!process.env.SENDGRID_API_KEY);
    console.log('API Key length:', process.env.SENDGRID_API_KEY?.length);
    console.log('FROM_EMAIL:', process.env.FROM_EMAIL);
    console.log('==================');
    
    sgMail.setApiKey(process.env.SENDGRID_API_KEY || '');
  }

  // Generate 6-digit OTP
  private generateOTP(): string {
    return crypto.randomInt(100000, 999999).toString();
  }

  // Send OTP via email
  async sendOTP(
    email: string,
    purpose: 'signup' | 'signin' | 'reset' = 'signup',
    registrationData?: any,
  ): Promise<void> {
    try {
      const otp = this.generateOTP();
      const expiresAt = new Date(Date.now() + this.OTP_EXPIRY_MINUTES * 60 * 1000);

      // Store OTP in memory (use Redis/Database in production)
      this.otpStorage.set(email, {
        email,
        otp,
        expiresAt,
        attempts: 0,
        registrationData, // Store registration data for signup
      });

      const msg = {
        to: email,
        from: process.env.FROM_EMAIL || 'no-reply@yourdomain.com',
        subject: 'Your OTP Code',
        text: `Your OTP is: ${otp}`,
        html: `<p>Your OTP is: <strong>${otp}</strong></p>`,
      };

      await sgMail.send(msg);
      this.logger.log(`OTP email sent to: ${email}`);
    } catch (error) {
      this.logger.error('Error sending OTP email:', error);
      throw new Error('Failed to send OTP email: ' + error.message);
    }
  }

  // Verify OTP
  async verifyOTP(email: string, otp: string): Promise<{ isValid: boolean; registrationData?: any }> {
    const otpData = this.otpStorage.get(email);

    if (!otpData) {
      throw new BadRequestException('No OTP found for this email');
    }

    if (new Date() > otpData.expiresAt) {
      this.otpStorage.delete(email);
      throw new BadRequestException('OTP has expired');
    }

    if (otpData.attempts >= this.MAX_ATTEMPTS) {
      this.otpStorage.delete(email);
      throw new BadRequestException('Too many failed attempts');
    }

    if (otpData.otp !== otp) {
      otpData.attempts++;
      throw new UnauthorizedException('Invalid OTP');
    }

    const registrationData = otpData.registrationData;
    this.otpStorage.delete(email);
    return { isValid: true, registrationData };
  }

  // Email template
  private getEmailTemplate(otp: string, purpose: 'signup' | 'signin' | 'reset'): string {
    const heading = {
      signup: 'Email Verification',
      signin: 'Sign In Verification',
      reset: 'Reset Your Password'
    }[purpose];
  
    return `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>${heading}</h2>
        <p>Your verification code is:</p>
        <div style="background: #f0f0f0; padding: 20px; text-align: center; margin: 20px 0;">
          <h1 style="color: #007bff; font-size: 32px; margin: 0;">${otp}</h1>
        </div>
        <p>This code will expire in ${this.OTP_EXPIRY_MINUTES} minutes.</p>
        <p>If you didn't request this, please ignore this email.</p>
      </div>
    `;
  }
} 