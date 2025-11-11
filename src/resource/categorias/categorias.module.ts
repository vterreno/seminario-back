import { Module } from '@nestjs/common';
import { CategoriasService } from './categorias.service';
import { CategoriasController } from './categorias.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { categoriasEntity } from 'src/database/core/categorias.entity';
import { PermissionEntity } from 'src/database/core/permission.entity';
import { UsersModule } from '../users/users.module';
import { JwtModule } from 'src/jwt/jwt.module';
import { ProductoEntity } from 'src/database/core/producto.entity';

@Module({
  imports: [TypeOrmModule.forFeature([categoriasEntity, PermissionEntity, ProductoEntity]), JwtModule, UsersModule],
  controllers: [CategoriasController],
  providers: [CategoriasService],
  exports: [CategoriasService],
})
export class CategoriasModule {}
