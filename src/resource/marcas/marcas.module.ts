import { Module } from '@nestjs/common';
import { MarcasService } from './marcas.service';
import { MarcasController } from './marcas.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MarcaEntity } from 'src/database/core/marcas.entity';
import { UsersModule } from '../users/users.module';
import { JwtModule } from 'src/jwt/jwt.module';
import { MarcaValidationPipe } from './pipes/marca-validation.pipe';

@Module({
  imports: [
    TypeOrmModule.forFeature([MarcaEntity]),
    JwtModule,
    UsersModule,
  ],
  controllers: [MarcasController],
  providers: [
    MarcasService,
    MarcaValidationPipe
  ],
  exports: [MarcasService]
})
export class MarcasModule {}
