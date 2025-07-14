import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LessonsService } from './lessons.service';
import { LessonsController } from './lessons.controller';
import { Lesson } from './lesson.entity';
import { Module as CourseModule } from 'src/modules/module.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Lesson, CourseModule])],
  providers: [LessonsService],
  controllers: [LessonsController],
})
export class LessonsModule {}
