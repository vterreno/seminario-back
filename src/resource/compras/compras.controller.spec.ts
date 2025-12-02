import { Test, TestingModule } from '@nestjs/testing';
import { ComprasController } from './compras.controller';
import { ComprasService } from './compras.service';
import { AuthGuard } from 'src/middlewares/auth.middleware';
import { PermissionsGuard } from 'src/middlewares/permission.middleware';
import { BadRequestException } from '@nestjs/common';
import { CreateCompraDto } from './dto/create-compra.dto';
import { UpdateCompraDto } from './dto/update-compra.dto';
import { EstadoCompra } from 'src/database/core/enums/EstadoCompra.enum';

describe('ComprasController', () => {
  let controller: ComprasController;
  let service: ComprasService;

  const mockComprasService = {
    getAllCompras: jest.fn(),
    getComprasByEmpresa: jest.fn(),
    findById: jest.fn(),
    findByIdWithEmpresa: jest.fn(),
    findByIdWithSucursalEmpresa: jest.fn(),
    createCompra: jest.fn(),
    updateCompra: jest.fn(),
    deleteCompra: jest.fn(),
    bulkDeleteCompras: jest.fn(),
    asociarPagoACompra: jest.fn(),
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

  const mockCompra = {
    id: 1,
    numero_compra: 1,
    fecha_compra: new Date(),
    monto_total: 1000,
    sucursal: { id: 1, empresa: { id: 1 } },
    contacto: null,
    estado: EstadoCompra.PENDIENTE_PAGO,
    detalles: [],
    pago: null,
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ComprasController],
      providers: [
        {
          provide: ComprasService,
          useValue: mockComprasService,
        },
      ],
    })
      .overrideGuard(AuthGuard)
      .useValue({ canActivate: jest.fn(() => true) })
      .overrideGuard(PermissionsGuard)
      .useValue({ canActivate: jest.fn(() => true) })
      .compile();

    controller = module.get<ComprasController>(ComprasController);
    service = module.get<ComprasService>(ComprasService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getAllCompras', () => {
    it('should return all compras for superadmin', async () => {
      const req = { user: mockSuperAdminUser } as any;
      const compras = [mockCompra];
      mockComprasService.getAllCompras.mockResolvedValue(compras);

      const result = await controller.getAllCompras(req);

      expect(result).toEqual(compras);
      expect(mockComprasService.getAllCompras).toHaveBeenCalled();
    });

    it('should return compras filtered by empresa for regular users', async () => {
      const req = { user: mockUser } as any;
      const compras = [mockCompra];
      mockComprasService.getComprasByEmpresa.mockResolvedValue(compras);

      const result = await controller.getAllCompras(req);

      expect(result).toEqual(compras);
      expect(mockComprasService.getComprasByEmpresa).toHaveBeenCalledWith(mockUser.empresa.id);
    });

    it('should return empty array when user has no empresa', async () => {
      const req = { user: { ...mockUser, empresa: null } } as any;

      const result = await controller.getAllCompras(req);

      expect(result).toEqual([]);
    });
  });

  describe('getComprasByEmpresa', () => {
    it('should allow superadmin to get compras from any empresa', async () => {
      const req = { user: mockSuperAdminUser } as any;
      const compras = [mockCompra];
      mockComprasService.getComprasByEmpresa.mockResolvedValue(compras);

      const result = await controller.getComprasByEmpresa('1', req);

      expect(result).toEqual(compras);
      expect(mockComprasService.getComprasByEmpresa).toHaveBeenCalledWith(1);
    });

    it('should allow users to get compras from their own empresa', async () => {
      const req = { user: mockUser } as any;
      const compras = [mockCompra];
      mockComprasService.getComprasByEmpresa.mockResolvedValue(compras);

      const result = await controller.getComprasByEmpresa('1', req);

      expect(result).toEqual(compras);
      expect(mockComprasService.getComprasByEmpresa).toHaveBeenCalledWith(1);
    });

    it('should throw BadRequestException when user tries to access another empresa', async () => {
      const req = { user: mockUser } as any;

      await expect(controller.getComprasByEmpresa('999', req)).rejects.toThrow(BadRequestException);
    });
  });

  describe('getCompraById', () => {
    it('should return compra by id', async () => {
      mockComprasService.findById.mockResolvedValue(mockCompra);

      const result = await controller.getCompraById('1');

      expect(result).toEqual(mockCompra);
      expect(mockComprasService.findById).toHaveBeenCalledWith(1);
    });
  });

  describe('createCompra', () => {
    it('should create compra with valid data', async () => {
      const req = { user: mockUser } as any;
      const createDto: CreateCompraDto = {
        sucursal_id: 1,
        fecha_compra: new Date(),
        monto_total: 1000,
        detalles: [],
      } as any;
      mockComprasService.createCompra.mockResolvedValue(mockCompra);

      const result = await controller.createCompra(createDto, req);

      expect(result).toEqual(mockCompra);
      expect(mockComprasService.createCompra).toHaveBeenCalledWith(createDto);
    });

    it('should throw BadRequestException when sucursal_id is missing', async () => {
      const req = { user: mockUser } as any;
      const createDto = { fecha_compra: new Date(), monto_total: 1000 } as any;

      await expect(controller.createCompra(createDto, req)).rejects.toThrow(BadRequestException);
    });
  });

  describe('updateCompra', () => {
    it('should update compra when user has permission', async () => {
      const req = { user: mockUser } as any;
      const updateDto: UpdateCompraDto = { monto_total: 1500 } as any;
      
      mockComprasService.findById.mockResolvedValue(mockCompra);
      mockComprasService.findByIdWithEmpresa.mockResolvedValue(mockCompra);
      mockComprasService.updateCompra.mockResolvedValue({ ...mockCompra, monto_total: 1500 });

      const result = await controller.updateCompra('1', updateDto, req);

      expect(result.monto_total).toBe(1500);
      expect(mockComprasService.updateCompra).toHaveBeenCalledWith(1, updateDto);
    });

    it('should throw BadRequestException when compra not found', async () => {
      const req = { user: mockUser } as any;
      const updateDto: UpdateCompraDto = {} as any;
      
      mockComprasService.findById.mockResolvedValue(null);

      await expect(controller.updateCompra('1', updateDto, req)).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException when user does not own the compra', async () => {
      const req = { user: mockUser } as any;
      const updateDto: UpdateCompraDto = {} as any;
      const compraOtraEmpresa = { ...mockCompra, sucursal: { id: 1, empresa: { id: 999 } } };
      
      mockComprasService.findById.mockResolvedValue(compraOtraEmpresa);
      mockComprasService.findByIdWithEmpresa.mockResolvedValue(compraOtraEmpresa);

      await expect(controller.updateCompra('1', updateDto, req)).rejects.toThrow(BadRequestException);
    });
  });

  describe('asociarPagoACompra', () => {
    it('should associate payment to compra successfully', async () => {
      const req = { user: mockUser } as any;
      const pagoDto = {
        fecha_pago: new Date(),
        monto_pago: 1000,
        metodo_pago: 'efectivo' as const,
        sucursal_id: 1,
      };
      
      mockComprasService.findById.mockResolvedValue(mockCompra);
      mockComprasService['compraRepository'] = {
        findOne: jest.fn().mockResolvedValue(mockCompra),
      };
      mockComprasService.asociarPagoACompra.mockResolvedValue({ ...mockCompra, pago: pagoDto });

      const result = await controller.asociarPagoACompra('1', pagoDto, req);

      expect(result.pago).toBeDefined();
      expect(mockComprasService.asociarPagoACompra).toHaveBeenCalledWith(1, pagoDto);
    });

    it('should throw BadRequestException when sucursal_id is missing', async () => {
      const req = { user: mockUser } as any;
      const pagoDto = {
        fecha_pago: new Date(),
        monto_pago: 1000,
        metodo_pago: 'efectivo' as const,
      } as any;

      await expect(controller.asociarPagoACompra('1', pagoDto, req)).rejects.toThrow(BadRequestException);
    });
  });

  describe('deleteCompra', () => {
    it('should delete compra when user has permission', async () => {
      const req = { user: mockUser } as any;
      
      mockComprasService.findById.mockResolvedValue(mockCompra);
      mockComprasService.findByIdWithSucursalEmpresa.mockResolvedValue(mockCompra);
      mockComprasService.deleteCompra.mockResolvedValue(undefined);

      const result = await controller.deleteCompra('1', req);

      expect(result).toEqual({ message: 'Compra eliminada exitosamente' });
      expect(mockComprasService.deleteCompra).toHaveBeenCalledWith(1);
    });

    it('should throw BadRequestException when compra not found', async () => {
      const req = { user: mockUser } as any;
      
      mockComprasService.findById.mockResolvedValue(null);

      await expect(controller.deleteCompra('1', req)).rejects.toThrow(BadRequestException);
    });
  });

  describe('bulkDeleteCompras', () => {
    it('should bulk delete compras', async () => {
      const req = { user: mockUser } as any;
      const ids = [1, 2, 3];
      
      mockComprasService.bulkDeleteCompras.mockResolvedValue(undefined);

      const result = await controller.bulkDeleteCompras({ ids }, req);

      expect(result).toEqual({ message: '3 compras eliminadas exitosamente' });
      expect(mockComprasService.bulkDeleteCompras).toHaveBeenCalledWith(ids, mockUser.empresa.id);
    });

    it('should throw BadRequestException on error', async () => {
      const req = { user: mockUser } as any;
      const ids = [1, 2, 3];
      
      mockComprasService.bulkDeleteCompras.mockRejectedValue(new Error('Error deleting'));

      await expect(controller.bulkDeleteCompras({ ids }, req)).rejects.toThrow(BadRequestException);
    });
  });
});
