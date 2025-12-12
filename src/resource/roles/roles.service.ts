import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { BaseService } from 'src/base-service/base-service.service';
import { RoleEntity } from 'src/database/core/roles.entity';
import { PermissionEntity } from 'src/database/core/permission.entity';
import { UserEntity } from 'src/database/core/user.entity';
import { FindManyOptions, FindOneOptions, Repository, In } from 'typeorm';

@Injectable()
export class RolesService extends BaseService<RoleEntity> {
    findManyOptions: FindManyOptions<RoleEntity> = {};
    findOneOptions: FindOneOptions<RoleEntity> = {
        relations: ['permissions', 'empresa'],
    };
    constructor(
        @InjectRepository(RoleEntity) 
        protected roleRepository: Repository<RoleEntity>,
        @InjectRepository(PermissionEntity) 
        private readonly permissionRepository: Repository<PermissionEntity>,
        @InjectRepository(UserEntity)
        private readonly userRepository: Repository<UserEntity>,
    ){
        super(roleRepository);
    }

    // Verificar si un rol tiene usuarios asociados
    private async hasUsersAssociated(roleId: number): Promise<boolean> {
        const count = await this.userRepository.count({ where: { role_id: roleId } });
        return count > 0;
    }

    // Verificar si alguno de los roles tiene usuarios asociados
    private async getRolesWithUsers(roleIds: number[]): Promise<number[]> {
        const users = await this.userRepository.find({
            where: { role_id: In(roleIds) },
            select: ['role_id'],
        });
        return [...new Set(users.map(u => u.role_id))];
    }

    // Get roles filtered by company
    async getRolesByEmpresa(empresaId: number): Promise<RoleEntity[]> {
        return await this.roleRepository.find({
            where: { empresa_id: empresaId },
            relations: ['permissions', 'empresa'],
        });
    }

    // Get all roles (for superadmin)
    async getAllRoles(): Promise<RoleEntity[]> {
        return await this.roleRepository.find({
            relations: ['permissions', 'empresa'],
        });
    }

    // Create role with permissions
    async createRole(roleData: any): Promise<RoleEntity> {
        const { permissions, ...restRoleData } = roleData;
        
        // Create role without permissions first
        const role = this.roleRepository.create(restRoleData);
        const savedRole = await this.roleRepository.save(role);
        
        // If permissions are provided, assign them
        if (permissions && Array.isArray(permissions)) {
            const roleWithRelations = await this.roleRepository.findOne({
                where: { id: (savedRole as unknown as RoleEntity).id },
                relations: ['permissions']
            });
            const permissionEntities = await this.permissionRepository.findBy({ 
                id: In(permissions) 
            });
            roleWithRelations.permissions = permissionEntities;
            await this.roleRepository.save(roleWithRelations);
        }
        
        return await this.findById((savedRole as unknown as RoleEntity).id);
    }

    // Update role with permissions
    async updateRole(id: number, roleData: any): Promise<RoleEntity> {
        const { permissions, ...restRoleData } = roleData;
        
        // Update basic role data
        await this.roleRepository.update(id, restRoleData);
        
        // If permissions are provided, update them
        if (permissions && Array.isArray(permissions)) {
            const role = await this.findById(id);
            
            if (!role) {
                throw new BadRequestException(`Role with id ${id} not found`);
            }
            
            const permissionEntities = await this.permissionRepository.findBy({ id: In(permissions) });
            role.permissions = permissionEntities;
            await this.roleRepository.save(role);
        }
        
        return await this.findById(id);
    }

    // Find role by id with relations
    async findById(id: number): Promise<RoleEntity> {
        return await this.roleRepository.findOne({
            where: { id },
            relations: ['permissions', 'empresa'],
        });
    }

    // Delete single role
    async deleteRole(id: number): Promise<void> {
        // Verificar si el rol tiene usuarios asociados
        if (await this.hasUsersAssociated(id)) {
            throw new BadRequestException('No se puede eliminar el rol porque tiene usuarios asociados');
        }
        await this.roleRepository.delete(id);
    }

