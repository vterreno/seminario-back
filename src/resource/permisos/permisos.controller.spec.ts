import { Test, TestingModule } from '@nestjs/testing';
import { PermisosService } from './permisos.service';
import { PermisosController } from './permisos.controller';
import { PermissionEntity } from 'src/database/core/permission.entity';
import { RoleEntity } from 'src/database/core/roles.entity';
import { AuthGuard } from 'src/middlewares/auth.middleware';
import { Reflector } from '@nestjs/core';

describe('PermisosController', () => {
  //Hacemos referencia a las instancias que obtendremos del modulo de testing
  let controller: PermisosController;
  let service: PermisosService;

   // Antes de cada test, armamos un módulo mínimo que contenga
  // SOLO el controlador y un mock del servicio.
  beforeEach(async () => {
    // Primero creamos el modulo de testing declarando el controlador y proveedor
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PermisosController],
      providers: [
        {
          provide: PermisosService,
          useValue: {
            find: jest.fn(),
          },
        },
        Reflector,
      ],
    })
      .overrideGuard(AuthGuard)
      .useValue({ canActivate: jest.fn().mockReturnValue(true) })
      .compile();
    // Aqui obtenemos instancias ya construidas y con dependencias inyectadas
    controller = module.get<PermisosController>(PermisosController);
    service = module.get<PermisosService>(PermisosService);
  });

  describe('getAllPermissions', () => {
    it('devuelve todos los permisos disponibles', async () => {
      // Creamos un rol reutilizable para los permisos
      const rolAdmin = {
        id: 1,
        nombre: 'ADMIN',
        empresa_id: 1,
        estado: true,
        empresa: null,
        permissions: [],
        users: [],
        created_at: new Date(),
        updated_at: new Date(),
        deleted_at: null,
      } as unknown as RoleEntity;

      // Mock de permisos, asignando el rolAdmin
      const result: PermissionEntity[] = [
        {
          id: 1,
          nombre: 'CREATE_USER',
          codigo: '1',
          created_at: new Date(),
          updated_at: new Date(),
          deleted_at: null,
          roles: rolAdmin,
        } as unknown as PermissionEntity,
        {
          id: 2,
          nombre: 'DELETE_USER',
          codigo: '2',
          created_at: new Date(),
          updated_at: new Date(),
          deleted_at: null,
          roles: rolAdmin,
        } as unknown as PermissionEntity,
      ];

      // Asociamos los permisos al rol para simular la relación bidireccional
      rolAdmin.permissions = result as unknown as PermissionEntity[];

      // Mockeamos el servicio
      jest.spyOn(service, 'find').mockResolvedValue(result);

      // Ejecutamos el controlador
      const response = await controller.getAllPermissions();

      // Verificamos que la respuesta sea la misma que nuestro mock
      expect(response).toBe(result);
      expect(service.find).toHaveBeenCalledTimes(1);
    });
  });
});
