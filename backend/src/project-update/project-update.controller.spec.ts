import { Test, TestingModule } from '@nestjs/testing';
import { ProjectUpdateController } from './project-update.controller';

describe('ProjectUpdateController', () => {
  let controller: ProjectUpdateController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ProjectUpdateController],
    }).compile();

    controller = module.get<ProjectUpdateController>(ProjectUpdateController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
