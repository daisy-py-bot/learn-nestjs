import { Controller, Post, Get, Param, Body, Patch, Delete, Query, Put} from '@nestjs/common';
import { CoursesService } from './courses.service';
import { CategoriesService } from './categories.service';
import { CreateCourseDto } from './dto/create-course.dto';
import { UpdateCourseDto } from './dto/update-course.dto';
import { EnrollmentsService } from '../enrollments/enrollments.service';
import { CreateCourseWithModulesLessonsDto } from './dto/create-course-with-modules-lessons.dto';
import { UpdateCourseWithModulesLessonsDto } from './dto/update-course-with-modules-lessons.dto';

@Controller('courses')
export class CoursesController {
  constructor(
    private readonly coursesService: CoursesService,
    private readonly categoriesService: CategoriesService,
    private readonly enrollmentsService: EnrollmentsService,
  ) {}

  @Post()
  create(@Body() data: CreateCourseDto) {
    return this.coursesService.create(data);
  }

  @Post('create-with-modules-lessons')
  async createWithModulesLessons(@Body() data: CreateCourseWithModulesLessonsDto) {
    return this.coursesService.createCourseWithModulesAndLessons(data);
  }

  @Get()
  findAll() {
    return this.coursesService.findAll();
  }

  @Get('catalog')
  getCatalog() {
    return this.coursesService.getCourseCatalog();
  }

  @Get('catalog/available')
  getAvailableCatalog(@Query('userId') userId: string) {
    return this.coursesService.getCourseCatalog(userId);
  }

  @Get('search/by-badge')
  findCoursesByBadge(@Query('badgeName') badgeName: string, @Query('userId') userId?: string) {
    return this.coursesService.findCoursesByBadgeName(badgeName, userId);
  }

  @Get('search/by-category')
  findCoursesByCategory(@Query('categoryId') categoryId: string, @Query('userId') userId?: string) {
    return this.coursesService.findCoursesByCategory(categoryId, userId);
  }

  @Get('search/most-popular')
  findMostPopularCourses(@Query('userId') userId?: string) {
    return this.coursesService.findMostPopularCourses(userId);
  }

  @Get('search')
  searchCourses(@Query('q') query: string, @Query('userId') userId?: string) {
    return this.coursesService.searchCourses(query, userId);
  }

  @Get('metrics')
  async getCourseMetrics() {
    const allCourses = await this.coursesService.findAll();
    const totalCourses = allCourses.length;
    const allEnrollments = await this.enrollmentsService.findAll();
    const totalEnrollment = allEnrollments.length;
    const completedEnrollments = allEnrollments.filter(e => e.status === 'completed');
    const avgCompletionRate = allEnrollments.length > 0 ? Math.round((completedEnrollments.length / allEnrollments.length) * 100) : 0;
    return [
      { value: totalEnrollment, label: 'Total Enrollment' },
      { value: totalCourses, label: 'Total Courses' },
      { value: `${avgCompletionRate}%`, label: 'Avg Completion Rate', isLast: true },
    ];
  }

  @Get('management')
  async getCoursesManagement() {
    const allCourses = await this.coursesService.findAll();
    // Assume enrollmentsService.findAll() returns all enrollments
    const allEnrollments = await this.enrollmentsService.findAll();
    return allCourses.map(course => {
      const studentsEnrolled = allEnrollments.filter(e => e.course.id === course.id).length;
      return {
        id: course.id,
        name: course.title,
        studentsEnrolled,
        lastUpdated: course.updatedAt ? course.updatedAt.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }) : '',
        category: course.category,
        published: course.isPublished,
      };
    });
  }

  @Get('categories')
  getCategories() {
    // This endpoint is now handled by the categories controller
    // Keeping for backward compatibility but redirecting to categories service
    return this.categoriesService.findActive();
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

  @Get(':id/content/admin')
  getCourseContentForAdmin(@Param('id') id: string) {
    return this.coursesService.getCourseContentForAdmin(id);
  }

  @Get(':id/statistics')
  getCourseStatistics(@Param('id') id: string) {
    return this.coursesService.getCourseStatistics(id);
  }

  @Get(':id/modules')
  getModulesForCourse(@Param('id') id: string) {
    return this.coursesService.getModulesForCourse(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updates: UpdateCourseDto){
    return this.coursesService.update(id, updates);
  }

  @Put(':id/full')
  updateFull(
    @Param('id') id: string,
    @Body() updates: UpdateCourseWithModulesLessonsDto
  ) {
    return this.coursesService.updateCourseWithModulesAndLessons(id, updates);
  }

  @Delete(':id')
  remove(@Param('id') id: string){
    return this.coursesService.remove(id);
  }
}
