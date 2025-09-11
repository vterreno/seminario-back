import { Module } from '@nestjs/common';
import { MailServiceService } from './mail-service.service';
import { MailServiceController } from './mail-service.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { emailCodeEntity } from 'src/database/core/email-code.entity';
import { UserEntity } from 'src/database/core/user.entity';

@Module({
  imports: [TypeOrmModule.forFeature([emailCodeEntity, UserEntity])],
  controllers: [MailServiceController],
  providers: [MailServiceService],
})
export class MailServiceModule {}
