import { SetMetadata } from '@nestjs/common';
// Decorador personalizado para definir la acción en los controladores
// (hace referencia a que acción corresponde el controlador)
export const ACTION_KEY = 'action';
export const Action = (action: string) => SetMetadata(ACTION_KEY, action);