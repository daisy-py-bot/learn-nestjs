import { Controller, Get } from '@nestjs/common';
import { CoursesService } from './courses/courses.service';
import { EnrollmentsService } from './enrollments/enrollments.service';
import { FeedbackService } from './feedback/feedback.service';
import { CourseCategory } from './courses/course.entity';

@Controller('home')
export class HomeController {
  constructor(
    private readonly coursesService: CoursesService,
    private readonly enrollmentsService: EnrollmentsService,
    private readonly feedbackService: FeedbackService,
  ) {}

  @Get()
  async getHomeData() {
    // All courses
    const courses = await this.coursesService.findAll();
    // All courses with totalLessons
    const coursesWithLessons = await Promise.all(courses.map(async (course) => {
      let totalLessons = 0;
      if (course.modules && course.modules.length > 0) {
        for (const module of course.modules) {
          if (module.lessons) {
            totalLessons += module.lessons.length;
          }
        }
      } else if (course.id) {
        // If modules are not loaded, fetch them
        const fullCourse = await this.coursesService.findOne(course.id);
        if (fullCourse && fullCourse.modules) {
          for (const module of fullCourse.modules) {
            if (module.lessons) {
              totalLessons += module.lessons.length;
            }
          }
        }
      }
      return { ...course, totalLessons };
    }));
    // Number of courses
    const numberOfCourses = courses.length;
    // Number of course categories
    const numberOfCategories = Object.keys(CourseCategory).length;
    // Number of students enrolled (unique users in enrollments)
    const enrollments = await this.enrollmentsService.findAll();
    const uniqueStudentIds = new Set(enrollments.map(e => e.user.id));
    const numberOfStudents = uniqueStudentIds.size;
    // Feedback from students (all feedback)
    const feedback = await this.feedbackService['feedbackRepo'].find({ relations: ['user', 'course'] });
    return {
      courses: coursesWithLessons,
      numberOfCourses,
      numberOfCategories,
      numberOfStudents,
      feedback,
    };
  }
} 