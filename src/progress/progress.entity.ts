import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { User } from 'src/users/user.entity';
import { Lesson } from 'src/lessons/lesson.entity';
import { Course } from 'src/courses/course.entity';

@Entity()
export class Progress {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => User, { eager: true, onDelete: 'CASCADE' })
  user: User;

  @ManyToOne(() => Lesson, { eager: true, onDelete: 'CASCADE' })
  lesson: Lesson;

  @ManyToOne(() => Course, { eager: true, onDelete: 'CASCADE' })
  course: Course;

  @Column({ default: false })
  isCompleted: boolean;

  @Column({ type: 'timestamp', nullable: true })
  completedAt: Date | null;

  @Column({ type: 'timestamp', nullable: true })
  lastAccessedAt: Date;

  @UpdateDateColumn()
  lastVisitedAt: Date;
}
