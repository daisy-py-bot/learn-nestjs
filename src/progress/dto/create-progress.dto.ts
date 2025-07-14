import { IsUUID, IsOptional, IsBoolean } from 'class-validator';

export class CreateProgressDto {
  @IsUUID()
  userId: string;

  @IsUUID()
  lessonId: string;

  @IsOptional()
  @IsBoolean()
  isCompleted?: boolean;
}
