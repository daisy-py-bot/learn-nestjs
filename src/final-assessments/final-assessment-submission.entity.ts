import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn } from 'typeorm';
import { FinalAssessment } from './final-assessment.entity';
import { User } from 'src/users/user.entity';

@Entity()
export class FinalAssessmentSubmission {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => FinalAssessment, { eager: true, onDelete: 'CASCADE' })
  assessment: FinalAssessment;

  @ManyToOne(() => User, { eager: true, onDelete: 'CASCADE' })
  user: User;

  @Column('int')
  score: number;

  @Column('jsonb')
  answers: any;

  @CreateDateColumn()
  completedAt: Date;
} 