import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Module } from './module.entity';
import { CreateModuleDto } from './dto/create-module.dto';
import { UpdateModuleDto } from './dto/update-module.dto';
import { Course } from 'src/courses/course.entity';

@Injectable()
export class ModulesService {
  constructor(
    @InjectRepository(Module)
    private moduleRepo: Repository<Module>,

    @InjectRepository(Course)
    private courseRepo: Repository<Course>,
  ) {}

  async create(data: CreateModuleDto) {
    const course = await this.courseRepo.findOne({ where: { id: data.courseId } });

    if (!course) {
      throw new NotFoundException('Course not found');
    }

    const module = this.moduleRepo.create({
      title: data.title,
      description: data.description,
      order: data.order,
      course: course,
    });

    return this.moduleRepo.save(module);
  }

  findAll() {
    return this.moduleRepo.find({ relations: ['course'] });
  }

  findOne(id: string) {
    return this.moduleRepo.findOne({ where: { id }, relations: ['course'] });
  }

  async update(id: string, updates: UpdateModuleDto) {
    const module = await this.moduleRepo.findOne({ where: { id } });

    if (!module) {
      throw new NotFoundException('Module not found');
    }

    Object.assign(module, updates);
    return this.moduleRepo.save(module);
  }

  async remove(id: string) {
    const module = await this.moduleRepo.findOne({ where: { id } });

    if (!module) {
      throw new NotFoundException('Module not found');
    }

    return this.moduleRepo.remove(module);
  }
}
