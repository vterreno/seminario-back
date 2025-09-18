import { Body, Controller, Delete, Get, Param, Post, Put, Req, UseGuards, Query } from '@nestjs/common';
import { BaseController } from 'src/base-service/base-controller.controller';
import { MarcaEntity } from 'src/database/core/marcas.entity';
import { MarcasService } from './marcas.service';
import { CreateMarcaDto } from './dto/create-marca.dto';
import { UpdateMarcaDto } from './dto/update-marca.dto';
import { Action } from 'src/middlewares/decorators/action.decorator';
import { RequestWithUser } from '../users/interface/request-user';
import { AuthGuard } from 'src/middlewares/auth.middleware';
import { PermissionsGuard } from 'src/middlewares/permission.middleware';
import { Entity as EntityDecorator } from 'src/middlewares/decorators/entity.decorator';

@UseGuards(AuthGuard, PermissionsGuard)
@EntityDecorator('marca')
@Controller('marcas')
export class MarcasController extends BaseController<MarcaEntity>{
    constructor(protected readonly marcasService: MarcasService){
        super(marcasService);
    }
    
    @Get()
    @Action('ver')
    async getAllMarcas(@Req() req: RequestWithUser) {
        const user = req.user;

        // If user has a company, filter marcas by that company
        if (user.empresa?.id) {
            return await this.marcasService.getMarcasByEmpresa(user.empresa.id);
        }

        // If no company (superadmin), return all marcas
        return await this.marcasService.getAllMarcas();
    }

    @Get(':id')
    @Action('ver')
    async getMarcaById(@Param('id') id: number) {
        return await this.marcasService.findById(id);
    }

    @Get('empresa/:id')
    @Action('ver')
    async getMarcasByEmpresa(@Param('id') id: number) {
        return await this.marcasService.getMarcasByEmpresa(id);
    }

    @Post()
    @Action('agregar')
    async createMarca(@Body() marcaData: CreateMarcaDto, @Req() req: RequestWithUser) {
        const user = req.user;
        // If user has a company and empresa_id is not provided, assign that company to the marca
        if (user.empresa?.id && !marcaData.empresa_id) {
            marcaData.empresa_id = user.empresa.id;
        }

        return await this.marcasService.createMarca(marcaData);
    }

    @Put(':id')
    @Action('modificar')
    async updateMarca(@Param('id') id: number, @Body() marcaData: UpdateMarcaDto, @Req() req: RequestWithUser) {
        const user = req.user;

        // Verify the marca belongs to the user's company (if user has a company)
        if (user.empresa?.id) {
            const existingMarca = await this.marcasService.findById(id);
            if (!existingMarca) {
                throw new Error('Marca no encontrada');
            }
            if (existingMarca.empresa_id !== user.empresa.id) {
                throw new Error('No tienes permisos para modificar esta marca');
            }
            // Ensure company_id doesn't change for regular users
            if (marcaData.empresa_id && marcaData.empresa_id !== user.empresa.id) {
                throw new Error('No puedes cambiar la empresa de la marca');
            }
        }

        return await this.marcasService.updateMarca(id, marcaData);
    }

    @Delete(':id')
    @Action('eliminar')
    async deleteMarca(@Param('id') id: number, @Req() req: RequestWithUser) {
        //Como todavia no se desarrollo lo que es producto, no se puede hacer la
        //validacion de que no se pueda eliminar una marca que este asociada a un producto

        const user = req.user;
        
        // Verify the marca belongs to the user's company (if user has a company)
        if (user.empresa?.id) {
            const existingMarca = await this.marcasService.findById(id);
            if (existingMarca.empresa_id !== user.empresa.id) {
                throw new Error('No tienes permisos para eliminar esta marca');
            }
        }

        await this.marcasService.deleteMarca(id);
        return { message: 'Marca eliminada exitosamente' };
    }

    @Delete('bulk/delete')
    @Action('eliminar')
    async bulkDeleteMarcas(@Body() body: { ids: number[] }, @Req() req: RequestWithUser) {
        //Como todavia no se desarrollo lo que es producto, no se puede hacer la
        //validacion de que no se pueda eliminar una marca que este asociada a un producto
        const user = req.user;
        const { ids } = body;

        try {
            await this.marcasService.bulkDeleteMarcas(
                ids, 
                user.empresa?.id
            );
            return { message: `${ids.length} marcas eliminadas exitosamente` };
        } catch (error) {
            console.error('Error en bulk delete de marcas:', error);
            throw new Error(`Error al eliminar marcas: ${error.message}`);
        }
    }

    @Put('bulk/status')
    @Action('modificar')
    async bulkUpdateMarcaStatus(@Body() body: { ids: number[], estado: boolean }, @Req() req: RequestWithUser) {
        const user = req.user;
        const { ids, estado } = body;

        try {
            const updatedMarcas = await this.marcasService.bulkUpdateMarcaStatus(
                ids, 
                estado, 
                user.empresa?.id
            );
            
            const action = estado ? 'activadas' : 'desactivadas';
            return { 
                message: `${ids.length} marcas ${action} exitosamente`,
                updatedMarcas: updatedMarcas
            };
        } catch (error) {
            console.error('Error en bulk update de marcas:', error);
            throw new Error(`Error al actualizar marcas: ${error.message}`);
        }
    }

}
