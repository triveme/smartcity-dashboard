/* eslint-disable  @typescript-eslint/no-explicit-any */
import { Injectable } from '@nestjs/common';
import {
  ChartData,
  MapObject,
  WeatherWarningData,
} from '../data-translation.service';
import { Tab } from '@app/postgres-db/schemas';
import { Query } from '@app/postgres-db/schemas/query.schema';
import { DataModel } from '@app/postgres-db/schemas/data-model.schema';
import { DataTranslationRepo } from '../data-translation.repo';
import { FiwareAttribute } from './fiware.types';
import { RoundingService } from '../transformation/rounding.service';

type ResolvedSingleValue = {
  chartValues: number[];
  textValue?: string;
};

@Injectable()
export class PopulateValueService {
  constructor(
    private readonly dataTranslationRepo: DataTranslationRepo,
    private readonly roundingService: RoundingService,
  ) {}

  async populateTab(
    tab: Tab & { query?: Query } & { dataModel: DataModel } & {
      chartData: ChartData[];
      mapObject: MapObject[];
      weatherWarnings: WeatherWarningData[];
    },
    usesQueryParameter: boolean = false,
  ): Promise<void> {
    if (tab.componentType === 'Bild') {
      await this.populateImageTab(tab);
    } else if (tab.componentType === 'Wetterwarnungen') {
      await this.populateWeatherWarnings(tab);
    } else if (usesQueryParameter === false) {
      await this.populateSingleValueTab(tab);
    } else {
      await this.populateSingleValueTabForMultiEntity(tab);
    }
  }

  private async populateImageTab(
    tab: Tab & { query?: Query } & { dataModel: DataModel } & {
      chartData: ChartData[];
    } & { mapObject: MapObject[] },
  ): Promise<void> {
    const query = await this.dataTranslationRepo.getQueryById(tab.queryId);

    if (query !== undefined) {
      if (query.queryData) {
        const queryDataMap: Map<string, string> = new Map(
          Object.entries(query.queryData),
        );

        tab.imageSrc = queryDataMap.get('imageData');
      }
    }
  }

  private async populateWeatherWarnings(
    tab: Tab & { query?: Query } & { dataModel: DataModel } & {
      chartData: ChartData[];
      mapObject: MapObject[];
      weatherWarnings: WeatherWarningData[];
    },
  ): Promise<void> {
    tab.weatherWarnings = [];

    try {
      const query = await this.dataTranslationRepo.getQueryById(tab.queryId);

      if (!query) {
        return;
      }

      const queryData = query.queryData as any[];

      if (Array.isArray(queryData) && queryData.length > 0) {
        for (const data of queryData) {
          const weatherWarning: WeatherWarningData = {
            category: data.category.value,
            subCategory: data.subCategory.value,
            alertDescription: data.alertDescription.value,
            instructions: data.instruction.value,
            severity: data.severity.value,
            validFrom: data.validFrom.value,
            validTo: data.validTo.value,
          };
          tab.weatherWarnings.push(weatherWarning);
        }
      }
    } catch (error) {
      console.error('Error in populateWeatherWarnings', error);
    }
  }

  private async populateSingleValueTab(
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

    if (queryConfig.attributes && queryConfig.attributes.length > 0) {
      tab.chartValues = [];
      tab.chartData = [];
      tab.chartLabels = [];

      for (const attribute of queryConfig.attributes) {
        if (query && query.queryData) {
          if (Array.isArray(query.queryData)) {
            const target = this.getLatestMatchingQueryDataEntry(
              query.queryData as Record<string, any>[],
              attribute,
              queryConfig.entityIds?.[0],
            );
            if (!target) {
              continue;
            }
            this.populateSingleValueTabFromQueryData(
              tab,
              target,
              attribute,
              queryConfig.roundingMode,
              queryConfig.roundingTarget,
            );
          } else {
            this.populateSingleValueTabFromQueryData(
              tab,
              query.queryData as object,
              attribute,
              queryConfig.roundingMode,
              queryConfig.roundingTarget,
            );
          }
        }
      }
    }
  }

