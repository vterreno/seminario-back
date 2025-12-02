import { Test, TestingModule } from '@nestjs/testing';
import { VentasController } from './ventas.controller';
import { VentasService } from './ventas.service';
import { AuthGuard } from 'src/middlewares/auth.middleware';
import { PermissionsGuard } from 'src/middlewares/permission.middleware';
import { BadRequestException } from '@nestjs/common';

describe('VentasController', () => {
  let controller: VentasController;
  let service: VentasService;

  const mockVentasService = {
    getAllVentas: jest.fn(),
    getVentasByEmpresa: jest.fn(),
    findById: jest.fn(),
    findByIdWithEmpresa: jest.fn(),
    createVenta: jest.fn(),
    updateVenta: jest.fn(),
    deleteVenta: jest.fn(),
    bulkDeleteVentas: jest.fn(),
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

  const mockVenta = {
    id: 1,
    numero_venta: 1,
    fecha_venta: new Date(),
    monto_total: 1000,
    sucursal: { id: 1, empresa: { id: 1 } },
    contacto: null,
    pago: { id: 1 },
    detalles: [],
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [VentasController],
      providers: [
        {
          provide: VentasService,
          useValue: mockVentasService,
        },
      ],
    })
      .overrideGuard(AuthGuard)
      .useValue({ canActivate: jest.fn(() => true) })
      .overrideGuard(PermissionsGuard)
      .useValue({ canActivate: jest.fn(() => true) })
      .compile();

    controller = module.get<VentasController>(VentasController);
    service = module.get<VentasService>(VentasService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getAllVentas', () => {
    it('should return all ventas for superadmin', async () => {
      const req = { user: mockSuperAdminUser } as any;
      const ventas = [mockVenta];
      mockVentasService.getAllVentas.mockResolvedValue(ventas);

      const result = await controller.getAllVentas(req);

      expect(result).toEqual(ventas);
      expect(mockVentasService.getAllVentas).toHaveBeenCalled();
    });

    it('should return ventas filtered by empresa for regular users', async () => {
      const req = { user: mockUser } as any;
      const ventas = [mockVenta];
      mockVentasService.getVentasByEmpresa.mockResolvedValue(ventas);

      const result = await controller.getAllVentas(req);

      expect(result).toEqual(ventas);
      expect(mockVentasService.getVentasByEmpresa).toHaveBeenCalledWith(1);
    });

    it('should return empty array when user has no empresa', async () => {
      const req = { user: { ...mockUser, empresa: null } } as any;

      const result = await controller.getAllVentas(req);

      expect(result).toEqual([]);
    });
  });

  describe('getVentaById', () => {
    it('should return venta by id', async () => {
      mockVentasService.findById.mockResolvedValue(mockVenta);

      const result = await controller.getVentaById('1');

      expect(result).toEqual(mockVenta);
      expect(mockVentasService.findById).toHaveBeenCalledWith(1);
    });
  });

  describe('createVenta', () => {
    it('should create venta', async () => {
      const req = { user: mockUser } as any;
      const createDto = {
        sucursal_id: 1,
        fecha_venta: new Date(),
        monto_total: 1000,
        detalles: [],
        pago: {
          fecha_pago: new Date(),
          monto_pago: 1000,
          metodo_pago: 'efectivo',
          sucursal_id: 1,
        },
      } as any;

      mockVentasService.createVenta.mockResolvedValue(mockVenta);

      const result = await controller.createVenta(createDto, req);

      expect(result).toEqual(mockVenta);
    });

    it('should throw BadRequestException when sucursal_id is missing', async () => {
      const req = { user: mockUser } as any;
      const createDto = { fecha_venta: new Date(), monto_total: 1000 } as any;

      await expect(controller.createVenta(createDto, req)).rejects.toThrow(BadRequestException);
    });
  });

  describe('updateVenta', () => {
    it('should update venta when user has permission', async () => {
      const req = { user: mockUser } as any;
      const updateDto = { monto_total: 1500 } as any;
      const updatedVenta = { ...mockVenta, monto_total: 1500 };

      mockVentasService.findById.mockResolvedValue(mockVenta);
      mockVentasService.findByIdWithEmpresa.mockResolvedValue(mockVenta);
      mockVentasService.updateVenta.mockResolvedValue(updatedVenta);

      const result = await controller.updateVenta('1', updateDto, req);

      expect(result).toEqual(updatedVenta);
    });

    it('should throw BadRequestException when venta not found', async () => {
      const req = { user: mockUser } as any;
      const updateDto = {} as any;

      mockVentasService.findById.mockResolvedValue(null);

      await expect(controller.updateVenta('1', updateDto, req)).rejects.toThrow(BadRequestException);
    });
  });

  describe('deleteVenta', () => {
    it('should delete venta', async () => {
      const req = { user: mockUser } as any;

      mockVentasService.findById.mockResolvedValue(mockVenta);
      mockVentasService.deleteVenta.mockResolvedValue(undefined);

      const result = await controller.deleteVenta('1', req);

      expect(result).toEqual({ message: 'Venta eliminada exitosamente' });
    });
  });

  describe('bulkDeleteVentas', () => {
    it('should bulk delete ventas', async () => {
      const req = { user: mockUser } as any;
      const ids = [1, 2, 3];

      mockVentasService.bulkDeleteVentas.mockResolvedValue(undefined);

      const result = await controller.bulkDeleteVentas({ ids }, req);

      expect(result).toEqual({ message: '3 ventas eliminadas exitosamente' });
    });
  });
});
