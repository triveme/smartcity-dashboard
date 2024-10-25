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
import {
  FiwareAttribute,
  FiwareAttributeData,
  FiwareAttributeEntity,
} from './fiware.types';
import { PopulateMapService } from './populate-map.service';
import { getGermanLabelForAttribute } from './populate.util';

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

      if (
        query &&
        query.queryData &&
        tab.componentSubType === 'Slider Übersicht'
      ) {
        this.populateSliderOverview(query, tab);
        return;
      }
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

  private populateSliderOverview(
    query: Query,
    tab: Tab & { chartData: ChartData[] },
  ): void {
    if (Array.isArray(query.queryData)) {
      for (let i = 0; i < query.queryData.length; i++) {
        const queryDataElement = query.queryData[i];

        const chartData: ChartData = {
          name: queryDataElement.id,
          values: [],
        };

        const currentValue =
          queryDataElement[tab.sliderCurrentAttribute]?.value;
        const maximumValue =
          queryDataElement[tab.sliderMaximumAttribute]?.value;

        if (currentValue !== undefined && maximumValue !== undefined) {
          chartData.values.push([tab.sliderCurrentAttribute, currentValue]);
          chartData.values.push([tab.sliderMaximumAttribute, maximumValue]);
        }

        tab.chartData.push(chartData);
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
      if (query && Array.isArray(query.queryData)) {
        // One Sensor with multiple Attributes
        if (query.queryData.length === 1) {
          const tquery = query.queryData[0] as { [key: string]: any };
          let tvalue = tquery[attribute];

          tvalue =
            tvalue && typeof tvalue === 'object' && 'value' in tvalue
              ? tvalue['value']
              : null;

          if (tvalue !== null) {
            tab.chartLabels.push(attribute);
            tab.chartValues.push(tvalue);
          }
        }
        // Multiple Sensors with the same attribute
        else if (query.queryData.length > 1) {
          query.queryData.forEach((queryEntry, i) => {
            const { id, ...attributes } = queryEntry as {
              id: string;
              [key: string]: any;
            };

            const sensorValue =
              attributes[queryConfig.attributes[0]]?.value || 0;
            const sensorLabel = `Sensor ${id?.slice(-4) || i}`;

            tab.chartLabels.push(sensorLabel);
            tab.chartValues.push(sensorValue);
          });
        }
      }
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

        chartDataItem.values.push([timestamp, +attributeValue]);
      });
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
      this.populateHistoricTabWithSingleEntityId(tab, queryDataMap);
    } else {
      this.populateHistoricTabWithMultipleEntityIds(
        tab,
        queryDataMap,
        attribute,
      );
    }
  }

  private populateHistoricTabWithSingleEntityId(
    tab: Tab & { query?: Query } & { dataModel: DataModel } & {
      chartData: ChartData[];
      mapObject: MapObject[];
    },
    queryDataMap: Map<string, any>,
  ): void {
    const entityAttributes = queryDataMap.get('attributes');
    const entityId: string = queryDataMap.get('entityId');
    const index: string[] = queryDataMap.get('index');

    // Loop through each attribute in entityAttributes
    entityAttributes.forEach((attr) => {
      const attrName = attr.attrName;

      // Create FiwareAttributeEntity for the current attribute
      const attributeObject: FiwareAttributeEntity = {
        entityId: entityId,
        index: index,
        values: attr.values, // Use the values specific to this attribute
      };

      // Push values to chart data
      this.pushValuesToChartData(
        attributeObject,
        `${getGermanLabelForAttribute(attrName)}`,
        tab,
      );
    });
  }

  private populateHistoricTabWithMultipleEntityIds(
    tab: Tab & { query?: Query } & { dataModel: DataModel } & {
      chartData: ChartData[];
      mapObject: MapObject[];
    },
    queryDataMap: Map<string, FiwareAttribute[]>,
    attribute: string,
  ): void {
    let sensorName: string = null;
    if (attribute === 'name') return; // Skip if the attribute itself is "name"

    let attributes: FiwareAttribute[] = queryDataMap.get('attrs');
    if (attributes) {
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

            // Logik to set sensor name if sensorattribute "name" is available
            const nameAttribute = queryDataMap
              .get('attrs')
              ?.find((attr) => attr.attrName === 'name');
            if (nameAttribute) {
              const matchingEntity = nameAttribute.types.find((t) =>
                t.entities.some((e) => e.entityId === entity.entityId),
              );

              if (matchingEntity) {
                const matchingEntityData = matchingEntity.entities.find(
                  (e) => e.entityId === entity.entityId,
                );
                if (
                  matchingEntityData &&
                  matchingEntityData.values &&
                  matchingEntityData.values.length > 0
                ) {
                  sensorName =
                    matchingEntityData.values[
                      matchingEntityData.values.length - 1
                    ].toString();
                }
              }
            }

            // Fallback to "Sensor ${entityIndex}" if sensorName is still null
            if (!sensorName) {
              sensorName = `Sensor ${entityIndex + 1}`; // Use 1-based index
            }

            this.pushValuesToChartData(
              entity,
              `${sensorName} | ${getGermanLabelForAttribute(attribute)}`,
              tab,
            );

            // Reset sensorName for the next iteration
            sensorName = null;
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

  private pushValuesToChartData(
    attributeObject: FiwareAttributeEntity,
    chartDataName: string,
    tab: Tab & { query?: Query } & { dataModel: DataModel } & {
      chartData: ChartData[];
      mapObject: MapObject[];
    },
  ): void {
    const numberValues = attributeObject.values.map((value) =>
      isNaN(value) ? 0.0 : Number(value),
    );
    const timeValues = attributeObject.index.map((timevalue) => timevalue);

    const resultArray: [string, number][] = [];
    for (let i = 0; i < timeValues.length; i++) {
      resultArray.push([timeValues[i], numberValues[i]]);
    }

    tab.chartData.push({
      name: chartDataName,
      values: resultArray,
      color: null,
    });
  }
}
