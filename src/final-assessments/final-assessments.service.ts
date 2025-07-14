import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { FinalAssessment } from './final-assessment.entity';
import { Course } from 'src/courses/course.entity';
import { CreateFinalAssessmentDto } from './dto/create-final-assessment.dto';
import { UpdateFinalAssessmentDto } from './dto/update-final-assessment.dto';

@Injectable()
export class FinalAssessmentsService {
  constructor(
    @InjectRepository(FinalAssessment)
    private assessmentRepo: Repository<FinalAssessment>,

    @InjectRepository(Course)
    private courseRepo: Repository<Course>,
  ) {}

  async create(data: CreateFinalAssessmentDto) {
    const course = await this.courseRepo.findOne({ where: { id: data.courseId } });
    if (!course) throw new NotFoundException('Course not found');

    const assessment = this.assessmentRepo.create({
      title: data.title,
      questions: data.questions,
      passingScore: data.passingScore,
      course,
    });

    return this.assessmentRepo.save(assessment);
  }

  findAll() {
    return this.assessmentRepo.find({ relations: ['course'] });
  }

  findOne(id: string) {
    return this.assessmentRepo.findOne({ where: { id }, relations: ['course'] });
  }

  async update(id: string, updates: UpdateFinalAssessmentDto) {
    const assessment = await this.assessmentRepo.findOne({ where: { id } });
    if (!assessment) throw new NotFoundException('Assessment not found');

    Object.assign(assessment, updates);
    return this.assessmentRepo.save(assessment);
  }

  async remove(id: string) {
    const assessment = await this.assessmentRepo.findOne({ where: { id } });
    if (!assessment) throw new NotFoundException('Assessment not found');

    return this.assessmentRepo.remove(assessment);
  }
}
