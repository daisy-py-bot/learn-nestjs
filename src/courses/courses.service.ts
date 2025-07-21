import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Course } from './course.entity';
import { CreateCourseDto } from './dto/create-course.dto';
import { User } from 'src/users/user.entity';
import { UpdateCourseDto } from './dto/update-course.dto';
import { getRepository } from 'typeorm';
import { ProgressService } from 'src/progress/progress.service';
import { Badge } from 'src/badges/badge.entity';

@Injectable()
export class CoursesService {
  constructor(
    @InjectRepository(Course)
    private courseRepo: Repository<Course>,
    @InjectRepository(User)
    private userRepo: Repository<User>,
    private progressService: ProgressService,
  ) {}

  async create(data: CreateCourseDto) {
    const creator = await this.userRepo.findOne({ where: { id: data.createdById } });

    if (!creator) {
      throw new Error('Creator (User) not found');
    }

    let badges: Badge[] = [];
    if (data.badgeIds && data.badgeIds.length > 0) {
      badges = await this.courseRepo.manager.getRepository(Badge).findByIds(data.badgeIds);
    }

    const course = this.courseRepo.create({
      ...data,
      createdBy: creator,
      badgeNames: data.badgeNames || [],
      badges,
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
    const course = await this.courseRepo.findOne({where: {id}, relations: ['badges']})

    if(!course){
        throw new NotFoundException('Course not found');
    }

    // merge updates into the course
    Object.assign(course, updates);
    if (updates.badgeNames) {
      course.badgeNames = updates.badgeNames;
    }
    if (updates.badgeIds && updates.badgeIds.length > 0) {
      const badges = await this.courseRepo.manager.getRepository(Badge).findByIds(updates.badgeIds);
      course.badges = badges;
    }
    return this.courseRepo.save(course);

  }

  async remove(id: string){
    const course = await this.courseRepo.findOne({where: {id}});

    if(!course){
        throw new NotFoundException('Course not found');
    }

    return this.courseRepo.remove(course);
  }

  findRecommendedForUser(userId: string) {
    // For now, recommend all published courses
    return this.courseRepo.find({ where: { isPublished: true } });
  }

  async getCourseCatalog() {
    // Use query builder to join modules and lessons
    const courses = await this.courseRepo.find({ relations: ['modules', 'modules.lessons'] });
    return courses.map((course) => {
      // Count total lessons across all modules
      let totalLessons = 0;
      if (course.modules && course.modules.length > 0) {
        for (const module of course.modules) {
          if (module.lessons) {
            totalLessons += module.lessons.length;
          }
        }
      }
      return {
        id: course.id,
        title: course.title,
        totalLessons,
        duration: course.duration,
        description: course.description,
        thumbnailUrl: course.thumbnailUrl,
        category: course.category,
      };
    });
  }

  async getCourseContent(courseId: string, userId?: string, currentLessonId?: string) {
    const course = await this.courseRepo.findOne({
      where: { id: courseId },
      relations: [
        'modules',
        'modules.lessons',
        'badges',
        'certificate',
        'finalAssessments',
        'createdBy',
      ],
    });
    if (!course) throw new NotFoundException('Course not found');

    // Determine current lesson: provided ID, user's last accessed, or first lesson
    let currentLessonIdToUse = currentLessonId;
    if (!currentLessonIdToUse && userId) {
      const currentLesson = await this.progressService.getCurrentLessonForCourse(userId, courseId);
      currentLessonIdToUse = currentLesson?.id;
    }
    
    // If still no current lesson, use the first lesson of the first module
    if (!currentLessonIdToUse && course.modules.length > 0 && course.modules[0].lessons.length > 0) {
      currentLessonIdToUse = course.modules[0].lessons[0].id;
    }

    // Find current lesson details
    let currentLesson: any = null;
    if (currentLessonIdToUse) {
      for (const module of course.modules) {
        const lesson = module.lessons?.find(l => l.id === currentLessonIdToUse);
        if (lesson) {
          currentLesson = {
            id: lesson.id,
            title: lesson.title,
            duration: lesson.duration ? `${lesson.duration} min` : '0 min',
            videoUrl: lesson.videoUrl || lesson.mediaUrl || '/placeholder.svg?height=400&width=800',
            transcript: lesson.transcript || [
              {
                timestamp: "0:00",
                text: "Lesson content will be available here.",
              }
            ],
            notes: lesson.notes || [
              {
                title: "Key Points",
                content: "Important notes will appear here.",
              }
            ],
            resources: lesson.resources || [
              {
                title: "Additional Resources",
                description: "Helpful resources for this lesson",
                url: "#",
                type: "article",
              }
            ],
          };
          break;
        }
      }
    }

    // Get user progress for completion tracking
    let userProgress: Array<{ lessonId: string; isCompleted: boolean; lastAccessedAt: Date; completedAt: Date | null }> = [];
    if (userId) {
      userProgress = await this.progressService.getCourseProgress(userId, courseId);
    }

    // Map modules with progress information
    const modules = course.modules.map((mod) => ({
      id: mod.id,
      title: mod.title,
      duration: mod.duration ? `${mod.duration} min` : '0 min',
      locked: false, // You can add logic for locking based on prerequisites
      lessons: (mod.lessons || []).map((lesson) => {
        const progress = userProgress.find(p => p.lessonId === lesson.id);
        return {
          id: lesson.id,
          title: lesson.title,
          duration: lesson.duration ? `${lesson.duration} min` : '0 min',
          type: lesson.type || 'video',
          completed: progress?.isCompleted || false,
          current: lesson.id === currentLessonIdToUse,
        };
      }),
    }));

    return {
      id: course.id,
      title: course.title,
      description: course.description,
      duration: course.duration,
      level: course.level,
      currentLesson,
      modules,
      objectives: course.objectives || [],
      instructor: course.createdBy ? {
        avatar: course.createdBy.avatarUrl || '',
        name: `${course.createdBy.firstname} ${course.createdBy.lastname}`,
        bio: course.createdBy.bio || '',
      } : null,
      rewards: {
        // badge: course.badges && course.badges.length > 0 ? course.badges[0].name : '',
        certificate: course.certificate ? course.certificate.title : '',
        challenges: course.finalAssessments ? course.finalAssessments.length : 0,
        badges: course.badges ? course.badges.map(b => ({
          id: b.id,
          name: b.name,
          description: b.description,
          iconUrl: b.iconUrl,
        })) : [],
      },
    };
  }

  async findCoursesByBadgeName(badgeName: string) {
    return this.courseRepo
      .createQueryBuilder('course')
      .leftJoinAndSelect('course.badges', 'badge')
      .where('badge.name = :badgeName', { badgeName })
      .getMany();
  }


}
