import { Controller, Post, Get, Body, Param } from '@nestjs/common';
import { BadgesService } from './badges.service';
import { CreateBadgeDto } from './dto/create-badge.dto';
import { AwardRevokeBadgeDto } from './dto/award-revoke-badge.dto';

@Controller('badges')
export class BadgesController {
  constructor(private readonly badgesService: BadgesService) {}

  @Post()
  create(@Body() dto: CreateBadgeDto) {
    return this.badgesService.createBadge(dto.name, dto.description, dto.iconUrl);
  }

  @Get()
  findAll() {
    return this.badgesService.findAllBadges();
  }

  @Get('user/:userId')
  getUserBadges(@Param('userId') userId: string) {
    return this.badgesService.getUserBadges(userId);
  }

  @Post('award')
  awardBadge(@Body() dto: AwardRevokeBadgeDto) {
    return this.badgesService.awardBadge(dto.userId, dto.badgeId);
  }

  @Post('revoke')
  revokeBadge(@Body() dto: AwardRevokeBadgeDto) {
    return this.badgesService.revokeBadge(dto.userId, dto.badgeId);
  }
}
