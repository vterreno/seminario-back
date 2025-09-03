import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from './users.service';
import { JwtService } from 'src/jwt/jwt.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UnauthorizedException } from '@nestjs/common';
import { UserEntity } from 'src/database/core/user.entity';

describe('UsersService', () => {
  let service: UsersService;
  let repo: Repository<UserEntity>;
  let jwt: JwtService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        // mock del repositorio
        {
          provide: getRepositoryToken(UserEntity),
          useValue: {
            findOneBy: jest.fn(),
          },
        },
        // mock del JwtService
        {
          provide: JwtService,
          useValue: {
            signAsync: jest.fn().mockResolvedValue('fake-token'),
          },
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
    repo = module.get<Repository<UserEntity>>(getRepositoryToken(UserEntity));
    jwt = module.get<JwtService>(JwtService);
  });

  describe('login', () => {
    it('debería loguear correctamente un usuario válido', async () => {
      // Arrange
      const user = { id: 1, email: 'ignacio@sala20', password: '12345678' } as UserEntity;
      (repo.findOneBy as jest.Mock).mockResolvedValue(user);

      // Act
      const result = await service.login({ email: 'ignacio@sala20', password: '12345678' });

      // Assert
      expect(repo.findOneBy).toHaveBeenCalledWith({ email: 'ignacio@sala20' });
      expect(jwt.generateToken).toHaveBeenCalled(); // se llama para token
      expect(result).toEqual({
        accessToken: 'fake-token',
        refreshToken: 'fake-token',
      });
    });

    it('debería lanzar Unauthorized si el usuario no existe', async () => {
      (repo.findOneBy as jest.Mock).mockResolvedValue(null);

      await expect(
        service.login({ email: 'noexiste@mail.com', password: '1234' }),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('debería lanzar Unauthorized si la contraseña es incorrecta', async () => {
      const user = { id: 1, email: 'ignacio@sala20', password: 'otroPass' } as UserEntity;
      (repo.findOneBy as jest.Mock).mockResolvedValue(user);

      await expect(
        service.login({ email: 'ignacio@sala20', password: '12345678' }),
      ).rejects.toThrow(UnauthorizedException);
    });
  });
});
