/* eslint-disable  @typescript-eslint/no-explicit-any */
import { Injectable } from '@nestjs/common';
import { ChartData, MapObject } from '../data-translation.service';
import { Tab } from '@app/postgres-db/schemas';
import { Query } from '@app/postgres-db/schemas/query.schema';
import { DataModel } from '@app/postgres-db/schemas/data-model.schema';
import { QueryConfig } from '@app/postgres-db/schemas/query-config.schema';
import { DataSource } from '@app/postgres-db/schemas/data-source.schema';
import {
  FiwareAttribute,
  FiwareAttributeData,
  FiwareAttributeEntity,
} from './fiware.types';
import { PopulateMapService } from './populate-map.service';
import { getGermanLabelForAttribute } from './populate.util';
import { DataTranslationRepo } from '../data-translation.repo';
import { parseCleanNumber } from 'apps/internal-data-service/src/helper';

@Injectable()
export class PopulateChartService {
  constructor(
    private readonly dataTranslationRepo: DataTranslationRepo,
    private readonly populateMapService: PopulateMapService,
  ) {}

  async populateTab(
    tab: Tab & { query?: Query } & { dataModel: DataModel } & {
      chartData: ChartData[];
      mapObject: MapObject[];
    },
  ): Promise<void> {
    const query = await this.dataTranslationRepo.getQueryById(tab.queryId);
    if (!query) {
      return;
    }

    const queryConfig = await this.dataTranslationRepo.getQueryConfigById(
      query.queryConfigId,
    );

    if (!queryConfig) {
      return;
    }

    const datasource = await this.dataTranslationRepo.getDatasourceById(
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

      if (query && query.queryData && tab.componentSubType === 'Pie Chart') {
        this.populateTabWithQueryDataArray(
          queryConfig,
          query,
          queryConfig.attributes[0],
          datasource,
          tab,
        );
        return;
      }

      if (query && query.queryData && tab.componentType === 'Karte') {
        if (Array.isArray(query.queryData)) {
          this.populateMapService.populateTabWithMapObjectFromArray(tab, query);
        } else {
          this.populateMapService.populateTabWithMapObjectFromObject(
            tab,
            query,
          );
        }
      } else if (tab.componentType === 'Karte') {
        console.warn(`Map tab ${tab.id} has no query data:`, {
          hasQuery: !!query,
          hasQueryData: !!(query && query.queryData),
          queryId: query?.id,
          tabId: tab.id,
        });
      }

      // Track amount of attributes for labeling
      const isSingleAttribute =
        queryConfig.attributes.filter((attr) => attr !== 'name').length === 1;

      for (const attribute of queryConfig.attributes) {
        if (query && query.queryData) {
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
              isSingleAttribute,
            );
          }
        }
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
          name: queryDataElement['name']?.value || queryDataElement.id,
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
    } else {
      const queryDataElement: any = query.queryData;

      const chartData: ChartData = {
        name: queryDataElement['name']?.value || queryDataElement.id,
        values: [],
      };

      const currentValue = queryDataElement[tab.sliderCurrentAttribute]?.value;
      const maximumValue = queryDataElement[tab.sliderMaximumAttribute]?.value;

      if (currentValue !== undefined && maximumValue !== undefined) {
        chartData.values.push([tab.sliderCurrentAttribute, currentValue]);
        chartData.values.push([tab.sliderMaximumAttribute, maximumValue]);
      }

      tab.chartData.push(chartData);
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
    // Piechart adjustment
    if (tab.componentSubType === 'Pie Chart') {
      if (query) {
        // Handle array case
        if (Array.isArray(query.queryData)) {
          // One Sensor with multiple Attributes
          if (query.queryData.length === 1) {
            const tquery = query.queryData[0] as { [key: string]: any };

            // Get all keys from the query data
            const attributes = Object.keys(tquery).filter(
              (key) =>
                // Filter out common metadata fields - adjust as needed
                !['_id', 'timestamp', 'sensorId'].includes(key),
            );

            // Process each attribute
            attributes.forEach((attr) => {
              let tvalue = tquery[attr];

              tvalue =
                tvalue && typeof tvalue === 'object' && 'value' in tvalue
                  ? tvalue['value']
                  : tvalue;

              if (tvalue !== null && tvalue !== undefined) {
                const label = getGermanLabelForAttribute(attr);
                tab.chartLabels.push(label);
                tab.chartValues.push(tvalue);

                // Add to chartData
                tab.chartData.push({
                  name: label,
                  values: [[attr, tvalue]],
                  color: null,
                });
              }
            });
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
              const sensorLabel = attributes['name']?.value || `${id} ${i}`;
              const label = getGermanLabelForAttribute(sensorLabel);

              tab.chartLabels.push(label);
              tab.chartValues.push(sensorValue);

              // Add to chartData
              tab.chartData.push({
                name: label,
                values: [[queryConfig.attributes[0], sensorValue]],
                color: null,
              });
            });
          }
        }
        // Handle object case
        else if (
          typeof query.queryData === 'object' &&
          query.queryData !== null
        ) {
          const queryData = query.queryData as { [key: string]: any };

          // Check if we have the flat attribute structure first (your case)
          if (queryData.attributes && Array.isArray(queryData.attributes)) {
            // For pie charts with flat attribute structure, process all attributes at once
            // Filter out non-data attributes like 'name'
            const dataAttributes = queryData.attributes.filter(
              (attr) => attr.attrName !== 'name',
            );

            dataAttributes.forEach((attrObj) => {
              if (attrObj.values && attrObj.values.length > 0) {
                // Get the latest value (last element in values array)
                const value = attrObj.values[attrObj.values.length - 1];

                // Use attribute name as label
                const label = getGermanLabelForAttribute(attrObj.attrName);

                tab.chartLabels.push(label);
                tab.chartValues.push(value);

                // Add to chartData
                tab.chartData.push({
                  name: label,
                  values: [[attrObj.attrName, value]],
                  color: null,
                });
              }
            });
          }
          // Check if we have the FIWARE attribute structure
          else if (queryData.attrs && Array.isArray(queryData.attrs)) {
            // Find the attribute we're looking for
            const attrObj = queryData.attrs.find(
              (attr) => attr.attrName === attribute,
            );

            if (attrObj && attrObj.types && attrObj.types.length > 0) {
              // Process entities for this attribute
              attrObj.types.forEach((type) => {
                if (type.entities && Array.isArray(type.entities)) {
                  type.entities.forEach((entity) => {
                    // Get the latest value for this entity (last element in values array)
                    if (entity.values && entity.values.length > 0) {
                      const value = entity.values[entity.values.length - 1];

                      // Use entity ID as label or try to find a name attribute
                      let label = entity.entityId;

                      // Check for name attribute if available
                      const nameAttr = queryData.attrs?.find(
                        (a) => a.attrName === 'name',
                      );
                      if (nameAttr) {
                        const nameEntity = nameAttr.types?.[0]?.entities.find(
                          (e) => e.entityId === entity.entityId,
                        );
                        if (nameEntity?.values?.[0]) {
                          label = nameEntity.values[0].toString();
                        }
                      }

                      const processedLabel = getGermanLabelForAttribute(label);
                      tab.chartLabels.push(processedLabel);
                      tab.chartValues.push(value);

                      // Add to chartData
                      tab.chartData.push({
                        name: processedLabel,
                        values: [[attribute, value]],
                        color: null,
                      });
                    }
                  });
                }
              });
            }
          } else {
            // Fallback to original logic
            let value = queryData[attribute];
            value =
              value && typeof value === 'object' && 'value' in value
                ? value['value']
                : null;

            if (value !== null) {
              const label = getGermanLabelForAttribute(attribute);
              tab.chartLabels.push(label);
              tab.chartValues.push(value);

              // Add to chartData
              tab.chartData.push({
                name: label,
                values: [[attribute, value]],
                color: null,
              });
            }
          }
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
    isSingleAttribute: boolean,
  ): void {
    const queryDataMap = new Map(Object.entries(query.queryData));
    this.populateHistoricTab(
      queryConfig,
      tab,
      queryDataMap,
      attribute,
      isSingleAttribute,
    );
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
    isSingleAttribute: boolean,
  ): void {
    if (queryConfig.entityIds.length === 1) {
      this.populateHistoricTabWithSingleEntityId(tab, queryDataMap);
    } else {
      this.populateHistoricTabWithMultipleEntityIds(
        tab,
        queryDataMap,
        attribute,
        isSingleAttribute,
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

    // Check if entityAttributes is defined and not empty
    if (entityAttributes && entityAttributes.length > 0) {
      // Loop through each attribute in entityAttributes
      entityAttributes.forEach((attr) => {
        const attrName = attr.attrName;

        // Check if an entry for the attribute for the entityId already exists in tab.chartData
        const existingEntry = tab.chartData.find(
          (data) => data.name === `${getGermanLabelForAttribute(attrName)}`,
        );

        if (!existingEntry) {
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
        }
      });
    }
  }

  private populateHistoricTabWithMultipleEntityIds(
    tab: Tab & { query?: Query } & { dataModel: DataModel } & {
      chartData: ChartData[];
      mapObject: MapObject[];
    },
    queryDataMap: Map<string, FiwareAttribute[]>,
    attribute: string,
    isSingleAttribute: boolean,
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
                    ]?.toString() || null;
                }
              }
            }

