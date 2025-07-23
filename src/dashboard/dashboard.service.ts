import { Injectable } from '@nestjs/common';
import { UsersService } from 'src/users/users.service';
import { EnrollmentsService } from 'src/enrollments/enrollments.service';
import { BadgesService } from 'src/badges/badges.service';
import { CoursesService } from 'src/courses/courses.service';

@Injectable()
export class DashboardService {
  constructor(
    private usersService: UsersService,
    private enrollmentsService: EnrollmentsService,
    private badgesService: BadgesService,
    private coursesService: CoursesService,
  ) {}

  async getDashboardData(userId: string) {
    // User basic info
    const user = await this.usersService.findOne(userId);
    if (!user) throw new Error('User not found');

    // User's enrollments (in-progress and completed)
    const enrollments = await this.enrollmentsService.findByUser(userId);

    // Calculate total courses, total hours, completed courses, etc
    const totalCourses = enrollments.length;
    const totalHours = Math.round((enrollments.reduce((sum, e) => sum + (e.course.duration || 0), 0) / 60) * 10) / 10;

    // Completed courses
    const completedCourses = enrollments.filter(e => e.status === 'completed').map(e => ({ ...e, completed: true }));

    // User badges
    const badges = await this.badgesService.getUserBadges(userId);

    // Recommended courses — for now fetch some random or popular courses
    let recommendedCourses = await this.coursesService.findRecommendedForUser(userId);
    // Exclude courses the user is already enrolled in
    const enrolledCourseIds = new Set(enrollments.map(e => e.course.id));
    recommendedCourses = recommendedCourses.filter(c => !enrolledCourseIds.has(c.id));

    // Ongoing courses with progress
    const ongoingCourses: any[] = [];
    for (const e of enrollments.filter(e => e.status !== 'completed')) {
      // Fetch course with modules and lessons
      const courseWithModules = await this.coursesService['courseRepo'].findOne({
        where: { id: e.course.id },
        relations: ['modules', 'modules.lessons', 'modules.quizzes', 'finalAssessments'],
      });
      if (!courseWithModules) {
        ongoingCourses.push({ ...e, progress: 0, resumeLessonId: null, completed: false });
        continue;
      }
      // Get completed lessons for user in this course
      const userProgress = await this.coursesService.getCourseProgressForDashboard(userId, e.course.id);
      const completedLessonIds = userProgress.filter((p: any) => p.isCompleted).map((p: any) => p.lessonId);
      // Flatten all lessons by module order, then lesson order
      const modules = (courseWithModules.modules || []).slice().sort((a: any, b: any) => (a.order ?? 0) - (b.order ?? 0));
      let resumeLessonId: string | null = null;
      outer: for (const mod of modules) {
        const lessons = (mod.lessons || []).slice().sort((a: any, b: any) => (a.order ?? 0) - (b.order ?? 0));
        for (const lesson of lessons) {
          if (!completedLessonIds.includes(lesson.id)) {
            resumeLessonId = lesson.id;
            break outer;
          }
        }
      }
      // Flatten all lessons for progress calculation
      const allLessons = modules.flatMap((m: any) => (m.lessons || []));
      const allQuizzes = modules.flatMap((m: any) => (m.quizzes || []));
      const allFinalAssessments = courseWithModules.finalAssessments || [];

      // Lessons
      const totalLessonMinutes = allLessons.reduce((sum: number, l: any) => sum + (l.duration || 0), 0);
      const completedLessonMinutes = allLessons.filter((l: any) => completedLessonIds.includes(l.id)).reduce((sum: number, l: any) => sum + (l.duration || 0), 0);

      // Quizzes
      const quizSubmissionRepo = this.coursesService['quizzesService']['quizSubmissionRepo'];
      const completedQuizIds = (await quizSubmissionRepo.find({ where: { user: { id: userId } } })).map((s: any) => s.quiz.id);
      const totalQuizMinutes = allQuizzes.reduce((sum: number, q: any) => sum + (q.duration || 0), 0);
      const completedQuizMinutes = allQuizzes.filter((q: any) => completedQuizIds.includes(q.id)).reduce((sum: number, q: any) => sum + (q.duration || 0), 0);

      // Final Assessments
      const finalAssessmentSubmissionRepo = this.coursesService['finalAssessmentsService']['submissionRepo'];
      const completedFinalAssessmentIds = (await finalAssessmentSubmissionRepo.find({ where: { user: { id: userId } } })).map((s: any) => s.assessment.id);
      const totalFinalAssessmentMinutes = allFinalAssessments.reduce((sum: number, fa: any) => sum + (fa.duration || 0), 0);
      const completedFinalAssessmentMinutes = allFinalAssessments.filter((fa: any) => completedFinalAssessmentIds.includes(fa.id)).reduce((sum: number, fa: any) => sum + (fa.duration || 0), 0);

      const totalMinutes = totalLessonMinutes + totalQuizMinutes + totalFinalAssessmentMinutes;
      const completedMinutes = completedLessonMinutes + completedQuizMinutes + completedFinalAssessmentMinutes;

      ongoingCourses.push({
        ...e,
        progress: totalMinutes > 0 ? completedMinutes / totalMinutes : 0,
        resumeLessonId,
        completed: false,
      });
    }

    return {
      user: {
        id: user.id,
        name: user.firstname,
        tagline: user.tagline || '',
        avatar: user.avatarUrl || '',
      },
      stats: {
        totalCourses,
        totalHours,
        badges: badges.length,
        certificates: completedCourses.filter(c => c.certificateIssued).length,
      },
      completedCourses,
      badges,
      recommendedCourses: recommendedCourses.length > 0 ? recommendedCourses.map(rc => ({ ...rc, completed: false })) : [],
      ongoingCourses,
    };
  }
}
