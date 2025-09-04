import { Test, TestingModule } from '@nestjs/testing';
import { MailServiceService } from './mail-service.service';

describe('MailServiceService', () => {
  let service: MailServiceService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [MailServiceService],
    }).compile();

    service = module.get<MailServiceService>(MailServiceService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
