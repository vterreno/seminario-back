import { BaseService } from './base-service.service';
import { BaseEntity } from 'src/database/core/base.entity';
import { paginate } from 'nestjs-typeorm-paginate';

jest.mock('nestjs-typeorm-paginate', () => ({
  paginate: jest.fn(),
}));

describe('BaseService', () => {
  class TestEntity extends BaseEntity {
    name!: string;
  }

  class ConcreteService extends BaseService<TestEntity> {}

  let repository: Record<string, jest.Mock>;
  let service: ConcreteService;

  beforeEach(() => {
    repository = {
      find: jest.fn(),
      findOne: jest.fn(),
      findOneBy: jest.fn(),
      save: jest.fn(),
      update: jest.fn(),
      softDelete: jest.fn(),
      createQueryBuilder: jest.fn(),
    } as any;

    service = new ConcreteService(repository as any);
  });

  it('merges default and custom options on find', async () => {
    const expected = [{ id: 1 } as TestEntity];
    service.findManyOptions = { relations: ['empresa'] };
    repository.find.mockResolvedValue(expected);

    const result = await service.find({ where: { id: 1 } });

    expect(repository.find).toHaveBeenCalledWith({ relations: ['empresa'], where: { id: 1 } });
    expect(result).toBe(expected);
  });

  it('merges default and custom options on findOne', async () => {
    const entity = { id: 2 } as TestEntity;
    service.findOneOptions = { relations: ['empresa'] };
    repository.findOne.mockResolvedValue(entity);

    const result = await service.findOne({ where: { id: 2 } });

    expect(repository.findOne).toHaveBeenCalledWith({ relations: ['empresa'], where: { id: 2 } });
    expect(result).toBe(entity);
  });

  it('delegates create to repository.save', async () => {
    const payload = { name: 'New' } as Partial<TestEntity>;
    const saved = { id: 3, name: 'New' } as TestEntity;
    repository.save.mockResolvedValue(saved);

    const result = await service.create(payload);

    expect(repository.save).toHaveBeenCalledWith(payload);
    expect(result).toBe(saved);
  });

  it('replaces an existing entity merging fields', async () => {
    const existing = { id: 4, name: 'Old' } as TestEntity;
    const merged = { id: 4, name: 'Updated' } as TestEntity;
    repository.findOneBy.mockResolvedValue(existing);
    repository.save.mockResolvedValue(merged);

    const result = await service.replace(4, { name: 'Updated' });

    expect(repository.findOneBy).toHaveBeenCalledWith({ id: 4 });
    expect(repository.save).toHaveBeenCalledWith({ ...existing, name: 'Updated' });
    expect(result).toBe(merged);
  });

  it('throws when replacing a missing entity', async () => {
    repository.findOneBy.mockResolvedValue(null);

    await expect(service.replace(9, { name: 'missing' })).rejects.toThrow('Entidad con id 9 no encontrado');
  });

  it('updates partially through repository.update', async () => {
    repository.update.mockResolvedValue({ affected: 1 } as any);

    const result = await service.updatePartial(10, { name: 'Partial' } as any);

    expect(repository.update).toHaveBeenCalledWith(10, { name: 'Partial' });
    expect(result).toEqual({ affected: 1 });
  });

  it('soft deletes an entity when present', async () => {
    repository.findOneBy.mockResolvedValue({ id: 11 } as TestEntity);

    const result = await service.delete(11);

    expect(repository.softDelete).toHaveBeenCalledWith(11);
    expect(result).toEqual({ message: 'deleted' });
  });

  it('throws when trying to delete a missing entity', async () => {
    repository.findOneBy.mockResolvedValue(null);

    await expect(service.delete(42)).rejects.toThrow('Entity with id 42 not found');
  });

  it('paginates using the repository query builder', async () => {
    const qb = { orderBy: jest.fn().mockReturnThis() };
    repository.createQueryBuilder.mockReturnValue(qb);
    (paginate as jest.Mock).mockResolvedValueOnce('paginated');

    const result = await service.paginate({ limit: 10, page: 1 });

    expect(qb.orderBy).toHaveBeenCalledWith('entity.id', 'ASC');
    expect(paginate).toHaveBeenCalledWith(qb, { limit: 10, page: 1 });
    expect(result).toBe('paginated');
  });
});
