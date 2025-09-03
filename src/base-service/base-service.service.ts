import {
    DeepPartial,
    FindManyOptions,
    FindOneOptions,
    FindOptionsWhere,
    Repository,
    UpdateResult,
} from 'typeorm';
import { QueryDeepPartialEntity } from 'typeorm/query-builder/QueryPartialEntity';
import { BaseEntity } from '../database/core/base.entity';  // Importamos BaseEntity definido por nosotros
import { paginate, IPaginationOptions, Pagination } from 'nestjs-typeorm-paginate';

export abstract class BaseService<T extends BaseEntity> {
    findManyOptions: FindManyOptions<T> = {};
    findOneOptions: FindOneOptions<T> = {};

    constructor(protected repository: Repository<T>) {}

    async find(options: FindManyOptions<T> = {}): Promise<T[]> {
        const findOptions = { ...this.findManyOptions, ...options };
        return this.repository.find(findOptions);
    }
    async findOne(options: FindOneOptions<T> = {}): Promise<T | null> {
        const findOptions = { ...this.findOneOptions, ...options };
        return this.repository.findOne(findOptions);
    }

    async create(entity: DeepPartial<T>): Promise<T> {
        return this.repository.save(entity);
    }

    async replace(id: string | number, entity: DeepPartial<T>): Promise<T> {
        const existingEntity = await this.repository.findOneBy({ id } as FindOptionsWhere<T>);
        if (!existingEntity) {
            throw new Error(`Entidad con id ${id} no encontrado`);
        }
        const updatedEntity = { ...existingEntity, ...entity };
        return this.repository.save(updatedEntity);
    }
    async updatePartial(id: string | number, entity: QueryDeepPartialEntity<T>,): Promise<UpdateResult> {
        return this.repository.update(id, entity);
    }

    //Borrado logico (le asignamos una fecha de borrado)
    async delete(id: number | string):Promise<{ message: string }> {
        //Lo que hace el FindOptionsWhere es una conversion explicita de un objeto a un objeto FindOptionsWhere
        const entity = await this.repository.findOneBy({id} as FindOptionsWhere<T>);
        if (!entity) {
            throw new Error(`Entity with id ${id} not found`);
        }
        await this.repository.softDelete(id);
        return {"message": "deleted" };
    }
    async paginate(options: IPaginationOptions): Promise<Pagination<T>> {
        const queryBuilder = this.repository.createQueryBuilder('entity');
        queryBuilder.orderBy('entity.id', 'ASC'); // orden por defecto, se puede organizar segun como querramos 
        //ASC es ascendente y DESC es descendente
        return paginate<T>(queryBuilder, options);
    }
}