import { Test, TestingModule } from '@nestjs/testing';
import { SucursalService } from './sucursal.service';

describe('SucursalService', () => {
  let service: SucursalService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [SucursalService],
    }).compile();

    service = module.get<SucursalService>(SucursalService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
