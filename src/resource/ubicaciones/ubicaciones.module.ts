import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { provinciaEntity } from 'src/database/core/provincia.entity';
import { ciudadEntity } from 'src/database/core/ciudad.entity';
import { UbicacionesService } from './ubicaciones.service';
import { UbicacionesController } from './ubicaciones.controller';
import { JwtModule } from 'src/jwt/jwt.module';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([provinciaEntity, ciudadEntity]),
    JwtModule,
    UsersModule,
  ],
  controllers: [UbicacionesController],
  providers: [UbicacionesService],
  exports: [UbicacionesService]
})
export class UbicacionesModule {}


