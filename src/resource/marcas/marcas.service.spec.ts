import { Test, TestingModule } from '@nestjs/testing';
import { MarcasService } from './marcas.service';
import { Repository } from 'typeorm';
import { getRepositoryToken } from '@nestjs/typeorm';
import { MarcaEntity } from 'src/database/core/marcas.entity';
import { BadRequestException } from '@nestjs/common';

describe('MarcasService', () => {
  let service: MarcasService;
  let repository: Repository<MarcaEntity>;

  const mockRepository = {
    find: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    createQueryBuilder: jest.fn(),
  };

  const mockMarca = {
    id: 1,
    nombre: 'Test Marca',
    descripcion: 'Test Description',
    estado: true,
    empresa_id: 1,
    created_at: new Date(),
    updated_at: new Date(),
  } as unknown as MarcaEntity;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MarcasService,
        {
          provide: getRepositoryToken(MarcaEntity),
          useValue: mockRepository,
        },
      ],
    }).compile();

    service = module.get<MarcasService>(MarcasService);
    repository = module.get<Repository<MarcaEntity>>(getRepositoryToken(MarcaEntity));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getMarcasByEmpresa', () => {
    it('should return marcas filtered by empresa', async () => {
      const empresaId = 1;
      const mockMarcas = [mockMarca];
      
      mockRepository.find.mockResolvedValue(mockMarcas);

      const result = await service.getMarcasByEmpresa(empresaId);

      expect(result).toEqual(mockMarcas);
      expect(mockRepository.find).toHaveBeenCalledWith({
        where: { empresa_id: empresaId },
      });
    });
  });

  describe('getAllMarcas', () => {
    it('should return all marcas', async () => {
      const mockMarcas = [mockMarca];
      
      mockRepository.find.mockResolvedValue(mockMarcas);

      const result = await service.getAllMarcas();

      expect(result).toEqual(mockMarcas);
    });
  });

  describe('createMarca', () => {
    it('should create a new marca', async () => {
      const marcaData = {
        nombre: 'New Marca',
        descripcion: 'New Description',
        empresa_id: 1,
      };

      mockRepository.create.mockReturnValue(mockMarca);
      mockRepository.save.mockResolvedValue(mockMarca);
      mockRepository.findOne.mockResolvedValue(mockMarca);

      const result = await service.createMarca(marcaData as any);

      expect(result).toEqual(mockMarca);
    });

    it('should handle errors during creation', async () => {
      const marcaData = {
        nombre: 'New Marca',
        empresa_id: 1,
      };

      mockRepository.create.mockImplementation(() => {
        throw new Error('Database error');
      });

      await expect(service.createMarca(marcaData as any)).rejects.toThrow(BadRequestException);
    });
  });

  describe('updateMarca', () => {
    it('should update a marca', async () => {
      const marcaId = 1;
      const updateData = {
        nombre: 'Updated Marca',
      };

      mockRepository.findOne.mockResolvedValue(mockMarca);
      mockRepository.update.mockResolvedValue({ affected: 1 });

      const result = await service.updateMarca(marcaId, updateData);

      expect(result).toEqual(mockMarca);
    });

    it('should throw BadRequestException if marca not found', async () => {
      mockRepository.findOne.mockResolvedValue(null);

      await expect(service.updateMarca(999, { nombre: 'Test' })).rejects.toThrow(BadRequestException);
    });
  });

  describe('findById', () => {
    it('should return a marca by id', async () => {
      mockRepository.findOne.mockResolvedValue(mockMarca);

      const result = await service.findById(1);

      expect(result).toEqual(mockMarca);
    });
  });

  describe('deleteMarca', () => {
    it('should delete a marca', async () => {
      mockRepository.delete.mockResolvedValue({ affected: 1 });

      await service.deleteMarca(1);

      expect(mockRepository.delete).toHaveBeenCalledWith(1);
    });
  });

  describe('bulkDeleteMarcas', () => {
    it('should delete multiple marcas', async () => {
      const ids = [1, 2, 3];
      const mockMarcas = [mockMarca, mockMarca, mockMarca];

      mockRepository.find.mockResolvedValue(mockMarcas);
      mockRepository.delete.mockResolvedValue({ affected: 3 });

      await service.bulkDeleteMarcas(ids, 1);

      expect(mockRepository.delete).toHaveBeenCalledWith(ids);
    });

    it('should throw BadRequestException if some marcas do not belong to empresa', async () => {
      const ids = [1, 2, 3];
      mockRepository.find.mockResolvedValue([mockMarca]);

      await expect(service.bulkDeleteMarcas(ids, 1)).rejects.toThrow(BadRequestException);
    });
  });

  describe('bulkUpdateMarcaStatus', () => {
    it('should update status of multiple marcas', async () => {
      const ids = [1, 2, 3];
      const estado = false;
      const mockMarcas = [mockMarca, mockMarca, mockMarca];

      mockRepository.find
        .mockResolvedValueOnce(mockMarcas)
        .mockResolvedValueOnce(mockMarcas);
      mockRepository.update.mockResolvedValue({ affected: 3 });

      const result = await service.bulkUpdateMarcaStatus(ids, estado, 1);

      expect(result).toEqual(mockMarcas);
    });
  });
});