  private async populateSingleValueTabForMultiEntity(
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

    if (queryConfig.attributes && queryConfig.attributes.length > 0) {
      tab.chartValues = [];
      tab.chartData = [];
      tab.chartLabels = [];

      // INPUT
      // [
      //   {
      //     id: 'urn:ngsi-ld:AirQualityObserved:sentiumfebr-7342',
      //     type: 'AirQualityObserved',
      //     co2: {
      //       type: 'Property',
      //       value: 1543,
      //       observedAt: '2025-12-04T09:38:31.841Z'
      //     }
      //   }
      // ]
      // OUTPUT
      // [
      //   {
      //     "name": "co2",
      //     "id": "urn:ngsi-ld:AirQualityObserved:sentiumfebr-7342",
      //     "color": null,
      //     "values": [1543]
      //   }
      // ]
      if (query && query.queryData) {
        if (Array.isArray(query.queryData)) {
          for (const entityId of queryConfig.entityIds) {
            for (const attribute of queryConfig.attributes) {
              const target = this.getLatestMatchingQueryDataEntry(
                query.queryData as Record<string, any>[],
                attribute,
                entityId,
              );
              if (!target) {
                continue;
              }
              this.populateSingleValueTabFromQueryDataUrlParam(
                tab,
                target,
                entityId,
                attribute,
                queryConfig.roundingMode,
                queryConfig.roundingTarget,
              );
            }
          }
        }
      }

      // for(const attribute of queryConfig.attributes){
      //   if(query && query.queryData){
      //     if(Array.isArray(query.queryData)){

      //     }
      //   }
      // }
      // for (const attribute of queryConfig.attributes) {
      //   if (query && query.queryData) {
      //     // ToDo: Change persisting of queryData to be ALWAYS an array
      //     if (Array.isArray(query.queryData) && query.queryData[0]) {
      //       this.populateSingleValueTabFromQueryData(
      //         tab,
      //         query.queryData[0],
      //         attribute,
      //         queryConfig.roundingMode,
      //         queryConfig.roundingTarget,
      //       );
      //     } else {
      //       this.populateSingleValueTabFromQueryData(
      //         tab,
      //         query.queryData as object,
      //         attribute,
      //         queryConfig.roundingMode,
      //         queryConfig.roundingTarget,
      //       );
      //     }
      //   }
      // }
    }
  }

  private getLatestMatchingQueryDataEntry(
    queryData: Record<string, any>[],
    attribute: string,
    entityId?: string,
  ): Record<string, any> | undefined {
    const entityCandidates = queryData.filter(
      (entry) =>
        this.matchesEntityId(entry, entityId) &&
        entry?.[attribute] !== undefined,
    );
    const candidates =
      entityCandidates.length > 0
        ? entityCandidates
        : queryData.filter((entry) => entry?.[attribute] !== undefined);

    if (candidates.length === 0) {
      return undefined;
    }

    let latestEntry = candidates[0];
    let latestTimestamp = this.getEntryTimestamp(latestEntry, attribute);

    for (let i = 1; i < candidates.length; i++) {
      const currentEntry = candidates[i];
      const currentTimestamp = this.getEntryTimestamp(currentEntry, attribute);

      if (currentTimestamp !== null && latestTimestamp !== null) {
        if (currentTimestamp >= latestTimestamp) {
          latestEntry = currentEntry;
          latestTimestamp = currentTimestamp;
        }
      } else if (currentTimestamp !== null && latestTimestamp === null) {
        latestEntry = currentEntry;
        latestTimestamp = currentTimestamp;
      } else if (currentTimestamp === null && latestTimestamp === null) {
        // Prefer the later array entry when no timestamp is available.
        latestEntry = currentEntry;
      }
    }

    return latestEntry;
  }

  private matchesEntityId(
    entry: Record<string, any>,
    entityId?: string,
  ): boolean {
    if (!entityId) {
      return true;
    }

    return entry.id === entityId || entry.entityId === entityId;
  }

  private getEntryTimestamp(
    entry: Record<string, any>,
    attribute: string,
  ): number | null {
    const rawValue = entry?.[attribute];
    const timestamp =
      typeof entry.timestamp === 'string'
        ? entry.timestamp
        : typeof entry.observedAt === 'string'
          ? entry.observedAt
          : typeof rawValue?.observedAt === 'string'
            ? rawValue.observedAt
            : typeof rawValue?.metadata?.timestamp?.value === 'string'
              ? rawValue.metadata.timestamp.value
              : null;

    if (!timestamp) {
      return null;
    }

    const parsedTimestamp = new Date(timestamp).getTime();
    return Number.isNaN(parsedTimestamp) ? null : parsedTimestamp;
  }

