import { Controller, Get, Post, Body, Param, Delete, UseGuards, BadRequestException, Put, Req } from '@nestjs/common';
import { ListaPreciosService } from './lista-precios.service';
import { CreateListaPrecioDto } from './dto/create-lista-precio.dto';
import { UpdateListaPrecioDto } from './dto/update-lista-precio.dto';
import { Entity as EntityDecorator } from 'src/middlewares/decorators/entity.decorator';
import { AuthGuard } from 'src/middlewares/auth.middleware';
import { PermissionsGuard } from 'src/middlewares/permission.middleware';
import { Action } from 'src/middlewares/decorators/action.decorator';
import { RequestWithUser } from '../users/interface/request-user';
import { BaseController } from 'src/base-service/base-controller.controller';
import { ListaPreciosEntity } from 'src/database/core/lista-precios.entity';

@UseGuards(AuthGuard, PermissionsGuard)
@EntityDecorator('modulo_listas')
@Controller('lista-precios')
export class ListaPreciosController extends BaseController<ListaPreciosEntity>{
    constructor(protected readonly listaPreciosService: ListaPreciosService) {
        super(listaPreciosService);
    }
    
    @Get()
    @Action('ver')
    async getAllListaPrecios(@Req() req: RequestWithUser) {
        const user = req.user;

        // If user has a company, filter lista precios by that company
        if (user.empresa?.id) {
            return await this.listaPreciosService.getListaPreciosByEmpresa(user.empresa.id);
        }

        // If no company (superadmin), return all lista precios
        return await this.listaPreciosService.getAllListaPrecios();
    }

    @Get(':id')
    @Action('ver')
    async getListaPrecioById(@Param('id') id: number) {
        return await this.listaPreciosService.findById(id);
    }

    @Get('empresa/:id')
    @Action('ver')
    async getListaPreciosByEmpresa(@Param('id') id: number) {
        return await this.listaPreciosService.getListaPreciosByEmpresa(id);
    }

    @Post()
    @Action('agregar')
    async createListaPrecio(@Body() listaPreciosData: CreateListaPrecioDto, @Req() req: RequestWithUser) {
        const user = req.user;
        // If user has a company and empresa_id is not provided, assign that company to the lista precio
        if (user.empresa?.id && !listaPreciosData.empresa_id) {
            listaPreciosData.empresa_id = user.empresa.id;
        }

        return await this.listaPreciosService.createListaPrecio(listaPreciosData);
    }

    @Put(':id')
    @Action('modificar')
    async updateListaPrecio(@Param('id') id: number, @Body() listaPreciosData: UpdateListaPrecioDto, @Req() req: RequestWithUser) {
        const user = req.user;

        // Verify the lista precio belongs to the user's company (if user has a company)
        if (user.empresa?.id) {
            const existingListaPrecio = await this.listaPreciosService.findById(id);
            if (!existingListaPrecio) {
                throw new BadRequestException('Lista precio no encontrada');
            }
            if (existingListaPrecio.empresa_id !== user.empresa.id) {
                throw new BadRequestException('No tienes permisos para modificar esta lista precio');
            }
            // Ensure company_id doesn't change for regular users
            if (listaPreciosData.empresa_id && listaPreciosData.empresa_id !== user.empresa.id) {
                throw new BadRequestException('No puedes cambiar la empresa de la lista precio');
            }
        }

        return await this.listaPreciosService.updateListaPrecio(id, listaPreciosData);
    }

    @Delete(':id')
    @Action('eliminar')
    async deleteListaPrecio(@Param('id') id: number, @Req() req: RequestWithUser) {
        //Como todavia no se desarrollo lo que es producto, no se puede hacer la
        //validacion de que no se pueda eliminar una marca que este asociada a un producto

        const user = req.user;

        // Verify the lista precio belongs to the user's company (if user has a company)
        if (user.empresa?.id) {
            const existingListaPrecio = await this.listaPreciosService.findById(id);
            if (existingListaPrecio.sucursal_id !== user.empresa.id) {
                throw new BadRequestException('No tienes permisos para eliminar esta lista precio');
            }
        }

        await this.listaPreciosService.deleteListaPrecio(id);
        return { message: 'Lista precio eliminada exitosamente' };
    }

