import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Course } from './course.entity';
import { CoursesService } from './courses.service';
import { CoursesController } from './courses.controller';
import { User } from 'src/users/user.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Course, User])],
  providers: [CoursesService],
  controllers: [CoursesController],
})
export class CoursesModule {}
