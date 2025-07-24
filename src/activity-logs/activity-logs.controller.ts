import { Controller, Post, Get, Body, Param, UseGuards } from '@nestjs/common';
import { ActivityLogsService } from './activity-logs.service';
import { CreateActivityLogDto } from './dto/create-activity-log.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { User } from 'src/users/user.entity';

@Controller('activity-logs')
export class ActivityLogsController {
  constructor(private readonly logsService: ActivityLogsService) {}

  @Post()
  create(@Body() dto: CreateActivityLogDto) {
    return this.logsService.create(dto);
  }

  @Get()
  findAll() {
    return this.logsService.findAll();
  }

  @Get('user/:userId')
  findForUser(@Param('userId') userId: string) {
    return this.logsService.findAllForUser(userId);
  }

  @Get('recent')
  @UseGuards(JwtAuthGuard)
  async getRecentActivities() {
    const logs = await this.logsService.findAll();
    // Map logs to frontend format
    return logs.map(log => {
      let role = 'user';
      if (log.user && (log.user as any).role) {
        role = (log.user as any).role;
      }
      return {
        name: log.user ? `${log.user.firstname} ${log.user.lastname}` : 'Unknown',
        avatar: log.user?.avatarUrl || null,
        type: log.actionType,
        time: log.createdAt, // Frontend can format as 'time ago'
        role,
      };
    });
  }
}


/**
 * {
  "userId": "USER_UUID_HERE",
  "actionType": "completed_course",
  "metadata": {
    "courseTitle": "Money Matters 101",
    "courseId": "COURSE_UUID_HERE"
  }
}

 */