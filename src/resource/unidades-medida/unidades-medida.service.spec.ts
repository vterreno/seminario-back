import { Test, TestingModule } from '@nestjs/testing';
import { UnidadesMedidaService } from './unidades-medida.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { UnidadMedidaEntity } from 'src/database/core/unidad-medida.entity';
import { ProductoEntity } from 'src/database/core/producto.entity';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { Repository } from 'typeorm';

describe('UnidadesMedidaService', () => {
  let service: UnidadesMedidaService;
  let unidadesMedidaRepository: Repository<UnidadMedidaEntity>;
  let productosRepository: Repository<ProductoEntity>;

  const mockUnidadesMedidaRepository = {
    find: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn((dto) => dto),
    save: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    softDelete: jest.fn(),
  };

  const mockProductosRepository = {
    find: jest.fn(),
    findOne: jest.fn(),
  };

  const mockUnidadMedida: UnidadMedidaEntity = {
    id: 1,
    nombre: 'Kilogramos',
    abreviatura: 'kg',
    empresa_id: 1,
    estado: true,
    empresa: {
      id: 1,
      name: 'Test Empresa',
    } as any,
    created_at: new Date(),
    updated_at: new Date(),
    deleted_at: null,
  } as UnidadMedidaEntity;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UnidadesMedidaService,
        {
          provide: getRepositoryToken(UnidadMedidaEntity),
          useValue: mockUnidadesMedidaRepository,
        },
        {
          provide: getRepositoryToken(ProductoEntity),
          useValue: mockProductosRepository,
        },
      ],
    }).compile();

    service = module.get<UnidadesMedidaService>(UnidadesMedidaService);
    unidadesMedidaRepository = module.get<Repository<UnidadMedidaEntity>>(
      getRepositoryToken(UnidadMedidaEntity),
    );
    productosRepository = module.get<Repository<ProductoEntity>>(
      getRepositoryToken(ProductoEntity),
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getUnidadesByEmpresa', () => {
    it('should return unidades filtered by empresa', async () => {
      const empresaId = 1;
      const unidades = [mockUnidadMedida];
      mockUnidadesMedidaRepository.find.mockResolvedValue(unidades);

      const result = await service.getUnidadesByEmpresa(empresaId);

      expect(result).toEqual(unidades);
      expect(mockUnidadesMedidaRepository.find).toHaveBeenCalledWith({
        where: { empresa_id: empresaId },
        relations: ['empresa'],
      });
    });

    it('should return empty array when empresa has no unidades', async () => {
      mockUnidadesMedidaRepository.find.mockResolvedValue([]);

      const result = await service.getUnidadesByEmpresa(1);

      expect(result).toEqual([]);
    });
  });

  describe('getAllUnidades', () => {
    it('should return all unidades with relations', async () => {
      const unidades = [mockUnidadMedida];
      mockUnidadesMedidaRepository.find.mockResolvedValue(unidades);

      const result = await service.getAllUnidades();

      expect(result).toEqual(unidades);
      expect(mockUnidadesMedidaRepository.find).toHaveBeenCalledWith({
        relations: ['empresa'],
      });
    });

    it('should return empty array when no unidades exist', async () => {
      mockUnidadesMedidaRepository.find.mockResolvedValue([]);

      const result = await service.getAllUnidades();

      expect(result).toEqual([]);
    });
  });

  describe('createUnidad', () => {
    it('should create unidad successfully', async () => {
      const createDto = {
        nombre: 'Litros',
        abreviatura: 'L',
        empresaId: 1,
        estado: true,
      };

      mockUnidadesMedidaRepository.create.mockReturnValue(mockUnidadMedida);
      mockUnidadesMedidaRepository.save.mockResolvedValue(mockUnidadMedida);

      const result = await service.createUnidad(createDto);

      expect(result).toEqual(mockUnidadMedida);
      expect(mockUnidadesMedidaRepository.create).toHaveBeenCalled();
      expect(mockUnidadesMedidaRepository.save).toHaveBeenCalled();
    });

    it('should create unidad with estado true by default', async () => {
      const createDto = {
        nombre: 'Litros',
        abreviatura: 'L',
        empresaId: 1,
      };

      mockUnidadesMedidaRepository.create.mockReturnValue({ ...mockUnidadMedida, estado: true });
      mockUnidadesMedidaRepository.save.mockResolvedValue({ ...mockUnidadMedida, estado: true });

      const result = await service.createUnidad(createDto);

      expect(result.estado).toBe(true);
    });

    it('should throw BadRequestException on database error', async () => {
      const createDto = {
        nombre: 'Litros',
        abreviatura: 'L',
        empresaId: 1,
      };

      mockUnidadesMedidaRepository.create.mockReturnValue(mockUnidadMedida);
      mockUnidadesMedidaRepository.save.mockRejectedValue(new Error('Database error'));

      await expect(service.createUnidad(createDto)).rejects.toThrow(BadRequestException);
    });
  });

  describe('updateUnidad', () => {
    it('should update unidad successfully when no products associated', async () => {
      const updateDto = {
        nombre: 'Kilogramos Actualizado',
      };

      mockUnidadesMedidaRepository.findOne.mockResolvedValue(mockUnidadMedida);
      mockProductosRepository.find.mockResolvedValue([]);
      mockUnidadesMedidaRepository.update.mockResolvedValue({ affected: 1 } as any);

      const result = await service.updateUnidad(1, updateDto);

      expect(mockUnidadesMedidaRepository.update).toHaveBeenCalledWith(1, updateDto);
    });

    it('should throw BadRequestException when unidad not found', async () => {
      const updateDto = {
        nombre: 'Updated',
      };

      mockUnidadesMedidaRepository.findOne.mockResolvedValue(null);

      await expect(service.updateUnidad(999, updateDto)).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException when unidad has associated products', async () => {
      const updateDto = {
        nombre: 'Updated',
      };

      const producto = { id: 1, nombre: 'Producto Test', unidad_medida_id: 1 };

      mockUnidadesMedidaRepository.findOne.mockResolvedValue(mockUnidadMedida);
      mockProductosRepository.find.mockResolvedValue([producto]);

      await expect(service.updateUnidad(1, updateDto)).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException when trying to change empresa with products', async () => {
      const updateDto = {
        empresaId: 2,
      };

      const producto = { id: 1, nombre: 'Producto Test', unidad_medida_id: 1 };

      mockUnidadesMedidaRepository.findOne.mockResolvedValue(mockUnidadMedida);
      mockProductosRepository.find.mockResolvedValue([producto]);

      await expect(service.updateUnidad(1, updateDto)).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException when trying to change abreviatura with products', async () => {
      const updateDto = {
        abreviatura: 'KG',
      };

      const producto = { id: 1, nombre: 'Producto Test', unidad_medida_id: 1 };

      mockUnidadesMedidaRepository.findOne.mockResolvedValue(mockUnidadMedida);
      mockProductosRepository.find.mockResolvedValue([producto]);

      await expect(service.updateUnidad(1, updateDto)).rejects.toThrow(BadRequestException);
    });
  });

  describe('findById', () => {
    it('should return unidad with relations', async () => {
      mockUnidadesMedidaRepository.findOne.mockResolvedValue(mockUnidadMedida);

      const result = await service.findById(1);

      expect(result).toEqual(mockUnidadMedida);
      expect(mockUnidadesMedidaRepository.findOne).toHaveBeenCalledWith({
        where: { id: 1 },
        relations: ['empresa'],
      });
    });
  });

  describe('deleteUnidad', () => {
    it('should soft delete unidad when no products associated', async () => {
      mockProductosRepository.find.mockResolvedValue([]);
      mockUnidadesMedidaRepository.softDelete.mockResolvedValue({ affected: 1 } as any);

      await service.deleteUnidad(1);

      expect(mockUnidadesMedidaRepository.softDelete).toHaveBeenCalledWith(1);
    });

    it('should throw BadRequestException when unidad has associated products', async () => {
      const producto = { id: 1, nombre: 'Producto Test', unidad_medida_id: 1 };
      mockProductosRepository.find.mockResolvedValue([producto]);

      await expect(service.deleteUnidad(1)).rejects.toThrow(BadRequestException);
    });
  });

  describe('bulkDeleteUnidades', () => {
    it('should bulk delete unidades when no products associated', async () => {
      const ids = [1, 2, 3];
      mockUnidadesMedidaRepository.find.mockResolvedValue([
        mockUnidadMedida,
        { ...mockUnidadMedida, id: 2 },
        { ...mockUnidadMedida, id: 3 },
      ]);
      mockProductosRepository.find.mockResolvedValue([]);
      mockUnidadesMedidaRepository.softDelete.mockResolvedValue({ affected: 3 } as any);

      await service.bulkDeleteUnidades(ids, 1);

      expect(mockUnidadesMedidaRepository.softDelete).toHaveBeenCalledWith(ids);
    });

    it('should throw BadRequestException when some unidades do not belong to empresa', async () => {
      const ids = [1, 2, 3];
      mockUnidadesMedidaRepository.find.mockResolvedValue([mockUnidadMedida]);

      await expect(service.bulkDeleteUnidades(ids, 1)).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException when unidades have associated products', async () => {
      const ids = [1, 2];
      mockUnidadesMedidaRepository.find.mockResolvedValue([
        mockUnidadMedida,
        { ...mockUnidadMedida, id: 2 },
      ]);
      mockProductosRepository.find.mockResolvedValue([
        { id: 1, nombre: 'Producto Test', unidad_medida_id: 1 },
      ]);

      await expect(service.bulkDeleteUnidades(ids, 1)).rejects.toThrow(BadRequestException);
    });
  });

  describe('bulkUpdateUnidadStatus', () => {
    it('should bulk update unidad status to active', async () => {
      const ids = [1, 2];
      const unidades = [mockUnidadMedida, { ...mockUnidadMedida, id: 2 }];

      mockUnidadesMedidaRepository.find
        .mockResolvedValueOnce(unidades)
        .mockResolvedValueOnce(unidades.map(u => ({ ...u, estado: true })));
      mockUnidadesMedidaRepository.update.mockResolvedValue({ affected: 2 } as any);

      const result = await service.bulkUpdateUnidadStatus(ids, true, 1);

      expect(result).toHaveLength(2);
      expect(mockUnidadesMedidaRepository.update).toHaveBeenCalledWith(ids, { estado: true });
    });

    it('should throw BadRequestException when trying to deactivate unidades with products', async () => {
      const ids = [1, 2];
      const unidades = [mockUnidadMedida, { ...mockUnidadMedida, id: 2 }];

      mockUnidadesMedidaRepository.find.mockResolvedValue(unidades);
      mockProductosRepository.find.mockResolvedValue([
        { id: 1, nombre: 'Producto Test', unidad_medida_id: 1 },
      ]);

      await expect(service.bulkUpdateUnidadStatus(ids, false, 1)).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException when some unidades do not belong to empresa', async () => {
      const ids = [1, 2, 3];
      mockUnidadesMedidaRepository.find.mockResolvedValue([mockUnidadMedida]);

      await expect(service.bulkUpdateUnidadStatus(ids, true, 1)).rejects.toThrow(BadRequestException);
    });
  });

  describe('softDeleteUnidad', () => {
    it('should soft delete unidad by setting estado to false', async () => {
      mockUnidadesMedidaRepository.update.mockResolvedValue({ affected: 1 } as any);
      mockUnidadesMedidaRepository.findOne.mockResolvedValue({ ...mockUnidadMedida, estado: false });

      const result = await service.softDeleteUnidad(1);

      expect(result.estado).toBe(false);
      expect(mockUnidadesMedidaRepository.update).toHaveBeenCalledWith(1, { estado: false });
    });
  });

  describe('bulkSoftDeleteUnidades', () => {
    it('should bulk soft delete unidades', async () => {
      const ids = [1, 2, 3];
      mockUnidadesMedidaRepository.update.mockResolvedValue({ affected: 3 } as any);

      await service.bulkSoftDeleteUnidades(ids);

      expect(mockUnidadesMedidaRepository.update).toHaveBeenCalledWith(ids, { estado: false });
    });
  });
});

