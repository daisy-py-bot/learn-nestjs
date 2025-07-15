import { IsNotEmpty, IsString, IsInt, IsUUID, IsOptional, IsUrl } from 'class-validator';

export class CreateLessonDto {
  @IsUUID()
  moduleId: string;

  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  content: string;

  @IsOptional()
  @IsUrl()
  mediaUrl?: string;

  @IsInt()
  order: number;

  @IsOptional()
  @IsString()
  resources?: string;

  @IsOptional()
  @IsString()
  notes?: string;
}
