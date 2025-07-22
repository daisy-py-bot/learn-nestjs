import { Controller, Post, Body } from '@nestjs/common';
import { ProgressService } from './progress.service';
import { CreateProgressDto } from './dto/create-progress.dto';

@Controller('progress')
export class ProgressController {
  constructor(private readonly progressService: ProgressService) {}

  // Track lesson access (called when user views a lesson)
  @Post('track')
  async trackLessonAccess(@Body() body: { userId: string; courseId: string; lessonId: string }) {
    return this.progressService.trackLessonAccess(body.userId, body.courseId, body.lessonId);
  }

  // Mark lesson as complete (or update progress)
  @Post()
  async createOrUpdateProgress(@Body() dto: CreateProgressDto) {
    return this.progressService.createOrUpdateProgress(dto);
  }
}
