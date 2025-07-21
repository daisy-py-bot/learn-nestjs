import { IsNotEmpty, IsString, IsInt, IsUUID, IsOptional, IsUrl, IsArray } from 'class-validator';

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

  @IsOptional()
  @IsUrl()
  videoUrl?: string;

  @IsOptional()
  @IsArray()
  transcript?: Array<{ timestamp: string; text: string }>;

  @IsOptional()
  @IsArray()
  notes?: Array<{ title: string; content: string }>;

  @IsOptional()
  @IsArray()
  resources?: Array<{ title: string; description: string; url: string; type: string }>;

  @IsInt()
  order: number;

  @IsOptional()
  @IsInt()
  duration?: number;

  @IsOptional()
  @IsString()
  type?: string;
}
