import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { BadRequestException } from '@nestjs/common';
import { RolesService } from './roles.service';
import { RoleEntity } from 'src/database/core/roles.entity';
import { PermissionEntity } from 'src/database/core/permission.entity';

const createRole = (overrides: Partial<RoleEntity> = {}): RoleEntity => ({
  id: 1,
  nombre: 'Admin',
  estado: true,
  empresa_id: 1,
  permissions: [],
  ...overrides,
}) as RoleEntity;

const createPermission = (overrides: Partial<PermissionEntity> = {}): PermissionEntity => ({
  id: 10,
  nombre: 'perm',
  modulo: 'mod',
  ...overrides,
}) as PermissionEntity;

describe('RolesService', () => {
  let service: RolesService;
  let roleRepository: Record<string, jest.Mock>;
  let permissionRepository: Record<string, jest.Mock>;

  beforeEach(async () => {
    roleRepository = {
      find: jest.fn(),
      findOne: jest.fn(),
      findBy: jest.fn(),
      findOneBy: jest.fn(),
      save: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      create: jest.fn(),
    } as any;

    permissionRepository = {
      findBy: jest.fn(),
    } as any;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RolesService,
        {
          provide: getRepositoryToken(RoleEntity),
          useValue: roleRepository,
        },
        {
          provide: getRepositoryToken(PermissionEntity),
          useValue: permissionRepository,
        },
      ],
    }).compile();

    service = module.get<RolesService>(RolesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getRolesByEmpresa', () => {
    it('returns roles filtered by empresa', async () => {
      const expected = [createRole({ empresa_id: 2 })];
      roleRepository.find.mockResolvedValue(expected);

      const result = await service.getRolesByEmpresa(2);

      expect(roleRepository.find).toHaveBeenCalledWith({
        where: { empresa_id: 2 },
        relations: ['permissions', 'empresa'],
      });
      expect(result).toEqual(expected);
    });
  });

  describe('getAllRoles', () => {
    it('returns all roles with relations', async () => {
      const expected = [createRole()];
      roleRepository.find.mockResolvedValue(expected);

      const result = await service.getAllRoles();

      expect(roleRepository.find).toHaveBeenCalledWith({
        relations: ['permissions', 'empresa'],
      });
      expect(result).toEqual(expected);
    });
  });

  describe('createRole', () => {
    it('creates role and assigns permissions when provided', async () => {
      const savedRole = createRole();
      const roleWithRelations = createRole({ permissions: [] });
      const permissionEntities = [createPermission()];

      roleRepository.create.mockReturnValue(savedRole);
      roleRepository.save
        .mockResolvedValueOnce(savedRole)
        .mockResolvedValueOnce({ ...roleWithRelations, permissions: permissionEntities });
      roleRepository.findOne
        .mockResolvedValueOnce(roleWithRelations)
        .mockResolvedValueOnce({ ...roleWithRelations, permissions: permissionEntities });
      permissionRepository.findBy.mockResolvedValue(permissionEntities);

      const result = await service.createRole({ nombre: 'Admin', permissions: [10] });

      expect(roleRepository.create).toHaveBeenCalledWith({ nombre: 'Admin' });
      expect(roleRepository.save).toHaveBeenCalledTimes(2);
      expect(permissionRepository.findBy).toHaveBeenCalledWith({ id: expect.anything() });
      expect(result.permissions).toEqual(permissionEntities);
    });

    it('creates role without assigning permissions when none provided', async () => {
      const savedRole = createRole();

      roleRepository.create.mockReturnValue(savedRole);
      roleRepository.save.mockResolvedValue(savedRole);
      roleRepository.findOne.mockResolvedValue(savedRole);

      const result = await service.createRole({ nombre: 'Invitado' });

      expect(permissionRepository.findBy).not.toHaveBeenCalled();
      expect(roleRepository.save).toHaveBeenCalledTimes(1);
      expect(result).toEqual(savedRole);
    });
  });

  describe('updateRole', () => {
    it('updates role data and permissions', async () => {
      const role = createRole({ id: 5 });
      const permissionEntities = [createPermission({ id: 2 })];

      roleRepository.update.mockResolvedValue(undefined);
      roleRepository.findOne
        .mockResolvedValueOnce(role)
        .mockResolvedValueOnce({ ...role, permissions: permissionEntities });
      permissionRepository.findBy.mockResolvedValue(permissionEntities);
      roleRepository.save.mockResolvedValue({ ...role, permissions: permissionEntities });

      const result = await service.updateRole(5, { nombre: 'Editor', permissions: [2] });

      expect(roleRepository.update).toHaveBeenCalledWith(5, { nombre: 'Editor' });
      expect(permissionRepository.findBy).toHaveBeenCalledWith({ id: expect.anything() });
      expect(result.permissions).toEqual(permissionEntities);
    });

    it('throws when role not found while updating permissions', async () => {
      roleRepository.update.mockResolvedValue(undefined);
      roleRepository.findOne.mockResolvedValue(null);

      await expect(
        service.updateRole(7, { permissions: [1] }),
      ).rejects.toThrow(new BadRequestException('Role with id 7 not found'));
    });
  });

  describe('deleteRole', () => {
    it('delegates to repository delete', async () => {
      roleRepository.delete.mockResolvedValue(undefined);

      await service.deleteRole(3);

      expect(roleRepository.delete).toHaveBeenCalledWith(3);
    });
  });

  describe('bulkDeleteRoles', () => {
    it('validates empresa ownership when empresaId provided', async () => {
      roleRepository.find.mockResolvedValue([createRole({ id: 1 }), createRole({ id: 2 })]);
      roleRepository.delete.mockResolvedValue(undefined);

      await service.bulkDeleteRoles([1, 2], 1);

      expect(roleRepository.find).toHaveBeenCalledWith({
        where: { id: expect.anything(), empresa_id: 1 },
      });
      expect(roleRepository.delete).toHaveBeenCalledWith([1, 2]);
    });

    it('throws when roles do not belong to empresa', async () => {
      roleRepository.find.mockResolvedValue([createRole({ id: 1 })]);

      await expect(service.bulkDeleteRoles([1, 2], 1)).rejects.toThrow(
        new BadRequestException('Algunos roles no pertenecen a tu empresa o no existen'),
      );
      expect(roleRepository.delete).not.toHaveBeenCalled();
    });

    it('throws when attempting to delete current user role', async () => {
      await expect(service.bulkDeleteRoles([4], undefined, 4)).rejects.toThrow(
        new BadRequestException('No puedes eliminar tu propio rol'),
      );
    });
  });

  describe('bulkUpdateRoleStatus', () => {
    it('updates estado for provided roles', async () => {
      const validationRoles = [createRole({ id: 9 })];
      const finalRoles = [createRole({ id: 9, estado: false })];
      roleRepository.find
        .mockResolvedValueOnce(validationRoles)
        .mockResolvedValueOnce(finalRoles);
      roleRepository.update.mockResolvedValue(undefined);

      const result = await service.bulkUpdateRoleStatus([9], false, 1);

      expect(roleRepository.update).toHaveBeenCalledWith([9], { estado: false });
      expect(result).toEqual(finalRoles);
    });

    it('throws when roles do not belong to empresa', async () => {
      roleRepository.find.mockResolvedValueOnce([]);

      await expect(service.bulkUpdateRoleStatus([1], true, 1)).rejects.toThrow(
        new BadRequestException('Algunos roles no pertenecen a tu empresa o no existen'),
      );
    });

    it('throws when attempting to change estado of current role', async () => {
      roleRepository.find.mockResolvedValueOnce([createRole({ id: 1 })]);

      await expect(service.bulkUpdateRoleStatus([1], true, undefined, 1)).rejects.toThrow(
        new BadRequestException('No puedes cambiar el estado de tu propio rol'),
      );
    });
  });

  describe('soft deletion helpers', () => {
    it('soft deletes a single role', async () => {
      const role = createRole({ estado: false });
      roleRepository.update.mockResolvedValue(undefined);
      roleRepository.findOne.mockResolvedValue(role);

      const result = await service.softDeleteRole(3);

      expect(roleRepository.update).toHaveBeenCalledWith(3, { estado: false });
      expect(result).toEqual(role);
    });

    it('bulk soft deletes roles', async () => {
      roleRepository.update.mockResolvedValue(undefined);

      await service.bulkSoftDeleteRoles([1, 2, 3]);

      expect(roleRepository.update).toHaveBeenCalledWith([1, 2, 3], { estado: false });
    });
  });
});
