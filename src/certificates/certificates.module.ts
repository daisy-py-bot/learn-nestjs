import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CertificatesService } from './certificates.service';
import { CertificatesController } from './certificates.controller';
import { Certificate } from './certificate.entity';
import { User } from 'src/users/user.entity';
import { Course } from 'src/courses/course.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Certificate, User, Course])],
  controllers: [CertificatesController],
  providers: [CertificatesService],
})
export class CertificatesModule {}
