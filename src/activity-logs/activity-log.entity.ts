import {
  Entity,
  PrimaryGeneratedColumn,
  ManyToOne,
  Column,
  CreateDateColumn,
} from 'typeorm';
import { User } from 'src/users/user.entity';

export enum ActionType {
  LOGIN = 'login',
  ENROLLED = 'enrolled',
  COMPLETED_COURSE = 'completed_course',
  COMPLETED_LESSON = 'completed_lesson',
  SUBMITTED_QUIZ = 'submitted_quiz',
  SUBMITTED_ASSESSMENT = 'submitted_assessment',
  SUBMITTED_FEEDBACK = 'submitted_feedback',
  GOTTEN_CERTIFICATE = 'gotten_certificate',
}

@Entity()
export class ActivityLog {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => User, { eager: true })
  user: User;

  @Column({
    type: 'enum',
    enum: ActionType,
  })
  actionType: ActionType;

  @Column({ type: 'jsonb', nullable: true })
  metadata: Record<string, any>;

  @CreateDateColumn()
  createdAt: Date;
}
