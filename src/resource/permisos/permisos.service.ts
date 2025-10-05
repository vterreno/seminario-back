import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { BaseService } from 'src/base-service/base-service.service';
import { PermissionEntity } from 'src/database/core/permission.entity';
import { FindManyOptions, FindOneOptions, Repository } from 'typeorm';

@Injectable()
export class PermisosService extends BaseService<PermissionEntity> {
    findManyOptions: FindManyOptions<PermissionEntity> = {};
    findOneOptions: FindOneOptions<PermissionEntity> = {
        relations: ['roles'],
    };
    constructor(
        @InjectRepository(PermissionEntity) 
        protected permisoService: Repository<PermissionEntity>,
    ){
        super(permisoService);
    }
    async getPermisosByEmpresa(empresaId: number): Promise<PermissionEntity[]> {
        // Obtener todos los permisos generales (que NO empiezan con 'lista_') incluyendo los permisos del módulo de gestión
        const permisosGenerales = await this.permisoService
            .createQueryBuilder('permission')
            .where("permission.codigo NOT LIKE 'lista_%'")
            .getMany();

        // Obtener nombres de listas de precios de esta empresa
        const listasPrecios = await this.permisoService.query(`
            SELECT nombre FROM lista_precios 
            WHERE empresa_id = $1 AND estado = true
        `, [empresaId]);

        // Generar códigos de permisos esperados para las listas de esta empresa
        const codigosListasEmpresa = listasPrecios.map((lista: any) => {
            const nombreNormalizado = lista.nombre.trim().toLowerCase().replace(/\s+/g, '_');
            return `lista_${nombreNormalizado}_ver`;
        });

        // Obtener permisos de listas de precios para esta empresa
        const permisosListas = codigosListasEmpresa.length > 0
            ? await this.permisoService
                .createQueryBuilder('permission')
                .where('permission.codigo IN (:...codigos)', { codigos: codigosListasEmpresa })
                .getMany()
            : [];
        // Combinar ambos conjuntos de permisos
        return [...permisosGenerales, ...permisosListas];
    }
}
