import { IsString, IsOptional, IsUrl } from 'class-validator';

export class CreateBadgeDto {
  @IsString()
  name: string;

  @IsString()
  description: string;

  @IsOptional()
  @IsUrl()
  iconUrl?: string;
}
