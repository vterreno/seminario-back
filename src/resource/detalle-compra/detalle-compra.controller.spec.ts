import { Test, TestingModule } from '@nestjs/testing';
import { DetalleCompraController } from './detalle-compra.controller';
import { DetalleCompraService } from './detalle-compra.service';
import { BadRequestException } from '@nestjs/common';

describe('DetalleCompraController', () => {
  let controller: DetalleCompraController;
  let service: DetalleCompraService;

  const mockDetalleCompraService = {
    getAllDetalles: jest.fn(),
    findById: jest.fn(),
    getDetallesByCompra: jest.fn(),
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

  const mockDetalleCompra = {
    id: 1,
    compra: { id: 1 },
    producto: { id: 1 },
    cantidad: 10,
    precio_unitario: 100,
    subtotal: 1000,
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [DetalleCompraController],
      providers: [
        {
          provide: DetalleCompraService,
          useValue: mockDetalleCompraService,
        },
      ],
    }).compile();

    controller = module.get<DetalleCompraController>(DetalleCompraController);
    service = module.get<DetalleCompraService>(DetalleCompraService);
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
      const detalles = [mockDetalleCompra];
      mockDetalleCompraService.getAllDetalles.mockResolvedValue(detalles);

      const result = await controller.getAllDetalles(req);

      expect(result).toEqual(detalles);
      expect(mockDetalleCompraService.getAllDetalles).toHaveBeenCalled();
    });
  });

  describe('getDetalleById', () => {
    it('should return detalle by id', async () => {
      mockDetalleCompraService.findById.mockResolvedValue(mockDetalleCompra);

      const result = await controller.getDetalleById(1);

      expect(result).toEqual(mockDetalleCompra);
      expect(mockDetalleCompraService.findById).toHaveBeenCalledWith(1);
    });
  });

  describe('getDetallesByCompra', () => {
    it('should return detalles by compra id', async () => {
      const detalles = [mockDetalleCompra];
      mockDetalleCompraService.getDetallesByCompra.mockResolvedValue(detalles);

      const result = await controller.getDetallesByCompra(1);

      expect(result).toEqual(detalles);
      expect(mockDetalleCompraService.getDetallesByCompra).toHaveBeenCalledWith(1);
    });
  });

  describe('getDetallesByProducto', () => {
    it('should return detalles by producto id', async () => {
      const detalles = [mockDetalleCompra];
      mockDetalleCompraService.getDetallesByProducto.mockResolvedValue(detalles);

      const result = await controller.getDetallesByProducto(1);

      expect(result).toEqual(detalles);
      expect(mockDetalleCompraService.getDetallesByProducto).toHaveBeenCalledWith(1);
    });
  });

  describe('createDetalle', () => {
    it('should create detalle', async () => {
      const req = { user: mockUser } as any;
      const createDto = {
        compra_id: 1,
        producto_proveedor_id: 1,
        cantidad: 10,
        precio_unitario: 100,
        subtotal: 1000,
      } as any;

      mockDetalleCompraService.createDetalle.mockResolvedValue(mockDetalleCompra);

      const result = await controller.createDetalle(createDto, req);

      expect(result).toEqual(mockDetalleCompra);
      expect(mockDetalleCompraService.createDetalle).toHaveBeenCalledWith(createDto);
    });
  });

  describe('updateDetalle', () => {
    it('should update detalle', async () => {
      const req = { user: mockUser } as any;
      const updateDto = {
        cantidad: 20,
      } as any;

      const updatedDetalle = { ...mockDetalleCompra, cantidad: 20 };
      mockDetalleCompraService.updateDetalle.mockResolvedValue(updatedDetalle);

      const result = await controller.updateDetalle(1, updateDto, req);

      expect(result).toEqual(updatedDetalle);
      expect(mockDetalleCompraService.updateDetalle).toHaveBeenCalledWith(1, updateDto);
    });
  });

  describe('deleteDetalle', () => {
    it('should delete detalle', async () => {
      const req = { user: mockUser } as any;
      mockDetalleCompraService.deleteDetalle.mockResolvedValue(undefined);

      const result = await controller.deleteDetalle(1, req);

      expect(result).toEqual({ message: 'Detalle de compra eliminado exitosamente' });
      expect(mockDetalleCompraService.deleteDetalle).toHaveBeenCalledWith(1);
    });
  });

  describe('bulkDeleteDetalles', () => {
    it('should bulk delete detalles', async () => {
      const req = { user: mockUser } as any;
      const ids = [1, 2, 3];
      mockDetalleCompraService.bulkDeleteDetalles.mockResolvedValue(undefined);

      const result = await controller.bulkDeleteDetalles({ ids }, req);

      expect(result).toEqual({ message: 'Detalles de compra eliminados exitosamente' });
      expect(mockDetalleCompraService.bulkDeleteDetalles).toHaveBeenCalledWith(ids);
    });

    it('should throw BadRequestException when ids array is empty', async () => {
      const req = { user: mockUser } as any;

      await expect(controller.bulkDeleteDetalles({ ids: [] }, req)).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException when ids is not provided', async () => {
      const req = { user: mockUser } as any;

      await expect(controller.bulkDeleteDetalles({} as any, req)).rejects.toThrow(BadRequestException);
    });
  });
});
