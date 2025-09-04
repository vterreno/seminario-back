import { Controller, Post, Body } from '@nestjs/common';
import { MailServiceService } from './mail-service.service';

@Controller('mail-service')
export class MailServiceController {
  constructor(private readonly mailServiceService: MailServiceService) {}
  
  @Post('send')
  async sendEmail(
    @Body('to') to: string,
  ) {
    const result = await this.mailServiceService.sendMail(to);
    return { ok: true, result };
  }
}
