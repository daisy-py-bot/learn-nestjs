import { Test, TestingModule } from '@nestjs/testing';
import { FinalAssessmentsController } from './final-assessments.controller';

describe('FinalAssessmentsController', () => {
  let controller: FinalAssessmentsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [FinalAssessmentsController],
    }).compile();

    controller = module.get<FinalAssessmentsController>(FinalAssessmentsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
