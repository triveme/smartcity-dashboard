import { Module } from '@nestjs/common';
import { ScheduleService } from './scheduler.service';
import { ScheduleModule } from '@nestjs/schedule';
import { PopulateCombinedWidgetService } from './populate/populate-combined-widget.service';
import { PopulateChartService } from './populate/populate-chart.service';
import { DataTranslationService } from './data-translation.service';
import { DataTranslationRepo } from './data-translation.repo';
import { PopulateMapService } from './populate/populate-map.service';
import { PostgresDbModule } from '@app/postgres-db';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule } from '@nestjs/config';
import { PopulateListviewService } from './populate/populate-listview';
import { RoundingService } from './transformation/rounding.service';
import { PopulateValueService } from './populate/populate-value.service';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: ['.env.local', '.env'],
      isGlobal: true,
    }),
    ScheduleModule.forRoot(),
    PostgresDbModule,
    JwtModule.register({
      global: true,
    }),
  ],
  providers: [
    ScheduleService,
    DataTranslationService,
    DataTranslationRepo,
    PopulateChartService,
    PopulateCombinedWidgetService,
    PopulateValueService,
    PopulateMapService,
    PopulateListviewService,
    RoundingService,
  ],
})
export class DataTranslationServiceModule {}
