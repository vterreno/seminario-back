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
          name: 'Admin',
          permissions: [],
          users: [],
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: 2,
          name: 'User',
          permissions: [],
          users: [],
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];
      jest.spyOn(service, 'find').mockResolvedValue(result);

      const response = await controller.getAll();
      console.log('Resultado del getAll():', response);

      expect(response).toBe(result);
    });
  });
});
