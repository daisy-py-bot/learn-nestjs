import { IsUUID, IsString, IsInt, IsArray, IsNotEmpty, IsOptional } from 'class-validator';

export class CreateQuizDto {
  @IsUUID()
  moduleId: string;

  @IsString()
  @IsNotEmpty()
  title: string;

  @IsInt()
  @IsOptional()
  unlockAfter: number;

  @IsArray()
  questions: any[];
}
