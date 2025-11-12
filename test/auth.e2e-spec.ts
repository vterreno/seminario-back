import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import * as request from 'supertest';
import { hashSync } from 'bcrypt';
import { UsersController } from '../src/resource/users/users.controller';
import { UsersService } from '../src/resource/users/users.service';
import { JwtService } from '../src/jwt/jwt.service';
import { MailServiceService } from '../src/resource/mail-service/mail-service.service';
import { ContactosService } from '../src/resource/contactos/contactos.service';
import { UserEntity } from '../src/database/core/user.entity';
import { RoleEntity } from '../src/database/core/roles.entity';
import { empresaEntity } from '../src/database/core/empresa.entity';
import { PermissionEntity } from '../src/database/core/permission.entity';
import { sucursalEntity } from '../src/database/core/sucursal.entity';

describe('Auth (Top-Down Integration)', () => {
  let app: INestApplication;

  const userRepositoryMock = {
    findOne: jest.fn(),
  };

  const roleRepositoryMock = {
    findOne: jest.fn(),
    save: jest.fn(),
    find: jest.fn(),
  };

  const empresaRepositoryMock = {
    findOne: jest.fn(),
    save: jest.fn(),
  };

  const permissionRepositoryMock = {
    find: jest.fn(),
  };

  const sucursalRepositoryMock = {
    find: jest.fn(),
  };

  const jwtServiceMock = {
    generateToken: jest.fn(),
    refreshToken: jest.fn(),
    getPayload: jest.fn(),
  };

  const mailServiceMock = {
    sendWelcomeMail: jest.fn(),
    sendMail: jest.fn(),
    verifyCode: jest.fn(),
  };

  const contactosServiceMock = {
    crearConsumidorFinal: jest.fn(),
  };

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [
        UsersService,
        { provide: JwtService, useValue: jwtServiceMock },
        { provide: MailServiceService, useValue: mailServiceMock },
        { provide: ContactosService, useValue: contactosServiceMock },
        { provide: getRepositoryToken(UserEntity), useValue: userRepositoryMock },
        { provide: getRepositoryToken(RoleEntity), useValue: roleRepositoryMock },
        { provide: getRepositoryToken(empresaEntity), useValue: empresaRepositoryMock },
        { provide: getRepositoryToken(PermissionEntity), useValue: permissionRepositoryMock },
        { provide: getRepositoryToken(sucursalEntity), useValue: sucursalRepositoryMock },
      ],
    }).compile();

    app = moduleRef.createNestApplication();
    await app.init();
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterAll(async () => {
    await app.close();
  });

  it('POST /users/login devuelve tokens válidos cuando las credenciales son correctas', async () => {
    userRepositoryMock.findOne.mockResolvedValueOnce({
      id: 1,
      email: 'auth@example.com',
      password: hashSync('secret123', 10),
      status: true,
      role: { permissions: [] },
      empresa: null,
    } as UserEntity);

    jwtServiceMock.generateToken
      .mockReturnValueOnce('access-token')
      .mockReturnValueOnce('refresh-token');

    const response = await request(app.getHttpServer())
      .post('/users/login')
      .send({ email: 'auth@example.com', password: 'secret123' });

    expect(response.status).toBe(201);
    expect(response.body).toEqual({
      accessToken: 'access-token',
      refreshToken: 'refresh-token',
    });
    expect(userRepositoryMock.findOne).toHaveBeenCalledWith({
      where: { email: 'auth@example.com' },
      relations: {
        role: { permissions: true },
        empresa: true,
        sucursales: true,
      },
    });
  });

  it('POST /users/login rechaza credenciales incorrectas', async () => {
    userRepositoryMock.findOne.mockResolvedValueOnce({
      id: 2,
      email: 'jane@example.com',
      password: hashSync('secret123', 10),
      status: true,
      role: { permissions: [] },
      empresa: null,
    } as UserEntity);

    const response = await request(app.getHttpServer())
      .post('/users/login')
      .send({ email: 'jane@example.com', password: 'wrong-password' });

    expect(response.status).toBe(401);
    expect(response.body.message).toBe('Usuario o contraseña incorrectos');
    expect(jwtServiceMock.generateToken).not.toHaveBeenCalled();
  });
});
