import { Test, TestingModule } from '@nestjs/testing';
import { DetalleVentaController } from './detalle-venta.controller';
import { DetalleVentaService } from './detalle-venta.service';

describe('DetalleVentaController', () => {
  let controller: DetalleVentaController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [DetalleVentaController],
      providers: [DetalleVentaService],
    }).compile();

    controller = module.get<DetalleVentaController>(DetalleVentaController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
