import { Test, TestingModule } from '@nestjs/testing';
import { ProductoProveedorService } from './producto-proveedor.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ProductoProveedorEntity } from 'src/database/core/producto-proveedor.entity';
import { ProductoEntity } from 'src/database/core/producto.entity';
import { contactoEntity } from 'src/database/core/contacto.entity';
import { NotFoundException, BadRequestException } from '@nestjs/common';
import { Repository } from 'typeorm';

describe('ProductoProveedorService', () => {
  let service: ProductoProveedorService;
  let productoProveedorRepository: Repository<ProductoProveedorEntity>;
  let productoRepository: Repository<ProductoEntity>;
  let contactoRepository: Repository<contactoEntity>;

  const mockProductoProveedorRepository = {
    find: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn((dto) => dto),
    save: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  };

  const mockProductoRepository = {
    find: jest.fn(),
    findOne: jest.fn(),
  };

  const mockContactoRepository = {
    find: jest.fn(),
    findOne: jest.fn(),
  };

  const mockProductoProveedor: ProductoProveedorEntity = {
    id: 1,
    producto_id: 1,
    proveedor_id: 1,
    precio_proveedor: 100,
    codigo_proveedor: 'PROV-001',
    producto: {
      id: 1,
      nombre: 'Producto Test',
      codigo: 'PROD-001',
    } as ProductoEntity,
    proveedor: {
      id: 1,
      nombre: 'Proveedor Test',
      rol: 'proveedor',
    } as contactoEntity,
    deleted_at: null,
    created_at: new Date(),
    updated_at: new Date(),
  } as ProductoProveedorEntity;

  const mockProducto: ProductoEntity = {
    id: 1,
    nombre: 'Producto Test',
    codigo: 'PROD-001',
  } as ProductoEntity;

  const mockContacto: contactoEntity = {
    id: 1,
    nombre: 'Proveedor Test',
    rol: 'proveedor',
  } as contactoEntity;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProductoProveedorService,
        {
          provide: getRepositoryToken(ProductoProveedorEntity),
          useValue: mockProductoProveedorRepository,
        },
        {
          provide: getRepositoryToken(ProductoEntity),
          useValue: mockProductoRepository,
        },
        {
          provide: getRepositoryToken(contactoEntity),
          useValue: mockContactoRepository,
        },
      ],
    }).compile();

    service = module.get<ProductoProveedorService>(ProductoProveedorService);
    productoProveedorRepository = module.get<Repository<ProductoProveedorEntity>>(
      getRepositoryToken(ProductoProveedorEntity),
    );
    productoRepository = module.get<Repository<ProductoEntity>>(
      getRepositoryToken(ProductoEntity),
    );
    contactoRepository = module.get<Repository<contactoEntity>>(
      getRepositoryToken(contactoEntity),
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findByProveedor', () => {
    it('should return all products for a proveedor', async () => {
      const proveedorId = 1;
      const productosProveedor = [mockProductoProveedor];
      mockProductoProveedorRepository.find.mockResolvedValue(productosProveedor);

      const result = await service.findByProveedor(proveedorId);

      expect(result).toEqual(productosProveedor);
      expect(mockProductoProveedorRepository.find).toHaveBeenCalledWith({
        where: { proveedor_id: proveedorId, deleted_at: null },
        relations: ['producto', 'producto.marca', 'producto.categoria', 'producto.unidadMedida', 'proveedor'],
      });
    });

    it('should return empty array when proveedor has no products', async () => {
      mockProductoProveedorRepository.find.mockResolvedValue([]);

      const result = await service.findByProveedor(1);

      expect(result).toEqual([]);
    });
  });

  describe('findByProducto', () => {
    it('should return all proveedores for a product', async () => {
      const productoId = 1;
      const productosProveedor = [mockProductoProveedor];
      mockProductoProveedorRepository.find.mockResolvedValue(productosProveedor);

      const result = await service.findByProducto(productoId);

      expect(result).toEqual(productosProveedor);
      expect(mockProductoProveedorRepository.find).toHaveBeenCalledWith({
        where: { producto_id: productoId, deleted_at: null },
        relations: ['producto', 'proveedor'],
      });
    });

    it('should return empty array when product has no proveedores', async () => {
      mockProductoProveedorRepository.find.mockResolvedValue([]);

      const result = await service.findByProducto(1);

      expect(result).toEqual([]);
    });
  });

  describe('create', () => {
    it('should create producto-proveedor relation successfully', async () => {
      const createDto = {
        producto_id: 1,
        proveedor_id: 1,
        precio_proveedor: 100,
        codigo_proveedor: 'PROV-001',
      };

      mockProductoRepository.findOne.mockResolvedValue(mockProducto);
      mockContactoRepository.findOne.mockResolvedValue(mockContacto);
      mockProductoProveedorRepository.findOne.mockResolvedValue(null);
      mockProductoProveedorRepository.create.mockReturnValue(mockProductoProveedor);
      mockProductoProveedorRepository.save.mockResolvedValue(mockProductoProveedor);

      const result = await service.create(createDto);

      expect(result).toEqual(mockProductoProveedor);
      expect(mockProductoRepository.findOne).toHaveBeenCalledWith({ where: { id: createDto.producto_id } });
      expect(mockContactoRepository.findOne).toHaveBeenCalledWith({ where: { id: createDto.proveedor_id } });
    });

    it('should throw NotFoundException when producto does not exist', async () => {
      const createDto = {
        producto_id: 999,
        proveedor_id: 1,
        precio_proveedor: 100,
        codigo_proveedor: 'PROV-001',
      };

      mockProductoRepository.findOne.mockResolvedValue(null);

      await expect(service.create(createDto)).rejects.toThrow(NotFoundException);
    });

    it('should throw NotFoundException when proveedor does not exist', async () => {
      const createDto = {
        producto_id: 1,
        proveedor_id: 999,
        precio_proveedor: 100,
        codigo_proveedor: 'PROV-001',
      };

      mockProductoRepository.findOne.mockResolvedValue(mockProducto);
      mockContactoRepository.findOne.mockResolvedValue(null);

      await expect(service.create(createDto)).rejects.toThrow(NotFoundException);
    });

    it('should throw BadRequestException when contacto is not a proveedor', async () => {
      const createDto = {
        producto_id: 1,
        proveedor_id: 1,
        precio_proveedor: 100,
        codigo_proveedor: 'PROV-001',
      };

      const contactoNoProveedor = { ...mockContacto, rol: 'cliente' };

      mockProductoRepository.findOne.mockResolvedValue(mockProducto);
      mockContactoRepository.findOne.mockResolvedValue(contactoNoProveedor);

      await expect(service.create(createDto)).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException when relation already exists', async () => {
      const createDto = {
        producto_id: 1,
        proveedor_id: 1,
        precio_proveedor: 100,
        codigo_proveedor: 'PROV-001',
      };

      mockProductoRepository.findOne.mockResolvedValue(mockProducto);
      mockContactoRepository.findOne.mockResolvedValue(mockContacto);
      mockProductoProveedorRepository.findOne.mockResolvedValue(mockProductoProveedor);

      await expect(service.create(createDto)).rejects.toThrow(BadRequestException);
    });

    it('should accept contacto with rol "ambos"', async () => {
      const createDto = {
        producto_id: 1,
        proveedor_id: 1,
        precio_proveedor: 100,
        codigo_proveedor: 'PROV-001',
      };

      const contactoAmbos = { ...mockContacto, rol: 'ambos' };

      mockProductoRepository.findOne.mockResolvedValue(mockProducto);
      mockContactoRepository.findOne.mockResolvedValue(contactoAmbos);
      mockProductoProveedorRepository.findOne
        .mockResolvedValueOnce(null)
        .mockResolvedValueOnce(mockProductoProveedor);
      mockProductoProveedorRepository.create.mockReturnValue(mockProductoProveedor);
      mockProductoProveedorRepository.save.mockResolvedValue(mockProductoProveedor);

      const result = await service.create(createDto);

      expect(result).toBeDefined();
    });
  });

  describe('update', () => {
    it('should update producto-proveedor relation successfully', async () => {
      const updateDto = {
        precio_proveedor: 150,
        codigo_proveedor: 'PROV-002',
      };

      const updatedProductoProveedor = { ...mockProductoProveedor, ...updateDto };

      mockProductoProveedorRepository.findOne
        .mockResolvedValueOnce(mockProductoProveedor)
        .mockResolvedValueOnce(updatedProductoProveedor);
      mockProductoProveedorRepository.save.mockResolvedValue(updatedProductoProveedor);

      const result = await service.update(1, updateDto);

      expect(result.precio_proveedor).toBe(150);
      expect(result.codigo_proveedor).toBe('PROV-002');
    });

    it('should throw NotFoundException when relation does not exist', async () => {
      const updateDto = {
        precio_proveedor: 150,
      };

      mockProductoProveedorRepository.findOne.mockResolvedValue(null);

      await expect(service.update(999, updateDto)).rejects.toThrow(NotFoundException);
    });

    it('should throw BadRequestException when updating to existing combination', async () => {
      const updateDto = {
        producto_id: 2,
        proveedor_id: 1,
      };

      const existingRelation = { ...mockProductoProveedor, id: 2 };

      mockProductoProveedorRepository.findOne
        .mockResolvedValueOnce(mockProductoProveedor)
        .mockResolvedValueOnce(existingRelation);

      await expect(service.update(1, updateDto)).rejects.toThrow(BadRequestException);
    });

    it('should allow update if combination is the same record', async () => {
      const updateDto = {
        precio_proveedor: 150,
      };

      const updatedRecord = { ...mockProductoProveedor, precio_proveedor: 150 };

      mockProductoProveedorRepository.findOne
        .mockResolvedValueOnce(mockProductoProveedor)
        .mockResolvedValueOnce(null)
        .mockResolvedValueOnce(updatedRecord);
      mockProductoProveedorRepository.save.mockResolvedValue(updatedRecord);

      const result = await service.update(1, updateDto);

      expect(result).toBeDefined();
    });
  });

  describe('remove', () => {
    it('should soft delete producto-proveedor relation', async () => {
      const deletedRelation = { ...mockProductoProveedor, deleted_at: new Date() };

      mockProductoProveedorRepository.findOne.mockResolvedValue(mockProductoProveedor);
      mockProductoProveedorRepository.save.mockResolvedValue(deletedRelation);

      await service.remove(1);

      expect(mockProductoProveedorRepository.save).toHaveBeenCalled();
      expect(mockProductoProveedorRepository.save).toHaveBeenCalledWith(
        expect.objectContaining({ deleted_at: expect.any(Date) }),
      );
    });

    it('should throw NotFoundException when relation does not exist', async () => {
      mockProductoProveedorRepository.findOne.mockResolvedValue(null);

      await expect(service.remove(999)).rejects.toThrow(NotFoundException);
    });

    it('should not remove already deleted relation', async () => {
      const deletedRelation = { ...mockProductoProveedor, deleted_at: new Date() };
      mockProductoProveedorRepository.findOne.mockResolvedValue(deletedRelation);

      await expect(service.remove(1)).rejects.toThrow(NotFoundException);
    });
  });
});

