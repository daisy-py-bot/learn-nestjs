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

export enum CourseCategory {
  CAREER_SKILLS = 'Career Skills',
  MONEY_MATTERS = 'Money Matters',
  CATEGORY_3 = 'Category_3',
  CATEGORY_4 = 'Category_4',
  CATEGORY_5 = 'Category_5',
  ALL = 'All',
  MOST_POPULAR = 'Most Popular',
  COMMUNICATION_SKILLS = 'Communication Skills',
  DIGITAL_TOOLS = 'Digital Tools',
  PERSONAL_GROWTH = 'Personal Growth',
  INTERVIEWS = 'Interviews',
}

export enum CourseLevel {
  BEGINNER = 'beginner',
  INTERMEDIATE = 'intermediate',
  ADVANCED = 'advanced',
}

export class CreateCourseWithModulesLessonsDto {
  title: string;
  category: CourseCategory;
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