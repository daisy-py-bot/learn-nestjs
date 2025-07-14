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

  @Get(':userId')
  findAllForUser(@Param('userId') userId: string) {
    return this.certService.findAllForUser(userId);
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