  private populateSingleValueTabFromQueryData(
    tab: Tab & { query?: Query } & { dataModel: DataModel } & {
      chartData: ChartData[];
      mapObject: MapObject[];
    },
    queryData: object,
    attribute: string,
    roundingMode: string,
    roundingTarget: number,
  ): void {
    // Orchideo Data Structure
    if (
      'entityId' in queryData &&
      'attributes' in queryData &&
      'index' in queryData
    ) {
      const latestValue = this.getLatestOrchideoAttributeValue(
        queryData as {
          attributes: Array<{
            attrName: string;
            values: any[];
          }>;
        },
        attribute,
      );

      if (latestValue !== undefined) {
        this.applyResolvedSingleValue(
          tab,
          this.resolveOrchideoLatestValue(latestValue),
        );
      } else {
        console.warn('No Data found for attribute:', attribute);
      }
    } else if ('attrs' in queryData) {
      const latestValue = this.getLatestFiwareAttributeValue(
        queryData as { attrs?: FiwareAttribute[] },
        attribute,
      );
      if (latestValue !== undefined) {
        tab.textValue = String(latestValue);
      } else {
        const queryDataMap: Map<string, FiwareAttribute[]> = new Map(
          Object.entries(queryData),
        ) as Map<string, FiwareAttribute[]>;
        const attributes: FiwareAttribute[] = queryDataMap.get('attrs');
        if (!attributes) {
          console.warn('No attributes');
        } else {
          console.warn('No Data found for attribute:', attribute);
        }
      }
    } else {
      // NGSI Data Structure
      const queryDataMap = new Map(Object.entries(queryData));
      const attributeValue = queryDataMap.get(attribute);

      if (!attributeValue) {
        console.warn('No Data found for attribute:', attribute);
        return;
      }

      this.applyResolvedSingleValue(
        tab,
        this.resolveNgsiAttributeValue(attributeValue),
      );
    }

    this.postProcessData(tab.chartValues, roundingMode, roundingTarget);
  }

  private populateSingleValueTabFromQueryDataUrlParam(
    tab: Tab & { query?: Query } & { dataModel: DataModel } & {
      chartData: ChartData[];
      mapObject: MapObject[];
    },
    queryData: object,
    entityId: string,
    attribute: string,
    roundingMode: string,
    roundingTarget: number,
  ): void {
    const resolvedValue = this.resolveSingleValueFromQueryData(
      queryData,
      attribute,
    );

    if (!resolvedValue) {
      return;
    }

    const value = this.getUrlParamSingleValue(
      resolvedValue,
      roundingMode,
      roundingTarget,
    );

    if (value === undefined) {
      return;
    }

    const newData: ChartData = {
      id: entityId,
      name: attribute,
      values: [value] as any,
    };
    tab.chartData.push(newData);
  }

  private resolveSingleValueFromQueryData(
    queryData: object,
    attribute: string,
  ): ResolvedSingleValue | undefined {
    if (
      'entityId' in queryData &&
      'attributes' in queryData &&
      'index' in queryData
    ) {
      const latestValue = this.getLatestOrchideoAttributeValue(
        queryData as {
          attributes: Array<{
            attrName: string;
            values: any[];
          }>;
        },
        attribute,
      );

      if (latestValue === undefined) {
        console.warn('No Data found for attribute:', attribute);
        return undefined;
      }

      return this.resolveOrchideoLatestValue(latestValue);
    }

    if ('attrs' in queryData) {
      const latestValue = this.getLatestFiwareAttributeValue(
        queryData as { attrs?: FiwareAttribute[] },
        attribute,
      );

      if (latestValue === undefined) {
        const queryDataMap: Map<string, FiwareAttribute[]> = new Map(
          Object.entries(queryData),
        ) as Map<string, FiwareAttribute[]>;
        const attributes: FiwareAttribute[] = queryDataMap.get('attrs');

        if (!attributes) {
          console.warn('No attributes');
        } else {
          console.warn('No Data found for attribute:', attribute);
        }

        return undefined;
      }

      return this.resolveFiwareAttributeValue(latestValue);
    }

    const queryDataMap = new Map(Object.entries(queryData));
    const attributeValue = queryDataMap.get(attribute);

    if (!attributeValue) {
      console.warn('No Data found for attribute:', attribute);
      return undefined;
    }

    return this.resolveNgsiAttributeValue(attributeValue);
  }

