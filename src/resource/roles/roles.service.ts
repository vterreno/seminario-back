import { Injectable } from '@nestjs/common';
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
        protected roleService: Repository<RoleEntity>,
        @InjectRepository(PermissionEntity) 
        private readonly permissionRepository: Repository<PermissionEntity>,
    ){
        super(roleService);
    }

    // Get roles filtered by company
    async getRolesByEmpresa(empresaId: number): Promise<RoleEntity[]> {
        return await this.roleService.find({
            where: { empresa_id: empresaId },
            relations: ['permissions', 'empresa'],
        });
    }

    // Get all roles (for superadmin)
    async getAllRoles(): Promise<RoleEntity[]> {
        return await this.roleService.find({
            relations: ['permissions', 'empresa'],
        });
    }

    // Create role with permissions
    async createRole(roleData: any): Promise<RoleEntity> {
        const { permissions, ...restRoleData } = roleData;
        
        // Create role without permissions first
        const role = this.roleService.create(restRoleData);
        const savedRole = await this.roleService.save(role);
        
        // If permissions are provided, assign them
        if (permissions && Array.isArray(permissions)) {
            const roleWithRelations = await this.roleService.findOne({
                where: { id: (savedRole as unknown as RoleEntity).id },
                relations: ['permissions']
            });
            const permissionEntities = await this.permissionRepository.findBy({ 
                id: In(permissions) 
            });
            roleWithRelations.permissions = permissionEntities;
            await this.roleService.save(roleWithRelations);
        }
        
        return await this.findById((savedRole as unknown as RoleEntity).id);
    }

    // Update role with permissions
    async updateRole(id: number, roleData: any): Promise<RoleEntity> {
        const { permissions, ...restRoleData } = roleData;
        
        // Update basic role data
        await this.roleService.update(id, restRoleData);
        
        // If permissions are provided, update them
        if (permissions && Array.isArray(permissions)) {
            const role = await this.findById(id);
            
            if (!role) {
                throw new Error(`Role with id ${id} not found`);
            }
            
            const permissionEntities = await this.permissionRepository.findBy({ id: In(permissions) });
            role.permissions = permissionEntities;
            await this.roleService.save(role);
        }
        
        return await this.findById(id);
    }

    // Find role by id with relations
    async findById(id: number): Promise<RoleEntity> {
        return await this.roleService.findOne({
            where: { id },
            relations: ['permissions', 'empresa'],
        });
    }

    // Delete single role
    async deleteRole(id: number): Promise<void> {
        await this.roleService.delete(id);
    }

    // Bulk delete roles
    async bulkDeleteRoles(ids: number[]): Promise<void> {
        await this.roleService.delete(ids);
    }

    // Bulk update role status (activate/deactivate)
    async bulkUpdateRoleStatus(ids: number[], estado: boolean): Promise<void> {
        await this.roleService.update(ids, { estado });
    }

    // Soft delete (set estado to false instead of hard delete)
    async softDeleteRole(id: number): Promise<RoleEntity> {
        await this.roleService.update(id, { estado: false });
        return await this.findById(id);
    }

    // Bulk soft delete
    async bulkSoftDeleteRoles(ids: number[]): Promise<void> {
        await this.roleService.update(ids, { estado: false });
    }
}
