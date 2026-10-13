import { Injectable } from '@nestjs/common';
import type { QueryBatch } from '../../../plan-bar-service/src/data/data.service';
import { DataService as NgsiDataService } from '../../../ngsi-service/src/data/data.service';
import { DataService as OrchideoDataService } from '../../../orchideo-connect-service/src/data/data.service';
import { OrchideoConnectService } from '../../../orchideo-connect-service/src/api.service';
import { DataService as InternalDataService } from '../../../internal-data-service/src/data/data.service';
import { PlanBarService } from '../../../plan-bar-service/src/data/data.service';
import { SqlViewService } from '../../../sql-view-service/src/data/data.service';
import { QueryConfigService as UsiDataService } from '../../../usi-platform-service/src/data/data.service';

@Injectable()
export class CsvDataService {
  constructor(
    private readonly ngsiDataService: NgsiDataService,
    private readonly orchideoDataService: OrchideoDataService,
    private readonly orchideoConnectService: OrchideoConnectService,
    private readonly internalDataService: InternalDataService,
    private readonly planBarService: PlanBarService,
    private readonly sqlViewService: SqlViewService,
    private readonly usiDataService: UsiDataService,
  ) {}

  async getData(queryBatch: QueryBatch): Promise<object | object[]> {
    switch (queryBatch.auth_data.type) {
      case 'ngsi':
      case 'ngsi-ld':
      case 'ngsi-v2':
        return this.ngsiDataService.getDataFromDataSource({
          ...queryBatch,
          queryConfigSnapshot: {
            id: queryBatch.query_config.id,
            hash: queryBatch.query_config.hash,
          },
        });
      case 'api': {
        const systemUser =
          await this.orchideoDataService.getSystemUserForTenant(
            queryBatch.auth_data.tenantAbbreviation,
          );
        if (!systemUser) {
          throw new Error('No system user configured for CSV data source');
        }
        const data = await this.orchideoDataService.getDataFromDataSource({
          ...queryBatch,
          queryConfigSnapshot: {
            id: queryBatch.query_config.id,
            hash: queryBatch.query_config.hash,
          },
          system_user: systemUser,
        });
        return this.orchideoConnectService.transformToTargetModel(
          Array.isArray(data) ? data : [data],
        );
      }
      case 'internal':
        return this.internalDataService.getDataFromDataSource(queryBatch);
      case 'planbar':
        return this.planBarService.getDataFromDataSource(queryBatch);
      case 'sql':
        return this.sqlViewService.getDataFromDataSource(queryBatch);
      case 'usi':
        return this.usiDataService.getSensorData(queryBatch.query_config);
      default:
        throw new Error(
          `CSV export is not supported for data source type: ${queryBatch.auth_data.type}`,
        );
    }
  }
}
