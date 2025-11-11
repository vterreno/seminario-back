import { ClientesController } from './clientes.controller';
import { ContactosService } from './contactos.service';
import { RequestWithUser } from '../users/interface/request-user';

describe('ClientesController', () => {
  let controller: ClientesController;
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

    controller = new ClientesController(service);
    request = { user: { role: { nombre: 'super_admin' }, empresa: { id: 7 } } } as RequestWithUser;
  });

  it('retrieves clientes with super admin context', async () => {
    const expected = [{ id: 1 }];
    service.findByRoles.mockResolvedValue(expected as any);

    const result = await controller.getAllClientes(request);

    expect(service.findByRoles).toHaveBeenCalledWith(['cliente', 'ambos'], 7, true);
    expect(result).toBe(expected);
  });

  it('logs and rethrows errors when fetching clientes fails', async () => {
    const error = new Error('boom');
    service.findByRoles.mockRejectedValue(error);
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => undefined);

    await expect(controller.getAllClientes(request)).rejects.toThrow(error);
    expect(consoleSpy).toHaveBeenCalledWith('Error al obtener clientes:', error);

    consoleSpy.mockRestore();
  });

  it('creates cliente using request empresa and default role', async () => {
    const dto: any = { nombre: 'Cliente' };
    service.createContacto.mockResolvedValue({ id: 10 } as any);

    const result = await controller.createCliente(dto, request);

    expect(service.createContacto).toHaveBeenCalledWith({ nombre: 'Cliente', rol: 'cliente', empresa_id: 7 });
    expect(result).toEqual({ id: 10 });
  });

  it('falls back to dto empresa_id when request has no company', async () => {
    const dto: any = { empresa_id: 9, rol: 'ambos' };
    service.createContacto.mockResolvedValue({ id: 3 } as any);

    const result = await controller.createCliente(dto, { user: undefined } as any);

    expect(service.createContacto).toHaveBeenCalledWith({ empresa_id: 9, rol: 'ambos' });
    expect(result).toEqual({ id: 3 });
  });

  it('updates cliente removing location fields', async () => {
    const dto: any = { provincia: 'X', ciudad: 'Y', telefono: '123' };
    service.updateContacto.mockResolvedValue({ id: 4 } as any);

    const result = await controller.updateCliente(4, dto);

    expect(service.updateContacto).toHaveBeenCalledWith(4, { telefono: '123' });
    expect(result).toEqual({ id: 4 });
  });

  it('partially updates cliente removing location fields', async () => {
    const dto: any = { provincia: 'Z', ciudad: 'Q', email: 'mail@test.com' };
    service.updateContacto.mockResolvedValue({ id: 5 } as any);

    const result = await controller.updateClientePartial(5, dto);

    expect(service.updateContacto).toHaveBeenCalledWith(5, { email: 'mail@test.com' });
    expect(result).toEqual({ id: 5 });
  });

  it('updates clientes status through service', async () => {
    service.updateContactosStatus.mockResolvedValue({ message: 'ok' } as any);

    const result = await controller.updateClientesStatus({ ids: [1, 2], estado: false });

    expect(service.updateContactosStatus).toHaveBeenCalledWith([1, 2], false);
    expect(result).toEqual({ message: 'ok' });
  });
});
