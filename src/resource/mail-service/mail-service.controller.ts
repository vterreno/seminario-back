import { Controller, Post, Body, HttpCode } from '@nestjs/common';
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
  @Post('verify')
  async verifyCode(@Body() body: { email: string; code: string }) {
    const isValid = await this.mailServiceService.verifyCode(body.email, body.code);
    return { valid: isValid };
  }
}
