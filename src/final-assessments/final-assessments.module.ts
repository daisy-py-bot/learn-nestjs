import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FinalAssessment } from './final-assessment.entity';
import { Course } from 'src/courses/course.entity';
import { FinalAssessmentsService } from './final-assessments.service';
import { FinalAssessmentsController } from './final-assessments.controller';
import { FinalAssessmentSubmission } from './final-assessment-submission.entity';
import { CertificatesModule } from 'src/certificates/certificates.module';
import { EnrollmentsModule } from 'src/enrollments/enrollments.module';

@Module({
  imports: [TypeOrmModule.forFeature([FinalAssessment, Course, FinalAssessmentSubmission]), CertificatesModule, EnrollmentsModule],
  providers: [FinalAssessmentsService],
  controllers: [FinalAssessmentsController],
  exports: [FinalAssessmentsService],
})
export class FinalAssessmentsModule {}
