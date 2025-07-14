import { IsNotEmpty, IsString, IsInt, IsUUID } from 'class-validator';

export class CreateModuleDto {
  @IsUUID()
  courseId: string;

  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  description: string;

  @IsInt()
  order: number;
}
