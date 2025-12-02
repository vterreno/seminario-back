import { Test, TestingModule } from '@nestjs/testing';
import { DetalleCompraService } from './detalle-compra.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { DetalleCompraEntity } from 'src/database/core/detalleCompra.entity';
import { ProductoEntity } from 'src/database/core/producto.entity';
import { ProductoProveedorEntity } from 'src/database/core/producto-proveedor.entity';
import { NotFoundException, BadRequestException } from '@nestjs/common';

describe('DetalleCompraService', () => {
  let service: DetalleCompraService;
  let detalleCompraRepository: any;
  let productoRepository: any;
  let productoProveedorRepository: any;

  const mockDetalleCompraRepository = {
    find: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn((dto) => dto),
    save: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    softDelete: jest.fn(),
    restore: jest.fn(),
    createQueryBuilder: jest.fn(() => ({
      leftJoinAndSelect: jest.fn().mockReturnThis(),
      select: jest.fn().mockReturnThis(),
      addSelect: jest.fn().mockReturnThis(),
      where: jest.fn().mockReturnThis(),
      andWhere: jest.fn().mockReturnThis(),
      groupBy: jest.fn().mockReturnThis(),
      addGroupBy: jest.fn().mockReturnThis(),
      orderBy: jest.fn().mockReturnThis(),
      limit: jest.fn().mockReturnThis(),
      getRawOne: jest.fn(),
      getRawMany: jest.fn(),
      getMany: jest.fn(),
    })),
  };

  const mockProductoRepository = {
    find: jest.fn(),
    findOne: jest.fn(),
    save: jest.fn(),
  };

  const mockProductoProveedorRepository = {
    find: jest.fn(),
    findOne: jest.fn(),
  };

  const mockProducto: ProductoEntity = {
    id: 1,
    nombre: 'Producto Test',
    codigo: 'PROD-001',
    stock: 100,
  } as ProductoEntity;

  const mockProductoProveedor: ProductoProveedorEntity = {
    id: 1,
    producto_id: 1,
    proveedor_id: 1,
    precio_proveedor: 100,
    producto: mockProducto,
  } as ProductoProveedorEntity;

  const mockDetalleCompra: DetalleCompraEntity = {
    id: 1,
    compra: { id: 1 } as any,
    producto: mockProductoProveedor,
    cantidad: 10,
    precio_unitario: 100,
    iva_porcentaje: 21,
    iva_monto: 210,
    subtotal: 1000,
    deleted_at: null,
    created_at: new Date(),
    updated_at: new Date(),
  } as DetalleCompraEntity;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DetalleCompraService,
        {
          provide: getRepositoryToken(DetalleCompraEntity),
          useValue: mockDetalleCompraRepository,
        },
        {
          provide: getRepositoryToken(ProductoEntity),
          useValue: mockProductoRepository,
        },
        {
          provide: getRepositoryToken(ProductoProveedorEntity),
          useValue: mockProductoProveedorRepository,
        },
      ],
    }).compile();

    service = module.get<DetalleCompraService>(DetalleCompraService);
    detalleCompraRepository = module.get(getRepositoryToken(DetalleCompraEntity));
    productoRepository = module.get(getRepositoryToken(ProductoEntity));
    productoProveedorRepository = module.get(getRepositoryToken(ProductoProveedorEntity));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getAllDetalles', () => {
    it('should return all detalles with relations', async () => {
      const detalles = [mockDetalleCompra];
      mockDetalleCompraRepository.find.mockResolvedValue(detalles);

      const result = await service.getAllDetalles();

      expect(result).toEqual(detalles);
      expect(mockDetalleCompraRepository.find).toHaveBeenCalled();
    });
  });

  describe('getDetallesByCompra', () => {
    it('should return detalles filtered by compra id', async () => {
      const detalles = [mockDetalleCompra];
      mockDetalleCompraRepository.find.mockResolvedValue(detalles);

      const result = await service.getDetallesByCompra(1);

      expect(result).toEqual(detalles);
    });
  });

  describe('getDetallesByProducto', () => {
    it('should return detalles filtered by producto proveedor id', async () => {
      const detalles = [mockDetalleCompra];
      mockDetalleCompraRepository.find.mockResolvedValue(detalles);

      const result = await service.getDetallesByProducto(1);

      expect(result).toEqual(detalles);
    });
  });

  describe('createDetalle', () => {
    it('should create detalle with producto_proveedor_id', async () => {
      const createDto = {
        compra_id: 1,
        producto_proveedor_id: 1,
        cantidad: 10,
        precio_unitario: 100,
        subtotal: 1000,
      };

      mockProductoProveedorRepository.findOne.mockResolvedValue(mockProductoProveedor);
      mockProductoRepository.findOne.mockResolvedValue(mockProducto);
      mockDetalleCompraRepository.create.mockReturnValue(mockDetalleCompra);
      mockDetalleCompraRepository.save.mockResolvedValue(mockDetalleCompra);
      mockDetalleCompraRepository.findOne.mockResolvedValue(mockDetalleCompra);

      const result = await service.createDetalle(createDto);

      expect(result).toEqual(mockDetalleCompra);
      expect(mockProductoRepository.save).toHaveBeenCalledWith(expect.objectContaining({
        stock: mockProducto.stock + createDto.cantidad,
      }));
    });

    it('should throw BadRequestException when no id provided', async () => {
      const createDto = {
        compra_id: 1,
        cantidad: 10,
        precio_unitario: 100,
        subtotal: 1000,
      } as any;

      await expect(service.createDetalle(createDto)).rejects.toThrow(BadRequestException);
    });

    it('should throw NotFoundException when producto_proveedor not found', async () => {
      const createDto = {
        compra_id: 1,
        producto_proveedor_id: 999,
        cantidad: 10,
        precio_unitario: 100,
        subtotal: 1000,
      };

      mockProductoProveedorRepository.findOne.mockResolvedValue(null);

      await expect(service.createDetalle(createDto)).rejects.toThrow(NotFoundException);
    });

    it('should calculate IVA when not provided', async () => {
      const createDto = {
        compra_id: 1,
        producto_proveedor_id: 1,
        cantidad: 10,
        precio_unitario: 100,
        subtotal: 1000,
      };

      mockProductoProveedorRepository.findOne.mockResolvedValue(mockProductoProveedor);
      mockProductoRepository.findOne.mockResolvedValue(mockProducto);
      mockDetalleCompraRepository.create.mockReturnValue(mockDetalleCompra);
      mockDetalleCompraRepository.save.mockResolvedValue(mockDetalleCompra);
      mockDetalleCompraRepository.findOne.mockResolvedValue(mockDetalleCompra);

      await service.createDetalle(createDto);

      expect(mockDetalleCompraRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          iva_porcentaje: 21,
          iva_monto: expect.any(Number),
        }),
      );
    });
  });

  describe('findById', () => {
    it('should return detalle by id', async () => {
      mockDetalleCompraRepository.findOne.mockResolvedValue(mockDetalleCompra);

      const result = await service.findById(1);

      expect(result).toEqual(mockDetalleCompra);
    });

    it('should throw NotFoundException when detalle not found', async () => {
      mockDetalleCompraRepository.findOne.mockResolvedValue(null);

      await expect(service.findById(999)).rejects.toThrow(NotFoundException);
    });
  });

  describe('deleteDetalle', () => {
    it('should delete detalle', async () => {
      mockDetalleCompraRepository.delete.mockResolvedValue({ affected: 1 });

      await service.deleteDetalle(1);

      expect(mockDetalleCompraRepository.delete).toHaveBeenCalledWith(1);
    });

    it('should throw NotFoundException when detalle not found', async () => {
      mockDetalleCompraRepository.delete.mockResolvedValue({ affected: 0 });

      await expect(service.deleteDetalle(999)).rejects.toThrow(NotFoundException);
    });
  });

  describe('bulkDeleteDetalles', () => {
    it('should bulk delete detalles', async () => {
      const ids = [1, 2, 3];
      mockDetalleCompraRepository.find.mockResolvedValue([
        mockDetalleCompra,
        { ...mockDetalleCompra, id: 2 },
        { ...mockDetalleCompra, id: 3 },
      ]);
      mockDetalleCompraRepository.delete.mockResolvedValue({ affected: 3 });

      await service.bulkDeleteDetalles(ids);

      expect(mockDetalleCompraRepository.delete).toHaveBeenCalledWith(ids);
    });

    it('should throw BadRequestException when some detalles not found', async () => {
      const ids = [1, 2, 3];
      mockDetalleCompraRepository.find.mockResolvedValue([mockDetalleCompra]);

      await expect(service.bulkDeleteDetalles(ids)).rejects.toThrow(BadRequestException);
    });
  });

  describe('softDeleteDetalle', () => {
    it('should soft delete detalle', async () => {
      mockDetalleCompraRepository.softDelete.mockResolvedValue({ affected: 1 });

      await service.softDeleteDetalle(1);

      expect(mockDetalleCompraRepository.softDelete).toHaveBeenCalledWith(1);
    });

    it('should throw NotFoundException when detalle not found', async () => {
      mockDetalleCompraRepository.softDelete.mockResolvedValue({ affected: 0 });

      await expect(service.softDeleteDetalle(999)).rejects.toThrow(NotFoundException);
    });
  });

  describe('bulkSoftDeleteDetalles', () => {
    it('should bulk soft delete detalles', async () => {
      const ids = [1, 2, 3];
      mockDetalleCompraRepository.find.mockResolvedValue([
        mockDetalleCompra,
        { ...mockDetalleCompra, id: 2 },
        { ...mockDetalleCompra, id: 3 },
      ]);
      mockDetalleCompraRepository.softDelete.mockResolvedValue({ affected: 3 });

      await service.bulkSoftDeleteDetalles(ids);

      expect(mockDetalleCompraRepository.softDelete).toHaveBeenCalledWith(ids);
    });
  });

  describe('restoreDetalle', () => {
    it('should restore soft deleted detalle', async () => {
      mockDetalleCompraRepository.restore.mockResolvedValue({ affected: 1 });
      mockDetalleCompraRepository.findOne.mockResolvedValue(mockDetalleCompra);

      const result = await service.restoreDetalle(1);

      expect(result).toEqual(mockDetalleCompra);
      expect(mockDetalleCompraRepository.restore).toHaveBeenCalledWith(1);
    });

    it('should throw NotFoundException when detalle not found', async () => {
      mockDetalleCompraRepository.restore.mockResolvedValue({ affected: 0 });

      await expect(service.restoreDetalle(999)).rejects.toThrow(NotFoundException);
    });
  });

  describe('calcularSubtotal', () => {
    it('should calculate subtotal correctly', () => {
      const result = service.calcularSubtotal(10, 100);
      expect(result).toBe(1000);
    });

    it('should throw BadRequestException when cantidad is zero or negative', () => {
      expect(() => service.calcularSubtotal(0, 100)).toThrow(BadRequestException);
      expect(() => service.calcularSubtotal(-5, 100)).toThrow(BadRequestException);
    });

    it('should throw BadRequestException when precio is zero or negative', () => {
      expect(() => service.calcularSubtotal(10, 0)).toThrow(BadRequestException);
      expect(() => service.calcularSubtotal(10, -50)).toThrow(BadRequestException);
    });
  });

  describe('getCantidadCompradaByProducto', () => {
    it('should return total cantidad comprada', async () => {
      const queryBuilder = mockDetalleCompraRepository.createQueryBuilder();
      queryBuilder.getRawOne.mockResolvedValue({ total: '100' });

      const result = await service.getCantidadCompradaByProducto(1);

      expect(result).toBe(100);
    });
  });

  describe('getTotalVentasByProducto', () => {
    it('should return total ventas monto', async () => {
      const queryBuilder = mockDetalleCompraRepository.createQueryBuilder();
      queryBuilder.getRawOne.mockResolvedValue({ total: '10000.50' });

      const result = await service.getTotalVentasByProducto(1);

      expect(result).toBe(10000.5);
    });
  });
});
