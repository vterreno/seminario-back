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
import { UsersService } from '../users.service';

@Injectable({ scope: Scope.REQUEST })
export class UsersValidationPipe implements PipeTransform {
    constructor(
        private readonly usersService: UsersService,
        @Inject(REQUEST) private readonly request: Request
    ) {}

    async transform(value: any, metadata: ArgumentMetadata) {
        // Si no tiene email, no validar
        if (!value || !value.email) {
            return value;
        }

        // Verificar si es actualización (PUT) o creación (POST)
        const isUpdate = this.request.method === 'PUT';
        
        let existingUser;
        if (isUpdate) {
            // Para actualización: excluir el usuario actual
            existingUser = await this.usersService.findByEmail(value.email);
        } else {
            // Para creación: buscar cualquier usuario con ese email
            existingUser = await this.usersService.findByEmail(value.email);
        }
        // Si existe, lanzar error
        if (existingUser) {
            throw new BadRequestException(
                `Ya existe un usuario con el email "${existingUser.email}". Por favor, elige un email diferente.`
            );
        }
        // Retornar el valor original
        return value;
    }
}
