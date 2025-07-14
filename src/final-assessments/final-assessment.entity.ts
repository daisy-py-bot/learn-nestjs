import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
} from 'typeorm';
import { Course } from 'src/courses/course.entity';

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
  questions: any;

  @Column('int')
  passingScore: number;

  @CreateDateColumn()
  createdAt: Date;
}
