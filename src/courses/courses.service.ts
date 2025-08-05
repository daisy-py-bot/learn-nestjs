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
import { CourseCategory } from './course-category.entity';
import { QuizzesService } from 'src/quizzes/quizzes.service';
import { FinalAssessmentsService } from 'src/final-assessments/final-assessments.service';
import { EnrollmentsService } from 'src/enrollments/enrollments.service';
import { EnrollmentStatus } from 'src/enrollments/enrollment.entity';
import { Module } from 'src/modules/module.entity';
import { Lesson } from 'src/lessons/lesson.entity';
import { CreateCourseWithModulesLessonsDto, CreateModuleWithLessonsDto, CreateLessonDto } from './dto/create-course-with-modules-lessons.dto';
import { FeedbackService } from 'src/feedback/feedback.service';

@Injectable()
export class CoursesService {
  constructor(
    @InjectRepository(Course)
    private courseRepo: Repository<Course>,
    @InjectRepository(User)
    private userRepo: Repository<User>,
    @InjectRepository(Module)
    private moduleRepo: Repository<Module>,
    @InjectRepository(Lesson)
    private lessonRepo: Repository<Lesson>,
    @InjectRepository(CourseCategory)
    private categoryRepo: Repository<CourseCategory>,
    private progressService: ProgressService,
    private quizzesService: QuizzesService,
    private finalAssessmentsService: FinalAssessmentsService,
    private enrollmentsService: EnrollmentsService,
    private feedbackService: FeedbackService,
  ) {}

  async create(data: CreateCourseDto) {
    const creator = await this.userRepo.findOne({ where: { id: data.createdById } });

    if (!creator) {
      throw new Error('Creator (User) not found');
    }

    const category = await this.categoryRepo.findOne({ where: { id: data.categoryId } });
    if (!category) {
      throw new Error('Category not found');
    }

    let badges: Badge[] = [];
    if (data.badgeIds && data.badgeIds.length > 0) {
      badges = await this.courseRepo.manager.getRepository(Badge).findByIds(data.badgeIds);
    } else if (data.badgeNames && data.badgeNames.length > 0) {
      badges = await this.getBadgesByNames(data.badgeNames);
    }

    const course = this.courseRepo.create({
      ...data,
      category,
      createdBy: creator,
      badgeNames: data.badgeNames || [],
      badges,
    });

    return this.courseRepo.save(course);
  }

  async createCourseWithModulesAndLessons(data: CreateCourseWithModulesLessonsDto) {
    // Get the category (use default if not provided)
    let category;
    if (data.categoryId) {
      category = await this.categoryRepo.findOne({ where: { id: data.categoryId } });
      if (!category) {
        throw new Error('Category not found');
      }
    } else {
      // Use the first available category as default
      category = await this.categoryRepo.findOne({ 
        where: { isActive: true },
        order: { order: 'ASC' }
      });
      if (!category) {
        throw new Error('No active categories found. Please create a category first.');
      }
    }

    // Get the creator
    const creator = await this.userRepo.findOne({ where: { id: data.createdById } });
    if (!creator) {
      throw new Error('Creator (User) not found');
    }

    // Create the course
    const course = this.courseRepo.create({
      ...data,
      category,
      createdBy: creator,
      modules: [],
    });
    await this.courseRepo.save(course);

    // For each module, create and save it, then add lessons
    for (const mod of data.modules) {
      const module = this.moduleRepo.create({
        title: mod.title,
        description: mod.description,
        order: mod.order,
        course: course,
        lessons: [],
      });
      await this.moduleRepo.save(module);

      for (const lesson of mod.lessons) {
        const lessonEntity = this.lessonRepo.create({
          ...lesson,
          module: module,
        });
        await this.lessonRepo.save(lessonEntity);
      }
    }

    // Return the created course with relations
    return this.courseRepo.findOne({
      where: { id: course.id },
      relations: ['modules', 'modules.lessons'],
    });
  }

