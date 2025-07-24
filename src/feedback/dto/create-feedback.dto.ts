import { IsInt, IsString, IsBoolean, IsOptional, IsUUID, Min, Max } from 'class-validator';

export class CreateFeedbackDto {
  @IsUUID()
  userId: string;

  @IsUUID()
  courseId: string;

  @IsInt()
  @Min(1)
  @Max(5)
  rating: number;

  @IsOptional()
  @IsString()
  comment?: string;

  @IsOptional()
  @IsString()
  testimonial?: string;

  @IsOptional()
  @IsBoolean()
  publicOk?: boolean;

  @IsOptional()
  fullResponse?: any;
}
