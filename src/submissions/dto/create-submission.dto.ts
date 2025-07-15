import { IsUUID, IsOptional, IsArray,ValidateNested, IsString, } from 'class-validator';
import { Type } from 'class-transformer';

class ResponseItem {
  @IsString()
  questionId: string;

  answerText: string;
}

export class CreateSubmissionDto {
  @IsUUID()
  userId: string;

  @IsUUID()
  @IsOptional()
  quizId?: string;

  @IsUUID()
  @IsOptional()
  assessmentId?: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ResponseItem)
  responses: ResponseItem[];
}
