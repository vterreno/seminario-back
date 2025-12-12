import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { BaseService } from 'src/base-service/base-service.service';
import { sucursalEntity } from 'src/database/core/sucursal.entity';
import { ProductoEntity } from 'src/database/core/producto.entity';
import { FindManyOptions, FindOneOptions, Repository, In, IsNull, UpdateResult } from 'typeorm';
import { QueryDeepPartialEntity } from 'typeorm/query-builder/QueryPartialEntity';


@Injectable()
export class SucursalesService extends BaseService<sucursalEntity> {
  findManyOptions: FindManyOptions<sucursalEntity> = {
    relations: ['empresa']
  };
  findOneOptions: FindOneOptions<sucursalEntity> = {
    relations: ['empresa']
  };
  constructor(
    @InjectRepository(sucursalEntity)
    protected sucursalesRepository: Repository<sucursalEntity>,
    @InjectRepository(ProductoEntity)
    private productosRepository: Repository<ProductoEntity>,
  ) {
    super(sucursalesRepository);
  }

  async findByEmpresa(empresaId: number): Promise<sucursalEntity[]> {
    return await this.repository.find({
      where: { empresa: { id: empresaId } },
      relations: ['empresa']
    });
  }

  // Sobrescribir replace para validar productos antes de desactivar
  async replace(id: string | number, entity: Partial<sucursalEntity>): Promise<sucursalEntity> {
    const sucursal = await this.repository.findOneBy({ id: Number(id) });
    
    if (!sucursal) {
      throw new NotFoundException(`Sucursal con id ${id} no encontrada`);
    }

    // Si se intenta desactivar (cambiar estado de true a false), verificar productos
    if (entity.estado === false && sucursal.estado === true) {
      const productosAsociados = await this.productosRepository.count({
        where: { sucursal_id: Number(id), deleted_at: IsNull() },
      });

      if (productosAsociados > 0) {
        throw new BadRequestException(
          `No se puede desactivar la sucursal "${sucursal.nombre}" porque tiene ${productosAsociados} producto(s) asociado(s).`
        );
      }
    }

    const updatedEntity = { ...sucursal, ...entity };
    return this.repository.save(updatedEntity);
  }

  // Sobrescribir updatePartial para validar productos antes de desactivar
  async updatePartial(id: string | number, entity: QueryDeepPartialEntity<sucursalEntity>): Promise<UpdateResult> {
    const sucursal = await this.repository.findOneBy({ id: Number(id) });
    
    if (!sucursal) {
      throw new NotFoundException(`Sucursal con id ${id} no encontrada`);
    }

    // Si se intenta desactivar (cambiar estado de true a false), verificar productos
    if (entity.estado === false && sucursal.estado === true) {
      const productosAsociados = await this.productosRepository.count({
        where: { sucursal_id: Number(id), deleted_at: IsNull() },
      });

      if (productosAsociados > 0) {
        throw new BadRequestException(
          `No se puede desactivar la sucursal "${sucursal.nombre}" porque tiene ${productosAsociados} producto(s) asociado(s).`
        );
      }
    }

    return this.repository.update(id, entity);
  }

  
  async delete(id: number): Promise<{ message: string }> {
    const entity = await this.repository.findOneBy({id});
    if (!entity) {
      throw new NotFoundException(`Sucursal con id ${id} no encontrada`);
    }
    if(entity.estado === true){
      throw new BadRequestException(`La sucursal no se puede eliminar porque está activa`);
    }
    
    // Verificar si tiene productos asociados
    const productosAsociados = await this.productosRepository.count({
      where: { sucursal_id: id, deleted_at: IsNull() },
    });

    if (productosAsociados > 0) {
      throw new BadRequestException(
        `No se puede eliminar la sucursal "${entity.nombre}" porque tiene ${productosAsociados} producto(s) asociado(s).`
      );
    }
    
    await this.repository.softDelete(id);
    return {"message": "deleted" };
  }

  async updateSucursalesStatus(ids: number[], estado: boolean): Promise<{ message: string }> {
    // Si se intenta desactivar, verificar que no tengan productos asociados
    if (estado === false) {
      const sucursalesConProductos: string[] = [];

      for (const id of ids) {
        const sucursal = await this.repository.findOneBy({ id });
        if (sucursal && sucursal.estado === true) {
          const productosCount = await this.productosRepository.count({
            where: { sucursal_id: id, deleted_at: IsNull() },
          });

          if (productosCount > 0) {
            sucursalesConProductos.push(`${sucursal.nombre} (${productosCount} productos)`);
          }
        }
      }

      if (sucursalesConProductos.length > 0) {
        throw new BadRequestException(
          `No se pueden desactivar las siguientes sucursales porque tienen productos asociados: ${sucursalesConProductos.join(', ')}`
        );
      }
    }
    
    await this.repository.update(ids, { estado });
    return {"message": "Status updated successfully" };
  }

  async deleteSucursales(ids: number[]): Promise<{ message: string }> {
    // Verificar que todas las sucursales estén inactivas antes de eliminar
    const sucursales = await this.repository.find({ where: { id: In(ids) } });
    const activeSucursales = sucursales.filter(s => s.estado === true);
    
    if (activeSucursales.length > 0) {
      throw new BadRequestException("Algunas sucursales están activas, no se pueden eliminar");
    }

    // Verificar que ninguna tenga productos asociados
    const sucursalesConProductos: string[] = [];

    for (const sucursal of sucursales) {
      const productosCount = await this.productosRepository.count({
        where: { sucursal_id: sucursal.id, deleted_at: IsNull() },
      });

      if (productosCount > 0) {
        sucursalesConProductos.push(`${sucursal.nombre} (${productosCount} productos)`);
      }
    }

    if (sucursalesConProductos.length > 0) {
      throw new BadRequestException(
        `No se pueden eliminar las siguientes sucursales porque tienen productos asociados: ${sucursalesConProductos.join(', ')}`
      );
    }
    
    await this.repository.softDelete(ids);
    return {"message": "Sucursales deleted successfully" };
  }
}