  findAll() {
    return this.courseRepo.find({ 
      relations: ['modules', 'modules.lessons', 'createdBy'],
      order: {
        modules: {
          order: 'ASC',
          lessons: {
            order: 'ASC'
          }
        }
      }
    });
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

  async getCourseCatalog(userId?: string) {
    // Use query builder to join modules and lessons
    let courses = await this.courseRepo.find({ relations: ['modules', 'modules.lessons'] });
    if (userId) {
      // Get enrolled course IDs for the user
      const enrollments = await this.enrollmentsService.findByUser(userId);
      const enrolledCourseIds = new Set(enrollments.map(e => e.course.id));
      courses = courses.filter(course => !enrolledCourseIds.has(course.id));
    }
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
    // Update lastAccessedAt for the user's enrollment if userId is provided
    if (userId) {
      await this.updateLastAccessedAt(userId, courseId);
    }

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

    // Map modules with progress information and quizzes, sorted by order
    const modules = await Promise.all(course.modules
      .sort((a, b) => (a.order || 0) - (b.order || 0)) // Sort modules by order
      .map(async (mod) => {
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
          order: mod.order || 0,
          duration: totalLessonDuration ? `${totalLessonDuration} min` : '0 min',
          locked: false, // You can add logic for locking based on prerequisites
          lessons: (mod.lessons || [])
            .sort((a, b) => (a.order || 0) - (b.order || 0)) // Sort lessons by order
            .map((lesson) => {
              const progress = userProgress.find(p => p.lessonId === lesson.id);
              return {
                id: lesson.id,
                title: lesson.title,
                order: lesson.order || 0,
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

  async getCourseContentForAdmin(courseId: string) {
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

    // Map modules with all content (no user-specific data), sorted by order
    const modules = course.modules
      .sort((a, b) => (a.order || 0) - (b.order || 0)) // Sort modules by order
      .map((mod) => {
        // Calculate total duration from lessons
        const totalLessonDuration = (mod.lessons || []).reduce((sum, lesson) => sum + (lesson.duration || 0), 0);
        
        return {
          id: mod.id,
          title: mod.title,
          description: mod.description,
          order: mod.order || 0,
          duration: totalLessonDuration ? `${totalLessonDuration} min` : '0 min',
          lessons: (mod.lessons || [])
            .sort((a, b) => (a.order || 0) - (b.order || 0)) // Sort lessons by order
            .map((lesson) => ({
              id: lesson.id,
              title: lesson.title,
              content: lesson.content,
              mediaUrl: lesson.mediaUrl,
              videoUrl: lesson.videoUrl,
              transcript: lesson.transcript,
              notes: lesson.notes,
              resources: lesson.resources,
              duration: lesson.duration ? `${lesson.duration} min` : '0 min',
              type: lesson.type || 'video',
              order: lesson.order || 0,
            })),
          quizzes: (mod.quizzes || []).map((quiz) => ({
            id: quiz.id,
            title: quiz.title,
            questions: quiz.questions,
            unlockAfter: quiz.unlockAfter,
            duration: quiz.duration,
          })),
        };
      });

    // Fetch badges by badgeNames
    const badges = await this.getBadgesByNames(course.badgeNames || []);

    return {
      id: course.id,
      title: course.title,
      description: course.description,
      duration: course.duration,
      level: course.level,
      category: course.category,
      isPublished: course.isPublished,
      hasCertificate: course.hasCertificate,
      modules,
      objectives: course.objectives || [],
      searchTags: course.searchTags || [],
      instructor: course.createdBy ? {
        id: course.createdBy.id,
        name: `${course.createdBy.firstname} ${course.createdBy.lastname}`,
        email: course.createdBy.email,
        bio: course.createdBy.bio || '',
        avatar: course.createdBy.avatarUrl || '',
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
      finalAssessments: (course.finalAssessments || []).map((assessment) => ({
        id: assessment.id,
        title: assessment.title,
        questions: assessment.questions,
        passingScore: assessment.passingScore,
        duration: assessment.duration,
      })),
      createdAt: course.createdAt,
      updatedAt: course.updatedAt,
    };
  }

  async findCoursesByBadgeName(badgeName: string, userId?: string) {
    let courses = await this.courseRepo
      .createQueryBuilder('course')
      .leftJoinAndSelect('course.badges', 'badge')
      .where('badge.name = :badgeName', { badgeName })
      .getMany();
    if (userId) {
      const enrollments = await this.enrollmentsService.findByUser(userId);
      const enrolledCourseIds = new Set(enrollments.map(e => e.course.id));
      courses = courses.filter(course => !enrolledCourseIds.has(course.id));
    }
    return courses;
  }

  async findCoursesByCategory(categoryId: string, userId?: string) {
    let courses;
    if (categoryId === 'all') {
      courses = await this.courseRepo.find({ relations: ['createdBy', 'category'] });
    } else {
      courses = await this.courseRepo.find({ 
        where: { category: { id: categoryId } }, 
        relations: ['createdBy', 'category'] 
      });
    }
    if (userId) {
      const enrollments = await this.enrollmentsService.findByUser(userId);
      const enrolledCourseIds = new Set(enrollments.map(e => e.course.id));
      courses = courses.filter(course => !enrolledCourseIds.has(course.id));
    }
    return courses;
  }

  async findMostPopularCourses(userId?: string, limit = 3) {
    const result = await this.courseRepo
      .createQueryBuilder('course')
      .leftJoin('enrollment', 'enrollment', 'enrollment.courseId = course.id')
      .addSelect('COUNT(enrollment.id)', 'enrollmentCount')
      .groupBy('course.id')
      .orderBy('"enrollmentCount"', 'DESC') // fixed alias quoting
      .limit(limit)
      .getRawAndEntities();
    let courses = result.entities.map((course, idx) => ({
      ...course,
      enrollmentCount: parseInt(result.raw[idx].enrollmentCount, 10) || 0,
    }));
    if (userId) {
      const enrollments = await this.enrollmentsService.findByUser(userId);
      const enrolledCourseIds = new Set(enrollments.map(e => e.course.id));
      courses = courses.filter(course => !enrolledCourseIds.has(course.id));
    }
    return courses;
  }

  async searchCourses(query: string, userId?: string) {
    if (!query) return [];
    const q = `%${query}%`;
    let courses = await this.courseRepo.createQueryBuilder('course')
      .where('course.title ILIKE :q', { q })
      .orWhere('course.description ILIKE :q', { q })
      .orWhere(`EXISTS (
        SELECT 1 FROM unnest(course.searchTags) AS tag WHERE tag ILIKE :q
      )`, { q })
      .getMany();
    if (userId) {
      const enrollments = await this.enrollmentsService.findByUser(userId);
      const enrolledCourseIds = new Set(enrollments.map(e => e.course.id));
      courses = courses.filter(course => !enrolledCourseIds.has(course.id));
    }
    return courses;
  }

  // Public method for dashboard to get user progress for a course
  async getCourseProgressForDashboard(userId: string, courseId: string) {
    return this.progressService.getCourseProgress(userId, courseId);
  }

  async getCourseStatistics(courseId: string) {
    // 1. Get all enrollments for the course
    const enrollments = await this.enrollmentsService.findByCourse(courseId);

    // 2. Calculate statistics
    const total = enrollments.length;
    const completed = enrollments.filter(e => e.status === 'completed').length;
    const completionRate = total ? Math.round((completed / total) * 100) : 0;

    // Drop-off: in progress but not completed
    const inProgress = enrollments.filter(e => e.status === 'in_progress').length;
    const dropOffRate = (inProgress + completed) > 0 ? Math.round((inProgress / (inProgress + completed)) * 100) : 0;

    // Active today: use lastAccessedAt
    const today = new Date();
    const activeToday = enrollments.filter(e => {
      if (!e.lastAccessedAt) return false;
      const d = new Date(e.lastAccessedAt);
      return d.toDateString() === today.toDateString();
    }).length;

    // Avg completion time (in hours, only for completed enrollments)
    const completionTimes = enrollments
      .filter(e => e.status === 'completed' && e.startedAt && e.completedAt)
      .map(e => (new Date(e.completedAt).getTime() - new Date(e.startedAt).getTime()) / (1000 * 60 * 60));
    const avgCompletionTime = completionTimes.length
      ? (completionTimes.reduce((a, b) => a + b, 0) / completionTimes.length).toFixed(1)
      : '0';

    // Avg rating from feedback
    const feedbacks = await this.feedbackService.findAllForCourse(courseId);
    const ratings = feedbacks.map(f => f.rating).filter(r => typeof r === 'number');
    const avgRating = ratings.length
      ? (ratings.reduce((a, b) => a + b, 0) / ratings.length).toFixed(1) + '/5'
      : 'N/A';

    return {
      statistics: {
        completionRate: `${completionRate}%`,
        avgRating,
        dropOffRate: `${dropOffRate}%`,
        activeToday,
        avgCompletionTime,
        enrollments: total,
      }
    };
  }

  async getModulesForCourse(courseId: string) {
    const course = await this.courseRepo.findOne({
      where: { id: courseId },
      relations: ['modules'],
      order: {
        modules: {
          order: 'ASC'
        }
      }
    });
    if (!course) throw new NotFoundException('Course not found');
    return course.modules.sort((a, b) => (a.order || 0) - (b.order || 0));
  }

  private async updateLastAccessedAt(userId: string, courseId: string) {
    try {
      const enrollment = await this.enrollmentsService.findByUserAndCourse(userId, courseId);
      if (enrollment) {
        await this.enrollmentsService.update(enrollment.id, { lastAccessedAt: new Date() });
      }
    } catch (error) {
      // Silently handle errors - user might not be enrolled or other issues
      console.log('Could not update lastAccessedAt:', error.message);
    }
  }


}
