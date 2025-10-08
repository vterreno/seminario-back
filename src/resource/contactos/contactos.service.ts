import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { BaseService } from 'src/base-service/base-service.service';
import { contactoEntity } from 'src/database/core/contacto.entity';
import { empresaEntity } from 'src/database/core/empresa.entity';
import { Repository, In } from 'typeorm';

@Injectable()
export class ContactosService extends BaseService<contactoEntity> {
  constructor(
    @InjectRepository(contactoEntity)
    protected contactosRepository: Repository<contactoEntity>,
    @InjectRepository(empresaEntity)
    protected empresaRepository: Repository<empresaEntity>
  ) {
    super(contactosRepository);
  }

  async findByRoles(roles: string[], empresaId?: number, isSuperAdmin?: boolean): Promise<contactoEntity[]> {
    const query = this.contactosRepository
      .createQueryBuilder('contacto')
      .leftJoinAndSelect('contacto.empresa', 'empresa')
      .where('contacto.rol IN (:...roles)', { roles })
      .andWhere('contacto.deleted_at IS NULL')
      .orderBy('contacto.id', 'DESC');

    // Si no es superadmin, filtrar por empresa del usuario
    if (!isSuperAdmin && empresaId) {
      query.andWhere('contacto.empresa_id = :empresaId', { empresaId });
    }

    return query.getMany();
  }

  async createContacto(data: Partial<contactoEntity>): Promise<contactoEntity> {
    try {
      // Validaciones: si hay tipo_identificacion, numero_identificacion es obligatorio y único por empresa
      if (data.tipo_identificacion && !data.numero_identificacion) {
        throw new BadRequestException('El número de identificación es obligatorio cuando se selecciona un tipo');
      }

      if (data.tipo_identificacion && data.numero_identificacion && data.empresa_id) {
        const exists = await this.contactosRepository.findOne({
          where: {
            empresa_id: data.empresa_id,
            tipo_identificacion: data.tipo_identificacion,
            numero_identificacion: data.numero_identificacion,
          },
        });
        if (exists) {
          throw new BadRequestException(`Ya existe el contacto "${exists.nombre_razon_social}" con ${data.tipo_identificacion} ${data.numero_identificacion} en esta empresa`);
        }
      }

      return await this.contactosRepository.save(data as contactoEntity);
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      
      // Handle database constraint violation
      if (error.code === '23505' && error.constraint === 'UQ_contactos_identificacion') {
        throw new BadRequestException(`Ya existe un contacto con ${data.tipo_identificacion} ${data.numero_identificacion} en esta empresa`);
      }
      
      console.error('Error creating contacto:', error);
      throw new BadRequestException('Error al crear el contacto');
    }
  }

