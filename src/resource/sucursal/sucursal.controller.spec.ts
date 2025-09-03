import { Test, TestingModule } from '@nestjs/testing';
import { SucursalController } from './sucursal.controller';
import { SucursalService } from './sucursal.service';

describe('SucursalController', () => {
  let controller: SucursalController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SucursalController],
      providers: [SucursalService],
    }).compile();

    controller = module.get<SucursalController>(SucursalController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
