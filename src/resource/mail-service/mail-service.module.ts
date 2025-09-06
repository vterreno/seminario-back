import { Module } from '@nestjs/common';
import { MailServiceService } from './mail-service.service';
import { MailServiceController } from './mail-service.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { emailCodeEntity } from 'src/database/core/email-code.entity';

@Module({
  imports: [TypeOrmModule.forFeature([emailCodeEntity])],
  controllers: [MailServiceController],
  providers: [MailServiceService],
})
export class MailServiceModule {}
