import { IsUUID, IsString, IsOptional, IsUrl } from 'class-validator';

export class CreateCertificateDto {
  @IsUUID()
  userId: string;

  @IsUUID()
  courseId: string;

  @IsOptional()
  @IsUrl()
  certificateUrl?: string;
}
