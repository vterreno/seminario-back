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

        // If user has a company, filter productos by that company
        if (user.empresa?.id) {
            return await this.productoService.getProductosByEmpresa(user.empresa.id);
        }

        // If no company (superadmin), return all productos
        return await this.productoService.getAllProductos();
    }

    @Get(':id')
    @Action('ver')
    async getProductoById(@Param('id') id: number) {
        return await this.productoService.findById(id);
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
        // If user has a company and empresa_id is not provided, assign that company to the producto
        if (user.empresa?.id && !productoData.empresa_id) {
            productoData.empresa_id = user.empresa.id;
        }

        return await this.productoService.createProducto(productoData);
    }

    @Put(':id')
    @Action('modificar')
    async updateProducto(@Param('id') id: number, @Body(ProductoValidationPipe) productoData: UpdateProductoDto, @Req() req: RequestWithUser) {
        const user = req.user;

        // Verify the producto belongs to the user's company (if user has a company)
        if (user.empresa?.id) {
            const existingProducto = await this.productoService.findById(id);
            if (!existingProducto) {
                throw new BadRequestException('Producto no encontrado');
            }
            if (existingProducto.empresa_id !== user.empresa.id) {
                throw new BadRequestException('No tienes permisos para modificar este producto');
            }
            // Ensure company_id doesn't change for regular users
            if (productoData.empresa_id && productoData.empresa_id !== user.empresa.id) {
                throw new BadRequestException('No puedes cambiar la empresa del producto');
            }
        }

        return await this.productoService.updateProducto(id, productoData);
    }

    @Delete(':id')
    @Action('eliminar')
    async deleteMarca(@Param('id') id: number, @Req() req: RequestWithUser) {
        //Como todavia no se desarrollo lo que es producto, no se puede hacer la
        //validacion de que no se pueda eliminar una marca que este asociada a un producto

        const user = req.user;
        
        // Verify the producto belongs to the user's company (if user has a company)
        if (user.empresa?.id) {
            const existingProducto = await this.productoService.findById(id);
            if (existingProducto.empresa_id !== user.empresa.id) {
                throw new BadRequestException('No tienes permisos para eliminar este producto');
            }
        }

        await this.productoService.deleteProducto(id);
        return { message: 'Producto eliminado exitosamente' };
    }

    @Delete('bulk/delete')
    @Action('eliminar')
    async bulkDeleteProductos(@Body() body: { ids: number[] }, @Req() req: RequestWithUser) {
        //Como todavia no se desarrollo lo que es producto, no se puede hacer la
        //validacion de que no se pueda eliminar una marca que este asociada a un producto
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

