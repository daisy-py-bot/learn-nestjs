import { IsString, IsOptional, IsNumber, IsArray, IsUUID, IsEnum, IsBoolean } from 'class-validator';

export enum LessonType {
  VIDEO = 'video',
  READING = 'reading',
  QUIZ = 'quiz',
  PDF = 'pdf',
  DOC = 'doc',
  IMAGE = 'image',
  OTHER = 'other',
}

export class CreateLessonDto {
  @IsString()
  title: string;
  
  @IsString()
  content: string;
  
  @IsOptional()
  @IsString()
  mediaUrl?: string;
  
  @IsOptional()
  @IsArray()
  transcript?: Array<{ timestamp: string; text: string }>;
  
  @IsOptional()
  @IsArray()
  notes?: Array<{ title: string; content: string }>;
  
  @IsOptional()
  @IsArray()
  resources?: Array<{ title: string; description: string; url: string; type: string }>;
  
  @IsOptional()
  @IsNumber()
  duration?: number;
  
  @IsOptional()
  @IsEnum(LessonType)
  type?: LessonType;
  
  @IsNumber()
  order: number;
}

export class CreateModuleWithLessonsDto {
  @IsString()
  title: string;
  
  @IsString()
  description: string;
  
  @IsNumber()
  order: number;
  
  @IsOptional()
  @IsNumber()
  duration?: number;
  
  @IsArray()
  lessons: CreateLessonDto[];
}

export enum CourseLevel {
  BEGINNER = 'beginner',
  INTERMEDIATE = 'intermediate',
  ADVANCED = 'advanced',
}

export class CreateCourseWithModulesLessonsDto {
  @IsString()
  title: string;
  
  @IsOptional()
  @IsUUID()
  categoryId?: string;
  
  @IsString()
  description: string;
  
  @IsNumber()
  duration: number;
  
  @IsOptional()
  @IsUUID()
  createdById?: string;
  
  @IsOptional()
  @IsString()
  thumbnailUrl?: string;
  
  @IsOptional()
  @IsBoolean()
  isPublished?: boolean;
  
  @IsOptional()
  @IsArray()
  objectives?: string[];
  
  @IsOptional()
  @IsArray()
  searchTags?: string[];
  
  @IsOptional()
  @IsArray()
  badgeNames?: string[];
  
  @IsOptional()
  @IsArray()
  badgeIds?: string[];
  
  @IsOptional()
  @IsEnum(CourseLevel)
  level?: CourseLevel;
  
  @IsOptional()
  @IsBoolean()
  hasCertificate?: boolean;
  
  @IsArray()
  modules: CreateModuleWithLessonsDto[];
} 