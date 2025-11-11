import { Test, TestingModule } from '@nestjs/testing';
import { EmpresaService } from './empresa.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { empresaEntity } from 'src/database/core/empresa.entity';
import { sucursalEntity } from 'src/database/core/sucursal.entity';
import { UserEntity } from 'src/database/core/user.entity';

describe('EmpresaService', () => {
  let service: EmpresaService;
  let empresaRepository: Record<string, jest.Mock>;
  let sucursalRepository: Record<string, jest.Mock>;
  let usuarioRepository: Record<string, jest.Mock>;

  beforeEach(async () => {
    empresaRepository = {
      findOneBy: jest.fn(),
      save: jest.fn(),
      softDelete: jest.fn(),
      find: jest.fn(),
      manager: {
        connection: {
          createQueryRunner: jest.fn().mockReturnValue({
            connect: jest.fn(),
            query: jest.fn(),
            release: jest.fn(),
          }),
        },
      },
    } as any;

    sucursalRepository = {
      find: jest.fn(),
    } as any;

    usuarioRepository = {
      find: jest.fn(),
    } as any;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EmpresaService,
        {
          provide: getRepositoryToken(empresaEntity),
          useValue: empresaRepository,
        },
        {
          provide: getRepositoryToken(sucursalEntity),
          useValue: sucursalRepository,
        },
        {
          provide: getRepositoryToken(UserEntity),
          useValue: usuarioRepository,
        },
      ],
    }).compile();

    service = module.get<EmpresaService>(EmpresaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
