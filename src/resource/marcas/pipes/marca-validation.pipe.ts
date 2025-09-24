import { 
    PipeTransform, 
    Injectable, 
    ArgumentMetadata, 
    BadRequestException,
    Inject,
    Scope
} from '@nestjs/common';
import { REQUEST } from '@nestjs/core';
import { Request } from 'express';
import { MarcasService } from '../marcas.service';

@Injectable({ scope: Scope.REQUEST })
export class MarcaValidationPipe implements PipeTransform {
    constructor(
        private readonly marcasService: MarcasService,
        @Inject(REQUEST) private readonly request: Request
    ) {}

    async transform(value: any, metadata: ArgumentMetadata) {
        // Si no tiene nombre, no validar
        if (!value || !value.nombre) {
            return value;
        }

        // Verificar si es actualización (PUT) o creación (POST)
        const isUpdate = this.request.method === 'PUT';
        
        let existingMarca;

        if (isUpdate) {
            // Para actualización: excluir la marca actual
            const currentId = parseInt(this.request.params?.id as string);
            existingMarca = await this.marcasService.findByNombreForUpdate(
                value.nombre, // El servicio ya compara en minúsculas
                currentId,
                value.empresa_id
            );
        } else {
            // Para creación: buscar cualquier marca con ese nombre
            existingMarca = await this.marcasService.findByNombre(
                value.nombre, // El servicio ya compara en minúsculas
                value.empresa_id
            );
        }

        // Si existe, lanzar error
        if (existingMarca) {
            throw new BadRequestException(
                `Ya existe una marca llamada "${existingMarca.nombre}". Por favor, elige un nombre diferente.`
            );
        }

        // Retornar el valor original (con mayúsculas/minúsculas como lo escribió el usuario)
        return value;
    }
}
