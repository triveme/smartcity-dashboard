import { Module } from '@nestjs/common';
import { PostgresDbModule } from '@app/postgres-db';
import { AuthService } from './auth/auth.service';
import { HttpModule } from '@nestjs/axios';
import { UsiPlaformService } from './usi-platform.service';
import { UsiPlatformController } from './usi-platform.controller';
import { QueryConfigService } from './query-config/query-config.service';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: ['.env.local', '.env'],
      isGlobal: true,
    }),
    HttpModule,
    PostgresDbModule,
  ],
  providers: [UsiPlaformService, AuthService, QueryConfigService],
  controllers: [UsiPlatformController],
})
export class UsiPlatformModule {}
