# OTP Authentication Setup Guide

## Overview
This guide explains how to set up OTP (One-Time Password) authentication in your NestJS application.

## Environment Variables
Add the following environment variables to your `.env` file:

```env
# Email Configuration for OTP
MAIL_HOST=smtp.mailtrap.io
MAIL_PORT=2525
MAIL_USER=your_mailtrap_user
MAIL_PASS=your_mailtrap_pass
FROM_EMAIL=no-reply@example.com
```

## Email Service Setup
1. **Mailtrap (Recommended for Development):**
   - Sign up at [mailtrap.io](https://mailtrap.io)
   - Create a new inbox
   - Use the SMTP credentials provided

2. **Production Email Service:**
   - For production, use services like SendGrid, AWS SES, or Gmail
   - Update the SMTP configuration accordingly

## Database Migration
After adding the `isEmailVerified` field to entities, run:

```bash
npm run typeorm:generate -- -n AddEmailVerification
npm run typeorm:run
```

## API Endpoints

### Registration Flow
1. **POST /auth/register** - Register a new user
   - Returns: `{ message: "Account created. Please verify your email with the OTP sent.", email: "user@example.com" }`

2. **POST /auth/verify-email** - Verify email with OTP
   ```json
   {
     "email": "user@example.com",
     "otp": "123456"
   }
   ```

3. **POST /auth/resend-otp** - Resend OTP
   ```json
   {
     "email": "user@example.com",
     "purpose": "signup"
   }
   ```

### Login Flow
1. **POST /auth/login** - Login (requires email verification)
   - Will return error if email is not verified

### Password Reset Flow
1. **POST /auth/forgot-password** - Request password reset
   ```json
   {
     "email": "user@example.com"
   }
   ```

2. **POST /auth/verify-reset-otp** - Verify reset OTP
   ```json
   {
     "email": "user@example.com",
     "otp": "123456"
   }
   ```

3. **POST /auth/reset-password** - Reset password
   ```json
   {
     "email": "user@example.com",
     "newPassword": "newpassword123"
   }
   ```

## Security Features
- OTP expires after 10 minutes
- Maximum 3 failed attempts per OTP
- Email verification required before login
- Secure password hashing with bcrypt

## Production Considerations
1. **Use Redis/Database for OTP Storage:** Replace the in-memory Map with Redis or database storage
2. **Rate Limiting:** Implement rate limiting for OTP requests
3. **Email Templates:** Customize email templates for your brand
4. **Monitoring:** Add logging and monitoring for OTP operations 