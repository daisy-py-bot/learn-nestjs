import {
  IsUUID,
  IsString,
  IsInt,
  IsArray,
  IsNotEmpty,
  IsOptional,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

export class QuizQuestionDto {
  @IsString()
  id: string;

  @IsString()
  @IsNotEmpty()
  prompt: string;

  @IsString()
  @IsNotEmpty()
  sampleAnswer: string;
}

export class CreateQuizDto {
  @IsUUID()
  moduleId: string;

  @IsString()
  @IsNotEmpty()
  title: string;

  @IsInt()
  @IsOptional()
  unlockAfter?: number;

  @IsInt()
  @IsOptional()
  duration?: number;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => QuizQuestionDto)
  questions: QuizQuestionDto[];
}
