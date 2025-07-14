import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Submission } from './submission.entity';
import { CreateSubmissionDto } from './dto/create-submission.dto';
import { UpdateSubmissionDto } from './dto/update-submission.dto';
import { User } from 'src/users/user.entity';
import { Quiz } from 'src/quizzes/quiz.entity';
import { FinalAssessment } from 'src/final-assessments/final-assessment.entity';

@Injectable()
export class SubmissionsService {
  constructor(
    @InjectRepository(Submission)
    private submissionRepo: Repository<Submission>,

    @InjectRepository(User)
    private userRepo: Repository<User>,

    @InjectRepository(Quiz)
    private quizRepo: Repository<Quiz>,

    @InjectRepository(FinalAssessment)
    private assessmentRepo: Repository<FinalAssessment>,
  ) {}

  async create(data: CreateSubmissionDto) {
    const user = await this.userRepo.findOne({ where: { id: data.userId } });
    if (!user) throw new NotFoundException('User not found');

    const quiz = data.quizId
      ? await this.quizRepo.findOne({ where: { id: data.quizId } })
      : null;

    const assessment = data.assessmentId
      ? await this.assessmentRepo.findOne({ where: { id: data.assessmentId } })
      : null;


    const submission = this.submissionRepo.create({
        user: { id: data.userId },
        quiz: data.quizId ? { id: data.quizId } : undefined,
        assessment: data.assessmentId ? { id: data.assessmentId } : undefined,
        score: data.score,
        response: data.response,
    });


    return this.submissionRepo.save(submission);
  }

  findAll() {
    return this.submissionRepo.find({ relations: ['user', 'quiz', 'assessment'] });
  }

  findOne(id: string) {
    return this.submissionRepo.findOne({ where: { id }, relations: ['user', 'quiz', 'assessment'] });
  }

  async update(id: string, updates: UpdateSubmissionDto) {
    const submission = await this.submissionRepo.findOne({ where: { id } });
    if (!submission) throw new NotFoundException('Submission not found');

    Object.assign(submission, updates);
    return this.submissionRepo.save(submission);
  }

  async remove(id: string) {
    const submission = await this.submissionRepo.findOne({ where: { id } });
    if (!submission) throw new NotFoundException('Submission not found');

    return this.submissionRepo.remove(submission);
  }
}
