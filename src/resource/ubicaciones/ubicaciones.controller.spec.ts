import { UbicacionesController } from './ubicaciones.controller';
import { UbicacionesService } from './ubicaciones.service';

describe('UbicacionesController', () => {
  let controller: UbicacionesController;
  let service: jest.Mocked<UbicacionesService>;

  beforeEach(() => {
    service = {
      getProvincias: jest.fn(),
      getCiudadesByProvincia: jest.fn(),
    } as any;

    controller = new UbicacionesController(service);
  });

  it('returns provincias from service', async () => {
    const provincias = [{ id: 1, nombre: 'Buenos Aires' }];
    service.getProvincias.mockResolvedValue(provincias as any);

    const result = await controller.getProvincias();

    expect(service.getProvincias).toHaveBeenCalled();
    expect(result).toBe(provincias);
  });

  it('returns cities by provincia using service', async () => {
    const ciudades = [{ id: 1, nombre: 'Ciudad' }];
    service.getCiudadesByProvincia.mockResolvedValue(ciudades as any);

    const result = await controller.getCiudades(5);

    expect(service.getCiudadesByProvincia).toHaveBeenCalledWith(5);
    expect(result).toBe(ciudades);
  });
});
