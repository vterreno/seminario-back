import { SetMetadata } from '@nestjs/common';
// Decorador personalizado para marcar rutas como públicas (no requieren autenticación)
export const IS_PUBLIC_KEY = 'isPublic';
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);
