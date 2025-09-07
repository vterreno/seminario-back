import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { BaseService } from 'src/base-service/base-service.service';
import { RoleEntity } from 'src/database/core/roles.entity';
import { FindManyOptions, FindOneOptions, Repository } from 'typeorm';

@Injectable()
export class RolesService extends BaseService<RoleEntity> {
    findManyOptions: FindManyOptions<RoleEntity> = {};
    findOneOptions: FindOneOptions<RoleEntity> = {
        relations: ['permissions', 'empresa'],
    };
    constructor(
        @InjectRepository(RoleEntity) 
        protected roleService: Repository<RoleEntity>,
    ){
        super(roleService);
    }

    // Get roles filtered by company
    async getRolesByCompany(empresaId: number): Promise<RoleEntity[]> {
        return await this.roleService.find({
            where: { empresa_id: empresaId },
            relations: ['permissions', 'empresa'],
        });
    }

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

    // Create role with company
    async createRole(roleData: Partial<RoleEntity>): Promise<RoleEntity> {
        const role = this.roleService.create(roleData);
        return await this.roleService.save(role);
    }

    // Update role
    async updateRole(id: number, roleData: Partial<RoleEntity>): Promise<RoleEntity> {
        await this.roleService.update(id, roleData);
        return await this.findById(id);
    }

    // Find role by id with relations
    async findById(id: number): Promise<RoleEntity> {
        return await this.roleService.findOne({
            where: { id },
            relations: ['permissions', 'empresa'],
        });
    }
}