            if (!sensorName || sensorName === '') {
              const idAttribute = queryDataMap
                .get('attrs')
                ?.find((attr) => attr.attrName === 'id');
              if (idAttribute) {
                const matchingEntity = idAttribute.types.find((t) =>
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
                      ]?.toString() || null;
                  }
                }
              }
            }

            // Fallback to "Sensor ${entityIndex}" if sensorName is still null
            if (!sensorName) {
              sensorName = `Sensor ${entityIndex + 1}`; // Use 1-based index
            }

            this.pushValuesToChartData(
              entity,
              this.utilNameFunction(attribute, sensorName, isSingleAttribute),
              tab,
            );

            // Reset sensorName for the next iteration
            sensorName = null;
          }
        }
      }
    }
  }

  private utilNameFunction(
    labelAttribute: string,
    sensorName: string,
    isSingleAttribute: boolean,
  ): string {
    if (isSingleAttribute) {
      return `${getGermanLabelForAttribute(sensorName)}`;
    } else {
      return `${getGermanLabelForAttribute(sensorName)} | ${getGermanLabelForAttribute(labelAttribute)}`;
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
    // isNan('') === false [0]
    const numberValues = attributeObject.values.map((value: number | string) =>
      value === '' || value === null || isNaN(value as number)
        ? parseCleanNumber(value?.toString())
        : Number(value),
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
      id: attributeObject.entityId,
    });
  }
}
