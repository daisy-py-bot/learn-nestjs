import { Injectable } from '@nestjs/common';
import { UsersService } from 'src/users/users.service';
import { EnrollmentsService } from 'src/enrollments/enrollments.service';
import { BadgesService } from 'src/badges/badges.service';
import { CoursesService } from 'src/courses/courses.service';

@Injectable()
export class DashboardService {
  constructor(
    private usersService: UsersService,
    private enrollmentsService: EnrollmentsService,
    private badgesService: BadgesService,
    private coursesService: CoursesService,
  ) {}

  async getDashboardData(userId: string) {
    // User basic info
    const user = await this.usersService.findOne(userId);
    if (!user) throw new Error('User not found');

    // User's enrollments (in-progress and completed)
    const enrollments = await this.enrollmentsService.findByUser(userId);

    // Calculate total courses, total hours, completed courses, etc
    const totalCourses = enrollments.length;
    const totalHours = enrollments.reduce((sum, e) => sum + (e.course.duration || 0), 0);

    // Completed courses
    const completedCourses = enrollments.filter(e => e.status === 'completed');

    // User badges
    const badges = await this.badgesService.getUserBadges(userId);

    // Recommended courses — for now fetch some random or popular courses
    const recommendedCourses = await this.coursesService.findRecommendedForUser(userId);

    return {
      user: {
        id: user.id,
        name: user.firstname,
        tagline: user.tagline || '',
        avatar: user.avatarUrl || '',
      },
      stats: {
        totalCourses,
        totalHours,
        badges: badges.length,
        certificates: completedCourses.filter(c => c.certificateIssued).length,
      },
      completedCourses,
      badges,
      recommendedCourses,
      ongoingCourses: enrollments.filter(e => e.status !== 'completed'),
    };
  }
}
