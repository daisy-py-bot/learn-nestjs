import { IsUUID, IsOptional, IsEnum } from 'class-validator';
import { EnrollmentStatus } from '../enrollment.entity';

export class CreateEnrollmentDto {
  @IsUUID()
  userId: string;

  @IsUUID()
  courseId: string;

  @IsOptional()
  @IsEnum(EnrollmentStatus)
  status?: EnrollmentStatus;
}
