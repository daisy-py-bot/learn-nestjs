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
import { CourseCategory } from './course.entity';
import { QuizzesService } from 'src/quizzes/quizzes.service';
import { FinalAssessmentsService } from 'src/final-assessments/final-assessments.service';
import { EnrollmentsService } from 'src/enrollments/enrollments.service';
import { EnrollmentStatus } from 'src/enrollments/enrollment.entity';

@Injectable()
export class CoursesService {
  constructor(
    @InjectRepository(Course)
    private courseRepo: Repository<Course>,
    @InjectRepository(User)
    private userRepo: Repository<User>,
    private progressService: ProgressService,
    private quizzesService: QuizzesService,
    private finalAssessmentsService: FinalAssessmentsService,
    private enrollmentsService: EnrollmentsService,
  ) {}

  async create(data: CreateCourseDto) {
    const creator = await this.userRepo.findOne({ where: { id: data.createdById } });

    if (!creator) {
      throw new Error('Creator (User) not found');
    }

    let badges: Badge[] = [];
    if (data.badgeIds && data.badgeIds.length > 0) {
      badges = await this.courseRepo.manager.getRepository(Badge).findByIds(data.badgeIds);
    } else if (data.badgeNames && data.badgeNames.length > 0) {
      badges = await this.getBadgesByNames(data.badgeNames);
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

  private async getBadgesByNames(badgeNames: string[]): Promise<Badge[]> {
    if (!badgeNames || badgeNames.length === 0) return [];
    return this.courseRepo.manager.getRepository(Badge).find({
      where: badgeNames.map(name => ({ name })),
    });
  }

  async getCourseContent(courseId: string, userId?: string, currentLessonId?: string) {
    const course = await this.courseRepo.findOne({
      where: { id: courseId },
      relations: [
        'modules',
        'modules.lessons',
        'modules.quizzes',
        'badges',
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
            videoUrl: lesson.mediaUrl || lesson.videoUrl ||  '/placeholder.svg?height=400&width=800',
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

    // Map modules with progress information and quizzes
    const modules = await Promise.all(course.modules.map(async (mod) => {
      // Calculate total duration from lessons
      const totalLessonDuration = (mod.lessons || []).reduce((sum, lesson) => sum + (lesson.duration || 0), 0);
      // For each quiz, check if completed by user
      const quizzes = await Promise.all((mod.quizzes || []).map(async (quiz) => {
        let completed = false;
        if (userId) {
          const submission = await this.quizzesService['quizSubmissionRepo'].findOne({
            where: { user: { id: userId }, quiz: { id: quiz.id } },
          });
          completed = !!submission;
        }
        return { ...quiz, completed };
      }));
      return {
        id: mod.id,
        title: mod.title,
        duration: totalLessonDuration ? `${totalLessonDuration} min` : '0 min',
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
        quizzes,
      };
    }));

    // Fetch badges by badgeNames
    const badges = await this.getBadgesByNames(course.badgeNames || []);

    // Get the first final assessment for the course, if any
    const finalAssessment = course.finalAssessments && course.finalAssessments.length > 0
      ? course.finalAssessments[0]
      : null;

    // Check if user has completed the final assessment
    let finalAssessmentCompleted = false;
    if (userId && finalAssessment) {
      const submission = await this.finalAssessmentsService['submissionRepo'].findOne({
        where: { user: { id: userId }, assessment: { id: finalAssessment.id } },
      });
      finalAssessmentCompleted = !!submission;
    }

    // Check if the course is completed for the user
    let completed = false;
    if (userId) {
      const enrollments = await this.enrollmentsService.findByUser(userId);
      const enrollment = enrollments.find(e => e.course.id === courseId);
      completed = !!enrollment && enrollment.status === EnrollmentStatus.COMPLETED;
    }

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
        certificate: course.hasCertificate ? 'Certificate of Completion' : '',
        challenges: course.finalAssessments ? course.finalAssessments.length : 0,
        badges: badges.map(b => ({
          id: b.id,
          name: b.name,
          description: b.description,
          iconUrl: b.iconUrl,
        })),
      },
      finalAssessment,
      finalAssessmentCompleted,
      hasCertificate: course.hasCertificate,
      completed,
    };
  }

  async findCoursesByBadgeName(badgeName: string) {
    return this.courseRepo
      .createQueryBuilder('course')
      .leftJoinAndSelect('course.badges', 'badge')
      .where('badge.name = :badgeName', { badgeName })
      .getMany();
  }

  async findCoursesByCategory(category: string) {
    if (category === CourseCategory.ALL) {
      return this.courseRepo.find({ relations: ['createdBy'] });
    }
    return this.courseRepo.find({ where: { category: category as CourseCategory }, relations: ['createdBy'] });
  }

  async findMostPopularCourses(limit = 3) {
    const result = await this.courseRepo
      .createQueryBuilder('course')
      .leftJoin('enrollment', 'enrollment', 'enrollment.courseId = course.id')
      .addSelect('COUNT(enrollment.id)', 'enrollmentCount')
      .groupBy('course.id')
      .orderBy('"enrollmentCount"', 'DESC') // fixed alias quoting
      .limit(limit)
      .getRawAndEntities();

    // Combine course entity and enrollment count
    return result.entities.map((course, idx) => ({
      ...course,
      enrollmentCount: parseInt(result.raw[idx].enrollmentCount, 10) || 0,
    }));
  }

  async searchCourses(query: string) {
    if (!query) return [];
    const q = `%${query}%`;
    return this.courseRepo.createQueryBuilder('course')
      .where('course.title ILIKE :q', { q })
      .orWhere('course.description ILIKE :q', { q })
      .orWhere(`EXISTS (
        SELECT 1 FROM unnest(course.searchTags) AS tag WHERE tag ILIKE :q
      )`, { q })
      .getMany();
  }

  // Public method for dashboard to get user progress for a course
  async getCourseProgressForDashboard(userId: string, courseId: string) {
    return this.progressService.getCourseProgress(userId, courseId);
  }


}
