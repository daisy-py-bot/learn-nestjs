import { IsUUID } from 'class-validator';

export class AwardRevokeBadgeDto {
  @IsUUID()
  userId: string;

  @IsUUID()
  badgeId: string;
}
