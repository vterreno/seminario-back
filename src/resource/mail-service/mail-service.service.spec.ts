import { Test, TestingModule } from '@nestjs/testing';

const sendMailMock = jest.fn();
const createTransportMock = jest.fn(() => ({ sendMail: sendMailMock }));
jest.mock('nodemailer', () => ({
  createTransport: createTransportMock,
}));

const readFileSyncMock = jest.fn();
jest.mock('fs', () => {
  const actual = jest.requireActual('fs');
  return {
    ...actual,
    readFileSync: (...args: unknown[]) => readFileSyncMock(...args),
  };
});

jest.mock('path', () => ({
  ...jest.requireActual('path'),
}));

jest.mock('bcrypt', () => ({
  hashSync: jest.fn(() => 'hashed-code'),
  compareSync: jest.fn(() => true),
}));

import * as bcrypt from 'bcrypt';
import { getRepositoryToken } from '@nestjs/typeorm';
import { emailCodeEntity } from 'src/database/core/email-code.entity';
import { UserEntity } from 'src/database/core/user.entity';
import { MailServiceService } from './mail-service.service';

describe('MailServiceService', () => {
  let service: MailServiceService;
  let emailCodeRepository: Record<string, jest.Mock>;
  let userRepository: Record<string, jest.Mock>;
  const originalEnv = { ...process.env };

  const buildTestingModule = async () => {
    emailCodeRepository = {
      save: jest.fn().mockResolvedValue(undefined),
      findOne: jest.fn(),
    } as any;

    userRepository = {
      findOne: jest.fn(),
    } as any;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MailServiceService,
        {
          provide: getRepositoryToken(emailCodeEntity),
          useValue: emailCodeRepository,
        },
        {
          provide: getRepositoryToken(UserEntity),
          useValue: userRepository,
        },
      ],
    }).compile();

    service = module.get(MailServiceService);
  };

  beforeEach(async () => {
    process.env = { ...originalEnv, SUPER_ADMIN_EMAIL: 'superadmin@mail.com' };
    sendMailMock.mockReset();
    createTransportMock.mockClear();
    readFileSyncMock.mockReset();
    (bcrypt.hashSync as jest.Mock).mockReset().mockReturnValue('hashed-code');
    (bcrypt.compareSync as jest.Mock).mockReset().mockReturnValue(true);
    await buildTestingModule();
  });

  afterEach(() => {
    jest.clearAllMocks();
    jest.restoreAllMocks();
    process.env = { ...originalEnv };
  });

  it('creates transporter on construction', () => {
    expect(createTransportMock).toHaveBeenCalledWith({
      host: 'smtp.zoho.com',
      port: 465,
      secure: true,
      auth: {
        user: process.env.ZOHO_USER,
        pass: process.env.ZOHO_PASS,
      },
    });
  });

  it('throws when email belongs to super admin', async () => {
    await expect(service.sendMail('superadmin@mail.com')).rejects.toThrow(
      'No se permite el cambio de contraseña por motivos de seguridad',
    );
    expect(userRepository.findOne).not.toHaveBeenCalled();
  });

  it('throws when user is not found', async () => {
    userRepository.findOne.mockResolvedValue(null);

    await expect(service.sendMail('user@mail.com')).rejects.toThrow('No se permite el cambio de contraseña');
    expect(emailCodeRepository.save).not.toHaveBeenCalled();
  });

  it('stores hashed code and sends email when user exists', async () => {
    userRepository.findOne.mockResolvedValue({ id: 10, email: 'user@mail.com' });
    readFileSyncMock.mockReturnValue('Código {{codigo}}');
    sendMailMock.mockResolvedValue({ messageId: '1' });
    const randomSpy = jest.spyOn(Math, 'random').mockReturnValue(0);

    const info = await service.sendMail('user@mail.com');

    expect(emailCodeRepository.save).toHaveBeenCalledWith(
      expect.objectContaining({
        email: 'user@mail.com',
        codigoHash: 'hashed-code',
        expired_at: expect.any(Date),
      }),
    );
    expect(readFileSyncMock).toHaveBeenCalledWith(expect.stringContaining('email-template.html'), 'utf8');
    expect(sendMailMock).toHaveBeenCalledWith(
      expect.objectContaining({
        to: 'user@mail.com',
        html: 'Código 100000',
      }),
    );
    expect(info).toEqual({ messageId: '1' });
    randomSpy.mockRestore();
  });

  it('wraps template rendering errors when sending mail', async () => {
    userRepository.findOne.mockResolvedValue({ id: 10, email: 'user@mail.com' });
    readFileSyncMock.mockImplementation(() => {
      throw new Error('ENOENT');
    });
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => undefined);

    await expect(service.sendMail('user@mail.com')).rejects.toThrow(
      'No se pudo enviar el correo. Verifique que el archivo de plantilla exista y esté configurado como un asset en nest-cli.json.',
    );

    expect(consoleSpy).toHaveBeenCalledWith('Error al enviar correo:', expect.any(Error));
  });

  it('verifyCode returns false when no record found', async () => {
    emailCodeRepository.findOne.mockResolvedValue(null);

    await expect(service.verifyCode('user@mail.com', '123456')).resolves.toBe(false);
    expect(bcrypt.compareSync).not.toHaveBeenCalled();
  });

  it('verifyCode returns false when record expired', async () => {
    emailCodeRepository.findOne.mockResolvedValue({
      expired_at: new Date(Date.now() - 1000),
    });

    await expect(service.verifyCode('user@mail.com', '123456')).resolves.toBe(false);
    expect(bcrypt.compareSync).not.toHaveBeenCalled();
  });

  it('verifyCode compares hash when record is valid', async () => {
    emailCodeRepository.findOne.mockResolvedValue({
      codigoHash: 'stored-hash',
      expired_at: new Date(Date.now() + 1000),
    });
    (bcrypt.compareSync as jest.Mock).mockReturnValueOnce(true);

    await expect(service.verifyCode('user@mail.com', '123456')).resolves.toBe(true);
    expect(bcrypt.compareSync).toHaveBeenCalledWith('123456', 'stored-hash');
  });

  it('sendWelcomeMail returns info when template renders', async () => {
    readFileSyncMock.mockReturnValue('Hola {{userName}}');
    sendMailMock.mockResolvedValue({ messageId: 'welcome-1' });

    const info = await service.sendWelcomeMail('new@mail.com', 'Mate');

    expect(readFileSyncMock).toHaveBeenCalledWith(
      expect.stringContaining('welcome-template.html'),
      'utf8',
    );
    expect(sendMailMock).toHaveBeenCalledWith(
      expect.objectContaining({
        to: 'new@mail.com',
        html: 'Hola Mate',
      }),
    );
    expect(info).toEqual({ messageId: 'welcome-1' });
  });

  it('sendWelcomeMail swallows errors and logs them', async () => {
    readFileSyncMock.mockImplementation(() => {
      throw new Error('read fail');
    });
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => undefined);

    const result = await service.sendWelcomeMail('new@mail.com', 'Mate');

    expect(result).toBeNull();
    expect(consoleSpy).toHaveBeenCalledWith('Error al enviar correo de bienvenida:', expect.any(Error));
    expect(sendMailMock).not.toHaveBeenCalled();
  });
});