    @Delete('bulk/delete')
    @Action('eliminar')
    async bulkDeleteListaPrecios(@Body() body: { ids: number[] }, @Req() req: RequestWithUser) {
        //Como todavia no se desarrollo lo que es producto, no se puede hacer la
        //validacion de que no se pueda eliminar una marca que este asociada a un producto
        const user = req.user;
        const { ids } = body;

        try {
            await this.listaPreciosService.bulkDeleteListaPrecios(
                ids, 
                user.empresa?.id
            );
            return { message: `${ids.length} lista precios eliminadas exitosamente` };
        } catch (error) {
            throw new BadRequestException(error.message);
        }
    }

    @Put('bulk/status')
    @Action('modificar')
    async bulkUpdateListaPrecioStatus(@Body() body: { ids: number[], estado: boolean }, @Req() req: RequestWithUser) {
        const user = req.user;
        const { ids, estado } = body;

        try {
            const updatedListaPrecios = await this.listaPreciosService.bulkUpdateListaPrecioStatus(
                ids, 
                estado, 
                user.empresa?.id
            );
            
            const action = estado ? 'activadas' : 'desactivadas';
            return { 
                message: `${ids.length} lista precios ${action} exitosamente`,
                updatedListaPrecios: updatedListaPrecios
            };
        } catch (error) {
            // Si el error viene del servicio con un mensaje específico (como validación de stock),
            // pasarlo directamente sin agregar texto adicional
            throw new BadRequestException(error.message);
        }
    }
    @Get(':id/productos')
    @Action('ver')
    async getProductosByListaPrecio(@Param('id') id: number, @Req() req: RequestWithUser) {
        const user = req.user;

        // El superadmin (sin empresa) puede ver productos de cualquier lista
        // Usuarios normales solo pueden ver productos de listas de su empresa
        if (user.empresa?.id) {
            const existingListaPrecio = await this.listaPreciosService.findById(id);
            if (!existingListaPrecio) {
                throw new BadRequestException('Lista de precios no encontrada');
            }
            if (existingListaPrecio.sucursal_id !== user.empresa.id) {
                throw new BadRequestException('No tienes permisos para ver los productos de esta lista de precios');
            }
        }
        // Si no tiene empresa (superadmin), puede ver productos de cualquier lista

        return await this.listaPreciosService.getProductosByListaPrecio(id);
    }
    
    @Put(':id/productos/:productoId/precio')
    @Action('modificar')
    async updateProductoPrecio(@Param('id') id: number, @Param('productoId') productoId: number, @Body() body: { precio: number }, @Req() req: RequestWithUser) {
        const user = req.user;

        // Verify the lista precio belongs to the user's company (if user has a company)
        if (user.empresa?.id) {
            const existingListaPrecio = await this.listaPreciosService.findById(id);
            if (!existingListaPrecio) {
                throw new BadRequestException('Lista de precios no encontrada');
            }
            if (existingListaPrecio.sucursal_id !== user.empresa.id) {
                throw new BadRequestException('No tienes permisos para modificar los productos de esta lista de precios');
            }
        }

        return await this.listaPreciosService.updateProductoPrecio(id, productoId, body.precio);
    }

    @Post(':id/productos')
    @Action('modificar')
    async addProductoToListaPrecio(@Param('id') id: number, @Body() body: { productoId: number, precioEspecifico: number }, @Req() req: RequestWithUser) {
        const user = req.user;

        // Verify the lista precio belongs to the user's company (if user has a company)
        if (user.empresa?.id) {
            const existingListaPrecio = await this.listaPreciosService.findById(id);
            if (!existingListaPrecio) {
                throw new BadRequestException('Lista de precios no encontrada');
            }
            if (existingListaPrecio.sucursal_id !== user.empresa.id) {
                throw new BadRequestException('No tienes permisos para modificar esta lista de precios');
            }
        }

        return await this.listaPreciosService.addProductoToListaPrecio(id, body.productoId, body.precioEspecifico);
    }

    @Delete(':id/productos/:productoId')
    @Action('eliminar')
    async removeProductoFromListaPrecio(@Param('id') id: number, @Param('productoId') productoId: number, @Req() req: RequestWithUser) {
        const user = req.user;

        // Verify the lista precio belongs to the user's company (if user has a company)
        if (user.empresa?.id) {
            const existingListaPrecio = await this.listaPreciosService.findById(id);
            if (!existingListaPrecio) {
                throw new BadRequestException('Lista de precios no encontrada');
            }
            if (existingListaPrecio.sucursal_id !== user.empresa.id) {
                throw new BadRequestException('No tienes permisos para modificar esta lista de precios');
            }
        }

        await this.listaPreciosService.removeProductoFromListaPrecio(id, productoId);
        return { message: 'Producto eliminado de la lista de precios exitosamente' };
    }
}
