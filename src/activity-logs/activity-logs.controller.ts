import { Controller, Post, Get, Body, Param } from '@nestjs/common';
import { ActivityLogsService } from './activity-logs.service';
import { CreateActivityLogDto } from './dto/create-activity-log.dto';

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