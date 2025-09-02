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
    ],
  controllers: [AppController],
  providers: [AuthGuard],
})
export class AppModule {}
