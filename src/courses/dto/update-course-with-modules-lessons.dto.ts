import { CourseLevel } from '../course.entity';
import { LessonType } from 'src/lessons/lesson.entity';

export class UpdateLessonDto {
  id?: string;
  title?: string;
  content?: string;
  mediaUrl?: string;
  videoUrl?: string;
  transcript?: Array<{ timestamp: string; text: string }>;
  notes?: Array<{ title: string; content: string }>;
  resources?: Array<{ title: string; description: string; url: string; type: string }>;
  duration?: number;
  type?: LessonType;
  order?: number;
}

export class UpdateModuleWithLessonsDto {
  id?: string;
  title?: string;
  description?: string;
  order?: number;
  duration?: number;
  lessons?: UpdateLessonDto[];
}

export class UpdateCourseWithModulesLessonsDto {
  title?: string;
  categoryId?: string;
  description?: string;
  duration?: number;
  createdById?: string;
  thumbnailUrl?: string;
  isPublished?: boolean;
  objectives?: string[];
  searchTags?: string[];
  badgeNames?: string[];
  badgeIds?: string[];
  level?: CourseLevel;
  hasCertificate?: boolean;
  modules?: UpdateModuleWithLessonsDto[];
}

