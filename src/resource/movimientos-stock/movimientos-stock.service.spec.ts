import { Test, TestingModule } from '@nestjs/testing';
import { MovimientosStockService } from './movimientos-stock.service';

describe('MovimientosStockService', () => {
  let service: MovimientosStockService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [MovimientosStockService],
    }).compile();

    service = module.get<MovimientosStockService>(MovimientosStockService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
