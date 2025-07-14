import { PartialType } from '@nestjs/mapped-types';
import { CreateFinalAssessmentDto } from './create-final-assessment.dto';

export class UpdateFinalAssessmentDto extends PartialType(CreateFinalAssessmentDto) {}
