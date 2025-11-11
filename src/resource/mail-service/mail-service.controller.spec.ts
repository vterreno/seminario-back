import { MailServiceController } from './mail-service.controller';
import { MailServiceService } from './mail-service.service';

describe('MailServiceController', () => {
  let controller: MailServiceController;
  let service: MailServiceService;
  let mockService: { sendMail: jest.Mock; verifyCode: jest.Mock };

  beforeEach(() => {
    jest.clearAllMocks();

    mockService = {
      sendMail: jest.fn(),
      verifyCode: jest.fn(),
    };

    controller = new MailServiceController(mockService as unknown as MailServiceService);
    service = mockService as unknown as MailServiceService;
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
    expect(service).toBeDefined();
  });

  it('should send email via service', async () => {
    mockService.sendMail.mockResolvedValue('ok');

    const result = await controller.sendEmail('user@example.com');

    expect(result).toEqual({ ok: true, result: 'ok' });
    expect(mockService.sendMail).toHaveBeenCalledWith('user@example.com');
  });

  it('should verify codes via service', async () => {
    mockService.verifyCode.mockResolvedValue(true);

    const result = await controller.verifyCode({ email: 'user@example.com', code: '123456' });

    expect(result).toEqual({ valid: true });
    expect(mockService.verifyCode).toHaveBeenCalledWith('user@example.com', '123456');
  });
});