  private getLatestOrchideoAttributeValue(
    queryData: {
      attributes: Array<{
        attrName: string;
        values: any[];
      }>;
    },
    attribute: string,
  ): any {
    const matchingAttribute = queryData.attributes.find(
      (attr) => attr.attrName === attribute,
    );

    if (!matchingAttribute || matchingAttribute.values.length === 0) {
      return undefined;
    }

    return matchingAttribute.values[matchingAttribute.values.length - 1];
  }

  private resolveOrchideoLatestValue(latestValue: any): ResolvedSingleValue {
    if (typeof latestValue === 'number') {
      return { chartValues: [latestValue] };
    }

    if (typeof latestValue === 'string' || typeof latestValue === 'boolean') {
      const textValue = String(latestValue);
      const numValue = parseFloat(latestValue as string);

      return {
        chartValues: !isNaN(numValue) ? [numValue] : [],
        textValue,
      };
    }

    if (latestValue !== null && typeof latestValue === 'object') {
      if ('value' in latestValue) {
        if (typeof latestValue.value === 'number') {
          return { chartValues: [latestValue.value] };
        }

        return {
          chartValues: [],
          textValue: String(latestValue.value),
        };
      }
    }

    return { chartValues: [] };
  }

  private getLatestFiwareAttributeValue(
    queryData: { attrs?: FiwareAttribute[] },
    attribute: string,
  ): unknown {
    if (!queryData.attrs) {
      return undefined;
    }

    const matchingAttribute = queryData.attrs.find(
      (attributeObject) => attributeObject.attrName === attribute,
    );

    if (!matchingAttribute) {
      return undefined;
    }

    let latestValue: unknown = undefined;

    for (const type of matchingAttribute.types) {
      for (const entity of type.entities) {
        if (entity.values && entity.values.length > 0) {
          latestValue = entity.values[entity.values.length - 1];
        }
      }
    }

    return latestValue;
  }

  private resolveFiwareAttributeValue(
    latestValue: unknown,
  ): ResolvedSingleValue {
    return {
      chartValues: [],
      textValue: String(latestValue),
    };
  }

  private resolveNgsiAttributeValue(attributeValue: any): ResolvedSingleValue {
    if (attributeValue.type) {
      if (
        attributeValue.type === 'Number' ||
        attributeValue.type === 'number'
      ) {
        return { chartValues: [attributeValue.value] };
      }

      if (
        attributeValue.type === 'Text' ||
        attributeValue.type === 'text' ||
        attributeValue.type === 'DateTime' ||
        attributeValue.type === 'datetime'
      ) {
        return {
          chartValues: [],
          textValue: attributeValue.value,
        };
      }

      if (attributeValue.type === 'Property') {
        // NGSI-LD
        return {
          chartValues: [attributeValue.value],
          textValue: attributeValue.value,
        };
      }
    }

    return { chartValues: [attributeValue] };
  }

  private applyResolvedSingleValue(
    tab: Tab & { chartValues?: number[]; textValue?: string },
    resolvedValue: ResolvedSingleValue,
  ): void {
    if (resolvedValue.textValue !== undefined) {
      tab.textValue = resolvedValue.textValue;
    }

    if (resolvedValue.chartValues.length > 0) {
      tab.chartValues.push(...resolvedValue.chartValues);
    }
  }

  private getUrlParamSingleValue(
    resolvedValue: ResolvedSingleValue,
    roundingMode: string,
    roundingTarget: number,
  ): number | string | undefined {
    const chartValues = [...resolvedValue.chartValues];
    this.postProcessData(chartValues, roundingMode, roundingTarget);

    if (chartValues.length > 0) {
      return chartValues[0];
    }

    return resolvedValue.textValue;
  }

  private postProcessData(
    chartValues: number[],
    roundingMode: string,
    roundingTarget: number,
  ): void {
    if (!roundingMode) return;

    chartValues.forEach((value, index) => {
      const roundedValue = this.roundingService.round(
        value,
        roundingTarget,
        this.roundingService.parseRoundingMode(roundingMode),
      );
      chartValues[index] = roundedValue;
    });
  }
}
