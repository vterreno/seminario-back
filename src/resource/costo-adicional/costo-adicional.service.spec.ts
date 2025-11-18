import { Test, TestingModule } from '@nestjs/testing';
import { CostoAdicionalService } from './costo-adicional.service';

describe('CostoAdicionalService', () => {
  let service: CostoAdicionalService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CostoAdicionalService],
    }).compile();

    service = module.get<CostoAdicionalService>(CostoAdicionalService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
