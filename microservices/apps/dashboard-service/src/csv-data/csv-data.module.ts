import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { DataPlatformQueue } from '@app/data-platform-queue';
import { AuthService as NgsiAuthService } from '../../../ngsi-service/src/auth/auth.service';
import { DataService as NgsiDataService } from '../../../ngsi-service/src/data/data.service';
import { AuthService as OrchideoAuthService } from '../../../orchideo-connect-service/src/auth/auth.service';
import { DataService as OrchideoDataService } from '../../../orchideo-connect-service/src/data/data.service';
import { QueryService as OrchideoQueryService } from '../../../orchideo-connect-service/src/query/query.service';
import { OrchideoConnectService } from '../../../orchideo-connect-service/src/api.service';
import { DataService as InternalDataService } from '../../../internal-data-service/src/data/data.service';
import { AuthService as PlanBarAuthService } from '../../../plan-bar-service/src/auth/auth.service';
import { PlanBarService } from '../../../plan-bar-service/src/data/data.service';
import { SqlViewService } from '../../../sql-view-service/src/data/data.service';
import { QueryConfigService as UsiDataService } from '../../../usi-platform-service/src/data/data.service';
import { CsvDataService } from './csv-data.service';

@Module({
  imports: [HttpModule],
  providers: [
    {
      provide: DataPlatformQueue,
      useFactory: () =>
        new DataPlatformQueue({
          name: 'dashboard-csv',
          platform: 'dashboard-csv',
        }),
    },
    NgsiAuthService,
    NgsiDataService,
    OrchideoAuthService,
    OrchideoDataService,
    OrchideoQueryService,
    OrchideoConnectService,
    InternalDataService,
    PlanBarAuthService,
    PlanBarService,
    SqlViewService,
    UsiDataService,
    CsvDataService,
  ],
  exports: [CsvDataService],
})
export class CsvDataModule {}
