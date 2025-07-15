import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
} from 'typeorm';
import { Module } from 'src/modules/module.entity';

@Entity()
export class Quiz {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Module, (module) => module.quizzes, { onDelete: 'CASCADE' })
  module: Module;

  @Column()
  title: string;

  @Column({ type: 'int', default: 0 })
  unlockAfter: number;

  @Column({ type: 'jsonb' })
  questions: {
    id: string; // unique identifier for the question 
    prompt: string; // the actual question text
    sampleAnswer: string; // what a good answer should contain
  }[];

  @CreateDateColumn()
  createdAt: Date;
}
