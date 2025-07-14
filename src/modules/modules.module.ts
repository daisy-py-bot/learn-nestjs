import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ModulesService } from './modules.service';
import { ModulesController } from './modules.controller';
import { Module as CourseModuleEntity } from './module.entity';
import { Course } from 'src/courses/course.entity';

@Module({
  imports: [TypeOrmModule.forFeature([CourseModuleEntity, Course])],
  providers: [ModulesService],
  controllers: [ModulesController],
})
export class ModulesModule {}
