import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Course } from './course.entity';
import { CoursesService } from './courses.service';
import { CoursesController } from './courses.controller';
import { User } from 'src/users/user.entity';
import { Module as CourseModuleEntity } from '../modules/module.entity';
import { Lesson } from '../lessons/lesson.entity';
import { ProgressModule } from 'src/progress/progress.module';
import { QuizzesModule } from 'src/quizzes/quizzes.module';
import { FinalAssessmentsModule } from 'src/final-assessments/final-assessments.module';
import { CertificatesModule } from 'src/certificates/certificates.module';
import { EnrollmentsModule } from 'src/enrollments/enrollments.module';

@Module({
  imports: [TypeOrmModule.forFeature([Course, User, CourseModuleEntity, Lesson]), ProgressModule, QuizzesModule, FinalAssessmentsModule, CertificatesModule, EnrollmentsModule],
  providers: [CoursesService],
  controllers: [CoursesController],
  exports: [CoursesService],
})
export class CoursesModule {}
