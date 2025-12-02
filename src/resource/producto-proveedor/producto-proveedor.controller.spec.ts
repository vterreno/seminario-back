import { Test, TestingModule } from '@nestjs/testing';
import { ProductoProveedorController } from './producto-proveedor.controller';
import { ProductoProveedorService } from './producto-proveedor.service';
import { AuthGuard } from 'src/middlewares/auth.middleware';
import { CreateProductoProveedorDto } from './dto/create-producto-proveedor.dto';
import { UpdateProductoProveedorDto } from './dto/update-producto-proveedor.dto';

describe('ProductoProveedorController', () => {
  let controller: ProductoProveedorController;
  let service: ProductoProveedorService;

  const mockProductoProveedorService = {
    findByProveedor: jest.fn(),
    findByProducto: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  };

  const mockProductoProveedor = {
    id: 1,
    producto_id: 1,
    proveedor_id: 1,
    precio_proveedor: 100,
    codigo_proveedor: 'PROV-001',
    producto: {
      id: 1,
      nombre: 'Producto Test',
    },
    proveedor: {
      id: 1,
      nombre: 'Proveedor Test',
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ProductoProveedorController],
      providers: [
        {
          provide: ProductoProveedorService,
          useValue: mockProductoProveedorService,
        },
      ],
    })
      .overrideGuard(AuthGuard)
      .useValue({ canActivate: jest.fn(() => true) })
      .compile();

    controller = module.get<ProductoProveedorController>(ProductoProveedorController);
    service = module.get<ProductoProveedorService>(ProductoProveedorService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('findByProveedor', () => {
    it('should return all products for a proveedor', async () => {
      const proveedorId = 1;
      const productosProveedor = [mockProductoProveedor];
      mockProductoProveedorService.findByProveedor.mockResolvedValue(productosProveedor);

      const result = await controller.findByProveedor(proveedorId);

      expect(result).toEqual(productosProveedor);
      expect(mockProductoProveedorService.findByProveedor).toHaveBeenCalledWith(proveedorId);
    });

    it('should return empty array when proveedor has no products', async () => {
      mockProductoProveedorService.findByProveedor.mockResolvedValue([]);

      const result = await controller.findByProveedor(1);

      expect(result).toEqual([]);
    });
  });

  describe('findByProducto', () => {
    it('should return all proveedores for a product', async () => {
      const productoId = 1;
      const productosProveedor = [mockProductoProveedor];
      mockProductoProveedorService.findByProducto.mockResolvedValue(productosProveedor);

      const result = await controller.findByProducto(productoId);

      expect(result).toEqual(productosProveedor);
      expect(mockProductoProveedorService.findByProducto).toHaveBeenCalledWith(productoId);
    });

    it('should return empty array when product has no proveedores', async () => {
      mockProductoProveedorService.findByProducto.mockResolvedValue([]);

      const result = await controller.findByProducto(1);

      expect(result).toEqual([]);
    });
  });

  describe('findOne', () => {
    it('should return producto-proveedor by id', async () => {
      mockProductoProveedorService.findOne.mockResolvedValue(mockProductoProveedor);

      const result = await controller.findOne(1);

      expect(result).toEqual(mockProductoProveedor);
      expect(mockProductoProveedorService.findOne).toHaveBeenCalledWith({
        where: { id: 1 },
        relations: ['producto', 'producto.marca', 'producto.categoria', 'producto.unidadMedida', 'proveedor'],
      });
    });
  });

  describe('create', () => {
    it('should create producto-proveedor relation', async () => {
      const createDto: CreateProductoProveedorDto = {
        producto_id: 1,
        proveedor_id: 1,
        precio_proveedor: 100,
        codigo_proveedor: 'PROV-001',
      };

      mockProductoProveedorService.create.mockResolvedValue(mockProductoProveedor);

      const result = await controller.create(createDto);

      expect(result).toEqual(mockProductoProveedor);
      expect(mockProductoProveedorService.create).toHaveBeenCalledWith(createDto);
    });
  });

  describe('update', () => {
    it('should update producto-proveedor relation', async () => {
      const updateDto: UpdateProductoProveedorDto = {
        precio_proveedor: 150,
        codigo_proveedor: 'PROV-002',
      };

      const updatedProductoProveedor = { ...mockProductoProveedor, ...updateDto };
      mockProductoProveedorService.update.mockResolvedValue(updatedProductoProveedor);

      const result = await controller.update(1, updateDto);

      expect(result).toEqual(updatedProductoProveedor);
      expect(mockProductoProveedorService.update).toHaveBeenCalledWith(1, updateDto);
    });
  });

  describe('remove', () => {
    it('should remove producto-proveedor relation', async () => {
      mockProductoProveedorService.remove.mockResolvedValue(undefined);

      const result = await controller.remove(1);

      expect(result).toEqual({ message: 'Relación producto-proveedor eliminada correctamente' });
      expect(mockProductoProveedorService.remove).toHaveBeenCalledWith(1);
    });
  });
});

