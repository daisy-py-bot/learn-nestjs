import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { UsersModule } from 'src/users/users.module';
import { AdminModule } from 'src/admin/admin.module';
import { JwtModule } from '@nestjs/jwt';
import { JwtStrategy } from './jwt.strategy';
import { ActivityLogsModule } from '../activity-logs/activity-logs.module';
import { OtpService } from './otp.service';

@Module({
  imports: [
    UsersModule,
    AdminModule,
    JwtModule.register({
      secret: 'hardcoded_secret_key', // <-- Hardcoded secret....needs to be changed
      signOptions: { expiresIn: '7d' },
    }),
    ActivityLogsModule,
  ],
  providers: [AuthService, JwtStrategy, OtpService],
  controllers: [AuthController],
  exports: [AuthService],
})
export class AuthModule {}
