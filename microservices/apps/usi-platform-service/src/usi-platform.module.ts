import { Module } from '@nestjs/common';
import { PostgresDbModule } from '@app/postgres-db';
import { AuthService } from './auth/auth.service';
import { HttpModule } from '@nestjs/axios';
import { AuthModule } from './auth/auth.module';
import { UsiPlaformService } from './usi-platform.service';
import { UsiPlatformController } from './usi-platform.controller';

@Module({
  imports: [AuthModule, HttpModule, PostgresDbModule],
  providers: [UsiPlaformService, AuthService],
  controllers: [UsiPlatformController],
})
export class UsiPlatformModule {}
