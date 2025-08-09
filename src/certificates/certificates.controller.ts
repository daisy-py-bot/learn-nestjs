import { Controller, Post, Body, Get, Param, Delete } from '@nestjs/common';
import { CertificatesService } from './certificates.service';
import { CreateCertificateDto } from './dto/create-certificate.dto';

@Controller('certificates')
export class CertificatesController {
  constructor(private readonly certService: CertificatesService) {}

  @Post()
  issue(@Body() dto: CreateCertificateDto) {
    return this.certService.issueCertificate(dto);
  }

  @Post('generate')
  async generateCertificate(@Body() dto: { userId: string; courseId: string }) {
    // Generate a dummy certificate URL
    const certificateUrl = `https://www.canva.com/design/DAGvTqXV_Z0/4Z3tPZLjbjbw37-7K5havg/view?utm_content=DAGvTqXV_Z0&utm_campaign=designshare&utm_medium=link2&utm_source=uniquelinks&utlId=hccc30a23ea/${dto.userId}-${dto.courseId}`;
    const cert = await this.certService.issueCertificate({
      userId: dto.userId,
      courseId: dto.courseId,
      certificateUrl,
    });
    return cert;
  }

  @Get(':userId')
  findAllForUser(@Param('userId') userId: string) {
    return this.certService.findAllForUser(userId);
  }

  @Get('by-user-course/:userId/:courseId')
  async findByUserAndCourse(@Param('userId') userId: string, @Param('courseId') courseId: string) {
    const cert = await this.certService.findByUserAndCourse(userId, courseId);
    const { user } = cert;
    return {
      certificateUrl: cert.certificateUrl,
      user: {
        id: user.id,
        firstname: user.firstname,
        lastname: user.lastname,
        email: user.email,
        avatarUrl: user.avatarUrl,
        bio: user.bio,
        tagline: user.tagline,
        status: user.status,
        createdAt: user.createdAt,
        lastlogin: user.lastlogin,
      }
    };
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.certService.remove(id);
  }
}

/**
 * {
  "userId": "USER_UUID_HERE",
  "courseId": "COURSE_UUID_HERE",
  "certificateUrl": "https://example.com/certificates/12345.pdf"
}

 */