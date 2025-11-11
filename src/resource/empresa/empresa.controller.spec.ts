import { EmpresaController } from './empresa.controller';
import { EmpresaService } from './empresa.service';
import { RequestWithUser } from '../users/interface/request-user';

describe('EmpresaController', () => {
  let controller: EmpresaController;
  let service: EmpresaService;
  let mockService: {
    find: jest.Mock;
    deleteEmpresas: jest.Mock;
    updateMyCompany: jest.Mock;
  };

  const mockUser = { id: 1 };
  const mockRequest = { user: mockUser } as RequestWithUser;

  beforeEach(() => {
    jest.clearAllMocks();

    mockService = {
      find: jest.fn(),
      deleteEmpresas: jest.fn(),
      updateMyCompany: jest.fn(),
    };

    controller = new EmpresaController(mockService as unknown as EmpresaService);
    service = mockService as unknown as EmpresaService;
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
    expect(service).toBeDefined();
  });

  it('should return all empresas', async () => {
    const empresas = [{ id: 1 }];
    mockService.find.mockResolvedValue(empresas);

    const result = await controller.getAllEmpresas();

    expect(result).toBe(empresas);
    expect(mockService.find).toHaveBeenCalledTimes(1);
  });

  it('should bulk delete empresas', async () => {
    mockService.deleteEmpresas.mockResolvedValue({ affected: 2 });

    const result = await controller.deleteEmpresas({ ids: [1, 2] });

    expect(result).toEqual({ affected: 2 });
    expect(mockService.deleteEmpresas).toHaveBeenCalledWith([1, 2]);
  });

  it('should update current company', async () => {
    const updateData = { nombre: 'New Name' } as any;
    mockService.updateMyCompany.mockResolvedValue({ id: 1, ...updateData });

    const result = await controller.updateMyCompany(updateData, mockRequest);

    expect(result).toEqual({ id: 1, ...updateData });
    expect(mockService.updateMyCompany).toHaveBeenCalledWith(updateData, mockUser);
  });
});
