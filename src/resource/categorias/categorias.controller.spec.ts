import { CategoriasController } from './categorias.controller';
import { CategoriasService } from './categorias.service';
import { categoriasEntity } from 'src/database/core/categorias.entity';
import { BadRequestException } from '@nestjs/common';
import { RequestWithUser } from '../users/interface/request-user';

describe('CategoriasController', () => {
  let controller: CategoriasController;
  let service: CategoriasService;
  let mockService: {
    getAllCategorias: jest.Mock;
    getCategoriasByEmpresa: jest.Mock;
    findById: jest.Mock;
    createCategoria: jest.Mock;
    updateCategoria: jest.Mock;
    deleteCategoria: jest.Mock;
    bulkDeleteCategorias: jest.Mock;
    bulkUpdateCategoriaStatus: jest.Mock;
  };

  const mockCategoria: categoriasEntity = {
    id: 1,
    nombre: 'Test Categoria',
    descripcion: 'Test Description',
    estado: true,
    empresa_id: 1,
    empresa: null,
    created_at: new Date(),
    updated_at: new Date(),
    deleted_at: null,
  } as categoriasEntity;

  const mockUser = {
    id: 1,
    email: 'test@test.com',
    nombre: 'Test',
    apellido: 'User',
    empresa: { id: 1, name: 'Test Empresa' },
    role: { id: 1, nombre: 'Admin' },
    permissionCodes: ['categoria_ver', 'categoria_agregar', 'categoria_modificar', 'categoria_eliminar'],
  };

  const mockRequest: Partial<RequestWithUser> = {
    user: mockUser as any,
  };

  beforeEach(() => {
    jest.clearAllMocks();

    mockService = {
      getAllCategorias: jest.fn(),
      getCategoriasByEmpresa: jest.fn(),
      findById: jest.fn(),
      createCategoria: jest.fn(),
      updateCategoria: jest.fn(),
      deleteCategoria: jest.fn(),
      bulkDeleteCategorias: jest.fn(),
      bulkUpdateCategoriaStatus: jest.fn(),
    };

    controller = new CategoriasController(mockService as unknown as CategoriasService);
    service = mockService as unknown as CategoriasService;
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
    expect(service).toBeDefined();
  });

  describe('getAllCategorias', () => {
    it('should return categorias filtered by empresa if user has empresa', async () => {
      const mockCategorias = [mockCategoria];
      mockService.getCategoriasByEmpresa.mockResolvedValue(mockCategorias);

      const result = await controller.getAllCategorias(mockRequest as RequestWithUser);

      expect(result).toEqual(mockCategorias);
      expect(mockService.getCategoriasByEmpresa).toHaveBeenCalledWith(1);
      expect(mockService.getAllCategorias).not.toHaveBeenCalled();
    });

    it('should return all categorias if user has no empresa (superadmin)', async () => {
      const mockCategorias = [mockCategoria];
      const superadminRequest = {
        user: { ...mockUser, empresa: null },
      };
      mockService.getAllCategorias.mockResolvedValue(mockCategorias);

      const result = await controller.getAllCategorias(superadminRequest as RequestWithUser);

      expect(result).toEqual(mockCategorias);
      expect(mockService.getAllCategorias).toHaveBeenCalled();
      expect(mockService.getCategoriasByEmpresa).not.toHaveBeenCalled();
    });
  });

  describe('getCategoriaById', () => {
    it('should return a categoria by id', async () => {
      mockService.findById.mockResolvedValue(mockCategoria);

      const result = await controller.getCategoriaById(1);

      expect(result).toEqual(mockCategoria);
      expect(mockService.findById).toHaveBeenCalledWith(1);
    });
  });

  describe('getCategoriasByEmpresa', () => {
    it('should return categorias filtered by empresa id', async () => {
      const mockCategorias = [mockCategoria];
      mockService.getCategoriasByEmpresa.mockResolvedValue(mockCategorias);

      const result = await controller.getCategoriasByEmpresa(1);

      expect(result).toEqual(mockCategorias);
      expect(mockService.getCategoriasByEmpresa).toHaveBeenCalledWith(1);
    });
  });

  describe('createCategoria', () => {
    it('should create a categoria with user empresa if provided', async () => {
      const categoriaData: Partial<categoriasEntity> = {
        nombre: 'New Categoria',
        descripcion: 'New Description',
      };

      mockService.createCategoria.mockResolvedValue(mockCategoria);

      const result = await controller.createCategoria(categoriaData, mockRequest as RequestWithUser);

      expect(result).toEqual(mockCategoria);
      expect(categoriaData.empresa_id).toBe(1);
      expect(mockService.createCategoria).toHaveBeenCalledWith(categoriaData);
    });

    it('should create a categoria without empresa_id for superadmin', async () => {
      const categoriaData: Partial<categoriasEntity> = {
        nombre: 'New Categoria',
        descripcion: 'New Description',
      };
      const superadminRequest = {
        user: { ...mockUser, empresa: null },
      };

      mockService.createCategoria.mockResolvedValue(mockCategoria);

      await controller.createCategoria(categoriaData, superadminRequest as RequestWithUser);

      expect(categoriaData.empresa_id).toBeUndefined();
    });
  });

  describe('updateCategoria', () => {
    it('should update a categoria if user has empresa and owns it', async () => {
      const updateData: Partial<categoriasEntity> = {
        nombre: 'Updated Categoria',
      };

      mockService.findById.mockResolvedValue(mockCategoria);
      mockService.updateCategoria.mockResolvedValue({ ...mockCategoria, ...updateData });

      const result = await controller.updateCategoria(1, updateData, mockRequest as RequestWithUser);

      expect(result).toBeDefined();
      expect(mockService.updateCategoria).toHaveBeenCalledWith(1, updateData);
    });

    it('should throw BadRequestException if categoria does not belong to user empresa', async () => {
      const updateData: Partial<categoriasEntity> = {
        nombre: 'Updated Categoria',
      };
      const otherEmpresaCategoria = { ...mockCategoria, empresa_id: 2 };

      mockService.findById.mockResolvedValue(otherEmpresaCategoria);

      await expect(
        controller.updateCategoria(1, updateData, mockRequest as RequestWithUser)
      ).rejects.toThrow(BadRequestException);
    });

    it('should allow superadmin to update any categoria', async () => {
      const updateData: Partial<categoriasEntity> = {
        nombre: 'Updated Categoria',
      };
      const superadminRequest = {
        user: { ...mockUser, empresa: null },
      };

      mockService.updateCategoria.mockResolvedValue({ ...mockCategoria, ...updateData });

      const result = await controller.updateCategoria(1, updateData, superadminRequest as RequestWithUser);

      expect(result).toBeDefined();
      expect(mockService.findById).not.toHaveBeenCalled();
    });
  });

  describe('deleteCategoria', () => {
    it('should delete a categoria if user has empresa and owns it', async () => {
      mockService.findById.mockResolvedValue(mockCategoria);
      mockService.deleteCategoria.mockResolvedValue(undefined);

      const result = await controller.deleteCategoria(1, mockRequest as RequestWithUser);

      expect(result).toEqual({ message: 'Categoría eliminada exitosamente' });
      expect(mockService.deleteCategoria).toHaveBeenCalledWith(1);
    });

    it('should throw BadRequestException if categoria does not belong to user empresa', async () => {
      const otherEmpresaCategoria = { ...mockCategoria, empresa_id: 2 };

      mockService.findById.mockResolvedValue(otherEmpresaCategoria);

      await expect(
        controller.deleteCategoria(1, mockRequest as RequestWithUser)
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('bulkDeleteCategorias', () => {
    it('should delete multiple categorias', async () => {
      const body = { ids: [1, 2, 3] };

      mockService.bulkDeleteCategorias.mockResolvedValue(undefined);

      const result = await controller.bulkDeleteCategorias(body, mockRequest as RequestWithUser);

      expect(result).toEqual({ message: '3 categorías eliminadas exitosamente' });
      expect(mockService.bulkDeleteCategorias).toHaveBeenCalledWith([1, 2, 3], 1);
    });

    it('should throw BadRequestException on error', async () => {
      const body = { ids: [1, 2, 3] };

      mockService.bulkDeleteCategorias.mockRejectedValue(new Error('Test error'));

      await expect(
        controller.bulkDeleteCategorias(body, mockRequest as RequestWithUser)
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('bulkUpdateCategoriaStatus', () => {
    it('should update status of multiple categorias', async () => {
      const body = { ids: [1, 2, 3], estado: false };
      const updatedCategorias = [mockCategoria, mockCategoria, mockCategoria];

      mockService.bulkUpdateCategoriaStatus.mockResolvedValue(updatedCategorias);

      const result = await controller.bulkUpdateCategoriaStatus(body, mockRequest as RequestWithUser);

      expect(result).toEqual({
        message: '3 categorías desactivadas exitosamente',
        updatedCategorias: updatedCategorias,
      });
      expect(mockService.bulkUpdateCategoriaStatus).toHaveBeenCalledWith([1, 2, 3], false, 1);
    });

    it('should handle activation correctly', async () => {
      const body = { ids: [1, 2], estado: true };
      const updatedCategorias = [mockCategoria, mockCategoria];

      mockService.bulkUpdateCategoriaStatus.mockResolvedValue(updatedCategorias);

      const result = await controller.bulkUpdateCategoriaStatus(body, mockRequest as RequestWithUser);

      expect(result.message).toContain('activadas');
    });
  });
});
