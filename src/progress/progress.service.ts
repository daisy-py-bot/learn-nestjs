import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DeepPartial } from 'typeorm';
import { Progress } from './progress.entity';
import { CreateProgressDto } from './dto/create-progress.dto';
import { UpdateProgressDto } from './dto/update-progress.dto';
import { User } from 'src/users/user.entity';
import { Lesson } from 'src/lessons/lesson.entity';
import { Course } from 'src/courses/course.entity';

@Injectable()
export class ProgressService {
  constructor(
    @InjectRepository(Progress)
    private progressRepo: Repository<Progress>,

    @InjectRepository(User)
    private userRepo: Repository<User>,

    @InjectRepository(Lesson)
    private lessonRepo: Repository<Lesson>,

    @InjectRepository(Course)
    private courseRepo: Repository<Course>,
  ) {}

  async createOrUpdateProgress(dto: CreateProgressDto) {
    const user = await this.userRepo.findOne({ where: { id: dto.userId } });
    const lesson = await this.lessonRepo.findOne({ where: { id: dto.lessonId } });

    if (!user || !lesson) throw new NotFoundException('User or Lesson not found');

    let progress = await this.progressRepo.findOne({
      where: { user: { id: dto.userId }, lesson: { id: dto.lessonId } },
    });

    const isCompleted = dto.isCompleted ?? false;

    if (progress) {
      progress.lastVisitedAt = new Date();
      if (isCompleted && !progress.isCompleted) {
        progress.isCompleted = true;
        progress.completedAt = new Date();
      }
    } else {
      const progressData: DeepPartial<Progress> = {
        user: { id: dto.userId },
        lesson: { id: dto.lessonId },
        isCompleted,
        completedAt: isCompleted ? new Date() : null,
      };
      progress = this.progressRepo.create(progressData);
    }

    return this.progressRepo.save(progress);
  }

  findAllForUser(userId: string) {
    return this.progressRepo.find({ where: { user: { id: userId } } });
  }

  findCompletedLessons(userId: string) {
    return this.progressRepo.find({
      where: { user: { id: userId }, isCompleted: true },
    });
  }

  async update(id: string, dto: UpdateProgressDto) {
    const progress = await this.progressRepo.findOne({ where: { id } });
    if (!progress) throw new NotFoundException('Progress record not found');

    Object.assign(progress, dto);

    if (dto.isCompleted && !progress.completedAt) {
      progress.completedAt = new Date();
    }

    return this.progressRepo.save(progress);
  }

  async trackLessonAccess(userId: string, courseId: string, lessonId: string) {
    const user = await this.userRepo.findOne({ where: { id: userId } });
    const course = await this.courseRepo.findOne({ where: { id: courseId } });
    const lesson = await this.lessonRepo.findOne({ where: { id: lessonId } });

    if (!user || !course || !lesson) {
      throw new NotFoundException('User, Course, or Lesson not found');
    }

    let progress = await this.progressRepo.findOne({
      where: { 
        user: { id: userId }, 
        course: { id: courseId },
        lesson: { id: lessonId } 
      },
    });

    if (progress) {
      progress.lastAccessedAt = new Date();
      progress.lastVisitedAt = new Date();
    } else {
      const progressData: DeepPartial<Progress> = {
        user: { id: userId },
        course: { id: courseId },
        lesson: { id: lessonId },
        lastAccessedAt: new Date(),
        isCompleted: false,
      };
      progress = this.progressRepo.create(progressData);
    }

    return this.progressRepo.save(progress);
  }

  async getCurrentLessonForCourse(userId: string, courseId: string) {
    const lastAccessedProgress = await this.progressRepo.findOne({
      where: { 
        user: { id: userId }, 
        course: { id: courseId } 
      },
      order: { lastAccessedAt: 'DESC' },
      relations: ['lesson'],
    });

    return lastAccessedProgress?.lesson || null;
  }

  async getCourseProgress(userId: string, courseId: string) {
    const progressRecords = await this.progressRepo.find({
      where: { 
        user: { id: userId }, 
        course: { id: courseId } 
      },
      relations: ['lesson'],
    });

    return progressRecords.map(record => ({
      lessonId: record.lesson.id,
      isCompleted: record.isCompleted,
      lastAccessedAt: record.lastAccessedAt,
      completedAt: record.completedAt,
    }));
  }
}
