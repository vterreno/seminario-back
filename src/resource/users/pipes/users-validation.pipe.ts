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
            const currentId = parseInt(this.request.params?.id as string);

            existingUser = await this.usersService.findByEmail(value.email);

            if (existingUser && existingUser.id !== currentId) {
                throw new BadRequestException(
                    `El email "${value.email}" ya está en uso por otro usuario.`
                );
            }
        } else {
            // Para creación: buscar cualquier usuario con ese email
            existingUser = await this.usersService.findByEmail(value.email);

            if (existingUser) {
                throw new BadRequestException(
                    `El email "${value.email}" ya está en uso.`
                );
            }
        }

        // Retornar el valor original
        return value;
    }
}
