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
import { ProductosService } from '../productos.service';

@Injectable({ scope: Scope.REQUEST })
export class ProductoValidationPipe implements PipeTransform {
    constructor(
        private readonly productosService: ProductosService,
        @Inject(REQUEST) private readonly request: Request
    ) {}

    async transform(value: any, metadata: ArgumentMetadata) {
        // Si no tiene código, no validar
        if (!value || !value.codigo) {
            return value;
        }

        // Verificar si es actualización (PUT) o creación (POST)
        const isUpdate = this.request.method === 'PUT';
        
        let existingProducto;

        if (isUpdate) {
            // Para actualización: excluir el producto actual
            const currentId = parseInt(this.request.params?.id as string);
            existingProducto = await this.productosService.findByCodigo(
                value.codigo,
                value.sucursal_id
            );
            
            // Si existe y no es el mismo producto que se está actualizando
            if (existingProducto && existingProducto.id !== currentId) {
                throw new BadRequestException(
                    `Ya existe un producto con el código "${value.codigo}" en esta sucursal. Por favor, elige un código diferente.`
                );
            }
        } else {
            // Para creación: buscar cualquier producto con ese código en la sucursal
            existingProducto = await this.productosService.findByCodigo(
                value.codigo,
                value.sucursal_id
            );
            
            // Si existe, lanzar error
            if (existingProducto) {
                throw new BadRequestException(
                    `Ya existe un producto con el código "${value.codigo}" en esta sucursal. Por favor, elige un código diferente.`
                );
            }
        }

        // Retornar el valor original
        return value;
    }
}
