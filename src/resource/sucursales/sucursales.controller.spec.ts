import { Test, TestingModule } from '@nestjs/testing';
import { SucursalesController } from './sucursales.controller';
import { SucursalesService } from './sucursales.service';
import { EmpresaService } from '../empresa/empresa.service';
import { AuthGuard } from 'src/middlewares/auth.middleware';
import { PermissionsGuard } from 'src/middlewares/permission.middleware';
import { Reflector } from '@nestjs/core';

describe('SucursalesController', () => {
  let controller: SucursalesController;
  const mockSucursalesService = {
    find: jest.fn(),
    findByEmpresa: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn(),
    replace: jest.fn(),
    updatePartial: jest.fn(),
    delete: jest.fn(),
    updateSucursalesStatus: jest.fn(),
    deleteSucursales: jest.fn(),
  };

  const mockEmpresaService = {
    find: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [SucursalesController],
      providers: [
        {
          provide: SucursalesService,
          useValue: mockSucursalesService,
        },
        {
          provide: EmpresaService,
          useValue: mockEmpresaService,
        },
        Reflector,
      ],
    })
      .overrideGuard(AuthGuard)
      .useValue({ canActivate: jest.fn().mockReturnValue(true) })
      .overrideGuard(PermissionsGuard)
      .useValue({ canActivate: jest.fn().mockReturnValue(true) })
      .compile();

    controller = module.get<SucursalesController>(SucursalesController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
