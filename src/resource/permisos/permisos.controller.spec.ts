import { Test, TestingModule } from '@nestjs/testing';
import { PermisosService } from './permisos.service';
import { PermisosController } from './permisos.controller';
import { PermissionEntity } from 'src/database/core/permission.entity';
import { RoleEntity } from 'src/database/core/roles.entity';

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
          // Segundo en vez del UsersService real, inyectamos un objeto mock
          // con los métodos que el controlador podría llamar.
          provide: PermisosService,
          useValue: {
            find: jest.fn(),
          },
        },
      ],
    }).compile();
    // Aqui obtenemos instancias ya construidas y con dependencias inyectadas
    controller = module.get<PermisosController>(PermisosController);
    service = module.get<PermisosService>(PermisosService);
  });

  describe('getAll', () => {
    it('devuelve todos los permisos disponibles', async () => {
      // Creamos un rol reutilizable para los permisos
      const rolAdmin: RoleEntity = {
        id: 1,
        name: 'ADMIN',
        permissions: [],
        users: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      // Mock de permisos, asignando el rolAdmin
      const result: PermissionEntity[] = [
        {
          id: 1,
          name: 'CREATE_USER',
          codigo: '1',
          createdAt: new Date(),
          updatedAt: new Date(),
          roles: [rolAdmin] as RoleEntity[], 
        },
        {
          id: 2,
          name: 'DELETE_USER',
          codigo: '2',
          createdAt: new Date(),
          updatedAt: new Date(),
          roles: [rolAdmin] as RoleEntity[],
        },
      ];

      // Asociamos los permisos al rol para simular la relación bidireccional
      rolAdmin.permissions = result;

      // Mockeamos el servicio
      jest.spyOn(service, 'find').mockResolvedValue(result);

      // Ejecutamos el controlador
      const response = await controller.getAll();
      console.log('Resultado del getAll():', response);

      // Verificamos que la respuesta sea la misma que nuestro mock
      expect(response).toBe(result);
    });
  });
});
