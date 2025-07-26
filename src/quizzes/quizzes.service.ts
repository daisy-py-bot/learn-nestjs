import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Quiz } from './quiz.entity';
import { Module } from 'src/modules/module.entity';
import { CreateQuizDto } from './dto/create-quiz.dto';
import { UpdateQuizDto } from './dto/update-quiz.dto';
import { QuizSubmission } from './quiz-submission.entity';
import { ActivityLogsService } from '../activity-logs/activity-logs.service';
import { ActionType } from '../activity-logs/activity-log.entity';

@Injectable()
export class QuizzesService {
  constructor(
    @InjectRepository(Quiz)
    private quizRepo: Repository<Quiz>,

    @InjectRepository(Module)
    private moduleRepo: Repository<Module>,

    @InjectRepository(QuizSubmission)
    private quizSubmissionRepo: Repository<QuizSubmission>,
    private activityLogsService: ActivityLogsService,
  ) {}

  async create(data: CreateQuizDto) {
    const module = await this.moduleRepo.findOne({ where: { id: data.moduleId } });

    if (!module) {
      throw new NotFoundException('Module not found');
    }

    const quiz = this.quizRepo.create({
      title: data.title,
      unlockAfter: data.unlockAfter ?? 0,
      questions: data.questions,
      module,
    });

    return this.quizRepo.save(quiz);
  }

  findAll() {
    return this.quizRepo.find({ relations: ['module'] });
  }

  findOne(id: string) {
    return this.quizRepo.findOne({ where: { id }, relations: ['module'] });
  }

  async update(id: string, updates: UpdateQuizDto) {
    const quiz = await this.quizRepo.findOne({ where: { id } });
    if (!quiz) throw new NotFoundException('Quiz not found');

    Object.assign(quiz, updates);
    return this.quizRepo.save(quiz);
  }

  async remove(id: string) {
    const quiz = await this.quizRepo.findOne({ where: { id } });
    if (!quiz) throw new NotFoundException('Quiz not found');

    return this.quizRepo.remove(quiz);
  }

  async gradeQuiz({ courseId, quizId, userId, answers }: { courseId: string, quizId: string, userId: string, answers: string[] | { [questionId: string]: string } }) {
    const quiz = await this.quizRepo.findOne({ where: { id: quizId } });
    if (!quiz) throw new NotFoundException('Quiz not found');

    const results = quiz.questions.map((q, index) => {
      // Handle both array and object formats for answers
      let userAnswer = '';
      if (Array.isArray(answers)) {
        userAnswer = answers[index] || '';
      } else {
        userAnswer = answers[q.id] || '';
      }
      
      const userWords = userAnswer.trim().toLowerCase().split(/\s+/).filter(word => word.length > 2);
      const sampleWords = q.sampleAnswer.trim().toLowerCase().split(/\s+/).filter(word => word.length > 2);
      
      // Check if any user word appears in sample answer, or if user answer contains any sample word
      const userWordInSample = userWords.some(word => q.sampleAnswer.toLowerCase().includes(word));
      const sampleWordInUser = sampleWords.some(word => userAnswer.toLowerCase().includes(word));
      
      const isCorrect = userWordInSample || sampleWordInUser;
      
      return {
        questionId: q.id,
        score: isCorrect ? 1 : 0,
        feedback: isCorrect ? 'Correct!' : q.sampleAnswer,
      };
    });

    // Save submission if userId is provided
    if (userId) {
      const totalScore = results.reduce((sum, r) => sum + r.score, 0);
      const submission = await this.quizSubmissionRepo.save({
        quiz: { id: quizId },
        user: { id: userId },
        score: totalScore,
        answers,
      });

      // Log quiz submission
      await this.activityLogsService.create({
        userId,
        actionType: ActionType.SUBMITTED_QUIZ,
        metadata: { quizId, submissionId: submission.id },
      });
    }

    return { results };
  }

  async getQuizSubmission(userId: string, quizId: string) {
    const submission = await this.quizSubmissionRepo.findOne({
      where: { user: { id: userId }, quiz: { id: quizId } },
      relations: ['quiz'],
    });
    if (!submission) return null;
    const quiz = submission.quiz;
    // Re-grade for feedback (in case logic changes)
    const results = quiz.questions.map((q, index) => {
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
      quizId,
      userId,
      score: submission.score,
      completedAt: submission.completedAt,
      results,
    };
  }

  async getRandomQuizForModule(moduleId: string) {
    const quizzes = await this.quizRepo.find({ where: { module: { id: moduleId } } });
    if (!quizzes.length) return null;
    const randomIndex = Math.floor(Math.random() * quizzes.length);
    return quizzes[randomIndex];
  }

  async getRandomUnattemptedQuizForUser(moduleId: string, userId: string) {
    // Get all quizzes for the module
    const quizzes = await this.quizRepo.find({ where: { module: { id: moduleId } } });
    if (!quizzes.length) return null;

    // Get all submissions for this user/module
    const submissions = await this.quizSubmissionRepo.find({
      where: { user: { id: userId } },
      relations: ['quiz'],
    });
    const attemptedIds = new Set(submissions.map(s => s.quiz.id));

    // Filter out attempted quizzes
    const unattempted = quizzes.filter(q => !attemptedIds.has(q.id));
    if (!unattempted.length) {
      // All attempted, allow repeats
      const randomIndex = Math.floor(Math.random() * quizzes.length);
      return quizzes[randomIndex];
    }

    // Pick a random unattempted quiz
    const randomIndex = Math.floor(Math.random() * unattempted.length);
    return unattempted[randomIndex];
  }
}
