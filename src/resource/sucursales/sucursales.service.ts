import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { BaseService } from 'src/base-service/base-service.service';
import { sucursalEntity } from 'src/database/core/sucursal.entity';
import { FindManyOptions, FindOneOptions, Repository, In } from 'typeorm';


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
  ) {
    super(sucursalesRepository);
  }

  async findByEmpresa(empresaId: number): Promise<sucursalEntity[]> {
    return await this.repository.find({
      where: { empresa: { id: empresaId } },
      relations: ['empresa']
    });
  }

  
  async delete(id: number): Promise<{ message: string }> {
    const entity = await this.repository.findOneBy({id});
    if (!entity) {
      throw new Error(`Entity with id ${id} not found`);
    }
    if(entity.estado === true){
      throw new Error(`La sucursal no se puede eliminar porque está activa`);
    }
    await this.repository.softDelete(id);
    return {"message": "deleted" };
  }

  async updateSucursalesStatus(ids: number[], estado: boolean): Promise<{ message: string }> {
    await this.repository.update(ids, { estado });
    return {"message": "Status updated successfully" };
  }

  async deleteSucursales(ids: number[]): Promise<{ message: string }> {
    // Verificar que todas las sucursales estén inactivas antes de eliminar
    const sucursales = await this.repository.find({ where: { id: In(ids) } });
    const activeSucursales = sucursales.filter(s => s.estado === true);
    
    if (activeSucursales.length > 0) {
      return {"message": "Algunas sucursales están activas, no se pueden eliminar" };
    }
    
    await this.repository.softDelete(ids);
    return {"message": "Sucursales deleted successfully" };
  }
}
