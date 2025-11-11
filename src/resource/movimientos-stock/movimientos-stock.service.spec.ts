import { BadRequestException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { MovimientoStockEntity } from 'src/database/core/movimientos-stock.entity';
import { ProductoEntity } from 'src/database/core/producto.entity';
import { TipoMovimientoStock } from 'src/database/core/enums/TipoMovimientoStock.enum';
import { MovimientosStockService } from './movimientos-stock.service';

describe('MovimientosStockService', () => {
  let service: MovimientosStockService;
  let movimientoStockRepository: Record<string, jest.Mock>;
  let productoRepository: Record<string, jest.Mock>;
  let manager: Record<string, jest.Mock>;

  beforeEach(async () => {
    manager = {
      findOne: jest.fn(),
      create: jest.fn(),
      save: jest.fn(),
    } as any;

    movimientoStockRepository = {
      find: jest.fn(),
      manager: { transaction: jest.fn(async (cb: any) => cb(manager)) },
    } as any;

    productoRepository = {
      findOne: jest.fn(),
    } as any;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MovimientosStockService,
        {
          provide: getRepositoryToken(MovimientoStockEntity),
          useValue: movimientoStockRepository,
        },
        {
          provide: getRepositoryToken(ProductoEntity),
          useValue: productoRepository,
        },
      ],
    }).compile();

    service = module.get(MovimientosStockService);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  const buildProducto = (overrides: Partial<ProductoEntity> = {}): ProductoEntity => ({
    id: 1,
    empresa_id: 2,
    stock: 10,
    ...overrides,
  }) as ProductoEntity;

  it('creates a purchase movement increasing stock', async () => {
    const producto = buildProducto({ stock: 5 });
    manager.findOne.mockResolvedValue(producto);
    const movimientoGuardado = { id: 20 } as MovimientoStockEntity;
    manager.create.mockImplementation((_entity, data) => data);
    manager.save.mockImplementation(async (entityClass, item) => {
      if (entityClass === MovimientoStockEntity) {
        return movimientoGuardado;
      }
      return item;
    });

    const result = await service.create({
      producto_id: producto.id,
      empresa_id: producto.empresa_id,
      tipo_movimiento: TipoMovimientoStock.COMPRA,
      cantidad: 3,
    });

    expect(result).toBe(movimientoGuardado);
    expect(manager.create).toHaveBeenCalledWith(MovimientoStockEntity, expect.objectContaining({
      cantidad: 3,
      stock_resultante: 8,
      producto_id: producto.id,
    }));
    expect(manager.save).toHaveBeenCalledWith(ProductoEntity, expect.objectContaining({ stock: 8 }));
  });

  it('throws when product is not found', async () => {
    manager.findOne.mockResolvedValue(null);

    await expect(
      service.create({ producto_id: 1, empresa_id: 1, tipo_movimiento: TipoMovimientoStock.COMPRA }),
    ).rejects.toThrow(new BadRequestException('Producto no encontrado o no pertenece a la empresa.'));
  });

  it('throws when tipo de movimiento es inválido', async () => {
    manager.findOne.mockResolvedValue(buildProducto());

    await expect(
      service.create({ producto_id: 1, empresa_id: 2, tipo_movimiento: 'INVALIDO' as any }),
    ).rejects.toThrow(new BadRequestException('Tipo de movimiento no válido.'));
  });

  it('throws when resulting stock would be negative', async () => {
    manager.findOne.mockResolvedValue(buildProducto({ stock: 2 }));

    await expect(
      service.create({
        producto_id: 1,
        empresa_id: 2,
        tipo_movimiento: TipoMovimientoStock.VENTA,
        cantidad: 5,
      }),
    ).rejects.toThrow('No se puede realizar el disminución. Stock actual: 2, cantidad a quitar: 5. El stock resultante sería: -3');
  });

  it('wraps unexpected errors with generic message', async () => {
    manager.findOne.mockResolvedValue(buildProducto());
    manager.create.mockImplementation((_entity, data) => data);
    manager.save.mockImplementation(async () => {
      throw new Error('db fail');
    });
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => undefined);

    await expect(
      service.create({
        producto_id: 1,
        empresa_id: 2,
        tipo_movimiento: TipoMovimientoStock.STOCK_APERTURA,
        cantidad: 1,
      }),
    ).rejects.toThrow(new BadRequestException('Error interno al crear el movimiento de stock.'));

    expect(consoleSpy).toHaveBeenCalledWith('Error al crear movimiento de stock:', expect.any(Error));
    consoleSpy.mockRestore();
  });

  it('filters movimientos by empresa', async () => {
    const records = [{} as MovimientoStockEntity];
    movimientoStockRepository.find.mockResolvedValue(records);

    const result = await service.getMovimientosByEmpresa(3);

    expect(movimientoStockRepository.find).toHaveBeenCalledWith({
      where: { empresa_id: 3 },
      relations: ['producto'],
      order: { fecha: 'DESC' },
    });
    expect(result).toBe(records);
  });

  it('retrieves all movimientos', async () => {
    const records = [{} as MovimientoStockEntity];
    movimientoStockRepository.find.mockResolvedValue(records);

    const result = await service.getAllMovimientos();

    expect(movimientoStockRepository.find).toHaveBeenCalledWith({
      relations: ['empresa', 'producto'],
      order: { fecha: 'DESC' },
    });
    expect(result).toBe(records);
  });

  it('filters movimientos by producto and empresa when provided', async () => {
    const records = [{} as MovimientoStockEntity];
    movimientoStockRepository.find.mockResolvedValue(records);

    const result = await service.getMovimientosByProducto(9, 4);

    expect(movimientoStockRepository.find).toHaveBeenCalledWith({
      where: { producto_id: 9, empresa_id: 4 },
      relations: ['producto'],
      order: { fecha: 'DESC' },
    });
    expect(result).toBe(records);
  });

  it('retrieves movimientos by producto without empresa filter', async () => {
    const records = [{} as MovimientoStockEntity];
    movimientoStockRepository.find.mockResolvedValue(records);

    await service.getMovimientosByProducto(5);

    expect(movimientoStockRepository.find).toHaveBeenCalledWith({
      where: { producto_id: 5 },
      relations: ['producto'],
      order: { fecha: 'DESC' },
    });
  });

  it('realiza ajuste de stock usando empresa_id del payload', async () => {
    const data = { empresa_id: 8 } as any;
    const createSpy = jest.spyOn(service, 'create').mockResolvedValue({} as any);

    await service.realizarAjusteStock(data);

    expect(createSpy).toHaveBeenCalledWith(data);
  });

  it('realiza ajuste obteniendo empresa del producto cuando falta', async () => {
    productoRepository.findOne.mockResolvedValue({ empresa_id: 9 });
    const createSpy = jest.spyOn(service, 'create').mockResolvedValue({} as any);

    await service.realizarAjusteStock({ producto_id: 3 } as any);

    expect(productoRepository.findOne).toHaveBeenCalledWith({
      where: { id: 3 },
      select: ['id', 'empresa_id'],
    });
    expect(createSpy).toHaveBeenCalledWith({ producto_id: 3, empresa_id: 9 });
  });
});
