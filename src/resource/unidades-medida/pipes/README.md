# Unidades Medida Module

Este módulo incluye utilities para el manejo de unidades de medida, incluyendo validación de empresaId.

## EmpresaId Decorator

El decorator `@EmpresaId()` extrae y valida automáticamente el `empresaId` del token JWT en la request.

### Uso

```typescript
import { EmpresaId } from './decorators/empresa-id.decorator';

@Controller('ejemplo')
export class EjemploController {
  
  @Get()
  findAll(@EmpresaId() empresaId: number) {
    // empresaId está validado y listo para usar
    return this.service.findAll(empresaId);
  }
  
  @Post()
  create(@Body() dto: CreateDto, @EmpresaId() empresaId: number) {
    return this.service.create(dto, empresaId);
  }
}
```

### Características

- **Validación automática**: Lanza `UnauthorizedException` si no encuentra empresaId válido
- **Tipado fuerte**: Retorna `number` garantizando tipo correcto
- **Reutilizable**: Se puede usar en cualquier controller que necesite empresaId
- **Limpio**: Elimina código boilerplate en los métodos del controller

### Ventajas sobre el método anterior

**Antes:**
```typescript
@Get()
findAll(@Req() request: Request) {
  const empresaId = request['user']?.empresaId || 1; // ❌ Fallback inseguro
  return this.service.findAll(empresaId);
}
```

**Ahora:**
```typescript
@Get()
findAll(@EmpresaId() empresaId: number) { // ✅ Validación automática y segura
  return this.service.findAll(empresaId);
}
```

## EmpresaIdPipe

El pipe que maneja la validación interna. Generalmente no necesitas usarlo directamente ya que el decorator `@EmpresaId()` lo maneja internamente.

### Método estático

También puedes usar el método estático si necesitas validar empresaId manualmente:

```typescript
import { EmpresaIdPipe } from './pipes/empresa-id.pipe';

const empresaId = EmpresaIdPipe.extractEmpresaId(request);
```