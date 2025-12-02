import { Test, TestingModule } from '@nestjs/testing';
import { CategoriasService } from './categorias.service';
import { Repository } from 'typeorm';
import { getRepositoryToken } from '@nestjs/typeorm';
import { categoriasEntity } from 'src/database/core/categorias.entity';
import { ProductoEntity } from 'src/database/core/producto.entity';
import { BadRequestException, NotFoundException } from '@nestjs/common';

describe('CategoriasService', () => {
  let service: CategoriasService;
  let repository: Repository<categoriasEntity>;

  const mockRepository = {
    find: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    softDelete: jest.fn(),
    restore: jest.fn(),
    createQueryBuilder: jest.fn(),
  };

  const mockProductoRepository = {
    find: jest.fn(),
    findOne: jest.fn(),
    count: jest.fn(),
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

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CategoriasService,
        {
          provide: getRepositoryToken(categoriasEntity),
          useValue: mockRepository,
        },
        {
          provide: getRepositoryToken(ProductoEntity),
          useValue: mockProductoRepository,
        },
      ],
    }).compile();

    service = module.get<CategoriasService>(CategoriasService);
    repository = module.get<Repository<categoriasEntity>>(getRepositoryToken(categoriasEntity));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getCategoriasByEmpresa', () => {
    it('should return categories filtered by empresa', async () => {
      const empresaId = 1;
      const mockCategorias = [mockCategoria];
      
      mockRepository.find.mockResolvedValue(mockCategorias);

      const result = await service.getCategoriasByEmpresa(empresaId);

      expect(result).toEqual(mockCategorias);
      expect(mockRepository.find).toHaveBeenCalledWith({
        where: { 
          empresa_id: empresaId,
          deleted_at: expect.anything()
        },
      });
    });
  });

  describe('getAllCategorias', () => {
    it('should return all categories', async () => {
      const mockCategorias = [mockCategoria];
      
      mockRepository.find.mockResolvedValue(mockCategorias);

      const result = await service.getAllCategorias();

      expect(result).toEqual(mockCategorias);
      expect(mockRepository.find).toHaveBeenCalledWith({
        relations: ['empresa'],
        where: {
          deleted_at: expect.anything()
        }
      });
    });
  });

  describe('createCategoria', () => {
    it('should create a new categoria', async () => {
      const categoriaData = {
        nombre: 'New Categoria',
        descripcion: 'New Description',
        empresa_id: 1,
      };

      const mockQueryBuilder: any = {
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        getOne: jest.fn().mockResolvedValue(null),
      };

      mockRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder);
      mockRepository.create.mockReturnValue(mockCategoria);
      mockRepository.save.mockResolvedValue(mockCategoria);
      mockRepository.findOne.mockResolvedValue(mockCategoria);

      const result = await service.createCategoria(categoriaData);

      expect(result).toEqual(mockCategoria);
      expect(mockRepository.create).toHaveBeenCalledWith(categoriaData);
      expect(mockRepository.save).toHaveBeenCalled();
    });

    it('should throw BadRequestException if categoria name already exists', async () => {
      const categoriaData = {
        nombre: 'Existing Categoria',
        descripcion: 'Description',
        empresa_id: 1,
      };

      const mockQueryBuilder: any = {
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        getOne: jest.fn().mockResolvedValue(mockCategoria),
      };

      mockRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder);

      await expect(service.createCategoria(categoriaData)).rejects.toThrow(BadRequestException);
    });
  });

  describe('updateCategoria', () => {
    it('should update a categoria', async () => {
      const categoriaId = 1;
      const updateData = {
        nombre: 'Updated Categoria',
        descripcion: 'Updated Description',
      };

      mockRepository.findOne.mockResolvedValue(mockCategoria);
      
      const mockQueryBuilder: any = {
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        getOne: jest.fn().mockResolvedValue(null),
      };

      mockRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder);
      mockRepository.update.mockResolvedValue({ affected: 1 });

      const result = await service.updateCategoria(categoriaId, updateData);

      expect(result).toEqual(mockCategoria);
      expect(mockRepository.update).toHaveBeenCalledWith(categoriaId, updateData);
    });

    it('should throw NotFoundException if categoria does not exist', async () => {
      mockRepository.findOne.mockResolvedValue(null);

      await expect(service.updateCategoria(1, { nombre: 'Test' })).rejects.toThrow(NotFoundException);
    });

    it('should throw BadRequestException if new name already exists', async () => {
      const updateData = {
        nombre: 'Existing Name',
      };

      mockRepository.findOne
        .mockResolvedValueOnce(mockCategoria)
        .mockResolvedValueOnce(mockCategoria);
      
      const mockQueryBuilder: any = {
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        getOne: jest.fn().mockResolvedValue(mockCategoria),
      };

      mockRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder);

      await expect(service.updateCategoria(1, updateData)).rejects.toThrow(BadRequestException);
    });
  });

  describe('findById', () => {
    it('should return a categoria by id', async () => {
      mockRepository.findOne.mockResolvedValue(mockCategoria);

      const result = await service.findById(1);

      expect(result).toEqual(mockCategoria);
      expect(mockRepository.findOne).toHaveBeenCalledWith({
        where: { 
          id: 1,
          deleted_at: expect.anything()
        },
        relations: ['empresa'],
      });
    });

    it('should throw NotFoundException if categoria does not exist', async () => {
      mockRepository.findOne.mockResolvedValue(null);

      await expect(service.findById(1)).rejects.toThrow(NotFoundException);
    });
  });

  describe('deleteCategoria', () => {
    it('should delete a categoria', async () => {
      mockProductoRepository.count.mockResolvedValue(0); // No productos asociados
      mockRepository.delete.mockResolvedValue({ affected: 1 });

      await service.deleteCategoria(1);

      expect(mockRepository.delete).toHaveBeenCalledWith(1);
    });

    it('should throw NotFoundException if categoria does not exist', async () => {
      mockProductoRepository.count.mockResolvedValue(0); // No productos asociados
      mockRepository.delete.mockResolvedValue({ affected: 0 });

      await expect(service.deleteCategoria(1)).rejects.toThrow(NotFoundException);
    });
  });

  describe('bulkDeleteCategorias', () => {
    it('should delete multiple categorias', async () => {
      const ids = [1, 2, 3];
      const mockCategorias = [mockCategoria, mockCategoria, mockCategoria];

      mockRepository.find.mockResolvedValue(mockCategorias);
      mockProductoRepository.find.mockResolvedValue([]); // No productos asociados
      mockRepository.delete.mockResolvedValue({ affected: 3 });

      await service.bulkDeleteCategorias(ids, 1);

      expect(mockRepository.delete).toHaveBeenCalledWith(ids);
    });

    it('should throw BadRequestException if some categorias do not belong to empresa', async () => {
      const ids = [1, 2, 3];
      const mockCategorias = [mockCategoria, mockCategoria]; // Only 2 found

      mockRepository.find.mockResolvedValue(mockCategorias);

      await expect(service.bulkDeleteCategorias(ids, 1)).rejects.toThrow(BadRequestException);
    });
  });

  describe('bulkUpdateCategoriaStatus', () => {
    it('should update status of multiple categorias', async () => {
      const ids = [1, 2, 3];
      const estado = false;
      const mockCategorias = [mockCategoria, mockCategoria, mockCategoria];

      mockRepository.find
        .mockResolvedValueOnce(mockCategorias)
        .mockResolvedValueOnce(mockCategorias);
      mockRepository.update.mockResolvedValue({ affected: 3 });

      const result = await service.bulkUpdateCategoriaStatus(ids, estado, 1);

      expect(result).toEqual(mockCategorias);
      expect(mockRepository.update).toHaveBeenCalledWith(
        { id: expect.anything() },
        { estado }
      );
    });

    it('should throw BadRequestException if some categorias do not belong to empresa', async () => {
      const ids = [1, 2, 3];
      const mockCategorias = [mockCategoria]; // Only 1 found

      mockRepository.find.mockResolvedValue(mockCategorias);

      await expect(service.bulkUpdateCategoriaStatus(ids, true, 1)).rejects.toThrow(BadRequestException);
    });
  });

  describe('softDeleteCategoria', () => {
    it('should soft delete a categoria', async () => {
      mockRepository.softDelete.mockResolvedValue({ affected: 1 });

      await service.softDeleteCategoria(1);

      expect(mockRepository.softDelete).toHaveBeenCalledWith(1);
    });

    it('should throw NotFoundException if categoria does not exist', async () => {
      mockRepository.softDelete.mockResolvedValue({ affected: 0 });

      await expect(service.softDeleteCategoria(1)).rejects.toThrow(NotFoundException);
    });
  });

  describe('restoreCategoria', () => {
    it('should restore a soft deleted categoria', async () => {
      mockRepository.restore.mockResolvedValue({ affected: 1 });
      mockRepository.findOne.mockResolvedValue(mockCategoria);

      const result = await service.restoreCategoria(1);

      expect(result).toEqual(mockCategoria);
      expect(mockRepository.restore).toHaveBeenCalledWith(1);
    });

    it('should throw NotFoundException if categoria does not exist', async () => {
      mockRepository.restore.mockResolvedValue({ affected: 0 });

      await expect(service.restoreCategoria(1)).rejects.toThrow(NotFoundException);
    });
  });
});
