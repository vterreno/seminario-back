import { Test, TestingModule } from '@nestjs/testing';
import { ProductosController } from './productos.controller';
import { ProductosService } from './productos.service';
import { AuthGuard } from 'src/middlewares/auth.middleware';
import { PermissionsGuard } from 'src/middlewares/permission.middleware';

describe('ProductosController', () => {
  let controller: ProductosController;
  let service: ProductosService;

  const mockService = {
    getAllProductos: jest.fn(),
    getProductosByEmpresa: jest.fn(),
    findById: jest.fn(),
    createProducto: jest.fn(),
    updateProducto: jest.fn(),
    deleteProducto: jest.fn(),
    bulkDeleteProductos: jest.fn(),
    bulkUpdateProductoStatus: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ProductosController],
      providers: [
        {
          provide: ProductosService,
          useValue: mockService,
        },
      ],
    })
    .overrideGuard(AuthGuard)
    .useValue({ canActivate: () => true })
    .overrideGuard(PermissionsGuard)
    .useValue({ canActivate: () => true })
    .compile();

    controller = module.get<ProductosController>(ProductosController);
    service = module.get<ProductosService>(ProductosService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
