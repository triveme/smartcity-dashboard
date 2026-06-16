import { Module } from '@nestjs/common';
import { PostgresDbModule } from '@app/postgres-db';
import { AuthService } from './auth/auth.service';
import { HttpModule } from '@nestjs/axios';
import { UsiPlaformService } from './usi-platform.service';
import { UsiPlatformController } from './usi-platform.controller';
import { QueryConfigService } from './data/data.service';
import { ConfigModule } from '@nestjs/config';
import { QueryService } from './query/query.service';
import { ScheduleService } from './schedule.service';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: ['.env.local', '.env'],
      isGlobal: true,
    }),
    HttpModule,
    PostgresDbModule,
  ],
  providers: [
    UsiPlaformService,
    QueryService,
    AuthService,
    QueryConfigService,
    ScheduleService,
  ],
  controllers: [UsiPlatformController],
})
export class UsiPlatformModule {}
