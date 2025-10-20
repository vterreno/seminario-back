import { Module } from '@nestjs/common';
import { PagoService } from './pago.service';
import { PagoController } from './pago.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { pagoEntity } from 'src/database/core/pago.entity';
import { sucursalEntity } from 'src/database/core/sucursal.entity';
import { JwtModule } from 'src/jwt/jwt.module';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([pagoEntity, sucursalEntity]),
    JwtModule,
    UsersModule,
  ],
  controllers: [PagoController],
  providers: [PagoService],
  exports: [PagoService]
})
export class PagoModule {}
