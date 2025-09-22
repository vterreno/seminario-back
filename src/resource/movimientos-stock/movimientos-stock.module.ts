import { Module } from '@nestjs/common';
import { MovimientosStockService } from './movimientos-stock.service';
import { MovimientosStockController } from './movimientos-stock.controller';
import { Type } from 'class-transformer';
import { TypeOrmModule } from '@nestjs/typeorm/dist/typeorm.module';
import { MovimientoStockEntity } from 'src/database/core/movimientos-stock.entity';
import { JwtModule } from 'src/jwt/jwt.module';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([MovimientoStockEntity]),
    JwtModule,
    UsersModule,
  ],
  controllers: [MovimientosStockController],
  providers: [MovimientosStockService],
  exports: [MovimientosStockService]
})
export class MovimientosStockModule {}
