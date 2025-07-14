import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ActivityLog } from './activity-log.entity';
import { CreateActivityLogDto } from './dto/create-activity-log.dto';
import { User } from 'src/users/user.entity';

@Injectable()
export class ActivityLogsService {
  constructor(
    @InjectRepository(ActivityLog)
    private logRepo: Repository<ActivityLog>,

    @InjectRepository(User)
    private userRepo: Repository<User>,
  ) {}

  async create(dto: CreateActivityLogDto) {
    const user = await this.userRepo.findOne({ where: { id: dto.userId } });
    if (!user) throw new NotFoundException('User not found');

    const log = this.logRepo.create({
      user: { id: dto.userId },
      actionType: dto.actionType,
      metadata: dto.metadata || {},
    });

    return this.logRepo.save(log);
  }

  findAllForUser(userId: string) {
    return this.logRepo.find({
      where: { user: { id: userId } },
      order: { createdAt: 'DESC' },
    });
  }

  findAll() {
    return this.logRepo.find({ order: { createdAt: 'DESC' } });
  }
}
