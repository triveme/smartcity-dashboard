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
  ): Promise<void> {
    if (tab.componentType === 'Bild') {
      await this.populateImageTab(tab);
    } else if (tab.componentType === 'Wetterwarnungen') {
      await this.populateWeatherWarnings(tab);
    } else {
      await this.populateSingleValueTab(tab);
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
          // ToDo: Change persisting of queryData to be ALWAYS an array
          if (Array.isArray(query.queryData) && query.queryData[0]) {
            this.populateSingleValueTabFromQueryData(
              tab,
              query.queryData[0],
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
      const attributes = queryData['attributes'] as Array<{
        attrName: string;
        values: any[];
      }>;

      const matchingAttribute = attributes.find(
        (attr) => attr.attrName === attribute,
      );

      if (matchingAttribute) {
        const latestValue =
          matchingAttribute.values[matchingAttribute.values.length - 1];

        if (typeof latestValue === 'number') {
          tab.chartValues.push(latestValue);
        } else if (
          typeof latestValue === 'string' ||
          typeof latestValue === 'boolean'
        ) {
          tab.textValue = String(latestValue);

          const numValue = parseFloat(latestValue as string);
          if (!isNaN(numValue)) {
            tab.chartValues.push(numValue);
          }
        } else if (latestValue !== null && typeof latestValue === 'object') {
          if ('value' in latestValue) {
            if (typeof latestValue.value === 'number') {
              tab.chartValues.push(latestValue.value);
            } else {
              tab.textValue = String(latestValue.value);
            }
          }
        }
      } else {
        console.warn('No Data found for attribute:', attribute);
      }
    } else if ('attrs' in queryData) {
      const queryDataMap: Map<string, FiwareAttribute[]> = new Map(
        Object.entries(queryData),
      ) as Map<string, FiwareAttribute[]>;
      const attributes: FiwareAttribute[] = queryDataMap.get('attrs');
      if (attributes) {
        const matchingAttribute = attributes.find(
          (attributeObject) => attributeObject.attrName === attribute,
        );
        if (matchingAttribute) {
          for (const type of matchingAttribute.types) {
            const entities = type.entities;
            for (
              let entityIndex = 0;
              entityIndex < entities.length;
              entityIndex++
            ) {
              const entity = entities[entityIndex];
              if (entity.values && entity.values.length > 0) {
                tab.textValue = String(entity.values[entity.values.length - 1]);
              }
            }
          }
        } else {
          console.warn('No Data found for attribute:', attribute);
        }
      } else {
        console.warn('No attributes');
      }
    } else {
      // NGSI Data Structure
      const queryDataMap = new Map(Object.entries(queryData));
      const attributeValue = queryDataMap.get(attribute);

      if (!attributeValue) {
        console.warn('No Data found for attribute:', attribute);
        return;
      }

      if (attributeValue.type) {
        if (
          attributeValue.type === 'Number' ||
          attributeValue.type === 'number'
        ) {
          tab.chartValues.push(attributeValue.value);
        } else if (
          attributeValue.type === 'Text' ||
          attributeValue.type === 'text' ||
          attributeValue.type === 'DateTime' ||
          attributeValue.type === 'datetime'
        ) {
          tab.textValue = attributeValue.value;
        } else if (attributeValue.type === 'Property') {
          // NGSI-LD
          tab.textValue = attributeValue.value;
          tab.chartValues.push(attributeValue.value);
        }
      } else {
        tab.chartValues.push(attributeValue);
      }
    }

    this.postProcessData(tab.chartValues, roundingMode, roundingTarget);
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
