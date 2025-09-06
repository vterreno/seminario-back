import { Module } from '@nestjs/common';
import { SucursalService } from './sucursal.service';
import { SucursalController } from './sucursal.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { sucursalEntity } from 'src/database/core/sucursal.entity';
import { JwtModule } from '@nestjs/jwt';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([sucursalEntity]),
    JwtModule,
    UsersModule,
  ],
  controllers: [SucursalController],
  providers: [SucursalService],
})
export class SucursalModule {}
