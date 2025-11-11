import { BadRequestException, NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ContactosService } from './contactos.service';
import { contactoEntity } from 'src/database/core/contacto.entity';
import { empresaEntity } from 'src/database/core/empresa.entity';

describe('ContactosService', () => {
  let service: ContactosService;
  let contactosRepository: Record<string, jest.Mock>;
  let empresaRepository: Record<string, jest.Mock>;
  let queryBuilder: Record<string, jest.Mock>;
  let consoleErrorSpy: jest.SpyInstance;

  const createContacto = (overrides: Partial<contactoEntity> = {}): contactoEntity => ({
    id: 1,
    nombre_razon_social: 'Juan Perez',
    tipo_identificacion: 'DNI',
    numero_identificacion: '12345678',
    empresa_id: 1,
    empresa: { id: 1 } as empresaEntity,
    estado: true,
    es_consumidor_final: false,
    condicion_iva: 'Responsable Inscripto' as any,
    deleted_at: null,
    rol: 'CLIENTE',
    ...overrides,
  }) as contactoEntity;

  beforeEach(async () => {
    queryBuilder = {
      leftJoinAndSelect: jest.fn().mockReturnThis(),
      where: jest.fn().mockReturnThis(),
      andWhere: jest.fn().mockReturnThis(),
      orderBy: jest.fn().mockReturnThis(),
      getMany: jest.fn(),
    } as any;

    contactosRepository = {
      createQueryBuilder: jest.fn().mockReturnValue(queryBuilder),
      findOne: jest.fn(),
      findBy: jest.fn(),
      save: jest.fn(),
      update: jest.fn(),
      softDelete: jest.fn(),
    } as any;

    empresaRepository = {
      findOne: jest.fn(),
    } as any;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ContactosService,
        {
          provide: getRepositoryToken(contactoEntity),
          useValue: contactosRepository,
        },
        {
          provide: getRepositoryToken(empresaEntity),
          useValue: empresaRepository,
        },
      ],
    }).compile();

    service = module.get<ContactosService>(ContactosService);
    consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => undefined);
  });

  afterEach(() => {
    jest.clearAllMocks();
    consoleErrorSpy.mockRestore();
  });

  describe('findByRoles', () => {
    it('returns contactos without empresa filter for super admin', async () => {
      const contactos = [createContacto({ id: 10 })];
      queryBuilder.getMany.mockResolvedValue(contactos);

      const result = await service.findByRoles(['ADMIN'], undefined, true);

      expect(queryBuilder.where).toHaveBeenCalledWith('contacto.rol IN (:...roles)', { roles: ['ADMIN'] });
      expect(queryBuilder.andWhere).not.toHaveBeenCalledWith('contacto.empresa_id = :empresaId', { empresaId: expect.any(Number) });
      expect(result).toEqual(contactos);
    });

    it('adds empresa filter when not super admin', async () => {
      const contactos = [createContacto({ id: 12 })];
      queryBuilder.getMany.mockResolvedValue(contactos);

      const result = await service.findByRoles(['VENDEDOR'], 5, false);

      expect(queryBuilder.andWhere).toHaveBeenCalledWith('contacto.empresa_id = :empresaId', { empresaId: 5 });
      expect(result).toEqual(contactos);
    });
  });

  describe('createContacto', () => {
    it('persists the contacto when validations pass', async () => {
      const saved = createContacto({ id: 2, tipo_identificacion: null, numero_identificacion: null });
      contactosRepository.save.mockResolvedValue(saved);

      const result = await service.createContacto({ nombre_razon_social: 'Nuevo' });

      expect(contactosRepository.save).toHaveBeenCalledWith({ nombre_razon_social: 'Nuevo' });
      expect(result).toEqual(saved);
    });

    it('throws when tipo_identificacion is provided without numero_identificacion', async () => {
      await expect(
        service.createContacto({ tipo_identificacion: 'DNI' }),
      ).rejects.toThrow(new BadRequestException('El número de identificación es obligatorio cuando se selecciona un tipo'));
    });

    it('throws when a duplicate contacto exists for the same empresa', async () => {
      contactosRepository.findOne.mockResolvedValueOnce(createContacto({ nombre_razon_social: 'Existente' }));

      await expect(
        service.createContacto({
          tipo_identificacion: 'DNI',
          numero_identificacion: '123',
          empresa_id: 1,
        }),
      ).rejects.toThrow(/Ya existe el contacto/);
    });

    it('maps database unique violation to BadRequest', async () => {
      contactosRepository.findOne.mockResolvedValueOnce(null);
      contactosRepository.save.mockRejectedValueOnce({ code: '23505', constraint: 'UQ_contactos_identificacion' });

      await expect(
        service.createContacto({ tipo_identificacion: 'CUIT', numero_identificacion: '30-123', empresa_id: 1 }),
      ).rejects.toThrow(/Ya existe un contacto con CUIT 30-123/);
    });
  });

  describe('updateContacto', () => {
    it('updates the contacto and reloads relations', async () => {
      const existing = createContacto({ id: 3 });
      const updated = { ...existing, nombre_razon_social: 'Actualizado' };

      contactosRepository.findOne
        .mockResolvedValueOnce(existing)
        .mockResolvedValueOnce(updated);
      contactosRepository.save.mockResolvedValue(updated);

      const result = await service.updateContacto(3, { nombre_razon_social: 'Actualizado' });

      expect(contactosRepository.save).toHaveBeenCalledWith(expect.objectContaining({ nombre_razon_social: 'Actualizado' }));
      expect(result).toEqual(updated);
    });

    it('throws when the contacto is not found', async () => {
      contactosRepository.findOne.mockResolvedValueOnce(null);

      await expect(service.updateContacto(99, {})).rejects.toThrow(new NotFoundException('Contacto no encontrado'));
    });

    it('throws when tipo_identificacion is set without numero_identificacion', async () => {
      const existing = createContacto({ tipo_identificacion: null, numero_identificacion: null });
      contactosRepository.findOne.mockResolvedValueOnce(existing);

      await expect(
        service.updateContacto(1, { tipo_identificacion: 'CUIT' }),
      ).rejects.toThrow(new BadRequestException('El número de identificación es obligatorio cuando se selecciona un tipo'));
    });

    it('throws when another contacto already uses the new identification', async () => {
      const existing = createContacto({ id: 5, numero_identificacion: '12345678' });
      const duplicate = createContacto({ id: 6, nombre_razon_social: 'Duplicado', numero_identificacion: '99999999' });

      contactosRepository.findOne
        .mockResolvedValueOnce(existing)
        .mockResolvedValueOnce(duplicate);

      await expect(
        service.updateContacto(5, { tipo_identificacion: 'DNI', numero_identificacion: '99999999' }),
      ).rejects.toThrow(/Ya existe el contacto/);
    });

    it('throws when new empresa does not exist', async () => {
      const existing = createContacto({ id: 7 });

      contactosRepository.findOne.mockResolvedValueOnce(existing);
      empresaRepository.findOne.mockResolvedValueOnce(null);

      await expect(
        service.updateContacto(7, { empresa_id: 99 }),
      ).rejects.toThrow(new NotFoundException('Empresa no encontrada'));
    });

    it('prevents modifying consumer final restricted fields', async () => {
      const existing = createContacto({ es_consumidor_final: true });
      contactosRepository.findOne.mockResolvedValue(existing);

      await expect(
        service.updateContacto(1, { estado: false }),
      ).rejects.toThrow(new BadRequestException('No se puede inactivar el contacto Consumidor Final'));

      await expect(
        service.updateContacto(1, { condicion_iva: 'Exento' as any }),
      ).rejects.toThrow(new BadRequestException('No se puede modificar la condición IVA del Consumidor Final'));
    });

    it('maps unique violations thrown during save to BadRequest', async () => {
      const existing = createContacto();

      contactosRepository.findOne.mockResolvedValueOnce(existing);
      contactosRepository.save.mockRejectedValueOnce({ code: '23505', constraint: 'UQ_contactos_identificacion' });

      await expect(
        service.updateContacto(1, { numero_identificacion: '321' }),
      ).rejects.toThrow(new BadRequestException('Ya existe un contacto con esa identificación en esta empresa'));
    });
  });

  describe('updateContactosStatus', () => {
    it('deactivates only non consumer final contactos and reports skipped ones', async () => {
      const contactos = [
        createContacto({ id: 1, es_consumidor_final: true }),
        createContacto({ id: 2, es_consumidor_final: false }),
      ];

      contactosRepository.findBy.mockResolvedValue(contactos);

      const result = await service.updateContactosStatus([1, 2], false);

      expect(contactosRepository.update).toHaveBeenCalledWith([2], { estado: false });
      expect(result.message).toBe('1 contacto desactivado. 1 consumidor final no se pudo desactivar.');
    });

    it('returns message when all contactos are protected consumers', async () => {
      contactosRepository.findBy.mockResolvedValue([createContacto({ id: 1, es_consumidor_final: true })]);

      const result = await service.updateContactosStatus([1], false);

      expect(contactosRepository.update).not.toHaveBeenCalled();
      expect(result.message).toBe('No se pudo desactivar ningún contacto. 1 consumidor final no se puede desactivar.');
    });

    it('updates all contactos when enabling them', async () => {
      contactosRepository.update.mockResolvedValue(undefined);

      const result = await service.updateContactosStatus([1, 2], true);

      expect(contactosRepository.update).toHaveBeenCalledWith([1, 2], { estado: true });
      expect(result.message).toBe('Estados actualizados correctamente');
    });
  });

  describe('delete', () => {
    it('soft deletes contacto when allowed', async () => {
      const contacto = createContacto({ id: 9 });
      contactosRepository.findOne.mockResolvedValueOnce(contacto);

      const result = await service.delete(9);

      expect(contactosRepository.softDelete).toHaveBeenCalledWith(9);
      expect(result).toEqual({ message: 'deleted' });
    });

    it('throws when contacto does not exist', async () => {
      contactosRepository.findOne.mockResolvedValueOnce(null);

      await expect(service.delete(1)).rejects.toThrow(new NotFoundException('Contacto no encontrado'));
    });

    it('throws when attempting to delete consumer final contacto', async () => {
      contactosRepository.findOne.mockResolvedValueOnce(createContacto({ es_consumidor_final: true }));

      await expect(service.delete(1)).rejects.toThrow(new BadRequestException('No se puede eliminar el contacto Consumidor Final'));
      expect(contactosRepository.softDelete).not.toHaveBeenCalled();
    });
  });
});
