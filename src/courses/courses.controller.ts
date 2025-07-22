import { Controller, Post, Get, Param, Body, Patch, Delete, Query} from '@nestjs/common';
import { CoursesService } from './courses.service';
import { CreateCourseDto } from './dto/create-course.dto';
import { UpdateCourseDto } from './dto/update-course.dto';

@Controller('courses')
export class CoursesController {
  constructor(private coursesService: CoursesService) {}

  @Post()
  create(@Body() data: CreateCourseDto) {
    return this.coursesService.create(data);
  }

  @Get()
  findAll() {
    return this.coursesService.findAll();
  }

  @Get('catalog')
  getCatalog() {
    return this.coursesService.getCourseCatalog();
  }

  @Get('search/by-badge')
  findCoursesByBadge(@Query('badgeName') badgeName: string) {
    return this.coursesService.findCoursesByBadgeName(badgeName);
  }

  @Get('search/by-category')
  findCoursesByCategory(@Query('category') category: string) {
    return this.coursesService.findCoursesByCategory(category);
  }

  @Get('categories')
  getCategories() {
    // Return all course categories as an array
    return Object.values(require('./course.entity').CourseCategory);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.coursesService.findOne(id);
  }

  @Get(':id/content')
  getCourseContent(
    @Param('id') id: string, 
    @Query('userId') userId?: string,
    @Query('currentLessonId') currentLessonId?: string
  ) {
    return this.coursesService.getCourseContent(id, userId, currentLessonId);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updates: UpdateCourseDto){
    return this.coursesService.update(id, updates);
  }

  @Delete(':id')
  remove(@Param('id') id: string){
    return this.coursesService.remove(id);
  }
}
