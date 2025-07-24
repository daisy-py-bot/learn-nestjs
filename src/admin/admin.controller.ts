import { Controller, Post, Get, Body, Param, Patch, Delete, UseGuards } from '@nestjs/common';
import { AdminService } from './admin.service';
import { CreateAdminDto } from './dto/create-admin.dto';
import { UpdateAdminDto } from './dto/update-admin.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { UsersService } from '../users/users.service';
import { CertificatesService } from '../certificates/certificates.service';
import { CoursesService } from '../courses/courses.service';
import { EnrollmentsService } from '../enrollments/enrollments.service';
import { addMonths, startOfMonth, endOfMonth, subMonths } from 'date-fns';

@Controller('admins')
export class AdminController {
  constructor(
    private readonly adminsService: AdminService,
    private readonly usersService: UsersService,
    private readonly certificatesService: CertificatesService,
    private readonly coursesService: CoursesService,
    private readonly enrollmentsService: EnrollmentsService,
  ) {}

  @Post()
  create(@Body() data: CreateAdminDto) {
    return this.adminsService.create(data);
  }

  @Get()
  findAll() {
    return this.adminsService.findAll();
  }

  @Get('dashboard-stats')
  async getDashboardStats() {
    // Date calculations
    const now = new Date();
    const startOfThisMonth = startOfMonth(now);
    const startOfLastMonth = startOfMonth(subMonths(now, 1));
    const endOfLastMonth = endOfMonth(subMonths(now, 1));
    const startOfTwoMonthsAgo = startOfMonth(subMonths(now, 2));
    const endOfTwoMonthsAgo = endOfMonth(subMonths(now, 2));

    // Total users
    const allUsers = await this.usersService.findAll();
    const totalUsers = allUsers.length;
    const newSignups = allUsers.filter(u => u.createdAt >= startOfLastMonth && u.createdAt <= endOfLastMonth).length;
    const prevSignups = allUsers.filter(u => u.createdAt >= startOfTwoMonthsAgo && u.createdAt <= endOfTwoMonthsAgo).length;
    const signupChange = prevSignups === 0 ? (newSignups > 0 ? '+100%' : 'No change from last month') : `${((newSignups - prevSignups) / prevSignups * 100).toFixed(0)}% from last month`;

    // Total users change
    const usersLastMonth = allUsers.filter(u => u.createdAt <= endOfLastMonth).length;
    const usersPrevMonth = allUsers.filter(u => u.createdAt <= endOfTwoMonthsAgo).length;
    const usersChange = usersPrevMonth === 0 ? (usersLastMonth > 0 ? '+100%' : 'No change from last month') : `${((usersLastMonth - usersPrevMonth) / usersPrevMonth * 100).toFixed(0)}% from last month`;

    // Certificates issued
    const allCertificates = await this.certificatesService.findAll();
    const certificatesIssued = allCertificates.length;
    const certificatesIssuedLastMonth = allCertificates.filter(c => c.issuedAt >= startOfLastMonth && c.issuedAt <= endOfLastMonth).length;
    const certificatesIssuedPrevMonth = allCertificates.filter(c => c.issuedAt >= startOfTwoMonthsAgo && c.issuedAt <= endOfTwoMonthsAgo).length;
    const certChange = certificatesIssuedPrevMonth === 0 ? (certificatesIssuedLastMonth > 0 ? '+100%' : 'No change from last month') : `${((certificatesIssuedLastMonth - certificatesIssuedPrevMonth) / certificatesIssuedPrevMonth * 100).toFixed(0)}% from last month`;

    // Total courses
    const allCourses = await this.coursesService.findAll();
    const totalCourses = allCourses.length;
    // For course change, compare total at end of last month vs end of prev month
    const coursesLastMonth = allCourses.filter(c => c.createdAt <= endOfLastMonth).length;
    const coursesPrevMonth = allCourses.filter(c => c.createdAt <= endOfTwoMonthsAgo).length;
    const courseChange = coursesPrevMonth === 0 ? (coursesLastMonth > 0 ? '+100%' : 'No change from last month') : `${((coursesLastMonth - coursesPrevMonth) / coursesPrevMonth * 100).toFixed(0)}% from last month`;

    // Courses enrolled (last month)
    const allEnrollments = await this.enrollmentsService.findAll();
    const coursesEnrolledLastMonth = allEnrollments.filter(e => e.startedAt >= startOfLastMonth && e.startedAt <= endOfLastMonth).length;
    const coursesEnrolledPrevMonth = allEnrollments.filter(e => e.startedAt >= startOfTwoMonthsAgo && e.startedAt <= endOfTwoMonthsAgo).length;
    const enrolledChange = coursesEnrolledPrevMonth === 0 ? (coursesEnrolledLastMonth > 0 ? '+100%' : 'No change from last month') : `${((coursesEnrolledLastMonth - coursesEnrolledPrevMonth) / coursesEnrolledPrevMonth * 100).toFixed(0)}% from last month`;

    // Average course completion rate
    const completedEnrollments = allEnrollments.filter(e => e.status === 'completed');
    const avgCompletionRate = allEnrollments.length > 0 ? Math.round((completedEnrollments.length / allEnrollments.length) * 100) : 0;
    // Previous month completion rate
    const prevCompletedEnrollments = allEnrollments.filter(e => e.status === 'completed' && e.completedAt >= startOfTwoMonthsAgo && e.completedAt <= endOfTwoMonthsAgo);
    const prevAllEnrollments = allEnrollments.filter(e => e.startedAt >= startOfTwoMonthsAgo && e.startedAt <= endOfTwoMonthsAgo);
    const prevAvgCompletionRate = prevAllEnrollments.length > 0 ? Math.round((prevCompletedEnrollments.length / prevAllEnrollments.length) * 100) : 0;
    const completionChange = prevAvgCompletionRate === 0 ? (avgCompletionRate > 0 ? '+100%' : 'No change from last month') : `${(avgCompletionRate - prevAvgCompletionRate)}% from last month`;

    return [
      { title: 'Total Users', value: totalUsers, change: usersChange },
      { title: 'New signups', value: newSignups, change: signupChange },
      { title: 'Certificates issued', value: certificatesIssued, change: certChange },
      { title: 'Total Courses', value: totalCourses, change: courseChange },
      { title: 'Courses enrolled', value: coursesEnrolledLastMonth, change: enrolledChange },
      { title: 'Average course completion rate', value: `${avgCompletionRate}%`, change: completionChange },
    ];
  }

  @Get('profile/:id')
  @UseGuards(JwtAuthGuard)
  async getProfile(@Param('id') id: string) {
    const admin = await this.adminsService.findOne(id);
    if (!admin) return null;
    const { firstname, lastname, email, role, avatar, createdAt, lastLogin } = admin;
    return { firstname, lastname, email, role, avatar, createdAt, lastLogin };
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.adminsService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() data: UpdateAdminDto) {
    return this.adminsService.update(id, data);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.adminsService.remove(id);
  }
}
