import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Req, Put } from '@nestjs/common';
import { CategoriasService } from './categorias.service';
import { BaseController } from 'src/base-service/base-controller.controller';
import { categoriasEntity } from 'src/database/core/categorias.entity';
import { Entity as EntityDecorator } from 'src/middlewares/decorators/entity.decorator';
import { AuthGuard } from 'src/middlewares/auth.middleware';
import { PermissionsGuard } from 'src/middlewares/permission.middleware';
import { RequestWithUser } from '../users/interface/request-user';
import { Action } from 'src/middlewares/decorators/action.decorator';

@UseGuards(AuthGuard, PermissionsGuard)
@EntityDecorator('categoria')
@Controller('categorias')
export class CategoriasController extends BaseController<categoriasEntity>{
    constructor(protected readonly categoriasService: CategoriasService) {
        super(categoriasService);
    }
    @Get()
    @Action('ver')
    async getAllCategorias(@Req() req: RequestWithUser) {
        const user = req.user;

        // If user has a company, filter categories by that company
        if (user.empresa?.id) {
        return await this.categoriasService.getCategoriasByEmpresa(user.empresa.id);
        }

        // If no company (superadmin), return all categories
        return await this.categoriasService.getAllCategorias();
    }
        @Get(':id')
        @Action('ver')
        async getCategoriaById(@Param('id') id: number) {
            return await this.categoriasService.findById(id);
        }
    
        @Get('empresa/:id')
        @Action('ver')
        async getCategoriasByEmpresa(@Param('id') id: number) {
            return await this.categoriasService.getCategoriasByEmpresa(id);
        }
    
        @Post()
        @Action('agregar')
        async createCategoria(@Body() categoriaData: Partial<categoriasEntity>, @Req() req: RequestWithUser) {

            const user = req.user;
            // If user has a company, assign that company to the category
            if (user.empresa?.id) {
                categoriaData.empresa_id = user.empresa.id;
            }
            
            return await this.categoriasService.createCategoria(categoriaData);
        }
    
        @Put(':id')
        @Action('modificar')
        async updateCategoria(@Param('id') id: number, @Body() categoriaData: Partial<categoriasEntity>, @Req() req: RequestWithUser) {
            const user = req.user;
            // Verify the category belongs to the user's company (if user has a company)
            if (user.empresa?.id) {
                const existingCategoria = await this.categoriasService.findById(id);
                if (existingCategoria.empresa_id !== user.empresa.id) {
                    throw new Error('No tienes permisos para modificar esta categoría');
                }
                // Ensure company_id doesn't change
                categoriaData.empresa_id = user.empresa.id;
            }

            return await this.categoriasService.updateCategoria(id, categoriaData);
        }
    
        @Delete(':id')
        @Action('eliminar')
        async deleteCategoria(@Param('id') id: number, @Req() req: RequestWithUser) {
            const user = req.user;

            // Verify the category belongs to the user's company (if user has a company)
            if (user.empresa?.id) {
                const existingCategoria = await this.categoriasService.findById(id);
                if (existingCategoria.empresa_id !== user.empresa.id) {
                    throw new Error('No tienes permisos para eliminar esta categoría');
                }
            }

            await this.categoriasService.deleteCategoria(id);
            return { message: 'Categoría eliminada exitosamente' };
        }
    
        @Delete('bulk/delete')
        @Action('eliminar')
        async bulkDeleteCategorias(@Body() body: { ids: number[] }, @Req() req: RequestWithUser) {
            const user = req.user;
            const { ids } = body;
    
            try {
                await this.categoriasService.bulkDeleteCategorias(
                    ids, 
                    user.empresa?.id
                );
                return { message: `${ids.length} categorías eliminadas exitosamente` };
            } catch (error) {
                console.error('Error en bulk delete de categorías:', error);
                throw new Error(`Error al eliminar categorías: ${error.message}`);
            }
        }
    
        @Put('bulk/status')
        @Action('modificar')
        async bulkUpdateCategoriaStatus(@Body() body: { ids: number[], estado: boolean }, @Req() req: RequestWithUser) {
            const user = req.user;
            const { ids, estado } = body;
    
            try {
                const updatedCategorias = await this.categoriasService.bulkUpdateCategoriaStatus(
                    ids, 
                    estado, 
                    user.empresa?.id // Pass company ID for validation
                );
                
                const action = estado ? 'activadas' : 'desactivadas';
                return { 
                    message: `${ids.length} categorías ${action} exitosamente`,
                    updatedCategorias: updatedCategorias
                };
            } catch (error) {
                console.error('Error en bulk update de categorías:', error);
                throw new Error(`Error al actualizar categorías: ${error.message}`);
            }
        }

}
