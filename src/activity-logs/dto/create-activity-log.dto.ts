import { IsEnum, IsOptional, IsUUID, IsObject } from 'class-validator';
import { ActionType } from '../activity-log.entity';

export class CreateActivityLogDto {
  @IsUUID()
  userId: string;

  @IsEnum(ActionType)
  actionType: ActionType;

  @IsOptional()
  @IsObject()
  metadata?: Record<string, any>;
}
