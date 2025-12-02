import { Test, TestingModule } from '@nestjs/testing';
import { CostoAdicionalService } from './costo-adicional.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { CostoAdicionalEntity } from 'src/database/core/costo-adicionales.entity';

describe('CostoAdicionalService', () => {
  let service: CostoAdicionalService;

  const mockRepository = {
    find: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    createQueryBuilder: jest.fn(() => ({
      delete: jest.fn().mockReturnThis(),
      where: jest.fn().mockReturnThis(),
      execute: jest.fn(),
    })),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CostoAdicionalService,
        {
          provide: getRepositoryToken(CostoAdicionalEntity),
          useValue: mockRepository,
        },
      ],
    }).compile();

    service = module.get<CostoAdicionalService>(CostoAdicionalService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