    // Bulk delete roles
    async bulkDeleteRoles(ids: number[], empresaId?: number, currentUserRoleId?: number): Promise<void> {
        // If empresa validation is needed, check roles belong to the company
        if (empresaId) {
            const roles = await this.roleRepository.find({
                where: { id: In(ids), empresa_id: empresaId }
            });
            
            if (roles.length !== ids.length) {
                throw new BadRequestException('Algunos roles no pertenecen a tu empresa o no existen');
            }
        }

        // Verificar que el usuario no esté intentando eliminar su propio rol
        if (currentUserRoleId && ids.includes(currentUserRoleId)) {
            throw new BadRequestException('No puedes eliminar tu propio rol');
        }

        // Verificar si algún rol tiene usuarios asociados
        const rolesWithUsers = await this.getRolesWithUsers(ids);
        if (rolesWithUsers.length > 0) {
            throw new BadRequestException('No se pueden eliminar los roles porque algunos tienen usuarios asociados');
        }

        await this.roleRepository.delete(ids);
    }

    // Bulk update role status (activate/deactivate)
    async bulkUpdateRoleStatus(ids: number[], estado: boolean, empresaId?: number, currentUserRoleId?: number): Promise<RoleEntity[]> {
        // If empresa validation is needed, check roles belong to the company
        if (empresaId) {
            const roles = await this.roleRepository.find({
                where: { id: In(ids), empresa_id: empresaId }
            });
            
            if (roles.length !== ids.length) {
                throw new BadRequestException('Algunos roles no pertenecen a tu empresa o no existen');
            }
        }

        // Verificar que el usuario no esté intentando cambiar el estado de su propio rol
        if (currentUserRoleId && ids.includes(currentUserRoleId)) {
            throw new BadRequestException('No puedes cambiar el estado de tu propio rol');
        }

        // Si se está desactivando, verificar que no haya usuarios asociados
        if (!estado) {
            const rolesWithUsers = await this.getRolesWithUsers(ids);
            if (rolesWithUsers.length > 0) {
                throw new BadRequestException('No se pueden desactivar los roles porque algunos tienen usuarios asociados');
            }
        }

        // Update the roles
        await this.roleRepository.update(ids, { estado });
        
        // Return updated roles with relations
        return await this.roleRepository.find({
            where: { id: In(ids) },
            relations: ['permissions', 'empresa']
        });
    }

    // Soft delete (set estado to false instead of hard delete)
    async softDeleteRole(id: number): Promise<RoleEntity> {
        // Verificar si el rol tiene usuarios asociados
        if (await this.hasUsersAssociated(id)) {
            throw new BadRequestException('No se puede desactivar el rol porque tiene usuarios asociados');
        }
        await this.roleRepository.update(id, { estado: false });
        return await this.findById(id);
    }

    // Bulk soft delete
    async bulkSoftDeleteRoles(ids: number[]): Promise<void> {
        // Verificar si algún rol tiene usuarios asociados
        const rolesWithUsers = await this.getRolesWithUsers(ids);
        if (rolesWithUsers.length > 0) {
            throw new BadRequestException('No se pueden desactivar los roles porque algunos tienen usuarios asociados');
        }
        await this.roleRepository.update(ids, { estado: false });
    }

    async asignarPermisosArol(nombre: string, empresaId: number | null, permisoCreado: PermissionEntity) {
        const role = await this.roleRepository.findOne({
            where: { nombre, empresa_id: empresaId },
            relations: ['permissions']
        });
        if (role) {
            // Verificar si el permiso ya está asignado
            const permisoYaAsignado = role.permissions?.some(p => p.id === permisoCreado.id);
            if (!permisoYaAsignado) {
                await this.roleRepository
                    .createQueryBuilder()
                    .relation(RoleEntity, 'permissions')
                    .of(role)
                    .add(permisoCreado);
            }
        } else {
            throw new BadRequestException(`No se encontró el rol Administrador para la empresa seleccionada. Por favor, verifica que la empresa tenga un rol Administrador antes de crear una lista de precios.`);
        }
    }

    async eliminarPermisoDeRoles(permisoEliminado: PermissionEntity) {
        const rolesConPermiso = await this.roleRepository.createQueryBuilder('role')
            .leftJoinAndSelect('role.permissions', 'permission')
            .where('permission.id = :permisoId', { permisoId: permisoEliminado.id })
            .getMany();

        // Remover el permiso de cada rol usando QueryBuilder
        for (const role of rolesConPermiso) {
            await this.roleRepository
                .createQueryBuilder()
                .relation(RoleEntity, 'permissions')
                .of(role)
                .remove(permisoEliminado);
        }

    }
}
