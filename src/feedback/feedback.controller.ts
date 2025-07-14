import { Controller, Post, Body, Get, Param, Patch, Delete } from '@nestjs/common';
import { FeedbackService } from './feedback.service';
import { CreateFeedbackDto } from './dto/create-feedback.dto';
import { UpdateFeedbackDto } from './dto/update-feedback.dto';

@Controller('feedback')
export class FeedbackController {
  constructor(private readonly feedbackService: FeedbackService) {}

  @Post()
  create(@Body() dto: CreateFeedbackDto) {
    return this.feedbackService.create(dto);
  }

  @Get('course/:courseId')
  findAllForCourse(@Param('courseId') courseId: string) {
    return this.feedbackService.findAllForCourse(courseId);
  }

  @Get('course/:courseId/public')
  findPublic(@Param('courseId') courseId: string) {
    return this.feedbackService.findPublicTestimonials(courseId);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateFeedbackDto) {
    return this.feedbackService.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.feedbackService.remove(id);
  }
}
