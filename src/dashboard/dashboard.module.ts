import { Module } from '@nestjs/common';
import { DashboardService } from './dashboard.service';
import { DashboardController } from './dashboard.controller';
import { UsersModule } from 'src/users/users.module';
import { EnrollmentsModule } from 'src/enrollments/enrollments.module';
import { BadgesModule } from 'src/badges/badges.module';
import { CoursesModule } from 'src/courses/courses.module';

@Module({
  imports: [UsersModule, EnrollmentsModule, BadgesModule, CoursesModule],
  providers: [DashboardService],
  controllers: [DashboardController],
})
export class DashboardModule {}
