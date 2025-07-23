import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { QuizzesService } from './quizzes.service';
import { QuizzesController } from './quizzes.controller';
import { Quiz } from './quiz.entity';
import { Module as CourseModule } from 'src/modules/module.entity';
import { QuizSubmission } from './quiz-submission.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Quiz, CourseModule, QuizSubmission])],
  providers: [QuizzesService],
  controllers: [QuizzesController],
  exports: [QuizzesService],
})
export class QuizzesModule {}
