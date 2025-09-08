import { TypeOrmModule } from "@nestjs/typeorm";
import { Module } from "@nestjs/common";
import { PermissionEntity } from "src/database/core/permission.entity";
import { PermisosService } from "./permisos.service";
import { PermisosController } from "./permisos.controller";
import { JwtModule } from "src/jwt/jwt.module";
import { UsersModule } from "../users/users.module";

@Module({
    imports: [TypeOrmModule.forFeature([PermissionEntity]),
        JwtModule,
        UsersModule,
    ],
    providers: [PermisosService],
    controllers: [PermisosController],
    exports: [PermisosService],
})
export class PermisosModule {}
