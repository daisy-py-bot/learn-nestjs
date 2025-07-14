import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
  CreateDateColumn,
} from 'typeorm';
import { Course } from 'src/courses/course.entity';
import { Lesson } from 'src/lessons/lesson.entity';
import { Quiz } from 'src/quizzes/quiz.entity';


@Entity()
export class Module {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Course, (course) => course.modules, { onDelete: 'CASCADE' })
  course: Course;

  @Column()
  title: string;

  @Column('text')
  description: string;

  @Column('int')
  order: number;

  @CreateDateColumn()
  createdAt: Date;

  @OneToMany( () => Lesson, (lesson) => lesson.module)
  lessons: Lesson[];

  @OneToMany(() => Quiz, (quiz) => quiz.module)
  quizzes: Quiz[];
}
