import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { UsersModule } from 'src/users/users.module';
import { JwtModule } from '@nestjs/jwt';
import { JwtStrategy } from './jwt.strategy';
import { ActivityLogsModule } from '../activity-logs/activity-logs.module';

@Module({
  imports: [
    UsersModule,
    JwtModule.register({
      secret: 'hardcoded_secret_key', // <-- Hardcoded secret....needs to be changed
      signOptions: { expiresIn: '7d' },
    }),
    ActivityLogsModule,
  ],
  providers: [AuthService, JwtStrategy],
  controllers: [AuthController],
  exports: [AuthService],
})
export class AuthModule {}
