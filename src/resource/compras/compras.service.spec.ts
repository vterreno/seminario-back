import { Test, TestingModule } from '@nestjs/testing';
import { ComprasService } from './compras.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { CompraEntity } from 'src/database/core/compra.entity';
import { sucursalEntity } from 'src/database/core/sucursal.entity';
import { ProductoProveedorEntity } from 'src/database/core/producto-proveedor.entity';
import { ProductoEntity } from 'src/database/core/producto.entity';
import { DetalleCompraService } from '../detalle-compra/detalle-compra.service';
import { MovimientosStockService } from '../movimientos-stock/movimientos-stock.service';
import { PagoService } from '../pago/pago.service';
import { ProductoProveedorService } from '../producto-proveedor/producto-proveedor.service';
import { ProductosService } from '../productos/productos.service';
import { CostoAdicionalService } from '../costo-adicional/costo-adicional.service';
import { DataSource } from 'typeorm';
import { NotFoundException, BadRequestException } from '@nestjs/common';
import { EstadoCompra } from 'src/database/core/enums/EstadoCompra.enum';

describe('ComprasService', () => {
  let service: ComprasService;
  let compraRepository: any;
  let sucursalRepository: any;
  let productoProveedorRepository: any;
  let productoRepository: any;
  let detalleCompraService: any;
  let movimientosStockService: any;
  let pagoService: any;
  let costoAdicionalService: any;
  let dataSource: any;

  const mockCompraRepository = {
    find: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    softDelete: jest.fn(),
    createQueryBuilder: jest.fn(() => ({
      delete: jest.fn().mockReturnThis(),
      from: jest.fn().mockReturnThis(),
      where: jest.fn().mockReturnThis(),
      execute: jest.fn(),
    })),
  };

  const mockSucursalRepository = {
    find: jest.fn(),
    findOne: jest.fn(),
  };

  const mockProductoProveedorRepository = {
    find: jest.fn(),
    findOne: jest.fn(),
  };

  const mockProductoRepository = {
    find: jest.fn(),
    findOne: jest.fn(),
    save: jest.fn(),
    increment: jest.fn(),
  };

  const mockDetalleCompraService = {
    create: jest.fn(),
    createDetalle: jest.fn(),
    findAll: jest.fn(),
  };

  const mockMovimientosStockService = {
    create: jest.fn(),
    createMovimientoRegistro: jest.fn(),
  };

  const mockPagoService = {
    create: jest.fn(),
    createPago: jest.fn(),
    findAll: jest.fn(),
  };

  const mockProductoProveedorService = {
    findOne: jest.fn(),
  };

  const mockProductosService = {
    findOne: jest.fn(),
    update: jest.fn(),
  };

  const mockCostoAdicionalService = {
    create: jest.fn(),
    createCostoAdicional: jest.fn(),
    deleteCostosByCompraId: jest.fn(),
  };

  const mockDataSource = {
    transaction: jest.fn(),
    createQueryRunner: jest.fn(() => ({
      connect: jest.fn(),
      startTransaction: jest.fn(),
      commitTransaction: jest.fn(),
      rollbackTransaction: jest.fn(),
      release: jest.fn(),
      manager: {
        findOne: jest.fn(),
        find: jest.fn(),
        update: jest.fn(),
        save: jest.fn(),
        create: jest.fn((entity, data) => data),
        increment: jest.fn(),
      },
    })),
  };

  const mockCompra: CompraEntity = {
    id: 1,
    numero_compra: 1,
    fecha_compra: new Date(),
    monto_total: 1000,
    sucursal: { id: 1, numero_compra: 0 } as sucursalEntity,
    contacto: null,
    estado: EstadoCompra.PENDIENTE_PAGO,
    numero_factura: 'FAC-001',
    observaciones: 'Test',
    detalles: [],
    pago: null,
    costosAdicionales: [],
    created_at: new Date(),
    updated_at: new Date(),
    deleted_at: null,
  } as CompraEntity;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ComprasService,
        {
          provide: getRepositoryToken(CompraEntity),
          useValue: mockCompraRepository,
        },
        {
          provide: getRepositoryToken(sucursalEntity),
          useValue: mockSucursalRepository,
        },
        {
          provide: getRepositoryToken(ProductoProveedorEntity),
          useValue: mockProductoProveedorRepository,
        },
        {
          provide: getRepositoryToken(ProductoEntity),
          useValue: mockProductoRepository,
        },
        {
          provide: DetalleCompraService,
          useValue: mockDetalleCompraService,
        },
        {
          provide: MovimientosStockService,
          useValue: mockMovimientosStockService,
        },
        {
          provide: PagoService,
          useValue: mockPagoService,
        },
        {
          provide: ProductoProveedorService,
          useValue: mockProductoProveedorService,
        },
        {
          provide: ProductosService,
          useValue: mockProductosService,
        },
        {
          provide: CostoAdicionalService,
          useValue: mockCostoAdicionalService,
        },
        {
          provide: DataSource,
          useValue: mockDataSource,
        },
      ],
    }).compile();

    service = module.get<ComprasService>(ComprasService);
    compraRepository = module.get(getRepositoryToken(CompraEntity));
    sucursalRepository = module.get(getRepositoryToken(sucursalEntity));
    productoProveedorRepository = module.get(getRepositoryToken(ProductoProveedorEntity));
    productoRepository = module.get(getRepositoryToken(ProductoEntity));
    detalleCompraService = module.get(DetalleCompraService);
    movimientosStockService = module.get(MovimientosStockService);
    pagoService = module.get(PagoService);
    costoAdicionalService = module.get(CostoAdicionalService);
    dataSource = module.get(DataSource);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getAllCompras', () => {
    it('should return all compras with relations', async () => {
      const compras = [mockCompra];
      mockCompraRepository.find.mockResolvedValue(compras);

      const result = await service.getAllCompras();

      expect(result).toEqual(compras);
      expect(mockCompraRepository.find).toHaveBeenCalledWith({
        relations: ['sucursal', 'sucursal.empresa', 'contacto', 'costosAdicionales'],
      });
    });

    it('should return empty array when no compras exist', async () => {
      mockCompraRepository.find.mockResolvedValue([]);

      const result = await service.getAllCompras();

      expect(result).toEqual([]);
    });
  });

  describe('getComprasByEmpresa', () => {
    it('should return compras filtered by empresa', async () => {
      const empresaId = 1;
      const sucursales = [{ id: 1 }, { id: 2 }];
      const compras = [mockCompra];

      mockSucursalRepository.find.mockResolvedValue(sucursales);
      mockCompraRepository.find.mockResolvedValue(compras);

      const result = await service.getComprasByEmpresa(empresaId);

      expect(result).toEqual(compras);
      expect(mockSucursalRepository.find).toHaveBeenCalledWith({
        where: { empresa_id: empresaId }
      });
    });

    it('should return empty array when empresa has no sucursales', async () => {
      const empresaId = 1;
      mockSucursalRepository.find.mockResolvedValue([]);

      const result = await service.getComprasByEmpresa(empresaId);

      expect(result).toEqual([]);
    });
  });

  describe('getComprasBySucursal', () => {
    it('should return compras filtered by sucursal ids', async () => {
      const sucursalIds = [1, 2];
      const compras = [mockCompra];

      mockCompraRepository.find.mockResolvedValue(compras);

      const result = await service.getComprasBySucursal(sucursalIds);

      expect(result).toEqual(compras);
    });
  });

  describe('findById', () => {
    it('should return compra with all relations', async () => {
      mockCompraRepository.findOne.mockResolvedValue(mockCompra);

      const result = await service.findById(1);

      expect(result).toEqual(mockCompra);
      expect(mockCompraRepository.findOne).toHaveBeenCalledWith({
        where: { id: 1 },
        relations: ['sucursal', 'contacto', 'detalles', 'detalles.producto', 'detalles.producto.producto', 'pago', 'costosAdicionales'],
      });
    });
  });

  describe('findByIdWithEmpresa', () => {
    it('should return compra with empresa relation', async () => {
      mockCompraRepository.findOne.mockResolvedValue(mockCompra);

      const result = await service.findByIdWithEmpresa(1);

      expect(result).toEqual(mockCompra);
      expect(mockCompraRepository.findOne).toHaveBeenCalledWith({
        where: { id: 1 },
        relations: ['sucursal', 'sucursal.empresa', 'contacto', 'detalles', 'pago', 'costosAdicionales'],
      });
    });
  });

  describe('findByIdWithSucursalEmpresa', () => {
    it('should return compra with sucursal and empresa relation', async () => {
      mockCompraRepository.findOne.mockResolvedValue(mockCompra);

      const result = await service.findByIdWithSucursalEmpresa(1);

      expect(result).toEqual(mockCompra);
      expect(mockCompraRepository.findOne).toHaveBeenCalledWith({
        where: { id: 1 },
        relations: ['sucursal', 'sucursal.empresa'],
      });
    });
  });

  describe('asociarPagoACompra', () => {
    it('should associate payment to compra successfully', async () => {
      const compraConPago = { ...mockCompra, estado: EstadoCompra.PAGADO };
      const pagoData = {
        fecha_pago: new Date(),
        monto_pago: 1000,
        metodo_pago: 'efectivo' as const,
        sucursal_id: 1,
      };
      const savedPago = { id: 1, ...pagoData };

      mockCompraRepository.findOne
        .mockResolvedValueOnce(mockCompra)
        .mockResolvedValueOnce(compraConPago);
      mockPagoService.createPago.mockResolvedValue(savedPago);
      mockCompraRepository.update.mockResolvedValue({ affected: 1 });

      const result = await service.asociarPagoACompra(1, pagoData);

      expect(result).toEqual(compraConPago);
      expect(mockPagoService.createPago).toHaveBeenCalled();
      expect(mockCompraRepository.update).toHaveBeenCalled();
    });

    it('should throw NotFoundException when compra does not exist', async () => {
      mockCompraRepository.findOne.mockResolvedValue(null);

      const pagoData = {
        fecha_pago: new Date(),
        monto_pago: 1000,
        metodo_pago: 'efectivo' as const,
        sucursal_id: 1,
      };

      await expect(service.asociarPagoACompra(1, pagoData)).rejects.toThrow(NotFoundException);
    });

    it('should throw BadRequestException when compra is not in PENDIENTE_PAGO state', async () => {
      const compraPagada = { ...mockCompra, estado: EstadoCompra.PAGADO };
      mockCompraRepository.findOne.mockResolvedValue(compraPagada);

      const pagoData = {
        fecha_pago: new Date(),
        monto_pago: 1000,
        metodo_pago: 'efectivo' as const,
        sucursal_id: 1,
      };

      await expect(service.asociarPagoACompra(1, pagoData)).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException when compra already has a payment', async () => {
      const compraConPago = { ...mockCompra, pago: { id: 1 } };
      mockCompraRepository.findOne.mockResolvedValue(compraConPago);

      const pagoData = {
        fecha_pago: new Date(),
        monto_pago: 1000,
        metodo_pago: 'efectivo' as const,
        sucursal_id: 1,
      };

      await expect(service.asociarPagoACompra(1, pagoData)).rejects.toThrow(BadRequestException);
    });
  });

  describe('softDeleteCompra', () => {
    it('should soft delete compra', async () => {
      mockCompraRepository.softDelete.mockResolvedValue({ affected: 1 });
      mockCompraRepository.findOne.mockResolvedValue({ ...mockCompra, deleted_at: new Date() });

      const result = await service.softDeleteCompra(1);

      expect(mockCompraRepository.softDelete).toHaveBeenCalledWith(1);
      expect(result.deleted_at).toBeDefined();
    });
  });

  describe('bulkSoftDeleteCompras', () => {
    it('should soft delete multiple compras', async () => {
      const ids = [1, 2, 3];
      mockCompraRepository.softDelete.mockResolvedValue({ affected: 3 });

      await service.bulkSoftDeleteCompras(ids);

      expect(mockCompraRepository.softDelete).toHaveBeenCalledWith(ids);
    });
  });
});
