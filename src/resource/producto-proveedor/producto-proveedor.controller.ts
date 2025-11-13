import { Controller, Get, Post, Put, Delete, Body, Param, ParseIntPipe, UseGuards } from '@nestjs/common';
import { ProductoProveedorService } from './producto-proveedor.service';
import { CreateProductoProveedorDto } from './dto/create-producto-proveedor.dto';
import { UpdateProductoProveedorDto } from './dto/update-producto-proveedor.dto';
import { AuthGuard } from 'src/middlewares/auth.middleware';

@Controller('producto-proveedor')
@UseGuards(AuthGuard)
export class ProductoProveedorController {
  constructor(private readonly productoProveedorService: ProductoProveedorService) {}

  // Obtener todos los productos de un proveedor
  @Get('proveedor/:proveedorId')
  async findByProveedor(@Param('proveedorId', ParseIntPipe) proveedorId: number) {
    return await this.productoProveedorService.findByProveedor(proveedorId);
  }

  // Obtener todos los proveedores de un producto
  @Get('producto/:productoId')
  async findByProducto(@Param('productoId', ParseIntPipe) productoId: number) {
    return await this.productoProveedorService.findByProducto(productoId);
  }

  // Obtener por ID
  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number) {
    return await this.productoProveedorService.findOne({ 
      where: { id },
      relations: ['producto', 'producto.marca', 'producto.categoria', 'producto.unidadMedida', 'proveedor']
    });
  }

  // Crear relación producto-proveedor
  @Post()
  async create(@Body() createDto: CreateProductoProveedorDto) {
    return await this.productoProveedorService.create(createDto);
  }

  // Actualizar relación producto-proveedor
  @Put(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateDto: UpdateProductoProveedorDto
  ) {
    return await this.productoProveedorService.update(id, updateDto);
  }

  // Eliminar relación producto-proveedor
  @Delete(':id')
  async remove(@Param('id', ParseIntPipe) id: number) {
    await this.productoProveedorService.remove(id);
    return { message: 'Relación producto-proveedor eliminada correctamente' };
  }
}
