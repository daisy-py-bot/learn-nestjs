import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Course } from './course.entity';
import { CoursesService } from './courses.service';
import { CoursesController } from './courses.controller';
import { User } from 'src/users/user.entity';
import { ProgressModule } from 'src/progress/progress.module';
import { QuizzesModule } from 'src/quizzes/quizzes.module';
import { FinalAssessmentsModule } from 'src/final-assessments/final-assessments.module';

@Module({
  imports: [TypeOrmModule.forFeature([Course, User]), ProgressModule, QuizzesModule, FinalAssessmentsModule],
  providers: [CoursesService],
  controllers: [CoursesController],
  exports: [CoursesService],
})
export class CoursesModule {}
