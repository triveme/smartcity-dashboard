import { Module } from '@nestjs/common';
import { CustomMapImageController } from './custom-map-image.controller';
import { CustomMapImageRepo } from './custom-map-image.repo';
import { CustomMapImageService } from './custom-map-image.service';

@Module({
  providers: [CustomMapImageService, CustomMapImageRepo],
  controllers: [CustomMapImageController],
  exports: [CustomMapImageService, CustomMapImageRepo],
})
export class CustomMapImageModule {}
