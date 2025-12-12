import { Controller, UseGuards, Get, Post, Put, Delete, Param, Body, Req } from '@nestjs/common';
import { BaseController } from 'src/base-service/base-controller.controller';
import { RoleEntity } from 'src/database/core/roles.entity';
import { RolesService } from './roles.service';
import { AuthGuard } from 'src/middlewares/auth.middleware';
import { PermissionsGuard } from 'src/middlewares/permission.middleware';
import { RequestWithUser } from 'src/resource/users/interface/request-user';
import { Action } from 'src/middlewares/decorators/action.decorator';
import { Entity as EntityDecorator } from 'src/middlewares/decorators/entity.decorator';

@UseGuards(AuthGuard, PermissionsGuard)
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
            return await this.roleService.getRolesByEmpresa(user.empresa.id);
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
        return await this.roleService.getRolesByEmpresa(id);
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
        
        // Verificar que el usuario no esté intentando eliminar su propio rol
        if (user.role?.id === id) {
            throw new Error('No puedes eliminar tu propio rol');
        }
        
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

        await this.roleService.bulkDeleteRoles(
            ids, 
            user.empresa?.id,
            user.role?.id // Pass current user's role ID to prevent self-deletion
        );
        return { message: `${ids.length} roles eliminados exitosamente` };
    }

    @Put('bulk/status')
    @Action('modificar')
    async bulkUpdateRoleStatus(@Body() body: { ids: number[], estado: boolean }, @Req() req: RequestWithUser) {
        const user = req.user;
        const { ids, estado } = body;

        const updatedRoles = await this.roleService.bulkUpdateRoleStatus(
            ids, 
            estado, 
            user.empresa?.id, // Pass company ID for validation
            user.role?.id // Pass current user's role ID to prevent self-modification
        );
        
        const action = estado ? 'activados' : 'desactivados';
        return { 
            message: `${ids.length} roles ${action} exitosamente`,
            updatedRoles: updatedRoles
        };
    }
}
