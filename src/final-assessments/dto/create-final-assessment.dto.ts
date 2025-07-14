import { IsUUID, IsString, IsArray, IsInt, IsNotEmpty } from 'class-validator';

export class CreateFinalAssessmentDto {
  @IsUUID()
  courseId: string;

  @IsString()
  @IsNotEmpty()
  title: string;

  @IsArray()
  questions: any[];

  @IsInt()
  passingScore: number;
}
