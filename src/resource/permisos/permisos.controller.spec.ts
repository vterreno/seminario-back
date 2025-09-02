import { Test, TestingModule } from '@nestjs/testing';
import { PermisosController } from './permisos.controller';

describe('PermisosController', () => {
  let controller: PermisosController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PermisosController],
    }).compile();

    controller = module.get<PermisosController>(PermisosController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
