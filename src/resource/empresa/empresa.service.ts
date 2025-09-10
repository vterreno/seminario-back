import { Injectable, ForbiddenException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { BaseService } from 'src/base-service/base-service.service';
import { empresaEntity } from 'src/database/core/empresa.entity';
import { sucursalEntity } from 'src/database/core/sucursal.entity';
import { UserEntity } from 'src/database/core/user.entity';
import { FindManyOptions, FindOneOptions, In, Repository } from 'typeorm';
import { UpdateEmpresaDto } from './dto/update-empresa.dto';
import { UserI } from '../users/interface/user.interface';


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

  async updateMyCompany(updateData: UpdateEmpresaDto, user: UserI): Promise<{ message: string; empresa: empresaEntity }> {
    // Verificar que el usuario tenga una empresa asignada
    if (!user.empresa?.id) {
      throw new ForbiddenException('Usuario no tiene empresa asignada');
    }

    // Buscar la empresa del usuario
    const empresa = await this.repository.findOneBy({ id: user.empresa.id });
    if (!empresa) {
      throw new NotFoundException('Empresa no encontrada');
    }

    // Actualizar solo el nombre de la empresa
    empresa.name = updateData.name;
    
    const empresaActualizada = await this.repository.save(empresa);
    
    return {
      message: 'Empresa actualizada correctamente',
      empresa: empresaActualizada
    };
  }

}
