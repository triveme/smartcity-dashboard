/* eslint-disable  @typescript-eslint/no-explicit-any */
import { Injectable } from '@nestjs/common';
import { ChartData, MapObject } from '../dashboard.service';
import { Tab } from '@app/postgres-db/schemas';
import { Query } from '@app/postgres-db/schemas/query.schema';
import { DataModel } from '@app/postgres-db/schemas/data-model.schema';
import { QueryService } from '../../query/query.service';
import { QueryConfigService } from '../../query-config/query-config.service';

@Injectable()
export class PopulateValueService {
  constructor(
    private readonly queryService: QueryService,
    private readonly queryConfigService: QueryConfigService,
  ) {}

  async populateTab(
    tab: Tab & { query?: Query } & { dataModel: DataModel } & {
      chartData: ChartData[];
      mapObject: MapObject[];
    },
  ): Promise<void> {
    if (tab.componentType === 'Bild') {
      await this.populateImageTab(tab);
    } else {
      await this.populateSingleValueTab(tab);
    }
  }

  private async populateImageTab(
    tab: Tab & { query?: Query } & { dataModel: DataModel } & {
      chartData: ChartData[];
    } & { mapObject: MapObject[] },
  ): Promise<void> {
    const query = await this.queryService.getById(tab.queryId);

    if (query !== undefined) {
      if (query.queryData) {
        const queryDataMap: Map<string, string> = new Map(
          Object.entries(query.queryData),
        );

        tab.imageSrc = queryDataMap.get('imageData');
      }
    }
  }

  private async populateSingleValueTab(
    tab: Tab & { query?: Query } & { dataModel: DataModel } & {
      chartData: ChartData[];
      mapObject: MapObject[];
    },
  ): Promise<void> {
    const query = await this.queryService.getById(tab.queryId);
    const queryConfig = await this.queryConfigService.getById(
      query.queryConfigId,
    );

    if (queryConfig.attributes && queryConfig.attributes.length > 0) {
      tab.chartValues = [];
      tab.chartData = [];
      tab.chartLabels = [];

      for (const attribute of queryConfig.attributes) {
        if (query && query.queryData) {
          // ToDo: Change persisting of queryData to be ALWAYS an array
          if (Array.isArray(query.queryData) && query.queryData[0]) {
            this.populateSingleValueTabFromQueryData(
              tab,
              query.queryData[0],
              attribute,
            );
          } else {
            this.populateSingleValueTabFromQueryData(
              tab,
              query.queryData as object,
              attribute,
            );
          }
        }
      }
    }
  }

  private populateSingleValueTabFromQueryData(
    tab: Tab & { query?: Query } & { dataModel: DataModel } & {
      chartData: ChartData[];
      mapObject: MapObject[];
    },
    queryData: object,
    attribute: string,
  ): void {
    const queryDataMap = new Map(Object.entries(queryData));
    const attributeValue = queryDataMap.get(attribute);

    if (!attributeValue) {
      return;
    }

    if (attributeValue.type) {
      if (attributeValue.type === 'Number') {
        tab.chartValues.push(attributeValue.value);
      } else if (attributeValue.type === 'String') {
        tab.textValue = attributeValue.value;
      }
    } else {
      tab.chartValues.push(attributeValue);
    }
  }
}
