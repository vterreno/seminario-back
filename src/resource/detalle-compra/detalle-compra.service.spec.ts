import { Test, TestingModule } from '@nestjs/testing';
import { DetalleCompraService } from './detalle-compra.service';

describe('DetalleCompraService', () => {
  let service: DetalleCompraService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [DetalleCompraService],
    }).compile();

    service = module.get<DetalleCompraService>(DetalleCompraService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
