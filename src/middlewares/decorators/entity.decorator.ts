import { SetMetadata } from '@nestjs/common';
//Decorador personalizado para definir la entidad en los controladores
// (hace referencia a que entidad corresponde el controlador)
export const ENTITY_KEY = 'entity';
export const Entity = (entity: string) => SetMetadata(ENTITY_KEY, entity);