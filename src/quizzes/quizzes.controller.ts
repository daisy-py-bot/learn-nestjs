import { Controller, Post, Get, Patch, Delete, Param, Body } from '@nestjs/common';
import { QuizzesService } from './quizzes.service';
import { CreateQuizDto } from './dto/create-quiz.dto';
import { UpdateQuizDto } from './dto/update-quiz.dto';

@Controller('quizzes')
export class QuizzesController {
  constructor(private quizzesService: QuizzesService) {}

  @Post()
  create(@Body() data: CreateQuizDto) {
    return this.quizzesService.create(data);
  }

  @Get()
  findAll() {
    return this.quizzesService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.quizzesService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updates: UpdateQuizDto) {
    return this.quizzesService.update(id, updates);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.quizzesService.remove(id);
  }

  @Post('grade')
  async gradeQuiz(@Body() body: { courseId: string, quizId: string, userId: string, answers: { [questionId: string]: string } }) {
    return this.quizzesService.gradeQuiz(body);
  }

  @Get('submissions/:userId/:quizId')
  async getQuizSubmission(@Param('userId') userId: string, @Param('quizId') quizId: string) {
    return this.quizzesService.getQuizSubmission(userId, quizId);
  }

  @Get('module/:moduleId/random')
  async getRandomForModule(@Param('moduleId') moduleId: string) {
    return this.quizzesService.getRandomQuizForModule(moduleId);
  }

  @Get('module/:moduleId/user/:userId/random')
  async getRandomUnattemptedForUser(@Param('moduleId') moduleId: string, @Param('userId') userId: string) {
    return this.quizzesService.getRandomUnattemptedQuizForUser(moduleId, userId);
  }
}
