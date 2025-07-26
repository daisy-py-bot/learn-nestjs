import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { FinalAssessment } from './final-assessment.entity';
import { Course } from 'src/courses/course.entity';
import { CreateFinalAssessmentDto } from './dto/create-final-assessment.dto';
import { UpdateFinalAssessmentDto } from './dto/update-final-assessment.dto';
import { FinalAssessmentSubmission } from './final-assessment-submission.entity';
import { CertificatesService } from 'src/certificates/certificates.service';
import { EnrollmentsService } from 'src/enrollments/enrollments.service';
import { EnrollmentStatus } from 'src/enrollments/enrollment.entity';

@Injectable()
export class FinalAssessmentsService {
  constructor(
    @InjectRepository(FinalAssessment)
    private assessmentRepo: Repository<FinalAssessment>,

    @InjectRepository(Course)
    private courseRepo: Repository<Course>,

    @InjectRepository(FinalAssessmentSubmission)
    private submissionRepo: Repository<FinalAssessmentSubmission>,

    private certificatesService: CertificatesService,
    private enrollmentsService: EnrollmentsService,
  ) {}

  async create(data: CreateFinalAssessmentDto) {
    const course = await this.courseRepo.findOne({ where: { id: data.courseId } });
    if (!course) throw new NotFoundException('Course not found');

    const assessment = this.assessmentRepo.create({
      title: data.title,
      questions: data.questions,
      passingScore: data.passingScore,
      course,
    });

    return this.assessmentRepo.save(assessment);
  }

  findAll() {
    return this.assessmentRepo.find({ relations: ['course'] });
  }

  findOne(id: string) {
    return this.assessmentRepo.findOne({ where: { id }, relations: ['course'] });
  }

  async update(id: string, updates: UpdateFinalAssessmentDto) {
    const assessment = await this.assessmentRepo.findOne({ where: { id } });
    if (!assessment) throw new NotFoundException('Assessment not found');

    Object.assign(assessment, updates);
    return this.assessmentRepo.save(assessment);
  }

  async remove(id: string) {
    const assessment = await this.assessmentRepo.findOne({ where: { id } });
    if (!assessment) throw new NotFoundException('Assessment not found');

    return this.assessmentRepo.remove(assessment);
  }

  async getUserFinalAssessment(userId: string, assessmentId: string) {
    const assessment = await this.assessmentRepo.findOne({ where: { id: assessmentId } });
    if (!assessment) return null;
    // You can expand this to include user submission data if you add a submission entity
    return {
      userId,
      assessment,
    };
  }

  async submitAndGradeAssessment({ userId, assessmentId, answers }: { userId: string, assessmentId: string, answers: { [questionId: string]: string } | string[] }) {
    const assessment = await this.assessmentRepo.findOne({ where: { id: assessmentId }, relations: ['course'] });
    if (!assessment) throw new NotFoundException('Assessment not found');

    // Grade answers (simple logic: check if user answer contains any sample word)
    const results = assessment.questions.map((q, index) => {
      let userAnswer = '';
      if (Array.isArray(answers)) {
        userAnswer = answers[index] || '';
      } else {
        userAnswer = answers[q.id] || '';
      }
      const userWords = userAnswer.trim().toLowerCase().split(/\s+/).filter(word => word.length > 2);
      const sampleWords = q.sampleAnswer.trim().toLowerCase().split(/\s+/).filter(word => word.length > 2);
      const userWordInSample = userWords.some(word => q.sampleAnswer.toLowerCase().includes(word));
      const sampleWordInUser = sampleWords.some(word => userAnswer.toLowerCase().includes(word));
      const isCorrect = userWordInSample || sampleWordInUser;
      return {
        questionId: q.id,
        prompt: q.prompt,
        sampleAnswer: q.sampleAnswer,
        userAnswer,
        score: isCorrect ? 1 : 0,
        feedback: isCorrect ? 'Correct!' : q.sampleAnswer,
      };
    });
    const totalScore = results.reduce((sum, r) => sum + r.score, 0);
    const percent = (totalScore / assessment.questions.length) * 100;
    const passed = percent >= assessment.passingScore;
    // Only save submission if passed
    if (passed) {
      await this.submissionRepo.save({
        assessment: { id: assessmentId },
        user: { id: userId },
        score: totalScore,
        answers,
      });
      // Mark enrollment as completed
      const enrollments = await this.enrollmentsService.findByUser(userId);
      const enrollment = enrollments.find(e => e.course.id === assessment.course.id);
      if (enrollment && enrollment.status !== EnrollmentStatus.COMPLETED) {
        await this.enrollmentsService.update(enrollment.id, { status: EnrollmentStatus.COMPLETED });
      }
    }
    return {
      assessmentId,
      userId,
      score: totalScore,
      completedAt: new Date(),
      results,
      passed,
    };
  }

  async getFinalAssessmentSubmission(userId: string, assessmentId: string) {
    const submission = await this.submissionRepo.findOne({
      where: { user: { id: userId }, assessment: { id: assessmentId } },
      relations: ['assessment'],
    });
    if (!submission) return null;
    const assessment = submission.assessment;
    // Re-grade for feedback (in case logic changes)
    const results = assessment.questions.map((q, index) => {
      let userAnswer = '';
      if (Array.isArray(submission.answers)) {
        userAnswer = submission.answers[index] || '';
      } else {
        userAnswer = submission.answers[q.id] || '';
      }
      const userWords = userAnswer.trim().toLowerCase().split(/\s+/).filter(word => word.length > 2);
      const sampleWords = q.sampleAnswer.trim().toLowerCase().split(/\s+/).filter(word => word.length > 2);
      const userWordInSample = userWords.some(word => q.sampleAnswer.toLowerCase().includes(word));
      const sampleWordInUser = sampleWords.some(word => userAnswer.toLowerCase().includes(word));
      const isCorrect = userWordInSample || sampleWordInUser;
      return {
        questionId: q.id,
        prompt: q.prompt,
        sampleAnswer: q.sampleAnswer,
        userAnswer,
        score: isCorrect ? 1 : 0,
        feedback: isCorrect ? 'Correct!' : q.sampleAnswer,
      };
    });
    return {
      assessmentId,
      userId,
      score: submission.score,
      completedAt: submission.completedAt,
      results,
      passed: (submission.score / assessment.questions.length) * 100 >= assessment.passingScore,
    };
  }

  async getRandomFinalAssessmentForCourse(courseId: string) {
    const assessments = await this.assessmentRepo.find({ where: { course: { id: courseId } } });
    if (!assessments.length) return null;
    const randomIndex = Math.floor(Math.random() * assessments.length);
    return assessments[randomIndex];
  }

  async getRandomUnattemptedAssessmentForUser(courseId: string, userId: string) {
    // Get all assessments for the course
    const assessments = await this.assessmentRepo.find({ where: { course: { id: courseId } } });
    if (!assessments.length) return null;

    // Get all submissions for this user/course
    const submissions = await this.submissionRepo.find({
      where: { user: { id: userId } },
      relations: ['assessment'],
    });
    const attemptedIds = new Set(submissions.map(s => s.assessment.id));

    // Filter out attempted assessments
    const unattempted = assessments.filter(a => !attemptedIds.has(a.id));
    if (!unattempted.length) {
      // All attempted, allow repeats
      const randomIndex = Math.floor(Math.random() * assessments.length);
      return assessments[randomIndex];
    }

    // Pick a random unattempted assessment
    const randomIndex = Math.floor(Math.random() * unattempted.length);
    return unattempted[randomIndex];
  }
}
