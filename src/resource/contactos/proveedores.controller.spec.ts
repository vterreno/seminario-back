import { ProveedoresController } from './proveedores.controller';
import { ContactosService } from './contactos.service';
import { RequestWithUser } from '../users/interface/request-user';

describe('ProveedoresController', () => {
  let controller: ProveedoresController;
  let service: jest.Mocked<ContactosService>;
  let request: RequestWithUser;

  beforeEach(() => {
    service = {
      findByRoles: jest.fn(),
      createContacto: jest.fn(),
      updateContacto: jest.fn(),
      updateContactosStatus: jest.fn(),
      find: jest.fn(),
      findOne: jest.fn(),
      replace: jest.fn(),
      updatePartial: jest.fn(),
      delete: jest.fn(),
    } as any;

    controller = new ProveedoresController(service);
    request = { user: { role: { nombre: 'user' }, empresa: { id: 11 } } } as RequestWithUser;
  });

  it('retrieves proveedores with user context', async () => {
    const expected = [{ id: 1 }];
    service.findByRoles.mockResolvedValue(expected as any);

    const result = await controller.getAllProveedores(request);

    expect(service.findByRoles).toHaveBeenCalledWith(['proveedor', 'ambos'], 11, false);
    expect(result).toBe(expected);
  });

  it('logs and rethrows errors when fetching proveedores fails', async () => {
    const error = new Error('failed');
    service.findByRoles.mockRejectedValue(error);
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => undefined);

    await expect(controller.getAllProveedores(request)).rejects.toThrow(error);
    expect(consoleSpy).toHaveBeenCalledWith('Error al obtener proveedores:', error);

    consoleSpy.mockRestore();
  });

  it('creates proveedor with default role', async () => {
    const dto: any = { nombre: 'Proveedor' };
    service.createContacto.mockResolvedValue({ id: 2 } as any);

    const result = await controller.createProveedor(dto, request);

    expect(service.createContacto).toHaveBeenCalledWith({ nombre: 'Proveedor', rol: 'proveedor', empresa_id: 11 });
    expect(result).toEqual({ id: 2 });
  });

  it('uses dto empresa_id when request lacks user', async () => {
    const dto: any = { empresa_id: 4 };
    service.createContacto.mockResolvedValue({ id: 3 } as any);

    const result = await controller.createProveedor(dto, { user: undefined } as any);

    expect(service.createContacto).toHaveBeenCalledWith({ empresa_id: 4, rol: 'proveedor' });
    expect(result).toEqual({ id: 3 });
  });

  it('updates proveedor removing location fields', async () => {
    const dto: any = { provincia: 'X', ciudad: 'Y', telefono: '456' };
    service.updateContacto.mockResolvedValue({ id: 6 } as any);

    const result = await controller.updateProveedor(6, dto);

    expect(service.updateContacto).toHaveBeenCalledWith(6, { telefono: '456' });
    expect(result).toEqual({ id: 6 });
  });

  it('partially updates proveedor removing location fields', async () => {
    const dto: any = { provincia: 'P', ciudad: 'C', email: 'mail@provider.com' };
    service.updateContacto.mockResolvedValue({ id: 7 } as any);

    const result = await controller.updateProveedorPartial(7, dto);

    expect(service.updateContacto).toHaveBeenCalledWith(7, { email: 'mail@provider.com' });
    expect(result).toEqual({ id: 7 });
  });

  it('updates proveedores status through service', async () => {
    service.updateContactosStatus.mockResolvedValue({ message: 'done' } as any);

    const result = await controller.updateProveedoresStatus({ ids: [9], estado: true });

    expect(service.updateContactosStatus).toHaveBeenCalledWith([9], true);
    expect(result).toEqual({ message: 'done' });
  });
});
