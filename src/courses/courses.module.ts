import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Course } from './course.entity';
import { CourseCategory } from './course-category.entity';
import { CoursesService } from './courses.service';
import { CategoriesService } from './categories.service';
import { CoursesController } from './courses.controller';
import { CategoriesController } from './categories.controller';
import { User } from 'src/users/user.entity';
import { Module as CourseModuleEntity } from '../modules/module.entity';
import { Lesson } from '../lessons/lesson.entity';
import { ProgressModule } from 'src/progress/progress.module';
import { QuizzesModule } from 'src/quizzes/quizzes.module';
import { FinalAssessmentsModule } from 'src/final-assessments/final-assessments.module';
import { CertificatesModule } from 'src/certificates/certificates.module';
import { EnrollmentsModule } from 'src/enrollments/enrollments.module';
import { FeedbackModule } from 'src/feedback/feedback.module';

@Module({
  imports: [TypeOrmModule.forFeature([Course, CourseCategory, User, CourseModuleEntity, Lesson]), ProgressModule, QuizzesModule, FinalAssessmentsModule, CertificatesModule, EnrollmentsModule, FeedbackModule],
  providers: [CoursesService, CategoriesService],
  controllers: [CoursesController, CategoriesController],
  exports: [CoursesService, CategoriesService],
})
export class CoursesModule {}
