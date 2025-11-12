import { Test, TestingModule } from '@nestjs/testing';
import { DetalleCompraController } from './detalle-compra.controller';
import { DetalleCompraService } from './detalle-compra.service';

describe('DetalleCompraController', () => {
  let controller: DetalleCompraController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [DetalleCompraController],
      providers: [DetalleCompraService],
    }).compile();

    controller = module.get<DetalleCompraController>(DetalleCompraController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
