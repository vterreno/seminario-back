import { Controller, UseGuards, Get, Post, Put, Delete, Param, Body, Req } from '@nestjs/common';
import { BaseController } from 'src/base-service/base-controller.controller';
import { RoleEntity } from 'src/database/core/roles.entity';
import { RolesService } from './roles.service';
import { Entity } from 'typeorm';
import { AuthGuard } from 'src/middlewares/auth.middleware';
import { PermissionsGuard } from 'src/middlewares/permission.middleware';
import { RequestWithUser } from 'src/resource/users/interface/request-user';
import { Action } from 'src/middlewares/decorators/action.decorator';
import { Entity as EntityDecorator } from 'src/middlewares/decorators/entity.decorator';

@UseGuards(AuthGuard, PermissionsGuard)
@Entity('roles')
@EntityDecorator('roles')
@Controller('roles')
export class RolesController extends BaseController<RoleEntity>{
    constructor(protected readonly roleService:RolesService){
        super(roleService);
    }


    @Get()
    @Action('ver')
    async getAllRoles(@Req() req: RequestWithUser) {
        const user = req.user;
        
        // If user has a company, filter roles by that company
        if (user.empresa?.id) {
            return await this.roleService.getRolesByCompany(user.empresa.id);
        }
        
        // If no company (superadmin), return all roles
        return await this.roleService.getAllRoles();
    }

    @Get(':id')
    @Action('ver')
    async getRoleById(@Param('id') id: number) {
        return await this.roleService.findById(id);
    }

    @Get('empresa/:id')
    @Action('ver')
    async getRolesByEmpresa(@Param('id') id: number) {
        console.log('id', id);
        
        return await this.roleService.getRolesByCompany(id);
    }

    @Post()
    @Action('agregar')
    async createRole(@Body() roleData: Partial<RoleEntity>, @Req() req: RequestWithUser) {
        const user = req.user;
        
        // If user has a company, assign that company to the role
        if (user.empresa?.id) {
            roleData.empresa_id = user.empresa.id;
        }
        
        return await this.roleService.createRole(roleData);
    }

    @Put(':id')
    @Action('modificar')
    async updateRole(@Param('id') id: number, @Body() roleData: Partial<RoleEntity>, @Req() req: RequestWithUser) {
        const user = req.user;
        
        // Verify the role belongs to the user's company (if user has a company)
        if (user.empresa?.id) {
            const existingRole = await this.roleService.findById(id);
            if (existingRole.empresa_id !== user.empresa.id) {
                throw new Error('No tienes permisos para modificar este rol');
            }
            // Ensure company_id doesn't change
            roleData.empresa_id = user.empresa.id;
        }
        
        return await this.roleService.updateRole(id, roleData);
    }

    @Delete(':id')
    @Action('eliminar')
    async deleteRole(@Param('id') id: number, @Req() req: RequestWithUser) {
        const user = req.user;
        
        // Verify the role belongs to the user's company (if user has a company)
        if (user.empresa?.id) {
            const existingRole = await this.roleService.findById(id);
            if (existingRole.empresa_id !== user.empresa.id) {
                throw new Error('No tienes permisos para eliminar este rol');
            }
        }
        
        await this.roleService.deleteRole(id);
        return { message: 'Rol eliminado exitosamente' };
    }

    @Delete('bulk/delete')
    @Action('eliminar')
    async bulkDeleteRoles(@Body() body: { ids: number[] }, @Req() req: RequestWithUser) {
        const user = req.user;
        const { ids } = body;

        // Verify all roles belong to the user's company (if user has a company)
        if (user.empresa?.id) {
            for (const id of ids) {
                const existingRole = await this.roleService.findById(id);
                if (existingRole.empresa_id !== user.empresa.id) {
                    throw new Error(`No tienes permisos para eliminar el rol con ID ${id}`);
                }
            }
        }

        await this.roleService.bulkDeleteRoles(ids);
        return { message: `${ids.length} roles eliminados exitosamente` };
    }

    @Put('bulk/status')
    @Action('modificar')
    async bulkUpdateRoleStatus(@Body() body: { ids: number[], estado: boolean }, @Req() req: RequestWithUser) {
        const user = req.user;
        const { ids, estado } = body;

        // Verify all roles belong to the user's company (if user has a company)
        if (user.empresa?.id) {
            for (const id of ids) {
                const existingRole = await this.roleService.findById(id);
                if (existingRole.empresa_id !== user.empresa.id) {
                    throw new Error(`No tienes permisos para modificar el rol con ID ${id}`);
                }
            }
        }

        await this.roleService.bulkUpdateRoleStatus(ids, estado);
        const action = estado ? 'activados' : 'desactivados';
        return { message: `${ids.length} roles ${action} exitosamente` };
    }
}
