import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Quiz } from './quiz.entity';
import { Module } from 'src/modules/module.entity';
import { CreateQuizDto } from './dto/create-quiz.dto';
import { UpdateQuizDto } from './dto/update-quiz.dto';

@Injectable()
export class QuizzesService {
  constructor(
    @InjectRepository(Quiz)
    private quizRepo: Repository<Quiz>,

    @InjectRepository(Module)
    private moduleRepo: Repository<Module>,
  ) {}

  async create(data: CreateQuizDto) {
    const module = await this.moduleRepo.findOne({ where: { id: data.moduleId } });

    if (!module) {
      throw new NotFoundException('Module not found');
    }

    const quiz = this.quizRepo.create({
      title: data.title,
      unlockAfter: data.unlockAfter,
      questions: data.questions,
      module,
    });

    return this.quizRepo.save(quiz);
  }

  findAll() {
    return this.quizRepo.find({ relations: ['module'] });
  }

  findOne(id: string) {
    return this.quizRepo.findOne({ where: { id }, relations: ['module'] });
  }

  async update(id: string, updates: UpdateQuizDto) {
    const quiz = await this.quizRepo.findOne({ where: { id } });
    if (!quiz) throw new NotFoundException('Quiz not found');

    Object.assign(quiz, updates);
    return this.quizRepo.save(quiz);
  }

  async remove(id: string) {
    const quiz = await this.quizRepo.findOne({ where: { id } });
    if (!quiz) throw new NotFoundException('Quiz not found');

    return this.quizRepo.remove(quiz);
  }
}
