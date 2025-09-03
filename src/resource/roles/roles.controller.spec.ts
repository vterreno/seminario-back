import { Test, TestingModule } from '@nestjs/testing';
import { RolesController } from './roles.controller';
import { RolesService } from './roles.service';
import { RoleEntity } from 'src/database/core/roles.entity';

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
            find: jest.fn(), // Mockeamos find (seria el del service)
          },
        },
      ],
    }).compile();

    controller = module.get<RolesController>(RolesController);
    service = module.get<RolesService>(RolesService);
  });

  describe('getAll', () => {
    it('devuelve todos los roles disponibles', async () => {
      const result: RoleEntity[] = [
        {
          id: 1,
          nombre: 'Admin',
          permissions: [],
          users: [],
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          id: 2,
          nombre: 'User',
          permissions: [],
          users: [],
          created_at: new Date(),
          updated_at: new Date(),
        },
      ];
      jest.spyOn(service, 'find').mockResolvedValue(result);

      const response = await controller.getAll();
      console.log('Resultado del getAll():', response);

      expect(response).toBe(result);
    });
  });
});
