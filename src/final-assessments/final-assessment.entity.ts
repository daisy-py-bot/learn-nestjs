import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
} from 'typeorm';
import { Course } from 'src/courses/course.entity';
import { QuizQuestion } from 'src/quizzes/types';

@Entity()
export class FinalAssessment {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Course, (course) => course.finalAssessments, {
    onDelete: 'CASCADE',
  })
  course: Course;

  @Column()
  title: string;

  
  @Column({ type: 'jsonb' })
  questions: {
    id: string;
    prompt: string;
    sampleAnswer: string;
  }[];



  @Column('int')
  passingScore: number;

  @CreateDateColumn()
  createdAt: Date;
}
