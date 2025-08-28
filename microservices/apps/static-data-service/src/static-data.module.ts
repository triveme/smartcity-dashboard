import { Module } from '@nestjs/common';
import { ScheduleService } from './schedule.service';
import { ScheduleModule } from '@nestjs/schedule';
import { DataModule } from '../../ngsi-service/src/data/data.module';
import { DataService } from './data/data.service';
import { QueryModule } from './query/query.module';
import { QueryService } from './query/query.service';
import { TransformationModule } from './transformation/transformation.module';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: ['.env.local', '.env'],
      isGlobal: true,
    }),
    DataModule,
    ScheduleModule.forRoot(),
    QueryModule,
    TransformationModule,
  ],
  providers: [DataService, ScheduleService, QueryService],
})
export class StaticDataModule {}
