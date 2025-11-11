import { Test, TestingModule } from '@nestjs/testing';
import { RolesController } from './roles.controller';
import { RolesService } from './roles.service';
import { RoleEntity } from 'src/database/core/roles.entity';
import { AuthGuard } from 'src/middlewares/auth.middleware';
import { PermissionsGuard } from 'src/middlewares/permission.middleware';
import { Reflector } from '@nestjs/core';

describe('RolesController', () => {
  let controller: RolesController;
  let service: RolesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [RolesController],
      providers: [
        {
          provide: RolesService,
          useValue: {
            find: jest.fn(),
          },
        },
        Reflector,
      ],
    })
      .overrideGuard(AuthGuard)
      .useValue({ canActivate: jest.fn().mockReturnValue(true) })
      .overrideGuard(PermissionsGuard)
      .useValue({ canActivate: jest.fn().mockReturnValue(true) })
      .compile();

    controller = module.get<RolesController>(RolesController);
    service = module.get<RolesService>(RolesService);
  });

  describe('getAll', () => {
    it('devuelve todos los roles disponibles', async () => {
      const result: RoleEntity[] = [
        {
          id: 1,
          nombre: 'Admin',
          empresa_id: 1,
          estado: true,
          empresa: null,
          permissions: [],
          users: [],
          created_at: new Date(),
          updated_at: new Date(),
          deleted_at: null,
        } as unknown as RoleEntity,
        {
          id: 2,
          nombre: 'User',
          empresa_id: 1,
          estado: true,
          empresa: null,
          permissions: [],
          users: [],
          created_at: new Date(),
          updated_at: new Date(),
          deleted_at: null,
        } as unknown as RoleEntity,
      ];
      jest.spyOn(service, 'find').mockResolvedValue(result);

      const response = await controller.getAll();

      expect(response).toBe(result);
    });
  });
});
