import {
    Controller,
    Get,
    Post,
    Body,
    Param,
    Delete,
    Req,
    UseGuards,
    BadRequestException,
    Put,
} from '@nestjs/common';
import { UnidadesMedidaService } from './unidades-medida.service';
import { CreateUnidadMedidaDto, UpdateUnidadMedidaDto } from './dto/unidad-medida.dto';
import { AuthGuard } from 'src/middlewares/auth.middleware';
import { Action } from 'src/middlewares/decorators/action.decorator';
import { RequestWithUser } from '../users/interface/request-user';
import { UnidadMedidaEntity } from 'src/database/core/unidad-medida.entity';
import { BaseController } from 'src/base-service/base-controller.controller';
import { PermissionsGuard } from 'src/middlewares/permission.middleware';
import { Entity as EntityDecorator } from 'src/middlewares/decorators/entity.decorator';

@Controller('unidad-medida')
@EntityDecorator('unidad_medida')
@UseGuards(AuthGuard, PermissionsGuard)
export class UnidadesMedidaController extends BaseController<UnidadMedidaEntity>{
    constructor(protected readonly unidadMedidaService: UnidadesMedidaService){
        super(unidadMedidaService);
    }
    @Get()
    @Action('ver')
    async getAllUnidades(@Req() req: RequestWithUser) {
        const user = req.user;

        // If user has a company, filter unidades by that company
        if (user.empresa?.id) {
            return await this.unidadMedidaService.getUnidadesByEmpresa(user.empresa.id);
        }

        // If no company (superadmin), return all unidades
        return await this.unidadMedidaService.getAllUnidades();
    }

    @Get(':id')
    @Action('ver')
    async getUnidadById(@Param('id') id: number) {
        return await this.unidadMedidaService.findOne({where: { id }});
    }

    @Get('empresa/:id')
    @Action('ver')
    async getUnidadesByEmpresa(@Param('id') id: number) {
        return await this.unidadMedidaService.getUnidadesByEmpresa(id);
    }

    @Post()
    @Action('agregar')
    async createUnidad(@Body() unidadData: CreateUnidadMedidaDto, @Req() req: RequestWithUser) {
        const user = req.user;
        // If user has a company and empresaId is not provided, assign that company to the unidad
        if (user.empresa?.id && !unidadData.empresaId) {
            unidadData.empresaId = user.empresa.id;
        }

        return await this.unidadMedidaService.createUnidad(unidadData);
    }

    @Put(':id')
    @Action('modificar')
    async updateUnidad(@Param('id') id: number, @Body() unidadData: UpdateUnidadMedidaDto, @Req() req: RequestWithUser) {
        const user = req.user;

        // Verify the unidad belongs to the user's company (if user has a company)
        if (user.empresa?.id) {
            const existingUnidad = await this.unidadMedidaService.findOne({
                where: { id },
            });
            if (!existingUnidad) {
                throw new BadRequestException('Unidad no encontrada');
            }
            if (existingUnidad.empresa_id !== user.empresa.id) {
                throw new BadRequestException('No tienes permisos para modificar esta unidad');
            }
            // Ensure company_id doesn't change for regular users
            if (unidadData.empresaId && unidadData.empresaId !== user.empresa.id) {
                throw new BadRequestException('No puedes cambiar la empresa de la unidad');
            }
        }

        return await this.unidadMedidaService.updateUnidad(id, unidadData);
    }

    @Delete(':id')
    @Action('eliminar')
    async deleteUnidad(@Param('id') id: number, @Req() req: RequestWithUser) {
        const user = req.user;
        // Verify the unidad belongs to the user's company (if user has a company)
        if (user.empresa?.id) {
            const existingUnidad = await this.unidadMedidaService.findOne({
                where: { id },
            });
            if (existingUnidad.empresa_id !== user.empresa.id) {
                throw new BadRequestException('No tienes permisos para eliminar esta unidad');
            }
        }

        await this.unidadMedidaService.deleteUnidad(id);
        return { message: 'Unidad eliminada exitosamente' };
    }

    @Delete('bulk/delete')
    @Action('eliminar')
    async bulkDeleteUnidades(@Body() body: { ids: number[] }, @Req() req: RequestWithUser) {
        //Como todavia no se desarrollo lo que es producto, no se puede hacer la
        //validacion de que no se pueda eliminar una marca que este asociada a un producto
        const user = req.user;
        const { ids } = body;

        try {
            await this.unidadMedidaService.bulkDeleteUnidades(
                ids, 
                user.empresa?.id
            );
            return { message: `${ids.length} unidades eliminadas exitosamente` };
        } catch (error) {
            throw new BadRequestException(error.message);
        }
    }

    @Put('bulk/status')
    @Action('modificar')
    async bulkUpdateUnidadStatus(@Body() body: { ids: number[], estado: boolean }, @Req() req: RequestWithUser) {
        const user = req.user;
        const { ids, estado } = body;

        try {
            const updatedUnidades = await this.unidadMedidaService.bulkUpdateUnidadStatus(
                ids, 
                estado, 
                user.empresa?.id
            );
            
            const action = estado ? 'activadas' : 'desactivadas';
            return { 
                message: `${ids.length} unidades ${action} exitosamente`,
                updatedUnidades: updatedUnidades
            };
        } catch (error) {
            // Si el error viene del servicio con un mensaje específico (como validación de stock),
            // pasarlo directamente sin agregar texto adicional
            throw new BadRequestException(error.message);
        }
    }
}
