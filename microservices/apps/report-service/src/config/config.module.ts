import { Module } from '@nestjs/common';
import { ConfigService } from './config.service';
import { ConfigController } from './config.controller';

@Module({
  providers: [ConfigService],
  controllers: [ConfigController],
})
export class ConfigModule {}
