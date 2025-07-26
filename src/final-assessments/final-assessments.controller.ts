import { Controller, Post, Get, Patch, Delete, Param, Body } from '@nestjs/common';
import { FinalAssessmentsService } from './final-assessments.service';
import { CreateFinalAssessmentDto } from './dto/create-final-assessment.dto';
import { UpdateFinalAssessmentDto } from './dto/update-final-assessment.dto';

@Controller('final-assessments')
export class FinalAssessmentsController {
  constructor(private service: FinalAssessmentsService) {}

  @Post()
  create(@Body() dto: CreateFinalAssessmentDto) {
    return this.service.create(dto);
  }

  @Get()
  findAll() {
    return this.service.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateFinalAssessmentDto) {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }

  @Get('user/:userId/:assessmentId')
  async getUserFinalAssessment(@Param('userId') userId: string, @Param('assessmentId') assessmentId: string) {
    return this.service.getUserFinalAssessment(userId, assessmentId);
  }

  @Post('submit')
  async submitAndGradeAssessment(@Body() body: { userId: string, assessmentId: string, answers: { [questionId: string]: string } | string[] }) {
    return this.service.submitAndGradeAssessment(body);
  }

  @Get('submission/:userId/:assessmentId')
  async getFinalAssessmentSubmission(@Param('userId') userId: string, @Param('assessmentId') assessmentId: string) {
    return this.service.getFinalAssessmentSubmission(userId, assessmentId);
  }

  @Get('course/:courseId/random')
  async getRandomForCourse(@Param('courseId') courseId: string) {
    return this.service.getRandomFinalAssessmentForCourse(courseId);
  }

  @Get('course/:courseId/user/:userId/random')
  async getRandomUnattemptedForUser(@Param('courseId') courseId: string, @Param('userId') userId: string) {
    return this.service.getRandomUnattemptedAssessmentForUser(courseId, userId);
  }
}
