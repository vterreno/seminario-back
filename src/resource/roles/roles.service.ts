import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { BaseService } from 'src/base-service/base-service.service';
import { RoleEntity } from 'src/database/core/roles.entity';
import { PermissionEntity } from 'src/database/core/permission.entity';
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
    ){
        super(roleRepository);
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
        await this.roleRepository.update(id, { estado: false });
        return await this.findById(id);
    }

    // Bulk soft delete
    async bulkSoftDeleteRoles(ids: number[]): Promise<void> {
        await this.roleRepository.update(ids, { estado: false });
    }
}
