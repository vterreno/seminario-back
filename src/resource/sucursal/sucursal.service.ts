import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { BaseService } from 'src/base-service/base-service.service';
import { sucursalEntity } from 'src/database/core/sucursal.entity';
import { FindManyOptions, FindOneOptions, Repository } from 'typeorm';


@Injectable()
export class SucursalService extends BaseService<sucursalEntity> {
  findManyOptions: FindManyOptions<sucursalEntity> = {};
  findOneOptions: FindOneOptions<sucursalEntity> = {};
  constructor(
    @InjectRepository(sucursalEntity)
    protected sucursalService: Repository<sucursalEntity>,
  ) {
    super(sucursalService);
  }
  async delete(id: number):Promise<{ message: string }> {
        //Lo que hace el FindOptionsWhere es una conversion explicita de un objeto a un objeto FindOptionsWhere
        const entity = await this.repository.findOneBy({id});
        if (!entity) {
            throw new Error(`Entity with id ${id} not found`);
        }
        if(entity.estado === true){
          throw new Error(`La sucursal con id ${id} no se puede eliminar porque está activa`);
        }
        await this.repository.softDelete(id);
        return {"message": "deleted" };
    }
}
