import { Test, TestingModule } from '@nestjs/testing';
import { ListaPreciosController } from './lista-precios.controller';
import { ListaPreciosService } from './lista-precios.service';
import { AuthGuard } from 'src/middlewares/auth.middleware';
import { PermissionsGuard } from 'src/middlewares/permission.middleware';
import { BadRequestException } from '@nestjs/common';

describe('ListaPreciosController', () => {
  let controller: ListaPreciosController;
  let service: ListaPreciosService;

  const mockListaPreciosService = {
    getAllListaPrecios: jest.fn(),
    getListaPreciosByEmpresa: jest.fn(),
    findOne: jest.fn(),
    createListaPrecio: jest.fn(),
    updateListaPrecio: jest.fn(),
    deleteListaPrecio: jest.fn(),
    bulkDeleteListaPrecios: jest.fn(),
  };

  const mockUser = {
    id: 1,
    email: 'test@test.com',
    role: { nombre: 'Admin' },
    empresa: { id: 1 },
  };

  const mockSuperAdminUser = {
    id: 2,
    email: 'superadmin@test.com',
    role: { nombre: 'SuperAdmin' },
    empresa: null,
  };

  const mockListaPrecio = {
    id: 1,
    nombre: 'Lista Test',
    descripcion: 'Test',
    empresa: { id: 1 },
    estado: true,
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ListaPreciosController],
      providers: [
        {
          provide: ListaPreciosService,
          useValue: mockListaPreciosService,
        },
      ],
    })
      .overrideGuard(AuthGuard)
      .useValue({ canActivate: jest.fn(() => true) })
      .overrideGuard(PermissionsGuard)
      .useValue({ canActivate: jest.fn(() => true) })
      .compile();

    controller = module.get<ListaPreciosController>(ListaPreciosController);
    service = module.get<ListaPreciosService>(ListaPreciosService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getAllListaPrecios', () => {
    it('should return all lista precios for superadmin', async () => {
      const req = { user: mockSuperAdminUser } as any;
      const listas = [mockListaPrecio];
      mockListaPreciosService.getAllListaPrecios.mockResolvedValue(listas);

      const result = await controller.getAllListaPrecios(req);

      expect(result).toEqual(listas);
      expect(mockListaPreciosService.getAllListaPrecios).toHaveBeenCalled();
    });

    it('should return lista precios filtered by empresa for regular users', async () => {
      const req = { user: mockUser } as any;
      const listas = [mockListaPrecio];
      mockListaPreciosService.getListaPreciosByEmpresa.mockResolvedValue(listas);

      const result = await controller.getAllListaPrecios(req);

      expect(result).toEqual(listas);
      expect(mockListaPreciosService.getListaPreciosByEmpresa).toHaveBeenCalledWith(1);
    });
  });

  describe('createListaPrecio', () => {
    it('should create lista precio', async () => {
      const req = { user: mockUser } as any;
      const createDto = {
        nombre: 'Nueva Lista',
        descripcion: 'Test',
        empresa_id: 1,
        productos: [],
      } as any;

      mockListaPreciosService.createListaPrecio.mockResolvedValue(mockListaPrecio);

      const result = await controller.createListaPrecio(createDto, req);

      expect(result).toEqual(mockListaPrecio);
    });
  });

  describe('updateListaPrecio', () => {
    it('should update lista precio', async () => {
      const req = { user: mockUser } as any;
      const updateDto = { nombre: 'Updated' } as any;
      const updatedLista = { ...mockListaPrecio, nombre: 'Updated' };

      mockListaPreciosService.updateListaPrecio.mockResolvedValue(updatedLista);

      const result = await controller.updateListaPrecio(1, updateDto, req);

      expect(result).toEqual(updatedLista);
    });
  });

  describe('deleteListaPrecio', () => {
    it('should delete lista precio', async () => {
      const req = { user: mockUser } as any;
      mockListaPreciosService.deleteListaPrecio.mockResolvedValue(undefined);

      const result = await controller.deleteListaPrecio(1, req);

      expect(result).toEqual({ message: 'Lista de precios eliminada exitosamente' });
    });
  });

  describe('bulkDeleteListaPrecios', () => {
    it('should bulk delete lista precios', async () => {
      const req = { user: mockUser } as any;
      const ids = [1, 2, 3];
      mockListaPreciosService.bulkDeleteListaPrecios.mockResolvedValue(undefined);

      const result = await controller.bulkDeleteListaPrecios({ ids }, req);

      expect(result).toEqual({ message: '3 listas de precios eliminadas exitosamente' });
    });

    it('should throw BadRequestException on error', async () => {
      const req = { user: mockUser } as any;
      const ids = [1, 2, 3];
      mockListaPreciosService.bulkDeleteListaPrecios.mockRejectedValue(new Error('Error'));

      await expect(controller.bulkDeleteListaPrecios({ ids }, req)).rejects.toThrow(BadRequestException);
    });
  });
});
