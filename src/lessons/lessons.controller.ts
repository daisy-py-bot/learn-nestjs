import { Controller, Post, Get, Patch, Delete, Param, Body } from '@nestjs/common';
import { LessonsService } from './lessons.service';
import { CreateLessonDto } from './dto/create-lesson.dto';
import { UpdateLessonDto } from './dto/update-lesson.dto';

@Controller('lessons')
export class LessonsController {
  constructor(private lessonsService: LessonsService) {}

  @Post()
  create(@Body() data: CreateLessonDto) {
    return this.lessonsService.create(data);
  }

  @Get()
  findAll() {
    return this.lessonsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.lessonsService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updates: UpdateLessonDto) {
    return this.lessonsService.update(id, updates);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.lessonsService.remove(id);
  }
}
