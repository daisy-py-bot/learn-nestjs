import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Submission } from './submission.entity';
import { SubmissionsService } from './submissions.service';
import { SubmissionsController } from './submissions.controller';
import { User } from 'src/users/user.entity';
import { Quiz } from 'src/quizzes/quiz.entity';
import { FinalAssessment } from 'src/final-assessments/final-assessment.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Submission, User, Quiz, FinalAssessment])],
  providers: [SubmissionsService],
  controllers: [SubmissionsController],
})
export class SubmissionsModule {}
