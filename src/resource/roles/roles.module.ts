import { RoleEntity } from "src/database/core/roles.entity";
import { RolesController } from "./roles.controller";
import { RolesService } from "./roles.service";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Module } from "@nestjs/common";

@Module({
    imports: [TypeOrmModule.forFeature([RoleEntity])],
    providers: [RolesService],
    controllers: [RolesController],
    exports: [RolesService],
})
export class RolesModule {}
