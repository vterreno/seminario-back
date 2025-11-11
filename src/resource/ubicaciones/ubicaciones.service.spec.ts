import { UbicacionesService } from './ubicaciones.service';

describe('UbicacionesService', () => {
  let service: UbicacionesService;
  let provinciasRepo: { find: jest.Mock };
  let ciudadesRepo: { find: jest.Mock };

  beforeEach(() => {
    provinciasRepo = { find: jest.fn() };
    ciudadesRepo = { find: jest.fn() };
    service = new UbicacionesService(provinciasRepo as any, ciudadesRepo as any);
  });

  it('retrieves provinces ordered by name', async () => {
    const provincias = [{ id: 1, nombre: 'Buenos Aires' }];
    provinciasRepo.find.mockResolvedValue(provincias);

    const result = await service.getProvincias();

    expect(provinciasRepo.find).toHaveBeenCalledWith({ order: { nombre: 'ASC' } });
    expect(result).toBe(provincias);
  });

  it('retrieves cities filtered by province ordered by name', async () => {
    const ciudades = [{ id: 2, nombre: 'Ciudad' }];
    ciudadesRepo.find.mockResolvedValue(ciudades);

    const result = await service.getCiudadesByProvincia(3);

    expect(ciudadesRepo.find).toHaveBeenCalledWith({ where: { provincia_id: 3 }, order: { nombre: 'ASC' } });
    expect(result).toBe(ciudades);
  });
});
