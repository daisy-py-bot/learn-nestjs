import { IsNotEmpty, IsEnum, IsInt, Min } from 'class-validator';
import { CourseCategory } from '../course.entity';

export class CreateCourseDto {
  @IsNotEmpty()
  title: string;

  @IsEnum(CourseCategory)
  category: CourseCategory;

  @IsNotEmpty()
  description: string;

  @IsInt()
  @Min(1)
  duration: number; // in minutes

  @IsNotEmpty()
  createdById: string; // link to the User (admin)
}
