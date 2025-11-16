import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, FindManyOptions, IsNull } from 'typeorm';
import { ProductoProveedorEntity } from 'src/database/core/producto-proveedor.entity';
import { ProductoEntity } from 'src/database/core/producto.entity';
import { contactoEntity } from 'src/database/core/contacto.entity';
import { CreateProductoProveedorDto } from './dto/create-producto-proveedor.dto';
import { UpdateProductoProveedorDto } from './dto/update-producto-proveedor.dto';
import { BaseService } from 'src/base-service/base-service.service';

@Injectable()
export class ProductoProveedorService extends BaseService<ProductoProveedorEntity> {
  findManyOptions: FindManyOptions<ProductoProveedorEntity> = {
    relations: ['producto', 'producto.marca', 'producto.categoria', 'producto.unidadMedida', 'proveedor'],
    where: { deleted_at: IsNull() }
  };

  findOneOptions: FindManyOptions<ProductoProveedorEntity> = {
    relations: ['producto', 'producto.marca', 'producto.categoria', 'producto.unidadMedida', 'proveedor'],
  };

  constructor(
    @InjectRepository(ProductoProveedorEntity)
    protected productoProveedorRepository: Repository<ProductoProveedorEntity>,
    @InjectRepository(ProductoEntity)
    protected productoRepository: Repository<ProductoEntity>,
    @InjectRepository(contactoEntity)
    protected contactoRepository: Repository<contactoEntity>,
  ) {
    super(productoProveedorRepository);
  }

  // Obtener todos los productos de un proveedor
  async findByProveedor(proveedorId: number): Promise<ProductoProveedorEntity[]> {
    return await this.productoProveedorRepository.find({
      where: { 
        proveedor_id: proveedorId,
        deleted_at: IsNull()
      },
      relations: ['producto', 'producto.marca', 'producto.categoria', 'producto.unidadMedida', 'proveedor'],
    });
  }

  // Obtener todos los proveedores de un producto
  async findByProducto(productoId: number): Promise<ProductoProveedorEntity[]> {
    return await this.productoProveedorRepository.find({
      where: { 
        producto_id: productoId,
        deleted_at: IsNull()
      },
      relations: ['producto', 'proveedor'],
    });
  }

  // Crear relación producto-proveedor
  async create(createDto: CreateProductoProveedorDto): Promise<ProductoProveedorEntity> {
    // Verificar que el producto existe
    const producto = await this.productoRepository.findOne({
      where: { id: createDto.producto_id }
    });

    if (!producto) {
      throw new NotFoundException(`Producto con id ${createDto.producto_id} no encontrado`);
    }

    // Verificar que el proveedor existe
    const proveedor = await this.contactoRepository.findOne({
      where: { id: createDto.proveedor_id }
    });

    if (!proveedor) {
      throw new NotFoundException(`Proveedor con id ${createDto.proveedor_id} no encontrado`);
    }
    // Validar que el contacto tiene el rol adecuado
    if (proveedor.rol !== 'proveedor' && proveedor.rol !== 'ambos') {
      throw new BadRequestException(`El contacto con id ${createDto.proveedor_id} no tiene el rol de proveedor o ambos`);
    }

    // Verificar si ya existe la relación
    const existente = await this.productoProveedorRepository.findOne({
      where: {
        producto_id: createDto.producto_id,
        proveedor_id: createDto.proveedor_id,
        deleted_at: IsNull()
      }
    });

    if (existente) {
      throw new BadRequestException('La relación producto-proveedor ya existe');
    }

    // Crear la relación
    const productoProveedor = this.productoProveedorRepository.create(createDto);
    const saved = await this.productoProveedorRepository.save(productoProveedor);

    // Retornar con relaciones
    return await this.productoProveedorRepository.findOne({
      where: { id: saved.id },
      relations: ['producto', 'producto.marca', 'producto.categoria', 'producto.unidadMedida', 'proveedor'],
    });
  }

  // Actualizar relación producto-proveedor
  async update(id: number, updateDto: UpdateProductoProveedorDto): Promise<ProductoProveedorEntity> {
    const productoProveedor = await this.productoProveedorRepository.findOne({
      where: { id, deleted_at: IsNull() }
    });

    if (!productoProveedor) {
      throw new NotFoundException(`Relación producto-proveedor con id ${id} no encontrada`);
    }

    // Si se está actualizando producto_id o proveedor_id, verificar que no cree duplicados
    const nuevoProductoId = updateDto.producto_id ?? productoProveedor.producto_id;
    const nuevoProveedorId = updateDto.proveedor_id ?? productoProveedor.proveedor_id;

    // Solo validar si hay cambio en producto_id o proveedor_id
    if (updateDto.producto_id || updateDto.proveedor_id) {
      const existente = await this.productoProveedorRepository.findOne({
        where: {
          producto_id: nuevoProductoId,
          proveedor_id: nuevoProveedorId,
          deleted_at: IsNull()
        }
      });

      // Si existe y no es el mismo registro que estamos actualizando
      if (existente && existente.id !== id) {
        throw new BadRequestException(
          'Ya existe una relación producto-proveedor con esa combinación de producto y proveedor'
        );
      }
    }

    // Actualizar
    Object.assign(productoProveedor, updateDto);
    const updated = await this.productoProveedorRepository.save(productoProveedor);

    // Retornar con relaciones
    return await this.productoProveedorRepository.findOne({
      where: { id: updated.id },
      relations: ['producto', 'producto.marca', 'producto.categoria', 'producto.unidadMedida', 'proveedor'],
    });
  }

  // Eliminar relación producto-proveedor (soft delete)
  async remove(id: number): Promise<void> {
    const productoProveedor = await this.productoProveedorRepository.findOne({
      where: { id, deleted_at: IsNull() }
    });

    if (!productoProveedor) {
      throw new NotFoundException(`Relación producto-proveedor con id ${id} no encontrada`);
    }

    productoProveedor.deleted_at = new Date();
    await this.productoProveedorRepository.save(productoProveedor);
  }
}
