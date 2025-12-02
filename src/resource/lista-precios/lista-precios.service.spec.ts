import { Test, TestingModule } from '@nestjs/testing';
import { ListaPreciosService } from './lista-precios.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ListaPreciosEntity } from 'src/database/core/lista-precios.entity';
import { ProductoListaPreciosEntity } from 'src/database/core/producto-lista-precios.entity';
import { ProductoEntity } from 'src/database/core/producto.entity';
import { sucursalEntity } from 'src/database/core/sucursal.entity';
import { PermisosService } from '../permisos/permisos.service';
import { RolesService } from '../roles/roles.service';
import { BadRequestException } from '@nestjs/common';

describe('ListaPreciosService', () => {
  let service: ListaPreciosService;
  let listaPreciosRepository: any;
  let productoListaPreciosRepository: any;
  let permisoService: any;
  let roleService: any;

  const mockListaPreciosRepository = {
    find: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn((dto) => dto),
    save: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    createQueryBuilder: jest.fn(() => ({
      where: jest.fn().mockReturnThis(),
      andWhere: jest.fn().mockReturnThis(),
      getOne: jest.fn(),
    })),
  };

  const mockProductoListaPreciosRepository = {
    find: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn((dto) => dto),
    save: jest.fn(),
    delete: jest.fn(),
  };

  const mockProductoRepository = {
    find: jest.fn(),
    findOne: jest.fn(),
  };

  const mockSucursalRepository = {
    find: jest.fn(),
    findOne: jest.fn(),
  };

  const mockPermisoService = {
    crearPermiso: jest.fn(),
    findOne: jest.fn(),
  };

  const mockRoleService = {
    asignarPermisosArol: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
  };

  const mockListaPrecio: ListaPreciosEntity = {
    id: 1,
    nombre: 'Lista Test',
    descripcion: 'Descripción test',
    empresa: { id: 1 } as any,
    estado: true,
    created_at: new Date(),
    updated_at: new Date(),
    deleted_at: null,
  } as ListaPreciosEntity;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ListaPreciosService,
        {
          provide: getRepositoryToken(ListaPreciosEntity),
          useValue: mockListaPreciosRepository,
        },
        {
          provide: getRepositoryToken(ProductoListaPreciosEntity),
          useValue: mockProductoListaPreciosRepository,
        },
        {
          provide: getRepositoryToken(ProductoEntity),
          useValue: mockProductoRepository,
        },
        {
          provide: getRepositoryToken(sucursalEntity),
          useValue: mockSucursalRepository,
        },
        {
          provide: PermisosService,
          useValue: mockPermisoService,
        },
        {
          provide: RolesService,
          useValue: mockRoleService,
        },
      ],
    }).compile();

    service = module.get<ListaPreciosService>(ListaPreciosService);
    listaPreciosRepository = module.get(getRepositoryToken(ListaPreciosEntity));
    productoListaPreciosRepository = module.get(getRepositoryToken(ProductoListaPreciosEntity));
    permisoService = module.get(PermisosService);
    roleService = module.get(RolesService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getAllListaPrecios', () => {
    it('should return all lista precios', async () => {
      const listas = [mockListaPrecio];
      mockListaPreciosRepository.find.mockResolvedValue(listas);

      const result = await service.getAllListaPrecios();

      expect(result).toEqual(listas);
      expect(mockListaPreciosRepository.find).toHaveBeenCalledWith({
        relations: ['empresa'],
      });
    });
  });

  describe('getListaPreciosByEmpresa', () => {
    it('should return lista precios filtered by empresa', async () => {
      const listas = [mockListaPrecio];
      mockListaPreciosRepository.find.mockResolvedValue(listas);

      const result = await service.getListaPreciosByEmpresa(1);

      expect(result).toEqual(listas);
    });
  });

  describe('findByNombre', () => {
    it('should find lista precio by nombre', async () => {
      const queryBuilder = mockListaPreciosRepository.createQueryBuilder();
      queryBuilder.getOne.mockResolvedValue(mockListaPrecio);

      const result = await service.findByNombre('Lista Test', 1);

      expect(result).toEqual(mockListaPrecio);
    });
  });

  describe('createListaPrecio', () => {
    it('should create lista precio with permissions', async () => {
      const createDto = {
        nombre: 'Nueva Lista',
        descripcion: 'Test',
        empresa_id: 1,
        estado: true,
        productos: [],
      };

      const mockPermiso = { id: 1, codigo: 'lista_nueva_lista_ver', nombre: 'Ver lista' };

      const queryBuilder = mockListaPreciosRepository.createQueryBuilder();
      queryBuilder.getOne.mockResolvedValue(null);
      mockPermisoService.crearPermiso.mockResolvedValue(mockPermiso);
      mockRoleService.asignarPermisosArol.mockResolvedValue(true);
      mockListaPreciosRepository.create.mockReturnValue(mockListaPrecio);
      mockListaPreciosRepository.save.mockResolvedValue(mockListaPrecio);
      mockListaPreciosRepository.findOne.mockResolvedValue(mockListaPrecio);

      const result = await service.createListaPrecio(createDto);

      expect(result).toBeDefined();
      expect(mockPermisoService.crearPermiso).toHaveBeenCalled();
      expect(mockRoleService.asignarPermisosArol).toHaveBeenCalledTimes(2);
    });

    it('should throw BadRequestException when lista precio already exists', async () => {
      const createDto = {
        nombre: 'Lista Existente',
        descripcion: 'Test',
        empresa_id: 1,
        productos: [],
      };

      const queryBuilder = mockListaPreciosRepository.createQueryBuilder();
      queryBuilder.getOne.mockResolvedValue(mockListaPrecio);

      await expect(service.createListaPrecio(createDto)).rejects.toThrow(BadRequestException);
    });

    it('should create lista precio with productos', async () => {
      const createDto = {
        nombre: 'Nueva Lista',
        descripcion: 'Test',
        empresa_id: 1,
        productos: [{ producto_id: 1, precio_venta_especifico: 100 }],
      };

      const mockPermiso = { id: 1, codigo: 'lista_nueva_lista_ver', nombre: 'Ver lista' };

      const queryBuilder = mockListaPreciosRepository.createQueryBuilder();
      queryBuilder.getOne.mockResolvedValue(null);
      mockPermisoService.crearPermiso.mockResolvedValue(mockPermiso);
      mockRoleService.asignarPermisosArol.mockResolvedValue(true);
      mockListaPreciosRepository.create.mockReturnValue(mockListaPrecio);
      mockListaPreciosRepository.save.mockResolvedValue(mockListaPrecio);
      mockProductoRepository.find.mockResolvedValue([{ id: 1 }]);
      mockProductoListaPreciosRepository.save.mockResolvedValue([]);
      mockListaPreciosRepository.findOne.mockResolvedValue(mockListaPrecio);

      const result = await service.createListaPrecio(createDto);

      expect(result).toBeDefined();
      expect(mockProductoListaPreciosRepository.save).toHaveBeenCalled();
    });
  });
});
