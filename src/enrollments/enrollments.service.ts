import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Enrollment, EnrollmentStatus } from './enrollment.entity';
import { CreateEnrollmentDto } from './dto/create-enrollment.dto';
import { UpdateEnrollmentDto } from './dto/update-enrollment.dto';
import { User } from 'src/users/user.entity';
import { Course } from 'src/courses/course.entity';

@Injectable()
export class EnrollmentsService {
  constructor(
    @InjectRepository(Enrollment)
    private enrollRepo: Repository<Enrollment>,

    @InjectRepository(User)
    private userRepo: Repository<User>,

    @InjectRepository(Course)
    private courseRepo: Repository<Course>,
  ) {}

  async create(data: CreateEnrollmentDto) {
    const user = await this.userRepo.findOne({ where: { id: data.userId } });
    const course = await this.courseRepo.findOne({ where: { id: data.courseId } });

    if (!user) throw new NotFoundException('User not found');
    if (!course) throw new NotFoundException('Course not found');

    const enrollment = this.enrollRepo.create({
      user: { id: data.userId },
      course: { id: data.courseId },
      status: data.status || EnrollmentStatus.IN_PROGRESS,
    });

    return this.enrollRepo.save(enrollment);
  }

  findAll() {
    return this.enrollRepo.find();
  }

  findOne(id: string) {
    return this.enrollRepo.findOne({ where: { id } });
  }

  async update(id: string, updates: UpdateEnrollmentDto) {
    const enrollment = await this.enrollRepo.findOne({ where: { id } });
    if (!enrollment) throw new NotFoundException('Enrollment not found');

    if (updates.status === EnrollmentStatus.COMPLETED) {
      enrollment.completedAt = new Date();
    }

    Object.assign(enrollment, updates);
    return this.enrollRepo.save(enrollment);
  }

  async remove(id: string) {
    const enrollment = await this.enrollRepo.findOne({ where: { id } });
    if (!enrollment) throw new NotFoundException('Enrollment not found');
    return this.enrollRepo.remove(enrollment);
  }
}
