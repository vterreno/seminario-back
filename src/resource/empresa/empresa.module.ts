import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EmpresaService } from './empresa.service';
import { EmpresaController } from './empresa.controller';
import { empresaEntity } from '../../database/core/empresa.entity';
import { JwtModule } from 'src/jwt/jwt.module';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [TypeOrmModule.forFeature([empresaEntity]),
    JwtModule,
    UsersModule,
  ],
  controllers: [EmpresaController],
  providers: [EmpresaService],
  exports: [EmpresaService],
})
export class EmpresaModule {}
