import { MovimientosStockController } from './movimientos-stock.controller';
import { MovimientosStockService } from './movimientos-stock.service';
import { RequestWithUser } from '../users/interface/request-user';
import { MovimientoStockEntity } from 'src/database/core/movimientos-stock.entity';
import { TipoMovimientoStock } from 'src/database/core/enums/TipoMovimientoStock.enum';

describe('MovimientosStockController', () => {
  let controller: MovimientosStockController;
  let service: MovimientosStockService;
  let mockService: {
    create: jest.Mock;
    getMovimientosByEmpresa: jest.Mock;
    getMovimientosBySucursal: jest.Mock;
    getAllMovimientos: jest.Mock;
    realizarAjusteStock: jest.Mock;
    getMovimientosByProducto: jest.Mock;
  };

  const mockUser = {
    id: 1,
    empresa: { id: 1 },
    sucursales: [{ id: 1, nombre: 'Sucursal 1' }, { id: 2, nombre: 'Sucursal 2' }],
  };

  const mockRequest: Partial<RequestWithUser> = {
    user: mockUser as any,
  };

  beforeEach(() => {
    jest.clearAllMocks();

    mockService = {
      create: jest.fn(),
      getMovimientosByEmpresa: jest.fn(),
      getMovimientosBySucursal: jest.fn(),
      getAllMovimientos: jest.fn(),
      realizarAjusteStock: jest.fn(),
      getMovimientosByProducto: jest.fn(),
    };

    controller = new MovimientosStockController(mockService as unknown as MovimientosStockService);
    service = mockService as unknown as MovimientosStockService;
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
    expect(service).toBeDefined();
  });

  it('should create a movimiento', async () => {
    const dto = { cantidad: 1 } as any;
    const movimiento = { id: 1 } as MovimientoStockEntity;
    mockService.create.mockResolvedValue(movimiento);

    const result = await controller.create(dto);

    expect(result).toBe(movimiento);
    expect(mockService.create).toHaveBeenCalledWith(dto);
  });

  it('should get movimientos by empresa for company user', async () => {
    const movimientos = [{ id: 1 }] as MovimientoStockEntity[];
    mockService.getMovimientosBySucursal.mockResolvedValue(movimientos);

    const result = await controller.getAllMovimientos(mockRequest as RequestWithUser);

    expect(result).toBe(movimientos);
    expect(mockService.getMovimientosBySucursal).toHaveBeenCalledWith([1, 2]);
    expect(mockService.getAllMovimientos).not.toHaveBeenCalled();
  });

  it('should fallback to all movimientos for superadmin', async () => {
    const movimientos = [{ id: 1 }] as MovimientoStockEntity[];
    mockService.getAllMovimientos.mockResolvedValue(movimientos);

    const result = await controller.getAllMovimientos({ user: { ...mockUser, empresa: null } } as RequestWithUser);

    expect(result).toBe(movimientos);
    expect(mockService.getAllMovimientos).toHaveBeenCalledTimes(1);
  });

  it('should realizar ajuste stock', async () => {
    const movimiento = { id: 1, cantidad: -5 } as MovimientoStockEntity;
    mockService.realizarAjusteStock.mockResolvedValue(movimiento);

    const result = await controller.realizarAjusteStock(10, { tipo_ajuste: 'disminucion', cantidad: 5, motivo: 'Test' }, mockRequest as RequestWithUser);

    expect(result).toBe(movimiento);
    expect(mockService.realizarAjusteStock).toHaveBeenCalledWith({
      tipo_movimiento: TipoMovimientoStock.AJUSTE_MANUAL,
      descripcion: 'Test',
      cantidad: -5,
      producto_id: 10,
    });
  });

  it('should get movimientos by producto with empresa', async () => {
    const movimientos = [{ id: 2 }] as MovimientoStockEntity[];
    mockService.getMovimientosByProducto.mockResolvedValue(movimientos);

    const result = await controller.getMovimientosByProducto(5, mockRequest as RequestWithUser);

    expect(result).toBe(movimientos);
    expect(mockService.getMovimientosByProducto).toHaveBeenCalledWith(5);
  });
});
