/* eslint-disable  @typescript-eslint/no-explicit-any */
import { Injectable } from '@nestjs/common';
import { ChartData, MapObject } from '../dashboard.service';
import { Tab } from '@app/postgres-db/schemas';
import { Query } from '@app/postgres-db/schemas/query.schema';
import { DataModel } from '@app/postgres-db/schemas/data-model.schema';
import { QueryService } from '../../query/query.service';
import { QueryConfigService } from '../../query-config/query-config.service';
import { DataSourceService } from '../../data-source/data-source.service';
import { QueryConfig } from '@app/postgres-db/schemas/query-config.schema';
import { DataSource } from '@app/postgres-db/schemas/data-source.schema';
import { FiwareAttribute, FiwareAttributeData } from './fiware.types';
import { PopulateMapService } from './populate-map.service';

@Injectable()
export class PopulateChartService {
  constructor(
    private readonly queryService: QueryService,
    private readonly queryConfigService: QueryConfigService,
    private readonly dataSourceService: DataSourceService,
    private readonly populateMapService: PopulateMapService,
  ) {}

  async populateTab(
    tab: Tab & { query?: Query } & { dataModel: DataModel } & {
      chartData: ChartData[];
      mapObject: MapObject[];
    },
  ): Promise<void> {
    const query = await this.queryService.getById(tab.queryId);
    const queryConfig = await this.queryConfigService.getById(
      query.queryConfigId,
    );
    const datasource = await this.dataSourceService.getById(
      queryConfig.dataSourceId,
    );

    if (queryConfig.attributes && queryConfig.attributes.length > 0) {
      tab.chartValues = [];
      tab.chartData = [];
      tab.chartLabels = [];

      for (const attribute of queryConfig.attributes) {
        if (query && query.queryData && tab.componentType !== 'Karte') {
          if (Array.isArray(query.queryData)) {
            this.populateTabWithQueryDataArray(
              queryConfig,
              query,
              attribute,
              datasource,
              tab,
            );
          } else {
            this.populateTabWithQueryDataObject(
              query,
              attribute,
              queryConfig,
              tab,
            );
          }
        } else {
          if (Array.isArray(query.queryData)) {
            this.populateMapService.populateTabWithMapObjectFromArray(
              tab,
              query,
            );
          } else {
            this.populateMapService.populateTabWithMapObjectFromObject(
              tab,
              query,
            );
          }
        }
      }
    } else {
      if (query && query.queryData && tab.componentType === 'Karte') {
        this.populateMapService.populateTabWithMapObjectFromObject(tab, query);
      }
    }
  }

  private populateTabWithQueryDataArray(
    queryConfig: QueryConfig,
    query: Query,
    attribute: string,
    datasource: DataSource,
    tab: Tab & { query?: Query } & { dataModel: DataModel } & {
      chartData: ChartData[];
      mapObject: MapObject[];
    },
  ): void {
    const sensorDataMap = this.buildSensorDataMap(query);

    this.buildChartDataArray(
      queryConfig,
      sensorDataMap,
      attribute,
      datasource,
      tab,
    );

    // Piechart adjustment
    if (tab.componentSubType === 'Pie Chart') {
      const tquery = query.queryData[0];
      const tvalue = tquery[attribute];

      tab.chartLabels.push(attribute);
      tab.chartValues.push(tvalue);
    }
  }

  private populateTabWithQueryDataObject(
    query: Query,
    attribute: string,
    queryConfig: QueryConfig,
    tab: Tab & { query?: Query } & { dataModel: DataModel } & {
      chartData: ChartData[];
      mapObject: MapObject[];
    },
  ): void {
    const queryDataMap = new Map(Object.entries(query.queryData));

    this.populateHistoricTab(queryConfig, tab, queryDataMap, attribute);
  }

  private buildChartDataArray(
    queryConfig: QueryConfig,
    sensorDataMap: Map<string, Array<object>>,
    attribute: string,
    datasource: DataSource,
    tab: Tab & { query?: Query } & { dataModel: DataModel } & {
      chartData: ChartData[];
      mapObject: MapObject[];
    },
  ): void {
    const chartDataMap = new Map<
      string,
      { values: number[]; timestamps: string[] }
    >();

    sensorDataMap.forEach((value, key) => {
      const chartDataItem: ChartData = {
        name: key,
        values: [],
        color: null,
      };

      if (!chartDataMap.has(key)) {
        chartDataMap.set(key, { values: [], timestamps: [] });
      }

      value.sort((a, b) => {
        if (a['timestamp'] == null && b['timestamp'] == null) {
          return 0;
        } else if (a['timestamp'] == null) {
          return 1;
        } else if (b['timestamp'] == null) {
          return -1;
        } else {
          return (
            new Date(a['timestamp']).getTime() -
            new Date(b['timestamp']).getTime()
          );
        }
      });
      value.forEach((queryDataItem) => {
        const attributeValue = queryDataItem[attribute] as FiwareAttributeData;
        const timestamp = queryDataItem['timestamp'];

        if (timestamp) {
          chartDataMap
            .get(key)
            .timestamps.push(this.formatDateLabel(timestamp, queryConfig));
        }

        if (datasource.origin === 'ngsi') {
          if (attributeValue && attributeValue.type == 'Number') {
            chartDataMap.get(key).values.push(+attributeValue.value);
          } else if (attributeValue) {
            tab.textValue = attributeValue.value;
          }
        } else {
          chartDataMap.get(key).values.push(+attributeValue);
        }
      });

      chartDataItem.values = chartDataMap.get(key).values;
      tab.chartData.push(chartDataItem);
    });

    if (chartDataMap.size > 0) {
      tab.chartLabels = Array.from(chartDataMap.values())[0].timestamps;
    }
  }

