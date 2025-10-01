import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { provinciaEntity } from 'src/database/core/provincia.entity';
import { ciudadEntity } from 'src/database/core/ciudad.entity';

@Injectable()
export class UbicacionesService {
  constructor(
    @InjectRepository(provinciaEntity)
    private provinciasRepo: Repository<provinciaEntity>,
    @InjectRepository(ciudadEntity)
    private ciudadesRepo: Repository<ciudadEntity>,
  ) {}

  getProvincias() { return this.provinciasRepo.find({ order: { nombre: 'ASC' } }) }
  getCiudadesByProvincia(provinciaId: number) { return this.ciudadesRepo.find({ where: { provincia_id: provinciaId }, order: { nombre: 'ASC' } }) }
}


