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
        
        // Buscar usuario existente con el mismo email
        const existingUser = await this.usersService.findByEmail(value.email);

        // Si es actualización, excluir el usuario actual del chequeo
        if (existingUser) {
            let currentUserId: string | number | undefined;
            // Intentar obtener el id del usuario actual desde el request
            if (this.request.params && this.request.params.id) {
                currentUserId = this.request.params.id;
            } else if (this.request.params && this.request.params.id) {
                currentUserId = this.request.params.id;
            }

            if (!isUpdate || (existingUser.id != currentUserId)) {
                throw new BadRequestException(
                    `Ya existe un usuario con el email "${existingUser.email}". Por favor, elige un email diferente.`
                );
            }
        }
        // Retornar el valor original
        return value;
    }
}
