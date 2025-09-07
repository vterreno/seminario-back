import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { BaseService } from 'src/base-service/base-service.service';
import { empresaEntity } from 'src/database/core/empresa.entity';
import { sucursalEntity } from 'src/database/core/sucursal.entity';
import { UserEntity } from 'src/database/core/user.entity';
import { FindManyOptions, FindOneOptions, In, Repository } from 'typeorm';


@Injectable()
export class EmpresaService extends BaseService<empresaEntity> {
  findManyOptions: FindManyOptions<empresaEntity> = {};
  findOneOptions: FindOneOptions<empresaEntity> = {
    relations: ['sucursales']
  };
  constructor(
    @InjectRepository(empresaEntity)
    protected empresaService: Repository<empresaEntity>,
    @InjectRepository(sucursalEntity)
    protected sucursalesRepository: Repository<sucursalEntity>,
    @InjectRepository(UserEntity)
    protected usuariosRepository: Repository<UserEntity>,
  ) {
    super(empresaService);
  } 

  async delete(id: number): Promise<{ message: string }> {
    const empresa = await this.repository.findOneBy({id});
    if (!empresa) {
      throw new Error(`Empresa with id ${id} not found`);
    }
    const sucursales = await this.sucursalesRepository.find({ where: { empresa_id: id } });
    if (sucursales.length > 0) {
      return {"message": "Empresa con sucursales, no se puede eliminar"};
    }
    const usuarios = await this.usuariosRepository.find({ where: { empresa: { id } } });
    if (usuarios.length > 0) {
      return {"message": "Empresa con usuarios, no se puede eliminar"};
    }
    await this.repository.softDelete(id);
    return {"message": "Empresa deleted successfully" };
  }

  async deleteEmpresas(ids: number[]): Promise<{ message: string }> {
    const sucursales = await this.sucursalesRepository.find({ where: { empresa: { id: In(ids) } } });
    if (sucursales.length > 0) {
      return {"message": "Algunas empresas con sucursales, no se pueden eliminar"};
    }
    const usuarios = await this.usuariosRepository.find({ where: { empresa: { id: In(ids) } } });
    if (usuarios.length > 0) {
      return {"message": "Algunas empresas con usuarios, no se pueden eliminar"};
    }
    await this.repository.softDelete(ids);
    return {"message": "Empresas deleted successfully" };
  }

}
