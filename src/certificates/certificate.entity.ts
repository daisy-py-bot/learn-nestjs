import {
  Entity,
  PrimaryGeneratedColumn,
  ManyToOne,
  Column,
  CreateDateColumn,
} from 'typeorm';
import { User } from 'src/users/user.entity';
import { Course } from 'src/courses/course.entity';

@Entity()
export class Certificate {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => User, { eager: true })
  user: User;

  @ManyToOne(() => Course, { eager: true })
  course: Course;

  @CreateDateColumn()
  issuedAt: Date;

  @Column({ default: 'Certificate of Completion' })
  title: string;

  @Column()
  certificateUrl: string;
}
