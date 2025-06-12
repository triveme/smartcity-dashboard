import { Module } from '@nestjs/common';
import { ScheduleService } from './scheduler.service';
import { ScheduleModule } from '@nestjs/schedule';
import { PopulateValueService } from './populate/populate-value.service';
import { PopulateCombinedWidgetService } from './populate/populate-combined-widget.service';
import { PopulateChartService } from './populate/populate-chart.service';
import { DataTranslationService } from './data-translation.service';
import { DataTranslationRepo } from './data-translation.repo';
import { PopulateMapService } from './populate/populate-map.service';
import { PostgresDbModule } from '@app/postgres-db';
import { JwtModule } from '@nestjs/jwt';

@Module({
  imports: [
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
  ],
})
export class DataTranslationServiceModule {}
