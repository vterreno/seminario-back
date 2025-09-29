import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthGuard } from './middlewares/auth.middleware';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { UsersModule } from './resource/users/users.module';
import { JwtModule } from './jwt/jwt.module';
import { RolesModule } from './resource/roles/roles.module';
import { PermisosModule } from './resource/permisos/permisos.module';
import { SeedModule } from './database/seeders/seeder.module';
import { MailServiceModule } from './resource/mail-service/mail-service.module';
import { EmpresaModule } from './resource/empresa/empresa.module';
import { SucursalesModule } from './resource/sucursales/sucursales.module';
import { ContactosModule } from './resource/contactos/contactos.module';
import { UbicacionesModule } from './resource/ubicaciones/ubicaciones.module';
import { PermissionsGuard } from './middlewares/permission.middleware';
import { MarcasModule } from './resource/marcas/marcas.module';
import { ProductosModule } from './resource/productos/productos.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: configService.get<'postgres'>('DATABASE_TYPE', 'postgres'),
        host: configService.get<string>('DATABASE_HOST', 'localhost'),
        port: parseInt(configService.get<string>('DATABASE_PORT', '5432')),
        username: configService.get<string>('DATABASE_USER'),
        password: configService.get<string>('DATABASE_PASSWORD'),
        database: configService.get<string>('DATABASE_NAME'),
        synchronize: false,
        autoLoadEntities: true,
        entities: [__dirname + '/database/core/*.entity{.ts,.js}'],
      }),
    }),
    UsersModule,
    JwtModule,
    RolesModule,
    PermisosModule,
    SeedModule,
    MailServiceModule,
    EmpresaModule,
    SucursalesModule,
    ContactosModule,
    UbicacionesModule,
    MarcasModule,
    ProductosModule,
    ],
  controllers: [AppController],
  providers: [AuthGuard, PermissionsGuard],
})
export class AppModule {}
