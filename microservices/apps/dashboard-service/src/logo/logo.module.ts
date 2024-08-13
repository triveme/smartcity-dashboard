import { Module } from '@nestjs/common';
import { LogoService } from './logo.service';
import { LogoController } from './logo.controller';
import { LogoRepo } from './logo.repo';

@Module({
  providers: [LogoService, LogoRepo],
  controllers: [LogoController],
  exports: [LogoService, LogoRepo],
})
export class LogoModule {}
