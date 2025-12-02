import { Test, TestingModule } from '@nestjs/testing';
import { ProductosService } from './productos.service';
import { Repository } from 'typeorm';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ProductoEntity } from 'src/database/core/producto.entity';
import { MovimientoStockEntity } from 'src/database/core/movimientos-stock.entity';
import { sucursalEntity } from 'src/database/core/sucursal.entity';
import { BadRequestException } from '@nestjs/common';

describe('ProductosService', () => {
  let service: ProductosService;
  let productosRepository: Repository<ProductoEntity>;
  let movimientoStockRepository: Repository<MovimientoStockEntity>;
  let sucursalRepository: Repository<sucursalEntity>;

  const mockProductosRepository = {
    find: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    createQueryBuilder: jest.fn(),
  };

  const mockMovimientoStockRepository = {
    create: jest.fn(),
    save: jest.fn(),
  };

  const mockProducto = {
    id: 1,
    codigo: 'PROD001',
    nombre: 'Test Producto',
    descripcion: 'Test Description',
    precio_compra: 100,
    precio_venta: 150,
    stock: 10,
    stock_apertura: 10,
    stock_minimo: 5,
    estado: true,
    empresa_id: 1,
    marca_id: 1,
    created_at: new Date(),
    updated_at: new Date(),
  } as unknown as ProductoEntity;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProductosService,
        {
          provide: getRepositoryToken(ProductoEntity),
          useValue: mockProductosRepository,
        },
        {
          provide: getRepositoryToken(MovimientoStockEntity),
          useValue: mockMovimientoStockRepository,
        },
        {
          provide: getRepositoryToken(sucursalEntity),
          useValue: {
            find: jest.fn(),
            findOne: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<ProductosService>(ProductosService);
    productosRepository = module.get<Repository<ProductoEntity>>(getRepositoryToken(ProductoEntity));
    movimientoStockRepository = module.get<Repository<MovimientoStockEntity>>(getRepositoryToken(MovimientoStockEntity));
    sucursalRepository = module.get<Repository<sucursalEntity>>(getRepositoryToken(sucursalEntity));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getProductosByEmpresa', () => {
    it('should return productos filtered by empresa', async () => {
      const empresaId = 1;
      const mockProductos = [mockProducto];
      const mockSucursales = [{ id: 1, empresa_id: empresaId }];
      
      jest.spyOn(sucursalRepository, 'find').mockResolvedValue(mockSucursales as any);
      mockProductosRepository.find.mockResolvedValue(mockProductos);

      const result = await service.getProductosByEmpresa(empresaId);

      expect(result).toEqual(mockProductos);
    });
  });

  describe('getAllProductos', () => {
    it('should return all productos', async () => {
      const mockProductos = [mockProducto];
      
      mockProductosRepository.find.mockResolvedValue(mockProductos);

      const result = await service.getAllProductos();

      expect(result).toEqual(mockProductos);
      expect(mockProductosRepository.find).toHaveBeenCalledWith({
        relations: ['sucursal', 'sucursal.empresa', 'marca', 'categoria', 'unidadMedida'],
      });
    });
  });

  describe('createProducto', () => {
    it('should create a new producto with stock apertura movement', async () => {
      const productoData = {
        codigo: 'PROD002',
        nombre: 'New Producto',
        precio_compra: 100,
        precio_venta: 150,
        stock_apertura: 20,
        sucursal_id: 1,
      };

      const mockSucursal = { id: 1, empresa_id: 1 };
      jest.spyOn(sucursalRepository, 'findOne').mockResolvedValue(mockSucursal as any);
      mockProductosRepository.create.mockReturnValue(mockProducto);
      mockProductosRepository.save.mockResolvedValue(mockProducto);
      mockProductosRepository.findOne.mockResolvedValue(mockProducto);
      mockMovimientoStockRepository.create.mockReturnValue({});
      mockMovimientoStockRepository.save.mockResolvedValue({});

      const result = await service.createProducto(productoData as any);

      expect(result).toEqual(mockProducto);
      expect(mockProductosRepository.save).toHaveBeenCalled();
      expect(mockMovimientoStockRepository.save).toHaveBeenCalled();
    });

    it('should handle errors during creation', async () => {
      const productoData = {
        codigo: 'PROD002',
        nombre: 'New Producto',
        precio_compra: 100,
        precio_venta: 150,
        stock_apertura: 20,
        sucursal_id: 1,
      };

      const mockSucursal = { id: 1, empresa_id: 1 };
      jest.spyOn(sucursalRepository, 'findOne').mockResolvedValue(mockSucursal as any);
      mockProductosRepository.create.mockImplementation(() => {
        throw new Error('Database error');
      });

      await expect(service.createProducto(productoData as any)).rejects.toThrow(BadRequestException);
    });
  });

  describe('updateProducto', () => {
    it('should update a producto', async () => {
      const productoId = 1;
      const updateData = {
        nombre: 'Updated Producto',
        precio_venta: 200,
      };

      mockProductosRepository.findOne.mockResolvedValue(mockProducto);
      mockProductosRepository.update.mockResolvedValue({ affected: 1 });

      const result = await service.updateProducto(productoId, updateData);

      expect(result).toEqual(mockProducto);
      expect(mockProductosRepository.update).toHaveBeenCalledWith(productoId, updateData);
    });

    it('should throw BadRequestException if trying to deactivate producto with stock', async () => {
      const productoId = 1;
      const updateData = {
        estado: false,
      };

      mockProductosRepository.findOne.mockResolvedValue({ ...mockProducto, stock: 10 });

      await expect(service.updateProducto(productoId, updateData)).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException if producto not found', async () => {
      const productoId = 999;
      const updateData = {
        nombre: 'Updated Producto',
      };

      mockProductosRepository.findOne.mockResolvedValue(null);

      await expect(service.updateProducto(productoId, updateData)).rejects.toThrow(BadRequestException);
    });
  });

  describe('bulkUpdateProductoStatus', () => {
    it('should update status of multiple productos without stock', async () => {
      const ids = [1, 2, 3];
      const estado = false;
      const mockProductos = [
        { ...mockProducto, stock: 0 },
        { ...mockProducto, id: 2, stock: 0 },
        { ...mockProducto, id: 3, stock: 0 },
      ];

      mockProductosRepository.find.mockResolvedValue(mockProductos);
      
      const mockQueryBuilder: any = {
        leftJoin: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        getMany: jest.fn()
          .mockResolvedValueOnce(mockProductos) // First call: empresa validation
          .mockResolvedValueOnce([]), // Second call: stock validation
      };

      mockProductosRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder);
      mockProductosRepository.update.mockResolvedValue({ affected: 3 });

      const result = await service.bulkUpdateProductoStatus(ids, estado, 1);

      expect(result).toEqual(mockProductos);
    });

    it('should throw BadRequestException if trying to deactivate productos with stock', async () => {
      const ids = [1, 2];
      const estado = false;
      const mockProductos = [mockProducto, { ...mockProducto, id: 2 }];

      mockProductosRepository.find.mockResolvedValue(mockProductos);
      
      const mockQueryBuilder: any = {
        leftJoin: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockResolvedValue([mockProducto]),
      };

      mockProductosRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder);

      await expect(service.bulkUpdateProductoStatus(ids, estado, 1)).rejects.toThrow(BadRequestException);
    });
  });

  describe('getStockProducto', () => {
    it('should return stock of a producto', async () => {
      mockProductosRepository.findOne.mockResolvedValue(mockProducto);

      const result = await service.getStockProducto(1, 1);

      expect(result).toBe(10);
    });

    it('should throw BadRequestException if producto not found', async () => {
      mockProductosRepository.findOne.mockResolvedValue(null);

      await expect(service.getStockProducto(999, 1)).rejects.toThrow(BadRequestException);
    });
  });
});
