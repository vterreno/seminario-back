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
import { CategoriasService } from '../categorias.service';

@Injectable({ scope: Scope.REQUEST })
export class CategoriaValidationPipe implements PipeTransform {
    constructor(
        private readonly categoriasService: CategoriasService,
        @Inject(REQUEST) private readonly request: Request
    ) {}

    async transform(value: any, metadata: ArgumentMetadata) {
        // Si no tiene nombre, no validar
        if (!value || !value.nombre) {
            return value;
        }

        // Verificar si es actualización (PUT) o creación (POST)
        const isUpdate = this.request.method === 'PUT';

        let existingCategoria;

        if (isUpdate) {
            // Para actualización: excluir la categoría actual
            const currentId = parseInt(this.request.params?.id as string);
            existingCategoria = await this.categoriasService.findByNombreForUpdate(
                value.nombre, // El servicio ya compara en minúsculas
                currentId,
                value.empresa_id
            );
        } else {
            // Para creación: buscar cualquier categoría con ese nombre
            existingCategoria = await this.categoriasService.findByNombre(
                value.nombre, // El servicio ya compara en minúsculas
                value.empresa_id
            );
    
        }

        // Si existe, lanzar error
        if (existingCategoria) {
            throw new BadRequestException(
                `Ya existe una categoría llamada "${existingCategoria.nombre}". Por favor, elige un nombre diferente.`
            );
        }

        // Retornar el valor original (con mayúsculas/minúsculas como lo escribió el usuario)
        return value;
    }
}