  async updateContacto(id: number, data: Partial<contactoEntity>): Promise<contactoEntity> {
    try {
      const existing = await this.contactosRepository.findOne({ 
        where: { id },
        relations: ['empresa'] 
      });
      if (!existing) throw new NotFoundException('Contacto no encontrado');

      // Validar unicidad si se está cambiando tipo o número de identificación
      if (data.tipo_identificacion || data.numero_identificacion) {
        const newTipo = data.tipo_identificacion || existing.tipo_identificacion;
        const newNumero = data.numero_identificacion || existing.numero_identificacion;
        
        // Si hay tipo, el número es obligatorio
        if (newTipo && !newNumero) {
          throw new BadRequestException('El número de identificación es obligatorio cuando se selecciona un tipo');
        }
        
        // Verificar unicidad solo si cambió alguno de los campos
        if (newTipo && newNumero && existing.empresa_id && 
            (newTipo !== existing.tipo_identificacion || newNumero !== existing.numero_identificacion)) {
          const exists = await this.contactosRepository.findOne({
            where: {
              empresa_id: existing.empresa_id,
              tipo_identificacion: newTipo,
              numero_identificacion: newNumero,
            },
          });
          if (exists && exists.id !== id) {
            throw new BadRequestException(`Ya existe el contacto "${exists.nombre_razon_social}" con ${newTipo} ${newNumero} en esta empresa`);
          }
        }
      }

      // Consumidor Final: no permitir cambiar condición IVA ni inactivarlo
      if (existing.es_consumidor_final) {
        if (
          typeof data.estado === 'boolean' && data.estado === false
        ) {
          throw new BadRequestException('No se puede inactivar el contacto Consumidor Final');
        }
        if (
          typeof data.condicion_iva !== 'undefined'
        ) {
          throw new BadRequestException('No se puede modificar la condición IVA del Consumidor Final');
        }
      }

      let newEmpresaEntity = existing.empresa;
      if (data.empresa_id) {
        newEmpresaEntity = await this.empresaRepository.findOne({ where: { id: data.empresa_id } });
        if (!newEmpresaEntity) {
          throw new NotFoundException('Empresa no encontrada');
        }
      }
      data.empresa = newEmpresaEntity;
      const updated = { ...existing, ...data };
      const result = await this.contactosRepository.save(updated);
      
      // Devolver el contacto actualizado con la relación empresa cargada
      return await this.contactosRepository.findOne({
        where: { id: result.id },
        relations: ['empresa']
      });
    } catch (error) {
      if (error instanceof BadRequestException || error instanceof NotFoundException) {
        throw error;
      }
      
      // Handle database constraint violation
      if (error.code === '23505' && error.constraint === 'UQ_contactos_identificacion') {
        throw new BadRequestException(`Ya existe un contacto con esa identificación en esta empresa`);
      }
      
      console.error('Error updating contacto:', error);
      throw new BadRequestException('Error al actualizar el contacto');
    }
  }

  async updateContactosStatus(ids: number[], estado: boolean) {
    // Evitar inactivar consumidores finales
    if (estado === false) {
      const consumidores = await this.contactosRepository.findBy({ id: In(ids) });
      const bloqueados = consumidores.filter(c => c.es_consumidor_final).map(c => c.id);
      const permitidos = ids.filter(id => !bloqueados.includes(id));
      
      if (permitidos.length > 0) {
        await this.contactosRepository.update(permitidos, { estado });
      }
      
      if (bloqueados.length > 0) {
        if (permitidos.length === 0) {
          return { 
            message: `No se pudo desactivar ningún contacto. ${bloqueados.length} consumidor${bloqueados.length !== 1 ? 'es' : ''} final${bloqueados.length !== 1 ? 'es' : ''} no se puede${bloqueados.length !== 1 ? 'n' : ''} desactivar.` 
          };
        } else {
          return { 
            message: `${permitidos.length} contacto${permitidos.length !== 1 ? 's' : ''} desactivado${permitidos.length !== 1 ? 's' : ''}. ${bloqueados.length} consumidor${bloqueados.length !== 1 ? 'es' : ''} final${bloqueados.length !== 1 ? 'es' : ''} no se pudo${bloqueados.length !== 1 ? 'ieron' : ''} desactivar.` 
          };
        }
      } else {
        return { message: 'Estados actualizados correctamente' };
      }
    }
    
    await this.contactosRepository.update(ids, { estado });
    return { message: 'Estados actualizados correctamente' };
  }

  async delete(id: number | string): Promise<{ message: string }> {
    const existing = await this.contactosRepository.findOne({ where: { id: id as number } });
    if (!existing) throw new NotFoundException('Contacto no encontrado');
    if (existing.es_consumidor_final) {
      throw new BadRequestException('No se puede eliminar el contacto Consumidor Final');
    }
    await this.contactosRepository.softDelete(id);
    return { message: 'deleted' };
  }
  async crearConsumidorFinal(empresa: empresaEntity){
    const nuevoConsumidor = this.contactosRepository.create({
        nombre_razon_social: 'Consumidor Final',
        condicion_iva: 'Consumidor Final',
        rol: 'cliente',
        es_consumidor_final: true,
        estado: true,
        empresa: empresa,
        tipo_identificacion: 'DNI',
        numero_identificacion: '00-00000000-0',
    });
    await this.contactosRepository.save(nuevoConsumidor);
    return nuevoConsumidor;
  }
}


