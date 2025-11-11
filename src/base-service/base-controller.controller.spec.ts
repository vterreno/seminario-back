import { BaseController } from './base-controller.controller';
import { BaseService } from './base-service.service';
import { BaseEntity } from 'src/database/core/base.entity';

describe('BaseController', () => {
  class TestEntity extends BaseEntity {
    name!: string;
  }

  const createController = (serviceOverrides: Partial<BaseService<TestEntity>> = {}) => {
    const service = {
      create: jest.fn(),
      find: jest.fn(),
      paginate: jest.fn(),
      findOne: jest.fn(),
      replace: jest.fn(),
      updatePartial: jest.fn(),
      delete: jest.fn(),
      ...serviceOverrides,
    } as unknown as BaseService<TestEntity> & Record<string, jest.Mock>;

    return { controller: new BaseController<TestEntity>(service), service };
  };

  it('delegates create to service', async () => {
    const { controller, service } = createController();
    const dto = { name: 'Test' } as TestEntity;
    (service.create as jest.Mock).mockResolvedValue(dto);

    const result = await controller.create(dto);

    expect(service.create).toHaveBeenCalledWith(dto);
    expect(result).toBe(dto);
  });

  it('returns all records using service.find', async () => {
    const { controller, service } = createController();
    const items = [{ id: 1 } as TestEntity];
    (service.find as jest.Mock).mockResolvedValue(items);

    const result = await controller.getAll();

    expect(service.find).toHaveBeenCalled();
    expect(result).toBe(items);
  });

  it('paginates results with route construction', async () => {
    const { controller, service } = createController();
    const paginationResult = { items: [] };
    (service.paginate as jest.Mock).mockResolvedValue(paginationResult);
    const request: any = {
      protocol: 'https',
      get: jest.fn().mockReturnValue('example.com'),
      baseUrl: '/api/test',
    };

    const result = await controller.getPaginated(request, 2, 200);

    expect(service.paginate).toHaveBeenCalledWith({
      page: 2,
      limit: 100,
      route: 'https://example.com/api/test',
    });
    expect(result).toBe(paginationResult);
  });

  it('finds one entity by id', async () => {
    const { controller, service } = createController();
    const entity = { id: 3 } as TestEntity;
    (service.findOne as jest.Mock).mockResolvedValue(entity);

    const result = await controller.findOne(3);

    expect(service.findOne).toHaveBeenCalledWith({ where: { id: 3 } });
    expect(result).toBe(entity);
  });

  it('replaces an entity via service', async () => {
    const { controller, service } = createController();
    const dto = { name: 'Updated' } as TestEntity;
    (service.replace as jest.Mock).mockResolvedValue(dto);

    const result = await controller.update(5, dto);

    expect(service.replace).toHaveBeenCalledWith(5, dto);
    expect(result).toBe(dto);
  });

  it('partially updates an entity', async () => {
    const { controller, service } = createController();
    const patch = { name: 'Partial' };
    (service.updatePartial as jest.Mock).mockResolvedValue({ affected: 1 });

    const result = await controller.updatePartial(6, patch);

    expect(service.updatePartial).toHaveBeenCalledWith(6, patch);
    expect(result).toEqual({ affected: 1 });
  });

  it('deletes an entity', async () => {
    const { controller, service } = createController();
    (service.delete as jest.Mock).mockResolvedValue({ message: 'deleted' });

    const result = await controller.delete(7);

    expect(service.delete).toHaveBeenCalledWith(7);
    expect(result).toEqual({ message: 'deleted' });
  });
});
