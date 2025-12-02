import { Test, TestingModule } from '@nestjs/testing';
import { UnidadesMedidaController } from './unidades-medida.controller';
import { UnidadesMedidaService } from './unidades-medida.service';
import { AuthGuard } from 'src/middlewares/auth.middleware';
import { PermissionsGuard } from 'src/middlewares/permission.middleware';
import { BadRequestException } from '@nestjs/common';
import { CreateUnidadMedidaDto, UpdateUnidadMedidaDto } from './dto/unidad-medida.dto';

describe('UnidadesMedidaController', () => {
  let controller: UnidadesMedidaController;
  let service: UnidadesMedidaService;

  const mockUnidadesMedidaService = {
    getAllUnidades: jest.fn(),
    getUnidadesByEmpresa: jest.fn(),
    findOne: jest.fn(),
    createUnidad: jest.fn(),
    updateUnidad: jest.fn(),
    deleteUnidad: jest.fn(),
    bulkDeleteUnidades: jest.fn(),
    bulkUpdateUnidadStatus: jest.fn(),
  };

  const mockUser = {
    id: 1,
    email: 'test@test.com',
    role: {
      id: 1,
      nombre: 'Admin',
    },
    empresa: {
      id: 1,
      name: 'Test Empresa',
    },
  };

  const mockSuperAdminUser = {
    id: 2,
    email: 'superadmin@test.com',
    role: {
      id: 2,
      nombre: 'SuperAdmin',
    },
    empresa: null,
  };

  const mockUnidadMedida = {
    id: 1,
    nombre: 'Kilogramos',
    abreviatura: 'kg',
    empresa_id: 1,
    estado: true,
    empresa: {
      id: 1,
      name: 'Test Empresa',
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UnidadesMedidaController],
      providers: [
        {
          provide: UnidadesMedidaService,
          useValue: mockUnidadesMedidaService,
        },
      ],
    })
      .overrideGuard(AuthGuard)
      .useValue({ canActivate: jest.fn(() => true) })
      .overrideGuard(PermissionsGuard)
      .useValue({ canActivate: jest.fn(() => true) })
      .compile();

    controller = module.get<UnidadesMedidaController>(UnidadesMedidaController);
    service = module.get<UnidadesMedidaService>(UnidadesMedidaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getAllUnidades', () => {
    it('should return unidades filtered by empresa for regular users', async () => {
      const req = { user: mockUser } as any;
      const unidades = [mockUnidadMedida];
      mockUnidadesMedidaService.getUnidadesByEmpresa.mockResolvedValue(unidades);

      const result = await controller.getAllUnidades(req);

      expect(result).toEqual(unidades);
      expect(mockUnidadesMedidaService.getUnidadesByEmpresa).toHaveBeenCalledWith(mockUser.empresa.id);
    });

    it('should return all unidades for superadmin', async () => {
      const req = { user: mockSuperAdminUser } as any;
      const unidades = [mockUnidadMedida];
      mockUnidadesMedidaService.getAllUnidades.mockResolvedValue(unidades);

      const result = await controller.getAllUnidades(req);

      expect(result).toEqual(unidades);
      expect(mockUnidadesMedidaService.getAllUnidades).toHaveBeenCalled();
    });
  });

  describe('getUnidadById', () => {
    it('should return unidad by id', async () => {
      mockUnidadesMedidaService.findOne.mockResolvedValue(mockUnidadMedida);

      const result = await controller.getUnidadById(1);

      expect(result).toEqual(mockUnidadMedida);
      expect(mockUnidadesMedidaService.findOne).toHaveBeenCalledWith({ where: { id: 1 } });
    });
  });

  describe('getUnidadesByEmpresa', () => {
    it('should return unidades by empresa id', async () => {
      const unidades = [mockUnidadMedida];
      mockUnidadesMedidaService.getUnidadesByEmpresa.mockResolvedValue(unidades);

      const result = await controller.getUnidadesByEmpresa(1);

      expect(result).toEqual(unidades);
      expect(mockUnidadesMedidaService.getUnidadesByEmpresa).toHaveBeenCalledWith(1);
    });
  });

  describe('createUnidad', () => {
    it('should create unidad with user empresa when not provided', async () => {
      const req = { user: mockUser } as any;
      const createDto: CreateUnidadMedidaDto = {
        nombre: 'Litros',
        abreviatura: 'L',
      } as any;

      mockUnidadesMedidaService.createUnidad.mockResolvedValue(mockUnidadMedida);

      const result = await controller.createUnidad(createDto, req);

      expect(result).toEqual(mockUnidadMedida);
      expect(createDto.empresaId).toBe(mockUser.empresa.id);
    });

    it('should create unidad with provided empresaId', async () => {
      const req = { user: mockUser } as any;
      const createDto: CreateUnidadMedidaDto = {
        nombre: 'Litros',
        abreviatura: 'L',
        empresaId: 1,
      } as any;

      mockUnidadesMedidaService.createUnidad.mockResolvedValue(mockUnidadMedida);

      const result = await controller.createUnidad(createDto, req);

      expect(result).toEqual(mockUnidadMedida);
      expect(createDto.empresaId).toBe(1);
    });
  });

  describe('updateUnidad', () => {
    it('should update unidad when user has permission', async () => {
      const req = { user: mockUser } as any;
      const updateDto: UpdateUnidadMedidaDto = {
        nombre: 'Kilogramos Actualizado',
      };

      mockUnidadesMedidaService.findOne.mockResolvedValue(mockUnidadMedida);
      mockUnidadesMedidaService.updateUnidad.mockResolvedValue({
        ...mockUnidadMedida,
        nombre: 'Kilogramos Actualizado',
      });

      const result = await controller.updateUnidad(1, updateDto, req);

      expect(result.nombre).toBe('Kilogramos Actualizado');
      expect(mockUnidadesMedidaService.updateUnidad).toHaveBeenCalledWith(1, updateDto);
    });

    it('should throw BadRequestException when unidad not found', async () => {
      const req = { user: mockUser } as any;
      const updateDto: UpdateUnidadMedidaDto = {};

      mockUnidadesMedidaService.findOne.mockResolvedValue(null);

      await expect(controller.updateUnidad(1, updateDto, req)).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException when user does not own the unidad', async () => {
      const req = { user: mockUser } as any;
      const updateDto: UpdateUnidadMedidaDto = {};
      const unidadOtraEmpresa = { ...mockUnidadMedida, empresa_id: 999 };

      mockUnidadesMedidaService.findOne.mockResolvedValue(unidadOtraEmpresa);

      await expect(controller.updateUnidad(1, updateDto, req)).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException when trying to change empresa', async () => {
      const req = { user: mockUser } as any;
      const updateDto: UpdateUnidadMedidaDto = {
        empresaId: 2,
      };

      mockUnidadesMedidaService.findOne.mockResolvedValue(mockUnidadMedida);

      await expect(controller.updateUnidad(1, updateDto, req)).rejects.toThrow(BadRequestException);
    });
  });

  describe('deleteUnidad', () => {
    it('should delete unidad when user has permission', async () => {
      const req = { user: mockUser } as any;

      mockUnidadesMedidaService.findOne.mockResolvedValue(mockUnidadMedida);
      mockUnidadesMedidaService.deleteUnidad.mockResolvedValue(undefined);

      const result = await controller.deleteUnidad(1, req);

      expect(result).toEqual({ message: 'Unidad eliminada exitosamente' });
      expect(mockUnidadesMedidaService.deleteUnidad).toHaveBeenCalledWith(1);
    });

    it('should throw BadRequestException when user does not own the unidad', async () => {
      const req = { user: mockUser } as any;
      const unidadOtraEmpresa = { ...mockUnidadMedida, empresa_id: 999 };

      mockUnidadesMedidaService.findOne.mockResolvedValue(unidadOtraEmpresa);

      await expect(controller.deleteUnidad(1, req)).rejects.toThrow(BadRequestException);
    });
  });

  describe('bulkDeleteUnidades', () => {
    it('should bulk delete unidades', async () => {
      const req = { user: mockUser } as any;
      const ids = [1, 2, 3];

      mockUnidadesMedidaService.bulkDeleteUnidades.mockResolvedValue(undefined);

      const result = await controller.bulkDeleteUnidades({ ids }, req);

      expect(result).toEqual({ message: '3 unidades eliminadas exitosamente' });
      expect(mockUnidadesMedidaService.bulkDeleteUnidades).toHaveBeenCalledWith(ids, mockUser.empresa.id);
    });

    it('should throw BadRequestException on error', async () => {
      const req = { user: mockUser } as any;
      const ids = [1, 2, 3];

      mockUnidadesMedidaService.bulkDeleteUnidades.mockRejectedValue(new Error('Error deleting'));

      await expect(controller.bulkDeleteUnidades({ ids }, req)).rejects.toThrow(BadRequestException);
    });
  });

  describe('bulkUpdateUnidadStatus', () => {
    it('should bulk update unidad status', async () => {
      const req = { user: mockUser } as any;
      const ids = [1, 2];
      const estado = true;
      const updatedUnidades = [mockUnidadMedida, { ...mockUnidadMedida, id: 2 }];

      mockUnidadesMedidaService.bulkUpdateUnidadStatus.mockResolvedValue(updatedUnidades);

      const result = await controller.bulkUpdateUnidadStatus({ ids, estado }, req);

      expect(result).toEqual({
        message: '2 unidades activadas exitosamente',
        updatedUnidades,
      });
      expect(mockUnidadesMedidaService.bulkUpdateUnidadStatus).toHaveBeenCalledWith(
        ids,
        estado,
        mockUser.empresa.id,
      );
    });

    it('should show correct message when deactivating', async () => {
      const req = { user: mockUser } as any;
      const ids = [1, 2];
      const estado = false;
      const updatedUnidades = [
        { ...mockUnidadMedida, estado: false },
        { ...mockUnidadMedida, id: 2, estado: false },
      ];

      mockUnidadesMedidaService.bulkUpdateUnidadStatus.mockResolvedValue(updatedUnidades);

      const result = await controller.bulkUpdateUnidadStatus({ ids, estado }, req);

      expect(result.message).toBe('2 unidades desactivadas exitosamente');
    });

    it('should throw BadRequestException on error', async () => {
      const req = { user: mockUser } as any;
      const ids = [1, 2];

      mockUnidadesMedidaService.bulkUpdateUnidadStatus.mockRejectedValue(
        new Error('Error updating status'),
      );

      await expect(
        controller.bulkUpdateUnidadStatus({ ids, estado: true }, req),
      ).rejects.toThrow(BadRequestException);
    });
  });
});

