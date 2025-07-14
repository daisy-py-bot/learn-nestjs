import { Test, TestingModule } from '@nestjs/testing';
import { FinalAssessmentsService } from './final-assessments.service';

describe('FinalAssessmentsService', () => {
  let service: FinalAssessmentsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [FinalAssessmentsService],
    }).compile();

    service = module.get<FinalAssessmentsService>(FinalAssessmentsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
