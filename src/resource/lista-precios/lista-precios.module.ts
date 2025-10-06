import { Module } from '@nestjs/common';
import { ListaPreciosService } from './lista-precios.service';
import { ListaPreciosController } from './lista-precios.controller';
import { ListaPreciosEntity } from 'src/database/core/lista-precios.entity';
import { TypeOrmModule } from '@nestjs/typeorm/dist/typeorm.module';
import { JwtModule } from 'src/jwt/jwt.module';
import { UsersModule } from '../users/users.module';
import { ProductoListaPreciosEntity } from 'src/database/core/producto-lista-precios.entity';
import { ProductoEntity } from 'src/database/core/producto.entity';
import { PermisosModule } from '../permisos/permisos.module';
import { RolesModule } from '../roles/roles.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([ListaPreciosEntity, ProductoListaPreciosEntity, ProductoEntity]),
    JwtModule,
    UsersModule,
    PermisosModule,
    RolesModule,
  ],
  controllers: [ListaPreciosController],
  providers: [ListaPreciosService],
  exports: [ListaPreciosService]
})
export class ListaPreciosModule {}
