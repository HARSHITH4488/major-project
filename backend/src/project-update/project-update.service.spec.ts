import { Test, TestingModule } from '@nestjs/testing';
import { ProjectUpdateService } from './project-update.service';

describe('ProjectUpdateService', () => {
  let service: ProjectUpdateService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ProjectUpdateService],
    }).compile();

    service = module.get<ProjectUpdateService>(ProjectUpdateService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
