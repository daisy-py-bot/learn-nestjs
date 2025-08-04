export enum LessonType {
  VIDEO = 'video',
  READING = 'reading',
  QUIZ = 'quiz',
  PDF = 'pdf',
  DOC = 'doc',
  IMAGE = 'image',
}

export class CreateLessonDto {
  title: string;
  content: string;
  mediaUrl?: string;
//   videoUrl?: string;
  transcript?: Array<{ timestamp: string; text: string }>;
  notes?: Array<{ title: string; content: string }>;
  resources?: Array<{ title: string; description: string; url: string; type: string }>;
  duration?: number;
  type?: LessonType;
  order: number;
}

export class CreateModuleWithLessonsDto {
  title: string;
  description: string;
  order: number;
  duration?: number;
  lessons: CreateLessonDto[];
}

export enum CourseLevel {
  BEGINNER = 'beginner',
  INTERMEDIATE = 'intermediate',
  ADVANCED = 'advanced',
}

export class CreateCourseWithModulesLessonsDto {
  title: string;
  categoryId?: string;
  description: string;
  duration: number;
  createdById?: string;
  thumbnailUrl?: string;
  isPublished?: boolean;
//   prerequisitesId?: string;
  objectives?: string[];
  searchTags?: string[];
  badgeNames?: string[];
  badgeIds?: string[];
  level?: CourseLevel;
  hasCertificate?: boolean;
  modules: CreateModuleWithLessonsDto[];
} 