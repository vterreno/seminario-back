import { Test, TestingModule } from '@nestjs/testing';
import { DetalleVentaController } from './detalle-venta.controller';
import { DetalleVentaService } from './detalle-venta.service';
import { AuthGuard } from 'src/middlewares/auth.middleware';
import { PermissionsGuard } from 'src/middlewares/permission.middleware';
import { BadRequestException } from '@nestjs/common';

describe('DetalleVentaController', () => {
  let controller: DetalleVentaController;
  let service: DetalleVentaService;

  const mockDetalleVentaService = {
    getAllDetalles: jest.fn(),
    findById: jest.fn(),
    getDetallesByVenta: jest.fn(),
    getDetallesByProducto: jest.fn(),
    createDetalle: jest.fn(),
    updateDetalle: jest.fn(),
    deleteDetalle: jest.fn(),
    bulkDeleteDetalles: jest.fn(),
  };

  const mockUser = {
    id: 1,
    email: 'test@test.com',
    empresa: { id: 1 },
  };

  const mockDetalleVenta = {
    id: 1,
    venta: { id: 1 },
    producto: { id: 1 },
    cantidad: 10,
    precio_unitario: 100,
    subtotal: 1000,
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [DetalleVentaController],
      providers: [
        {
          provide: DetalleVentaService,
          useValue: mockDetalleVentaService,
        },
      ],
    })
      .overrideGuard(AuthGuard)
      .useValue({ canActivate: jest.fn(() => true) })
      .overrideGuard(PermissionsGuard)
      .useValue({ canActivate: jest.fn(() => true) })
      .compile();

    controller = module.get<DetalleVentaController>(DetalleVentaController);
    service = module.get<DetalleVentaService>(DetalleVentaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getAllDetalles', () => {
    it('should return all detalles', async () => {
      const req = { user: mockUser } as any;
      const detalles = [mockDetalleVenta];
      mockDetalleVentaService.getAllDetalles.mockResolvedValue(detalles);

      const result = await controller.getAllDetalles(req);

      expect(result).toEqual(detalles);
    });
  });

  describe('getDetalleById', () => {
    it('should return detalle by id', async () => {
      mockDetalleVentaService.findById.mockResolvedValue(mockDetalleVenta);

      const result = await controller.getDetalleById(1);

      expect(result).toEqual(mockDetalleVenta);
    });
  });

  describe('getDetallesByVenta', () => {
    it('should return detalles by venta id', async () => {
      const detalles = [mockDetalleVenta];
      mockDetalleVentaService.getDetallesByVenta.mockResolvedValue(detalles);

      const result = await controller.getDetallesByVenta(1);

      expect(result).toEqual(detalles);
    });
  });

  describe('getDetallesByProducto', () => {
    it('should return detalles by producto id', async () => {
      const detalles = [mockDetalleVenta];
      mockDetalleVentaService.getDetallesByProducto.mockResolvedValue(detalles);

      const result = await controller.getDetallesByProducto(1);

      expect(result).toEqual(detalles);
    });
  });

  describe('createDetalle', () => {
    it('should create detalle', async () => {
      const req = { user: mockUser } as any;
      const createDto = {
        venta_id: 1,
        producto_id: 1,
        cantidad: 10,
        precio_unitario: 100,
        subtotal: 1000,
      } as any;

      mockDetalleVentaService.createDetalle.mockResolvedValue(mockDetalleVenta);

      const result = await controller.createDetalle(createDto, req);

      expect(result).toEqual(mockDetalleVenta);
    });
  });

  describe('updateDetalle', () => {
    it('should update detalle', async () => {
      const req = { user: mockUser } as any;
      const updateDto = { cantidad: 20 } as any;
      const updatedDetalle = { ...mockDetalleVenta, cantidad: 20 };

      mockDetalleVentaService.updateDetalle.mockResolvedValue(updatedDetalle);

      const result = await controller.updateDetalle(1, updateDto, req);

      expect(result).toEqual(updatedDetalle);
    });
  });

  describe('deleteDetalle', () => {
    it('should delete detalle', async () => {
      const req = { user: mockUser } as any;
      mockDetalleVentaService.deleteDetalle.mockResolvedValue(undefined);

      const result = await controller.deleteDetalle(1, req);

      expect(result).toEqual({ message: 'Detalle de venta eliminado exitosamente' });
    });
  });

  describe('bulkDeleteDetalles', () => {
    it('should bulk delete detalles', async () => {
      const req = { user: mockUser } as any;
      const ids = [1, 2, 3];
      mockDetalleVentaService.bulkDeleteDetalles.mockResolvedValue(undefined);

      const result = await controller.bulkDeleteDetalles({ ids }, req);

      expect(result).toEqual({ message: 'Detalles de venta eliminados exitosamente' });
    });

    it('should throw BadRequestException when ids array is empty', async () => {
      const req = { user: mockUser } as any;

      await expect(controller.bulkDeleteDetalles({ ids: [] }, req)).rejects.toThrow(
        BadRequestException,
      );
    });
  });
});
