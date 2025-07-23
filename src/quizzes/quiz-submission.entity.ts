import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn } from 'typeorm';
import { Quiz } from './quiz.entity';
import { User } from 'src/users/user.entity';

@Entity()
export class QuizSubmission {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Quiz, { eager: true, onDelete: 'CASCADE' })
  quiz: Quiz;

  @ManyToOne(() => User, { eager: true, onDelete: 'CASCADE' })
  user: User;

  @Column('int')
  score: number;

  @Column('jsonb')
  answers: any;

  @CreateDateColumn()
  completedAt: Date;
} 