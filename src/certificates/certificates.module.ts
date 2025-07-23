import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CertificatesService } from './certificates.service';
import { CertificatesController } from './certificates.controller';
import { Certificate } from './certificate.entity';
import { User } from 'src/users/user.entity';
import { Course } from 'src/courses/course.entity';
import { EnrollmentsModule } from 'src/enrollments/enrollments.module';

@Module({
  imports: [TypeOrmModule.forFeature([Certificate, User, Course]), EnrollmentsModule],
  controllers: [CertificatesController],
  providers: [CertificatesService],
  exports: [CertificatesService],
})
export class CertificatesModule {}
