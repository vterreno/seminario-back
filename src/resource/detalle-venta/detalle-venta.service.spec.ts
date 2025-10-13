import { Test, TestingModule } from '@nestjs/testing';
import { DetalleVentaService } from './detalle-venta.service';

describe('DetalleVentaService', () => {
  let service: DetalleVentaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [DetalleVentaService],
    }).compile();

    service = module.get<DetalleVentaService>(DetalleVentaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
