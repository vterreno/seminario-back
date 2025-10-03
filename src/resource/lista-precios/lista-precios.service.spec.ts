import { Test, TestingModule } from '@nestjs/testing';
import { ListaPreciosService } from './lista-precios.service';

describe('ListaPreciosService', () => {
  let service: ListaPreciosService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ListaPreciosService],
    }).compile();

    service = module.get<ListaPreciosService>(ListaPreciosService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
