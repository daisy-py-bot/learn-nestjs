import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Course } from './course.entity';
import { CoursesService } from './courses.service';
import { CoursesController } from './courses.controller';
import { User } from 'src/users/user.entity';
import { ProgressModule } from 'src/progress/progress.module';

@Module({
  imports: [TypeOrmModule.forFeature([Course, User]), ProgressModule],
  providers: [CoursesService],
  controllers: [CoursesController],
  exports: [CoursesService],
})
export class CoursesModule {}
