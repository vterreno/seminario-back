import { Test, TestingModule } from '@nestjs/testing';
import { SucursalesService } from './sucursales.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { sucursalEntity } from 'src/database/core/sucursal.entity';

describe('SucursalesService', () => {
  let service: SucursalesService;
  let sucursalesRepository: Record<string, jest.Mock>;

  beforeEach(async () => {
    sucursalesRepository = {
      find: jest.fn(),
      findOneBy: jest.fn(),
      findByIds: jest.fn(),
      softDelete: jest.fn(),
      update: jest.fn(),
    } as any;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SucursalesService,
        {
          provide: getRepositoryToken(sucursalEntity),
          useValue: sucursalesRepository,
        },
      ],
    }).compile();

    service = module.get<SucursalesService>(SucursalesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
