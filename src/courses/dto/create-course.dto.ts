import { IsNotEmpty, IsString, IsInt, Min, IsUUID } from 'class-validator';

export class CreateCourseDto {
  @IsNotEmpty()
  title: string;

  @IsUUID()
  categoryId: string;

  @IsNotEmpty()
  description: string;

  @IsInt()
  @Min(1)
  duration: number; // in minutes

  @IsNotEmpty()
  createdById: string; // link to the User (admin)

  objectives?: string[];
  searchTags?: string[];
  badgeNames?: string[];
  badgeIds?: string[];
}
