import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FinalAssessment } from './final-assessment.entity';
import { Course } from 'src/courses/course.entity';
import { FinalAssessmentsService } from './final-assessments.service';
import { FinalAssessmentsController } from './final-assessments.controller';

@Module({
  imports: [TypeOrmModule.forFeature([FinalAssessment, Course])],
  providers: [FinalAssessmentsService],
  controllers: [FinalAssessmentsController],
})
export class FinalAssessmentsModule {}
