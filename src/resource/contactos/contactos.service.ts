import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { BaseService } from 'src/base-service/base-service.service';
import { contactoEntity } from 'src/database/core/contacto.entity';
import { Repository } from 'typeorm';

@Injectable()
export class ContactosService extends BaseService<contactoEntity> {
  constructor(
    @InjectRepository(contactoEntity)
    protected contactosRepository: Repository<contactoEntity>,
  ) {
    super(contactosRepository);
  }

  async createContacto(data: Partial<contactoEntity>): Promise<contactoEntity> {
    // Validaciones: si hay tipo_identificacion, numero_identificacion es obligatorio y único por empresa
    if (data.tipo_identificacion && !data.numero_identificacion) {
      throw new BadRequestException('El número de identificación es obligatorio');
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
        throw new BadRequestException('Ya existe un contacto con ese Tipo y Número de Identificación');
      }
    }

    return this.contactosRepository.save(data as contactoEntity);
  }

  async updateContacto(id: number, data: Partial<contactoEntity>): Promise<contactoEntity> {
    const existing = await this.contactosRepository.findOne({ where: { id } });
    if (!existing) throw new NotFoundException('Contacto no encontrado');

    // No permitir modificar tipo y número de identificación
    if (
      (data.tipo_identificacion && data.tipo_identificacion !== existing.tipo_identificacion) ||
      (data.numero_identificacion && data.numero_identificacion !== existing.numero_identificacion)
    ) {
      throw new BadRequestException('No se puede modificar el Tipo o Número de Identificación');
    }

    // Consumidor Final: no permitir cambiar datos fiscales ni inactivarlo
    if (existing.es_consumidor_final) {
      if (
        typeof data.estado === 'boolean' && data.estado === false
      ) {
        throw new BadRequestException('No se puede inactivar el contacto Consumidor Final');
      }
      if (
        typeof data.condicion_iva !== 'undefined' ||
        typeof data.tipo_identificacion !== 'undefined' ||
        typeof data.numero_identificacion !== 'undefined'
      ) {
        throw new BadRequestException('No se pueden modificar los datos fiscales del Consumidor Final');
      }
    }

    const updated = { ...existing, ...data };
    return this.contactosRepository.save(updated);
  }

  async updateContactosStatus(ids: number[], estado: boolean) {
    // Evitar inactivar consumidores finales
    if (estado === false) {
      const consumidores = await this.contactosRepository.findBy({ id: (ids as any) });
      const bloqueados = consumidores.filter(c => c.es_consumidor_final).map(c => c.id);
      const permitidos = ids.filter(id => !bloqueados.includes(id));
      if (permitidos.length) {
        await this.contactosRepository.update(permitidos, { estado });
      }
      return { message: bloqueados.length ? `Algunos contactos no se pudieron inactivar (Consumidor Final): ${bloqueados.join(',')}` : 'Estados actualizados' };
    }
    await this.contactosRepository.update(ids, { estado });
    return { message: 'Estados actualizados' };
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
}


