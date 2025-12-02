import { Test, TestingModule } from '@nestjs/testing';
import { PagoService } from './pago.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { pagoEntity } from 'src/database/core/pago.entity';
import { sucursalEntity } from 'src/database/core/sucursal.entity';
import { NotFoundException, BadRequestException } from '@nestjs/common';

describe('PagoService', () => {
  let service: PagoService;
  let pagoRepository: any;
  let sucursalRepository: any;

  const mockPagoRepository = {
    find: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn((dto) => dto),
    save: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    softDelete: jest.fn(),
  };

  const mockSucursalRepository = {
    find: jest.fn(),
    findOne: jest.fn(),
  };

  const mockPago: pagoEntity = {
    id: 1,
    fecha_pago: new Date(),
    monto_pago: 1000,
    metodo_pago: 'efectivo',
    sucursal: { id: 1 } as sucursalEntity,
    venta: null,
    deleted_at: null,
    created_at: new Date(),
    updated_at: new Date(),
  } as pagoEntity;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PagoService,
        {
          provide: getRepositoryToken(pagoEntity),
          useValue: mockPagoRepository,
        },
        {
          provide: getRepositoryToken(sucursalEntity),
          useValue: mockSucursalRepository,
        },
      ],
    }).compile();

    service = module.get<PagoService>(PagoService);
    pagoRepository = module.get(getRepositoryToken(pagoEntity));
    sucursalRepository = module.get(getRepositoryToken(sucursalEntity));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getAllPagos', () => {
    it('should return all pagos', async () => {
      const pagos = [mockPago];
      mockPagoRepository.find.mockResolvedValue(pagos);

      const result = await service.getAllPagos();

      expect(result).toEqual(pagos);
    });
  });

  describe('getPagosByEmpresa', () => {
    it('should return pagos filtered by empresa', async () => {
      const sucursales = [{ id: 1 }, { id: 2 }];
      const pagos = [mockPago];

      mockSucursalRepository.find.mockResolvedValue(sucursales);
      mockPagoRepository.find.mockResolvedValue(pagos);

      const result = await service.getPagosByEmpresa(1);

      expect(result).toEqual(pagos);
    });

    it('should return empty array when empresa has no sucursales', async () => {
      mockSucursalRepository.find.mockResolvedValue([]);

      const result = await service.getPagosByEmpresa(1);

      expect(result).toEqual([]);
    });
  });

  describe('getPagosBySucursal', () => {
    it('should return pagos filtered by sucursal', async () => {
      const pagos = [mockPago];
      mockPagoRepository.find.mockResolvedValue(pagos);

      const result = await service.getPagosBySucursal([1, 2]);

      expect(result).toEqual(pagos);
    });
  });

  describe('createPago', () => {
    it('should create pago successfully', async () => {
      const pagoData = {
        fecha_pago: new Date(),
        monto_pago: 1000,
        metodo_pago: 'efectivo' as const,
        sucursal: { id: 1 } as any,
      };

      mockPagoRepository.create.mockReturnValue(mockPago);
      mockPagoRepository.save.mockResolvedValue(mockPago);
      mockPagoRepository.findOne.mockResolvedValue(mockPago);

      const result = await service.createPago(pagoData);

      expect(result).toEqual(mockPago);
    });
  });

  describe('updatePago', () => {
    it('should update pago successfully', async () => {
      const updateData = { monto_pago: 1500 };
      const updatedPago = { ...mockPago, monto_pago: 1500 };

      mockPagoRepository.findOne.mockResolvedValue(mockPago);
      mockPagoRepository.update.mockResolvedValue({ affected: 1 });
      mockPagoRepository.findOne.mockResolvedValue(updatedPago);

      const result = await service.updatePago(1, updateData);

      expect(result.monto_pago).toBe(1500);
    });

    it('should throw NotFoundException when pago not found', async () => {
      mockPagoRepository.findOne.mockResolvedValue(null);

      await expect(service.updatePago(999, {})).rejects.toThrow(NotFoundException);
    });
  });

  describe('findById', () => {
    it('should return pago by id', async () => {
      mockPagoRepository.findOne.mockResolvedValue(mockPago);

      const result = await service.findById(1);

      expect(result).toEqual(mockPago);
    });

    it('should throw NotFoundException when pago not found', async () => {
      mockPagoRepository.findOne.mockResolvedValue(null);

      await expect(service.findById(999)).rejects.toThrow(NotFoundException);
    });
  });
});
