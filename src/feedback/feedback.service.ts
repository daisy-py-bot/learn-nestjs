import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Feedback } from './feedback.entity';
import { CreateFeedbackDto } from './dto/create-feedback.dto';
import { UpdateFeedbackDto } from './dto/update-feedback.dto';
import { User } from 'src/users/user.entity';
import { Course } from 'src/courses/course.entity';

@Injectable()
export class FeedbackService {
  constructor(
    @InjectRepository(Feedback)
    private feedbackRepo: Repository<Feedback>,

    @InjectRepository(User)
    private userRepo: Repository<User>,

    @InjectRepository(Course)
    private courseRepo: Repository<Course>,
  ) {}

  async create(dto: CreateFeedbackDto) {
    const user = await this.userRepo.findOne({ where: { id: dto.userId } });
    const course = await this.courseRepo.findOne({ where: { id: dto.courseId } });

    if (!user || !course) throw new NotFoundException('User or course not found');

    const feedback = this.feedbackRepo.create({
      user,
      course,
      rating: dto.rating,
      comment: dto.comment,
      testimonial: dto.testimonial,
      publicOk: dto.publicOk ?? false,
    });

    return this.feedbackRepo.save(feedback);
  }

  findAllForCourse(courseId: string) {
    return this.feedbackRepo.find({
      where: { course: { id: courseId } },
      relations: ['user'],
    });
  }

  findPublicTestimonials(courseId: string) {
    return this.feedbackRepo.find({
      where: { course: { id: courseId }, publicOk: true },
    });
  }

  async update(id: string, dto: UpdateFeedbackDto) {
    const feedback = await this.feedbackRepo.findOne({ where: { id } });
    if (!feedback) throw new NotFoundException('Feedback not found');

    Object.assign(feedback, dto);
    return this.feedbackRepo.save(feedback);
  }

  async remove(id: string) {
    const feedback = await this.feedbackRepo.findOne({ where: { id } });
    if (!feedback) throw new NotFoundException('Feedback not found');

    return this.feedbackRepo.remove(feedback);
  }
}
