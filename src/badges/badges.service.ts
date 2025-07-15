import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Badge } from './badge.entity';
import { User } from '../users/user.entity';


@Injectable()
export class BadgesService {
  constructor(
    @InjectRepository(Badge)
    private badgeRepo: Repository<Badge>,

    @InjectRepository(User)
    private userRepo: Repository<User>,
  ) {}

  async createBadge(name: string, description: string, iconUrl?: string) {
    const badge = this.badgeRepo.create({ name, description, iconUrl });
    return this.badgeRepo.save(badge);
  }

  async findAllBadges() {
    return this.badgeRepo.find();
  }

  async getUserBadges(userId: string) {
    const user = await this.userRepo.findOne({ where: { id: userId }, relations: ['badges'] });
    if (!user) throw new NotFoundException('User not found');
    return user.badges;
  }

  async awardBadge(userId: string, badgeId: string) {
    const user = await this.userRepo.findOne({ where: { id: userId }, relations: ['badges'] });
    const badge = await this.badgeRepo.findOne({ where: { id: badgeId } });

    if (!user || !badge) throw new NotFoundException('User or badge not found');

    const alreadyAwarded = user.badges.some((b) => b.id === badge.id);
    if (alreadyAwarded) return user;

    user.badges.push(badge);
    return this.userRepo.save(user);
  }

  async revokeBadge(userId: string, badgeId: string) {
    const user = await this.userRepo.findOne({ where: { id: userId }, relations: ['badges'] });
    if (!user) throw new NotFoundException('User not found');

    user.badges = user.badges.filter((badge) => badge.id !== badgeId);
    return this.userRepo.save(user);
  }

  async getBadgeByName(name: string) {
    return this.badgeRepo.findOne({ where: { name } });
  }


}
