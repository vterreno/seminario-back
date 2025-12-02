import { MarcasController } from './marcas.controller';
import { MarcasService } from './marcas.service';
import { MarcaEntity } from 'src/database/core/marcas.entity';
import { BadRequestException } from '@nestjs/common';
import { RequestWithUser } from '../users/interface/request-user';

describe('MarcasController', () => {
  let controller: MarcasController;
  let service: MarcasService;
  let mockService: {
    getAllMarcas: jest.Mock;
    getMarcasByEmpresa: jest.Mock;
    findById: jest.Mock;
    createMarca: jest.Mock;
    updateMarca: jest.Mock;
    deleteMarca: jest.Mock;
    bulkDeleteMarcas: jest.Mock;
    bulkUpdateMarcaStatus: jest.Mock;
  };

  const mockMarca = {
    id: 1,
    nombre: 'Test Marca',
    descripcion: 'Test Description',
    estado: true,
    empresa_id: 1,
  } as unknown as MarcaEntity;

  const mockUser = {
    id: 1,
    email: 'test@test.com',
    empresa: { id: 1, name: 'Test Empresa' },
    role: { id: 1, nombre: 'Admin' },
    permissionCodes: ['marca_ver', 'marca_agregar', 'marca_modificar', 'marca_eliminar'],
  };

  const mockRequest: Partial<RequestWithUser> = {
    user: mockUser as any,
  };

  beforeEach(() => {
    jest.clearAllMocks();

    mockService = {
      getAllMarcas: jest.fn(),
      getMarcasByEmpresa: jest.fn(),
      findById: jest.fn(),
      createMarca: jest.fn(),
      updateMarca: jest.fn(),
      deleteMarca: jest.fn(),
      bulkDeleteMarcas: jest.fn(),
      bulkUpdateMarcaStatus: jest.fn(),
    };

    controller = new MarcasController(mockService as unknown as MarcasService);
    service = mockService as unknown as MarcasService;
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
    expect(service).toBeDefined();
  });

  describe('getAllMarcas', () => {
    it('should return marcas filtered by empresa if user has empresa', async () => {
      const mockMarcas = [mockMarca];
      mockService.getMarcasByEmpresa.mockResolvedValue(mockMarcas);

      const result = await controller.getAllMarcas(mockRequest as RequestWithUser);

      expect(result).toEqual(mockMarcas);
      expect(mockService.getMarcasByEmpresa).toHaveBeenCalledWith(1);
    });

    it('should return all marcas if user has no empresa', async () => {
      const mockMarcas = [mockMarca];
      const superadminRequest = {
        user: { ...mockUser, empresa: null },
      };
      mockService.getAllMarcas.mockResolvedValue(mockMarcas);

      const result = await controller.getAllMarcas(superadminRequest as RequestWithUser);

      expect(result).toEqual(mockMarcas);
      expect(mockService.getAllMarcas).toHaveBeenCalled();
    });
  });

  describe('createMarca', () => {
    it('should create a marca with user empresa', async () => {
      const marcaData: any = {
        nombre: 'New Marca',
      };

      mockService.createMarca.mockResolvedValue(mockMarca);

      const result = await controller.createMarca(marcaData, mockRequest as RequestWithUser);

      expect(result).toEqual(mockMarca);
      expect(marcaData.empresa_id).toBe(1);
    });
  });

  describe('updateMarca', () => {
    it('should update a marca if user has empresa and owns it', async () => {
      const updateData: any = {
        nombre: 'Updated Marca',
      };

      mockService.findById.mockResolvedValue(mockMarca);
      mockService.updateMarca.mockResolvedValue({ ...mockMarca, ...updateData });

      const result = await controller.updateMarca(1, updateData, mockRequest as RequestWithUser);

      expect(result).toBeDefined();
      expect(mockService.updateMarca).toHaveBeenCalledWith(1, updateData);
    });

    it('should throw BadRequestException if marca does not belong to user empresa', async () => {
      const updateData: any = { nombre: 'Updated' };
      const otherEmpresaMarca = { ...mockMarca, empresa_id: 2 };

      mockService.findById.mockResolvedValue(otherEmpresaMarca);

      await expect(
        controller.updateMarca(1, updateData, mockRequest as RequestWithUser)
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('deleteMarca', () => {
    it('should delete a marca if user has empresa and owns it', async () => {
      mockService.findById.mockResolvedValue(mockMarca);
      mockService.deleteMarca.mockResolvedValue(undefined);

      const result = await controller.deleteMarca(1, mockRequest as RequestWithUser);

      expect(result).toEqual({ message: '✅ Marca eliminada exitosamente.' });
    });
  });

  describe('bulkDeleteMarcas', () => {
    it('should delete multiple marcas', async () => {
      const body = { ids: [1, 2, 3] };

      mockService.bulkDeleteMarcas.mockResolvedValue(undefined);

      const result = await controller.bulkDeleteMarcas(body, mockRequest as RequestWithUser);

      expect(result).toEqual({ message: '✅ 3 marcas eliminadas exitosamente.' });
    });
  });

  describe('bulkUpdateMarcaStatus', () => {
    it('should update status of multiple marcas', async () => {
      const body = { ids: [1, 2], estado: false };
      const updatedMarcas = [mockMarca, mockMarca];

      mockService.bulkUpdateMarcaStatus.mockResolvedValue(updatedMarcas);

      const result = await controller.bulkUpdateMarcaStatus(body, mockRequest as RequestWithUser);

      expect(result.message).toContain('desactivadas');
    });
  });
});
