import { Injectable, BadRequestException, UnauthorizedException } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
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
  private transporter: nodemailer.Transporter;
  private otpStorage: Map<string, OtpData> = new Map();
  private readonly OTP_EXPIRY_MINUTES = 10;
  private readonly MAX_ATTEMPTS = 3;

  constructor() {
    this.transporter = nodemailer.createTransport({
      // Production email service
      host: process.env.MAIL_HOST || 'smtp.gmail.com',
      port: Number(process.env.MAIL_PORT) || 587,
      secure: false, // true for 465, false for other ports
      auth: {
        user: process.env.MAIL_USER,
        pass: process.env.MAIL_PASS,
      },
    });
  }

  // Generate 6-digit OTP
  private generateOTP(): string {
    return crypto.randomInt(100000, 999999).toString();
  }

  // Send OTP via email
  async sendOTP(email: string, purpose: 'signup' | 'signin' | 'reset' = 'signup', registrationData?: any): Promise<void> {
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

      const subject = {
        signup: 'Verify Your Email - Sign Up',
        signin: 'Verify Your Email - Sign In',
        reset: 'Reset Your Password'
      }[purpose];

      console.log('Sending OTP email to:', email);
      console.log('Mail config:', {
        host: process.env.MAIL_HOST,
        port: process.env.MAIL_PORT,
        user: process.env.MAIL_USER,
        from: process.env.FROM_EMAIL
      });

      await this.transporter.sendMail({
        from: `"No Reply" <${process.env.FROM_EMAIL}>`,
        to: email,
        subject,
        html: this.getEmailTemplate(otp, purpose)
      });

      console.log('OTP email sent successfully to:', email);
    } catch (error) {
      console.error('Error sending OTP email:', error);
      throw new Error(`Failed to send OTP email: ${error.message}`);
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