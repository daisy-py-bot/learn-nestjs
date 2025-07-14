import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
} from 'typeorm';
import { User } from 'src/users/user.entity';
import { Quiz } from 'src/quizzes/quiz.entity';
import { FinalAssessment } from 'src/final-assessments/final-assessment.entity';

@Entity()
export class Submission {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  user: User;

  @ManyToOne(() => Quiz, { nullable: true, onDelete: 'SET NULL' })
  quiz: Quiz;

  @ManyToOne(() => FinalAssessment, { nullable: true, onDelete: 'SET NULL' })
  assessment: FinalAssessment;

  @Column('float')
  score: number;

  @Column({ type: 'jsonb' })
  response: any;

  @CreateDateColumn()
  submittedAt: Date;
}
