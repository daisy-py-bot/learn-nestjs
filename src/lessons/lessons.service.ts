import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Lesson } from './lesson.entity';
import { CreateLessonDto } from './dto/create-lesson.dto';
import { UpdateLessonDto } from './dto/update-lesson.dto';
import { Module } from 'src/modules/module.entity';

@Injectable()
export class LessonsService {
  constructor(
    @InjectRepository(Lesson)
    private lessonRepo: Repository<Lesson>,

    @InjectRepository(Module)
    private moduleRepo: Repository<Module>,
  ) {}

  async create(data: CreateLessonDto) {
    const module = await this.moduleRepo.findOne({ where: { id: data.moduleId } });

    if (!module) {
      throw new NotFoundException('Module not found');
    }

    const lesson = this.lessonRepo.create({
      title: data.title,
      content: data.content,
      mediaUrl: data.mediaUrl,
      order: data.order,
      module: module,
      resources: data.resources,
      notes: data.notes,
    });

    return this.lessonRepo.save(lesson);
  }

  findAll() {
    return this.lessonRepo.find({ relations: ['module'] });
  }

  findOne(id: string) {
    return this.lessonRepo.findOne({ where: { id }, relations: ['module'] });
  }

  async update(id: string, updates: UpdateLessonDto) {
    const lesson = await this.lessonRepo.findOne({ where: { id } });

    if (!lesson) {
      throw new NotFoundException('Lesson not found');
    }

    Object.assign(lesson, updates);
    return this.lessonRepo.save(lesson);
  }

  async remove(id: string) {
    const lesson = await this.lessonRepo.findOne({ where: { id } });

    if (!lesson) {
      throw new NotFoundException('Lesson not found');
    }

    return this.lessonRepo.remove(lesson);
  }
}
