import { Controller, Post, Patch, Get, Param, Body } from '@nestjs/common';
import { ProgressService } from './progress.service';
import { CreateProgressDto } from './dto/create-progress.dto';
import { UpdateProgressDto } from './dto/update-progress.dto';

@Controller('progress')
export class ProgressController {
  constructor(private readonly service: ProgressService) {}

  @Post()
  createOrUpdate(@Body() dto: CreateProgressDto) {
    return this.service.createOrUpdateProgress(dto);
  }

  @Get('user/:userId')
  getAllForUser(@Param('userId') userId: string) {
    return this.service.findAllForUser(userId);
  }

  @Get('user/:userId/completed')
  getCompletedLessons(@Param('userId') userId: string) {
    return this.service.findCompletedLessons(userId);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateProgressDto) {
    return this.service.update(id, dto);
  }
}
