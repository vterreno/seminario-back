import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { UbicacionesService } from './ubicaciones.service';
import { AuthGuard } from 'src/middlewares/auth.middleware';
import { PermissionsGuard } from 'src/middlewares/permission.middleware';
import { Public } from 'src/middlewares/decorators/public.decorator';

@UseGuards(AuthGuard, PermissionsGuard)
@Controller('ubicaciones')
export class UbicacionesController {
  constructor(private service: UbicacionesService) {}

  @Public()
  @Get('provincias')
  getProvincias() { return this.service.getProvincias() }

  @Public()
  @Get('ciudades/:provinciaId')
  getCiudades(@Param('provinciaId') provinciaId: number) { return this.service.getCiudadesByProvincia(provinciaId) }
}


