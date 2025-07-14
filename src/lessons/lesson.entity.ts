import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
} from 'typeorm';
import { Module } from 'src/modules/module.entity';

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

  @Column('int')
  order: number;

  @Column({type:'text', nullable: true}) // optional additional resources for the lesson
  resources: string;

  @Column({type: 'text', nullable: true}) // optional notes on the lesson
  notes: string;

  @CreateDateColumn()
  createdAt: Date;
}
