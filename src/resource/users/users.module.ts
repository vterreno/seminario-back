import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { RoleEntity } from "src/database/core/roles.entity";
import { UserEntity } from "src/database/core/user.entity";
import { UsersService } from "./users.service";
import { UsersController } from "./users.controller";
import { JwtModule } from "src/jwt/jwt.module";
import { empresaEntity } from "src/database/core/empresa.entity";

@Module({
    imports: [TypeOrmModule.forFeature([UserEntity, RoleEntity, empresaEntity]), 
    JwtModule
    ],
    providers: [UsersService],
    controllers: [UsersController],
    exports: [UsersService], 
})
export class UsersModule {}
