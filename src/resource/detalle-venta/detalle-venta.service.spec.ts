import { Test, TestingModule } from '@nestjs/testing';
import { DetalleVentaService } from './detalle-venta.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { detalleVentaEntity } from 'src/database/core/detalleVenta.entity';
import { ProductoEntity } from 'src/database/core/producto.entity';
import { NotFoundException, BadRequestException } from '@nestjs/common';

describe('DetalleVentaService', () => {
  let service: DetalleVentaService;
  let detalleVentaRepository: any;
  let productoRepository: any;

  const mockDetalleVentaRepository = {
    find: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn((dto) => dto),
    save: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    softDelete: jest.fn(),
    restore: jest.fn(),
  };

  const mockProductoRepository = {
    find: jest.fn(),
    findOne: jest.fn(),
    save: jest.fn(),
  };

  const mockProducto: ProductoEntity = {
    id: 1,
    nombre: 'Producto Test',
    codigo: 'PROD-001',
    stock: 100,
  } as ProductoEntity;

  const mockDetalleVenta: detalleVentaEntity = {
    id: 1,
    venta: { id: 1 } as any,
    producto: mockProducto,
    cantidad: 10,
    precio_unitario: 100,
    subtotal: 1000,
    deleted_at: null,
    created_at: new Date(),
    updated_at: new Date(),
  } as detalleVentaEntity;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DetalleVentaService,
        {
          provide: getRepositoryToken(detalleVentaEntity),
          useValue: mockDetalleVentaRepository,
        },
        {
          provide: getRepositoryToken(ProductoEntity),
          useValue: mockProductoRepository,
        },
      ],
    }).compile();

    service = module.get<DetalleVentaService>(DetalleVentaService);
    detalleVentaRepository = module.get(getRepositoryToken(detalleVentaEntity));
    productoRepository = module.get(getRepositoryToken(ProductoEntity));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getAllDetalles', () => {
    it('should return all detalles', async () => {
      const detalles = [mockDetalleVenta];
      mockDetalleVentaRepository.find.mockResolvedValue(detalles);

      const result = await service.getAllDetalles();

      expect(result).toEqual(detalles);
    });
  });

  describe('getDetallesByVenta', () => {
    it('should return detalles filtered by venta id', async () => {
      const detalles = [mockDetalleVenta];
      mockDetalleVentaRepository.find.mockResolvedValue(detalles);

      const result = await service.getDetallesByVenta(1);

      expect(result).toEqual(detalles);
    });
  });

  describe('getDetallesByProducto', () => {
    it('should return detalles filtered by producto id', async () => {
      const detalles = [mockDetalleVenta];
      mockDetalleVentaRepository.find.mockResolvedValue(detalles);

      const result = await service.getDetallesByProducto(1);

      expect(result).toEqual(detalles);
    });
  });

  describe('createDetalle', () => {
    it('should create detalle and reduce stock', async () => {
      const createDto = {
        venta_id: 1,
        producto_id: 1,
        cantidad: 10,
        precio_unitario: 100,
        subtotal: 1000,
      };

      mockProductoRepository.findOne.mockResolvedValue(mockProducto);
      mockDetalleVentaRepository.create.mockReturnValue(mockDetalleVenta);
      mockDetalleVentaRepository.save.mockResolvedValue(mockDetalleVenta);
      mockDetalleVentaRepository.findOne.mockResolvedValue(mockDetalleVenta);
      mockProductoRepository.save.mockResolvedValue({ ...mockProducto, stock: 90 });

      const result = await service.createDetalle(createDto);

      expect(result).toEqual(mockDetalleVenta);
      expect(mockProductoRepository.save).toHaveBeenCalledWith(
        expect.objectContaining({ stock: 90 }),
      );
    });

    it('should throw NotFoundException when producto not found', async () => {
      const createDto = {
        venta_id: 1,
        producto_id: 999,
        cantidad: 10,
        precio_unitario: 100,
        subtotal: 1000,
      };

      mockProductoRepository.findOne.mockResolvedValue(null);

      await expect(service.createDetalle(createDto)).rejects.toThrow(NotFoundException);
    });

    it('should throw BadRequestException when insufficient stock', async () => {
      const createDto = {
        venta_id: 1,
        producto_id: 1,
        cantidad: 200,
        precio_unitario: 100,
        subtotal: 20000,
      };

      mockProductoRepository.findOne.mockResolvedValue(mockProducto);

      await expect(service.createDetalle(createDto)).rejects.toThrow(BadRequestException);
    });
  });

  describe('findById', () => {
    it('should return detalle by id', async () => {
      mockDetalleVentaRepository.findOne.mockResolvedValue(mockDetalleVenta);

      const result = await service.findById(1);

      expect(result).toEqual(mockDetalleVenta);
    });

    it('should throw NotFoundException when detalle not found', async () => {
      mockDetalleVentaRepository.findOne.mockResolvedValue(null);

      await expect(service.findById(999)).rejects.toThrow(NotFoundException);
    });
  });

  describe('updateDetalle', () => {
    it('should update detalle', async () => {
      const updateDto = { cantidad: 20 } as any;

      mockDetalleVentaRepository.findOne.mockResolvedValue(mockDetalleVenta);
      mockDetalleVentaRepository.update.mockResolvedValue({ affected: 1 });

      const result = await service.updateDetalle(1, updateDto);

      expect(mockDetalleVentaRepository.update).toHaveBeenCalled();
    });

    it('should throw NotFoundException when detalle not found', async () => {
      const updateDto = { cantidad: 20 } as any;

      mockDetalleVentaRepository.findOne.mockResolvedValue(null);

      await expect(service.updateDetalle(999, updateDto)).rejects.toThrow(NotFoundException);
    });
  });

  describe('deleteDetalle', () => {
    it('should delete detalle', async () => {
      mockDetalleVentaRepository.delete.mockResolvedValue({ affected: 1 });

      await service.deleteDetalle(1);

      expect(mockDetalleVentaRepository.delete).toHaveBeenCalledWith(1);
    });

    it('should throw NotFoundException when detalle not found', async () => {
      mockDetalleVentaRepository.delete.mockResolvedValue({ affected: 0 });

      await expect(service.deleteDetalle(999)).rejects.toThrow(NotFoundException);
    });
  });

  describe('bulkDeleteDetalles', () => {
    it('should bulk delete detalles', async () => {
      const ids = [1, 2, 3];
      mockDetalleVentaRepository.find.mockResolvedValue([
        mockDetalleVenta,
        { ...mockDetalleVenta, id: 2 },
        { ...mockDetalleVenta, id: 3 },
      ]);
      mockDetalleVentaRepository.delete.mockResolvedValue({ affected: 3 });

      await service.bulkDeleteDetalles(ids);

      expect(mockDetalleVentaRepository.delete).toHaveBeenCalledWith(ids);
    });

    it('should throw BadRequestException when some detalles not found', async () => {
      const ids = [1, 2, 3];
      mockDetalleVentaRepository.find.mockResolvedValue([mockDetalleVenta]);

      await expect(service.bulkDeleteDetalles(ids)).rejects.toThrow(BadRequestException);
    });
  });

  describe('softDeleteDetalle', () => {
    it('should soft delete detalle', async () => {
      mockDetalleVentaRepository.softDelete.mockResolvedValue({ affected: 1 });

      await service.softDeleteDetalle(1);

      expect(mockDetalleVentaRepository.softDelete).toHaveBeenCalledWith(1);
    });
  });

  describe('bulkSoftDeleteDetalles', () => {
    it('should bulk soft delete detalles', async () => {
      const ids = [1, 2, 3];
      mockDetalleVentaRepository.find.mockResolvedValue([
        mockDetalleVenta,
        { ...mockDetalleVenta, id: 2 },
        { ...mockDetalleVenta, id: 3 },
      ]);
      mockDetalleVentaRepository.softDelete.mockResolvedValue({ affected: 3 });

      await service.bulkSoftDeleteDetalles(ids);

      expect(mockDetalleVentaRepository.softDelete).toHaveBeenCalledWith(ids);
    });
  });

  describe('restoreDetalle', () => {
    it('should restore soft deleted detalle', async () => {
      mockDetalleVentaRepository.restore.mockResolvedValue({ affected: 1 });
      mockDetalleVentaRepository.findOne.mockResolvedValue(mockDetalleVenta);

      const result = await service.restoreDetalle(1);

      expect(result).toEqual(mockDetalleVenta);
    });
  });
});
