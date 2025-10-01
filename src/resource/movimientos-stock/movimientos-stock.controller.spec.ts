import { Test, TestingModule } from '@nestjs/testing';
import { MovimientosStockController } from './movimientos-stock.controller';
import { MovimientosStockService } from './movimientos-stock.service';

describe('MovimientosStockController', () => {
  let controller: MovimientosStockController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [MovimientosStockController],
      providers: [MovimientosStockService],
    }).compile();

    controller = module.get<MovimientosStockController>(MovimientosStockController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
