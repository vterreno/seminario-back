
import { Body, DefaultValuePipe, Delete, Get, Param, ParseIntPipe, Patch, Post, Put, Query, Req } from '@nestjs/common';
import { BaseService } from './base-service.service';
import { BaseEntity } from '../database/core/base.entity';
import { FindOptionsWhere } from 'typeorm';
import { QueryDeepPartialEntity } from 'typeorm/query-builder/QueryPartialEntity';
import { Pagination } from 'nestjs-typeorm-paginate';
import { Request } from 'express';
import { Action } from 'src/middlewares/decorators/action.decorator';

export class BaseController<T extends BaseEntity> {  // Definir que T extiende BaseEntity
    constructor(protected readonly service: BaseService<T>) {}  // Inyectamos el servicio BaseService para el tipo específico
    
    @Post()
    @Action('crear')
    create(@Body() data: T) {
        return this.service.create(data);  
    }

    @Get('all')
    @Action('ver')
    getAll() {
        return this.service.find();
    }

    @Get()
    @Action('ver')
    async getPaginated(
        @Req() req: Request,
        @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number = 1,
        @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number = 10,
    ): Promise<Pagination<T>> {
        limit = limit > 100 ? 100 : limit;
        const route = `${req.protocol}://${req.get('host')}${req.baseUrl}`;
        return this.service.paginate({
            page,
            limit,
            route,
        });
    }

    @Get(':id')
    @Action('ver')
    findOne(@Param('id') id: number) {
        return this.service.findOne({ where: { id } as FindOptionsWhere<T> });
    }

    @Put(':id')
    @Action('modificar')
    update(@Param('id') id: number, @Body() data: T) { 
        return this.service.replace(id, data); 
    }


    @Patch(':id')
    @Action('modificar')
    updatePartial(@Param('id') id: number, @Body() data: QueryDeepPartialEntity<T>) {
        return this.service.updatePartial(id, data);
    }
    @Delete(':id')
    @Action('eliminar')
    delete(@Param('id') id: number) {
        return this.service.delete(id);  
    }
}