  private populateHistoricTab(
    queryConfig: QueryConfig,
    tab: Tab & { query?: Query } & { dataModel: DataModel } & {
      chartData: ChartData[];
      mapObject: MapObject[];
    },
    queryDataMap: Map<string, any>,
    attribute: string,
  ): void {
    if (queryConfig.entityIds.length === 1) {
      this.populateHistoricTabWithSingleEntityId(tab, queryDataMap, attribute);

      const timestamps: string[] = queryDataMap.get('index');

      tab.chartLabels = timestamps.map((timestamp) =>
        this.formatDateLabel(timestamp, queryConfig),
      );
    } else {
      this.populateHistoricTabWithMultipleEntityIds(
        tab,
        queryDataMap,
        attribute,
        queryConfig,
      );
    }
  }

  private populateHistoricTabWithSingleEntityId(
    tab: Tab & { query?: Query } & { dataModel: DataModel } & {
      chartData: ChartData[];
      mapObject: MapObject[];
    },
    queryDataMap: Map<string, any>,
    attribute: string,
  ): void {
    const attributes = queryDataMap.get('attributes');
    const attributeObject = attributes.filter(
      (attributeListObject) => attributeListObject.attrName === attribute,
    )[0];

    if (attributeObject && attributeObject.values) {
      this.pushValuesToChartData(attributeObject, tab.id, tab);
    }
  }

  private populateHistoricTabWithMultipleEntityIds(
    tab: Tab & { query?: Query } & { dataModel: DataModel } & {
      chartData: ChartData[];
      mapObject: MapObject[];
    },
    queryDataMap: Map<string, FiwareAttribute[]>,
    attribute: string,
    queryConfig: QueryConfig,
  ): void {
    let attributes: FiwareAttribute[] = queryDataMap.get('attrs');
    attributes = attributes.filter(
      (attributeListObject) => attributeListObject.attrName === attribute,
    );
    const attributeObject = attributes[0];

    if (attributeObject) {
      for (const type of attributeObject.types) {
        const entities = type.entities;

        for (
          let entityIndex = 0;
          entityIndex < entities.length;
          entityIndex++
        ) {
          const entity = entities[entityIndex];

          this.pushValuesToChartData(
            entity,
            `${entity.entityId} | ${attribute}`,
            tab,
          );

          if (entityIndex === entities.length - 1) {
            tab.chartLabels = entity.index.map((timestamp) =>
              this.formatDateLabel(timestamp, queryConfig),
            );
          }
        }
      }
    }
  }

  private buildSensorDataMap(query: Query): Map<string, object[]> {
    const sensorDataMap = new Map<string, object[]>();

    if (Array.isArray(query.queryData)) {
      for (const dataItem of query.queryData) {
        if (dataItem) {
          const sensorKey = dataItem.id;

          if (!sensorDataMap.get(sensorKey)) {
            sensorDataMap.set(sensorKey, []);
          }

          sensorDataMap.get(sensorKey).push(dataItem);
        }
      }
    }

    return sensorDataMap;
  }

  private formatDateLabel(timestamp: string, queryConfig: QueryConfig): string {
    const date = new Date(timestamp);
    if (queryConfig.timeframe === 'day') {
      // Format label for every hour
      return date.toLocaleTimeString('de-DE', {
        hour: '2-digit',
        minute: '2-digit',
      });
    } else {
      // Format label for the date
      return date.toLocaleDateString('de-DE', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
      });
    }
  }

  private pushValuesToChartData(
    attributeObject,
    chartDataName: string,
    tab: Tab & { query?: Query } & { dataModel: DataModel } & {
      chartData: ChartData[];
      mapObject: MapObject[];
    },
  ): void {
    const numberValues = attributeObject.values.map((value) =>
      isNaN(value) ? 0.0 : Number(value),
    );

    tab.chartData.push({
      name: chartDataName,
      values: numberValues,
      color: null,
    });
  }
}
