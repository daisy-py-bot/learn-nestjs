import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Course } from './course.entity';
import { CreateCourseDto } from './dto/create-course.dto';
import { User } from 'src/users/user.entity';
import { UpdateCourseDto } from './dto/update-course.dto';

@Injectable()
export class CoursesService {
  constructor(
    @InjectRepository(Course)
    private courseRepo: Repository<Course>,
    @InjectRepository(User)
    private userRepo: Repository<User>,
  ) {}

  async create(data: CreateCourseDto) {
    const creator = await this.userRepo.findOne({ where: { id: data.createdById } });

    if (!creator) {
      throw new Error('Creator (User) not found');
    }

    const course = this.courseRepo.create({
      ...data,
      createdBy: creator,
    });

    return this.courseRepo.save(course);
  }

  findAll() {
    return this.courseRepo.find({ relations: ['createdBy'] });
  }

  findOne(id: string) {
    return this.courseRepo.findOne({
      where: { id },
      relations: ['createdBy'],
    });
  }

  async update(id: string, updates: UpdateCourseDto){
    const course = await this.courseRepo.findOne({where: {id}})

    if(!course){
        throw new NotFoundException('Course not found');
    }

    // merge updates into the course
    Object.assign(course, updates);
    return this.courseRepo.save(course);

  }

  async remove(id: string){
    const course = await this.courseRepo.findOne({where: {id}});

    if(!course){
        throw new NotFoundException('Course not found');
    }

    return this.courseRepo.remove(course);
  }



}
