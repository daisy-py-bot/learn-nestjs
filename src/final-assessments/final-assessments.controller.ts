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
}
