import { Test, TestingModule } from '@nestjs/testing';
import { PermisosService } from './permisos.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { PermissionEntity } from 'src/database/core/permission.entity';

describe('PermisosService', () => {
  let service: PermisosService;
  let permisoRepository: Record<string, jest.Mock>;

  beforeEach(async () => {
    permisoRepository = {
      find: jest.fn(),
      findOne: jest.fn(),
      save: jest.fn(),
    } as any;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PermisosService,
        {
          provide: getRepositoryToken(PermissionEntity),
          useValue: permisoRepository,
        },
      ],
    }).compile();

    service = module.get<PermisosService>(PermisosService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
