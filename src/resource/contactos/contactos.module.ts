import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { contactoEntity } from 'src/database/core/contacto.entity';
import { ContactosService } from './contactos.service';
import { ClientesController } from './clientes.controller';
import { ProveedoresController } from './proveedores.controller';
import { JwtModule } from 'src/jwt/jwt.module';
import { UsersModule } from '../users/users.module';
import { empresaEntity } from 'src/database/core/empresa.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([contactoEntity, empresaEntity]),
    JwtModule,
    UsersModule,
  ],
  controllers: [ClientesController, ProveedoresController],
  providers: [ContactosService],
  exports: [ContactosService]
})
export class ContactosModule {}


