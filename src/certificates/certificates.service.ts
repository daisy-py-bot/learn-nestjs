import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Certificate } from './certificate.entity';
import { Repository } from 'typeorm';
import { CreateCertificateDto } from './dto/create-certificate.dto';
import { UpdateCertificateDto } from './dto/update-certificate.dto';
import { User } from 'src/users/user.entity';
import { Course } from 'src/courses/course.entity';
import { EnrollmentsService } from 'src/enrollments/enrollments.service';
import { EnrollmentStatus } from 'src/enrollments/enrollment.entity';
import { ActivityLogsService } from '../activity-logs/activity-logs.service';
import { ActionType } from '../activity-logs/activity-log.entity';

@Injectable()
export class CertificatesService {
  constructor(
    @InjectRepository(Certificate)
    private certRepo: Repository<Certificate>,

    @InjectRepository(User)
    private userRepo: Repository<User>,

    @InjectRepository(Course)
    private courseRepo: Repository<Course>,

    private enrollmentsService: EnrollmentsService,
    private activityLogsService: ActivityLogsService,
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
      certificateUrl: dto.certificateUrl ?? '',
    });

    const saved = await this.certRepo.save(cert);
    // Update enrollment to set certificateIssued to true
    const enrollments = await this.enrollmentsService.findByUser(dto.userId);
    const enrollment = enrollments.find(e => e.course.id === dto.courseId);
    if (enrollment && !enrollment.certificateIssued) {
      await this.enrollmentsService.update(enrollment.id, { certificateIssued: true });
    }
    // Fetch with relations to include full user and course info
    const fullCert = await this.certRepo.findOne({
      where: { id: saved.id },
      relations: ['user', 'course'],
    });

    // Log certificate issuance
    await this.activityLogsService.create({
      userId: user.id,
      actionType: ActionType.GOTTEN_CERTIFICATE,
      metadata: { courseId: course.id, certificateId: saved.id },
    });

    return fullCert;
  }

  findAllForUser(userId: string) {
    return this.certRepo.find({
      where: { user: { id: userId } },
    });
  }

  findAll() {
    return this.certRepo.find();
  }

  async findByUserAndCourse(userId: string, courseId: string) {
    // Optionally, check if the course has a certificate enabled
    const course = await this.courseRepo.findOne({ where: { id: courseId } });
    if (!course) throw new NotFoundException('Course not found');
    if (!course.hasCertificate) throw new NotFoundException('This course does not issue certificates');
    const cert = await this.certRepo.findOne({
      where: { user: { id: userId }, course: { id: courseId } },
    });
    if (!cert) throw new NotFoundException('Certificate not found');
    return cert;
  }

  async remove(id: string) {
    const cert = await this.certRepo.findOne({ where: { id } });
    if (!cert) throw new NotFoundException('Certificate not found');
    return this.certRepo.remove(cert);
  }
}
