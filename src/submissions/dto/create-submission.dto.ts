import { IsUUID, IsOptional, IsNumber, IsNotEmpty } from 'class-validator';

export class CreateSubmissionDto {
  @IsUUID()
  userId: string;

  @IsUUID()
  @IsOptional()
  quizId?: string;

  @IsUUID()
  @IsOptional()
  assessmentId?: string;

  @IsNumber()
  score: number;

  @IsNotEmpty()
  response: any;
}
