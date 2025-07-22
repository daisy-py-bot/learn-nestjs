import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
} from 'typeorm';
import { Module } from 'src/modules/module.entity';

export enum LessonType {
  VIDEO = 'video',
  READING = 'reading',
  QUIZ = 'quiz',
  PDF = 'pdf',
  DOC = 'doc',
}

@Entity()
export class Lesson {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Module, (module) => module.lessons, { onDelete: 'CASCADE' })
  module: Module;

  @Column()
  title: string;

  @Column('text')
  content: string;

  @Column({ nullable: true })
  mediaUrl?: string;

  @Column({ type: 'text', nullable: true })
  videoUrl?: string;

  @Column({ type: 'json', nullable: true })
  transcript?: Array<{ timestamp: string; text: string }>;

  @Column({ type: 'json', nullable: true })
  notes?: Array<{ title: string; content: string }>;

  @Column({ type: 'json', nullable: true })
  resources?: Array<{ title: string; description: string; url: string; type: string }>;

  @Column('int', { nullable: true })
  duration?: number; // duration in minutes

  @Column({ type: 'enum', enum: LessonType, default: LessonType.VIDEO })
  type: LessonType;

  @Column('int')
  order: number;

  @CreateDateColumn()
  createdAt: Date;
}
