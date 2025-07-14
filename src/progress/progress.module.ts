import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Progress } from './progress.entity';
import { User } from 'src/users/user.entity';
import { Lesson } from 'src/lessons/lesson.entity';
import { ProgressService } from './progress.service';
import { ProgressController } from './progress.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Progress, User, Lesson])],
  providers: [ProgressService],
  controllers: [ProgressController],
})
export class ProgressModule {}
