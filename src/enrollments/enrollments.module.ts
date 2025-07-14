import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Enrollment } from './enrollment.entity';
import { EnrollmentsService } from './enrollments.service';
import { EnrollmentsController } from './enrollments.controller';
import { User } from 'src/users/user.entity';
import { Course } from 'src/courses/course.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Enrollment, User, Course])],
  providers: [EnrollmentsService],
  controllers: [EnrollmentsController],
})
export class EnrollmentsModule {}
