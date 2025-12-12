import { RoleEntity } from "src/database/core/roles.entity";
import { PermissionEntity } from "src/database/core/permission.entity";
import { UserEntity } from "src/database/core/user.entity";
import { RolesController } from "./roles.controller";
import { RolesService } from "./roles.service";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Module } from "@nestjs/common";
import { JwtModule } from "src/jwt/jwt.module";
import { UsersModule } from "../users/users.module";

@Module({
    imports: [TypeOrmModule.forFeature([RoleEntity, PermissionEntity, UserEntity]),
        JwtModule,
        UsersModule,
    ],
    providers: [RolesService],
    controllers: [RolesController],
    exports: [RolesService],
})
export class RolesModule {}
