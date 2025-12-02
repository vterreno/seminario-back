import { Test, TestingModule } from '@nestjs/testing';
import { PagoController } from './pago.controller';
import { PagoService } from './pago.service';
import { AuthGuard } from 'src/middlewares/auth.middleware';
import { PermissionsGuard } from 'src/middlewares/permission.middleware';
import { BadRequestException } from '@nestjs/common';

describe('PagoController', () => {
  let controller: PagoController;
  let service: PagoService;

  const mockPagoService = {
    getAllPagos: jest.fn(),
    getPagosByEmpresa: jest.fn(),
    findById: jest.fn(),
    createPago: jest.fn(),
    updatePago: jest.fn(),
    deletePago: jest.fn(),
    bulkDeletePagos: jest.fn(),
  };

  const mockUser = {
    id: 1,
    email: 'test@test.com',
    role: { nombre: 'Admin' },
    empresa: { id: 1 },
  };

  const mockSuperAdminUser = {
    id: 2,
    email: 'superadmin@test.com',
    role: { nombre: 'SuperAdmin' },
    empresa: null,
  };

  const mockPago = {
    id: 1,
    fecha_pago: new Date(),
    monto_pago: 1000,
    metodo_pago: 'efectivo',
    sucursal: { id: 1 },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PagoController],
      providers: [
        {
          provide: PagoService,
          useValue: mockPagoService,
        },
      ],
    })
      .overrideGuard(AuthGuard)
      .useValue({ canActivate: jest.fn(() => true) })
      .overrideGuard(PermissionsGuard)
      .useValue({ canActivate: jest.fn(() => true) })
      .compile();

    controller = module.get<PagoController>(PagoController);
    service = module.get<PagoService>(PagoService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getAllPagos', () => {
    it('should return all pagos for superadmin', async () => {
      const req = { user: mockSuperAdminUser } as any;
      const pagos = [mockPago];
      mockPagoService.getAllPagos.mockResolvedValue(pagos);

      const result = await controller.getAllPagos(req);

      expect(result).toEqual(pagos);
      expect(mockPagoService.getAllPagos).toHaveBeenCalled();
    });

    it('should return pagos filtered by empresa for regular users', async () => {
      const req = { user: mockUser } as any;
      const pagos = [mockPago];
      mockPagoService.getPagosByEmpresa.mockResolvedValue(pagos);

      const result = await controller.getAllPagos(req);

      expect(result).toEqual(pagos);
      expect(mockPagoService.getPagosByEmpresa).toHaveBeenCalledWith(1);
    });

    it('should return empty array when user has no empresa', async () => {
      const req = { user: { ...mockUser, empresa: null } } as any;

      const result = await controller.getAllPagos(req);

      expect(result).toEqual([]);
    });
  });

  describe('getPagoById', () => {
    it('should return pago by id', async () => {
      mockPagoService.findById.mockResolvedValue(mockPago);

      const result = await controller.getPagoById(1);

      expect(result).toEqual(mockPago);
    });
  });

  describe('createPago', () => {
    it('should create pago', async () => {
      const req = { user: mockUser } as any;
      const createDto = {
        fecha_pago: new Date(),
        monto_pago: 1000,
        metodo_pago: 'efectivo',
        sucursal_id: 1,
      } as any;

      mockPagoService.createPago.mockResolvedValue(mockPago);

      const result = await controller.createPago(createDto, req);

      expect(result).toEqual(mockPago);
    });
  });

  describe('updatePago', () => {
    it('should update pago', async () => {
      const req = { user: mockUser } as any;
      const updateDto = { monto_pago: 1500 } as any;
      const updatedPago = { ...mockPago, monto_pago: 1500 };

      mockPagoService.updatePago.mockResolvedValue(updatedPago);

      const result = await controller.updatePago(1, updateDto, req);

      expect(result).toEqual(updatedPago);
    });
  });

  describe('deletePago', () => {
    it('should delete pago', async () => {
      const req = { user: mockUser } as any;
      mockPagoService.deletePago.mockResolvedValue(undefined);

      const result = await controller.deletePago(1, req);

      expect(result).toEqual({ message: 'Pago eliminado exitosamente' });
    });
  });

  describe('bulkDeletePagos', () => {
    it('should bulk delete pagos', async () => {
      const req = { user: mockUser } as any;
      const ids = [1, 2, 3];
      mockPagoService.bulkDeletePagos.mockResolvedValue(undefined);

      const result = await controller.bulkDeletePagos({ ids }, req);

      expect(result).toEqual({ message: '3 pagos eliminados exitosamente' });
    });
  });
});
