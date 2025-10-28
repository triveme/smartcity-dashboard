import { Module } from '@nestjs/common';
import { TabImageService } from './tab-image.service';
import { TabImageRepo } from './tab-image.repo';
import { TabImageController } from './tab-image.controller';

@Module({
  providers: [TabImageService, TabImageRepo],
  controllers: [TabImageController],
  exports: [TabImageService, TabImageRepo],
})
export class TabImageModule {}
