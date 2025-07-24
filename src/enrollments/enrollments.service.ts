import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Enrollment, EnrollmentStatus } from './enrollment.entity';
import { CreateEnrollmentDto } from './dto/create-enrollment.dto';
import { UpdateEnrollmentDto } from './dto/update-enrollment.dto';
import { User } from 'src/users/user.entity';
import { Course } from 'src/courses/course.entity';
import { BadgesService } from 'src/badges/badges.service';

@Injectable()
export class EnrollmentsService {
  constructor(
    @InjectRepository(Enrollment)
    private enrollRepo: Repository<Enrollment>,

    @InjectRepository(User)
    private userRepo: Repository<User>,

    @InjectRepository(Course)
    private courseRepo: Repository<Course>,

    private readonly badgeService: BadgesService,
  ) {}

  async create(data: CreateEnrollmentDto) {
    const user = await this.userRepo.findOne({ where: { id: data.userId } });
    const course = await this.courseRepo.findOne({ where: { id: data.courseId } });

    if (!user) throw new NotFoundException('User not found');
    if (!course) throw new NotFoundException('Course not found');

    // Check if the user is already enrolled in the course
    const existingEnrollment = await this.enrollRepo.findOne({
      where: { user: { id: data.userId }, course: { id: data.courseId } },
    });
    if (existingEnrollment) {
      throw new ConflictException('User is already enrolled in this course');
    }

    const enrollment = this.enrollRepo.create({
      user: { id: data.userId },
      course: { id: data.courseId },
      status: data.status || EnrollmentStatus.IN_PROGRESS,
    });

    const saved = await this.enrollRepo.save(enrollment);

        // Award "First Enrolment" badge
    const badge = await this.badgeService.getBadgeByName('First Enrolment');
    if (badge) {
      await this.badgeService.awardBadge(user.id, badge.id);
    }

    return saved;
    // return this.enrollRepo.save(enrollment);
  }

  findAll() {
    return this.enrollRepo.find();
  }

  findOne(id: string) {
    return this.enrollRepo.findOne({ where: { id } });
  }

  findByUser(userId: string) {
    return this.enrollRepo.find({ where: { user: { id: userId } } });
  }

  async update(id: string, updates: UpdateEnrollmentDto) {
    const enrollment = await this.enrollRepo.findOne({ where: { id } });
    if (!enrollment) throw new NotFoundException('Enrollment not found');

    if (updates.status === EnrollmentStatus.COMPLETED) {
      enrollment.completedAt = new Date();

      //  Award "Course Finisher" badge
      const badge = await this.badgeService.getBadgeByName('Course Finisher');
      if (badge) {
        await this.badgeService.awardBadge(enrollment.user.id, badge.id);
      }
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
