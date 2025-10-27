import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Req, BadRequestException, Put } from '@nestjs/common';
import { ProductosService } from './productos.service';
import { CreateProductoDto } from './dto/create-producto.dto';
import { UpdateProductoDto } from './dto/update-producto.dto';
import { Action } from 'src/middlewares/decorators/action.decorator';
import { Entity as EntityDecorator } from 'src/middlewares/decorators/entity.decorator';
import { AuthGuard } from 'src/middlewares/auth.middleware';
import { PermissionsGuard } from 'src/middlewares/permission.middleware';
import { BaseController } from 'src/base-service/base-controller.controller';
import { ProductoEntity } from 'src/database/core/producto.entity';
import { RequestWithUser } from '../users/interface/request-user';
import { ProductoValidationPipe } from './pipes/producto-validation.pipe';

@UseGuards(AuthGuard, PermissionsGuard)
@EntityDecorator('producto')
@Controller('productos')
export class ProductosController extends BaseController<ProductoEntity>{
    constructor(protected readonly productoService: ProductosService){
        super(productoService);
    }
    @Get()
    @Action('ver')
    async getAllProductos(@Req() req: RequestWithUser) {
        const user = req.user;

        // If user has a company, filter productos by sucursales of that company
        if (user.empresa?.id) {
            //Extrae los IDs de todas sus sucursales
            const sucursalIds = user.sucursales.map(sucursal => sucursal.id);

            return await this.productoService.getProductosBySucursal(sucursalIds);
        }
        // If no company (superadmin), return all productos
        return await this.productoService.getAllProductos();
    }

    @Get(':id')
    @Action('ver')
    async getProductoById(@Param('id') id: number) {
        return await this.productoService.findById(id);
    }

    @Get('sucursal/:id')
    @Action('ver')
    async getProductosBySucursal(@Param('id') id: number) {
        return await this.productoService.getProductosBySucursal([id]);
    }

    @Get('empresa/:id')
    @Action('ver')
    async getProductosByEmpresa(@Param('id') id: number) {
        return await this.productoService.getProductosByEmpresa(id);
    }

    @Post()
    @Action('agregar')
    async createProducto(@Body(ProductoValidationPipe) productoData: CreateProductoDto, @Req() req: RequestWithUser) {
        const user = req.user;
        // Si no se proporciona sucursal_id, se podría asignar una sucursal por defecto
        // de la empresa del usuario, pero es mejor requerir que se especifique
        
        // Validar que la sucursal pertenezca a la empresa del usuario
        if (user.empresa?.id && productoData.sucursal_id) {
            await this.productoService.validateSucursalBelongsToEmpresa(productoData.sucursal_id, user.empresa.id);
        }

        return await this.productoService.createProducto(productoData);
    }

    @Put(':id')
    @Action('modificar')
    async updateProducto(@Param('id') id: number, @Body(ProductoValidationPipe) productoData: UpdateProductoDto, @Req() req: RequestWithUser) {
        const user = req.user;

        // Verify the producto belongs to a sucursal of the user's company (if user has a company)
        if (user.empresa?.id) {
            const existingProducto = await this.productoService.findById(id);
            if (!existingProducto) {
                throw new BadRequestException('Producto no encontrado');
            }
            
            // Validar que la sucursal del producto pertenezca a la empresa del usuario
            await this.productoService.validateProductoBelongsToEmpresa(existingProducto, user.empresa.id);
            
            // Si se intenta cambiar la sucursal, validar que la nueva también pertenezca a la empresa
            if (productoData.sucursal_id && productoData.sucursal_id !== existingProducto.sucursal_id) {
                await this.productoService.validateSucursalBelongsToEmpresa(productoData.sucursal_id, user.empresa.id);
            }
        }

        return await this.productoService.updateProducto(id, productoData);
    }

    @Delete(':id')
    @Action('eliminar')
    async deleteMarca(@Param('id') id: number, @Req() req: RequestWithUser) {
        const user = req.user;
        
        // Verify the producto belongs to a sucursal of the user's company (if user has a company)
        if (user.empresa?.id) {
            const existingProducto = await this.productoService.findById(id);
            if (!existingProducto) {
                throw new BadRequestException('Producto no encontrado');
            }
            await this.productoService.validateProductoBelongsToEmpresa(existingProducto, user.empresa.id);
        }

        await this.productoService.deleteProducto(id);
        return { message: 'Producto eliminado exitosamente' };
    }

    @Delete('bulk/delete')
    @Action('eliminar')
    async bulkDeleteProductos(@Body() body: { ids: number[] }, @Req() req: RequestWithUser) {
        const user = req.user;
        const { ids } = body;

        try {
            await this.productoService.bulkDeleteProductos(
                ids, 
                user.empresa?.id
            );
            return { message: `${ids.length} productos eliminados exitosamente` };
        } catch (error) {
            throw new BadRequestException(error.message);
        }
    }

    @Put('bulk/status')
    @Action('modificar')
    async bulkUpdateProductoStatus(@Body() body: { ids: number[], estado: boolean }, @Req() req: RequestWithUser) {
        const user = req.user;
        const { ids, estado } = body;

        try {
            const updatedProductos = await this.productoService.bulkUpdateProductoStatus(
                ids, 
                estado, 
                user.empresa?.id
            );
            
            const action = estado ? 'activadas' : 'desactivadas';
            return { 
                message: `${ids.length} productos ${action} exitosamente`,
                updatedProductos: updatedProductos
            };
        } catch (error) {
            // Si el error viene del servicio con un mensaje específico (como validación de stock),
            // pasarlo directamente sin agregar texto adicional
            throw new BadRequestException(error.message);
        }
    }

}

