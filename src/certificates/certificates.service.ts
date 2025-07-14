import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Certificate } from './certificate.entity';
import { Repository } from 'typeorm';
import { CreateCertificateDto } from './dto/create-certificate.dto';
import { UpdateCertificateDto } from './dto/update-certificate.dto';
import { User } from 'src/users/user.entity';
import { Course } from 'src/courses/course.entity';

@Injectable()
export class CertificatesService {
  constructor(
    @InjectRepository(Certificate)
    private certRepo: Repository<Certificate>,

    @InjectRepository(User)
    private userRepo: Repository<User>,

    @InjectRepository(Course)
    private courseRepo: Repository<Course>,
  ) {}

  async issueCertificate(dto: CreateCertificateDto) {
    const user = await this.userRepo.findOne({ where: { id: dto.userId } });
    const course = await this.courseRepo.findOne({ where: { id: dto.courseId } });

    if (!user || !course) {
      throw new NotFoundException('User or Course not found');
    }

    const cert = this.certRepo.create({
      user: { id: dto.userId },
      course: { id: dto.courseId },
      certificateUrl: dto.certificateUrl ?? '', // Add URL generation logic here later if needed
    });

    return this.certRepo.save(cert);
  }

  findAllForUser(userId: string) {
    return this.certRepo.find({
      where: { user: { id: userId } },
    });
  }

  async remove(id: string) {
    const cert = await this.certRepo.findOne({ where: { id } });
    if (!cert) throw new NotFoundException('Certificate not found');
    return this.certRepo.remove(cert);
  }
}
