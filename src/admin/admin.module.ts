import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Admin } from './admin.entity';
import { AdminService } from './admin.service';
import { AdminController } from './admin.controller';
import { JwtModule } from '@nestjs/jwt';
import { AdminAuthService } from './admin-auth.service';
import { AdminAuthController } from './admin-auth.controller';
import { UsersModule } from '../users/users.module';
import { CertificatesModule } from '../certificates/certificates.module';
import { CoursesModule } from '../courses/courses.module';
import { EnrollmentsModule } from '../enrollments/enrollments.module';
import { ActivityLogsModule } from '../activity-logs/activity-logs.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Admin]),
    JwtModule.register({
      secret: 'hardcoded_secret_key', // Use the same secret as user auth
      signOptions: { expiresIn: '7d' },
    }),
    UsersModule,
    CertificatesModule,
    CoursesModule,
    EnrollmentsModule,
    ActivityLogsModule,
  ],
  providers: [AdminService, AdminAuthService],
  controllers: [AdminController, AdminAuthController],
  exports: [AdminService],
})
export class AdminModule {}
