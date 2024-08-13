import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MailController } from './mail.controller';
import { MailService } from './mail.service';

@Module({
  imports: [ConfigModule.forRoot({ envFilePath: '../.env' })],
  controllers: [MailController],
  providers: [MailService],
})
export class MailModule {}
