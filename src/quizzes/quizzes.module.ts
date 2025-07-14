import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { QuizzesService } from './quizzes.service';
import { QuizzesController } from './quizzes.controller';
import { Quiz } from './quiz.entity';
import { Module as CourseModule } from 'src/modules/module.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Quiz, CourseModule])],
  providers: [QuizzesService],
  controllers: [QuizzesController],
})
export class QuizzesModule {}
