import { Test, TestingModule } from '@nestjs/testing';
import { VentasService } from './ventas.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ventaEntity } from 'src/database/core/venta.entity';
import { sucursalEntity } from 'src/database/core/sucursal.entity';
import { PagoService } from '../pago/pago.service';
import { DetalleVentaService } from '../detalle-venta/detalle-venta.service';
import { MovimientosStockService } from '../movimientos-stock/movimientos-stock.service';
import { NotFoundException } from '@nestjs/common';

describe('VentasService', () => {
  let service: VentasService;
  let ventaRepository: any;
  let sucursalRepository: any;
  let pagoService: any;
  let detalleVentaService: any;
  let movimientosStockService: any;

  const mockVentaRepository = {
    find: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn((dto) => dto),
    save: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  };

  const mockSucursalRepository = {
    find: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
  };

  const mockPagoService = {
    createPago: jest.fn(),
    findAll: jest.fn(),
  };

  const mockDetalleVentaService = {
    createDetalle: jest.fn(),
    findAll: jest.fn(),
  };

  const mockMovimientosStockService = {
    createMovimientoRegistro: jest.fn(),
    create: jest.fn(),
    productoRepository: {
      findOne: jest.fn(),
    },
  };

  const mockVenta: ventaEntity = {
    id: 1,
    numero_venta: 1,
    fecha_venta: new Date(),
    monto_total: 1000,
    sucursal: { id: 1, numero_venta: 0 } as sucursalEntity,
    contacto: null,
    pago: { id: 1 } as any,
    detalles: [],
    created_at: new Date(),
    updated_at: new Date(),
    deleted_at: null,
  } as ventaEntity;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        VentasService,
        {
          provide: getRepositoryToken(ventaEntity),
          useValue: mockVentaRepository,
        },
        {
          provide: getRepositoryToken(sucursalEntity),
          useValue: mockSucursalRepository,
        },
        {
          provide: PagoService,
          useValue: mockPagoService,
        },
        {
          provide: DetalleVentaService,
          useValue: mockDetalleVentaService,
        },
        {
          provide: MovimientosStockService,
          useValue: mockMovimientosStockService,
        },
      ],
    }).compile();

    service = module.get<VentasService>(VentasService);
    ventaRepository = module.get(getRepositoryToken(ventaEntity));
    sucursalRepository = module.get(getRepositoryToken(sucursalEntity));
    pagoService = module.get(PagoService);
    detalleVentaService = module.get(DetalleVentaService);
    movimientosStockService = module.get(MovimientosStockService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getAllVentas', () => {
    it('should return all ventas', async () => {
      const ventas = [mockVenta];
      mockVentaRepository.find.mockResolvedValue(ventas);

      const result = await service.getAllVentas();

      expect(result).toEqual(ventas);
    });
  });

  describe('getVentasByEmpresa', () => {
    it('should return ventas filtered by empresa', async () => {
      const sucursales = [{ id: 1 }, { id: 2 }];
      const ventas = [mockVenta];

      mockSucursalRepository.find.mockResolvedValue(sucursales);
      mockVentaRepository.find.mockResolvedValue(ventas);

      const result = await service.getVentasByEmpresa(1);

      expect(result).toEqual(ventas);
    });

    it('should return empty array when empresa has no sucursales', async () => {
      mockSucursalRepository.find.mockResolvedValue([]);

      const result = await service.getVentasByEmpresa(1);

      expect(result).toEqual([]);
    });
  });

  describe('getVentasBySucursal', () => {
    it('should return ventas filtered by sucursal', async () => {
      const ventas = [mockVenta];
      mockVentaRepository.find.mockResolvedValue(ventas);

      const result = await service.getVentasBySucursal([1, 2]);

      expect(result).toEqual(ventas);
    });
  });

  describe('findById', () => {
    it('should return venta by id', async () => {
      mockVentaRepository.findOne.mockResolvedValue(mockVenta);

      const result = await service.findById(1);

      expect(result).toEqual(mockVenta);
    });
  });
});
