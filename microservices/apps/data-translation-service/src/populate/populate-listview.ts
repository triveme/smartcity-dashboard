/* eslint-disable  @typescript-eslint/no-explicit-any */
import { Injectable } from '@nestjs/common';
import {
  ChartData,
  MapObject,
  WeatherWarningData,
  InterestingPlace,
} from '../data-translation.service';
import { Tab } from '@app/postgres-db/schemas';
import { Query } from '@app/postgres-db/schemas/query.schema';
import { DataModel } from '@app/postgres-db/schemas/data-model.schema';
import { DataTranslationRepo } from '../data-translation.repo';

@Injectable()
export class PopulateListviewService {
  constructor(private readonly dataTranslationRepo: DataTranslationRepo) {}

  async populateListview(
    tab: Tab & { query?: Query } & { dataModel: DataModel } & {
      chartData: ChartData[];
      mapObject: MapObject[];
      weatherWarnings: WeatherWarningData[];
      listviewData: InterestingPlace[];
    },
  ): Promise<void> {
    if (!tab.queryId) {
      console.warn('No queryId found for listview tab:', tab.id);
      return;
    }

    try {
      // Fetch query data
      const query = await this.dataTranslationRepo.getQueryById(tab.queryId);
      if (!query || !query.queryData) {
        console.warn('No query data found for listview tab:', tab.id);
        return;
      }

      // Get query config to understand the data structure
      const queryConfig = await this.dataTranslationRepo.getQueryConfigById(
        query.queryConfigId,
      );
      if (!queryConfig) {
        console.warn('No query config found for listview tab:', tab.id);
        return;
      }

      // Parse FIWARE data and transform to InterestingPlace format
      const fiwareData = Array.isArray(query.queryData)
        ? query.queryData
        : [query.queryData];

      const listviewData: InterestingPlace[] = fiwareData
        .map((entity: any) => {
          return this.transformEntityToInterestingPlace(entity, tab);
        })
        .filter(Boolean); // Remove null/undefined entries

      // Store the processed data in the tab
      tab.listviewData = listviewData;
    } catch (error) {
      console.error('Error populating listview data:', error);
      tab.listviewData = [];
    }
  }

  private transformEntityToInterestingPlace(
    entity: any,
    tab: Tab,
  ): InterestingPlace | null {
    if (!entity) return null;

    try {
      // Detect NGSI format and use appropriate extraction methods
      const isNGSILD = this.isNGSILDEntity(entity);

      // Extract location first as it's required
      const location = isNGSILD
        ? this.extractLocationNGSILD(entity)
        : this.extractLocation(entity);
      if (!location) {
        console.warn('No location found for entity:', entity.id);
        return null;
      }

      // Extract name - always required, use entity.id as final fallback
      const name = tab.listviewNameAttribute
        ? (isNGSILD
            ? this.extractAttributeNGSILD(entity, [tab.listviewNameAttribute])
            : this.extractAttribute(entity, [tab.listviewNameAttribute])) ||
          entity.id ||
          'Unknown'
        : entity.id || 'Unknown'; // Extract address - only if configured
      const address = tab.listviewAddressAttribute
        ? (isNGSILD
            ? this.extractAddressWithCustomLogicNGSILD(
                entity,
                tab.listviewAddressAttribute,
              )
            : this.extractAddressWithCustomLogic(
                entity,
                tab.listviewAddressAttribute,
              )) || ''
        : '';

      // Extract categories/types - only if configured
      const types = tab.listviewCategoryAttribute
        ? isNGSILD
          ? this.extractTypesFromAttributeNGSILD(
              entity,
              tab.listviewCategoryAttribute,
            )
          : this.extractTypesFromAttribute(
              entity,
              tab.listviewCategoryAttribute,
            )
        : [];

      // Extract image - only if configured
      const image = tab.listviewImageAttribute
        ? (isNGSILD
            ? this.extractAttributeNGSILD(entity, [tab.listviewImageAttribute])
            : this.extractAttribute(entity, [tab.listviewImageAttribute])) || ''
        : '';
      const imagePreview = image;

      // Extract contact/creator - only if configured
      const creator = tab.listviewContactAttribute
        ? (isNGSILD
            ? this.extractAttributeNGSILD(entity, [
                tab.listviewContactAttribute,
              ])
            : this.extractAttribute(entity, [tab.listviewContactAttribute])) ||
          ''
        : '';

      // Extract description/info - basic fallback for existing functionality
      const info = isNGSILD
        ? this.extractAttributeNGSILD(entity, [
            'description',
            'info',
            'details',
          ]) || ''
        : this.extractAttribute(entity, ['description', 'info', 'details']) ||
          '';

      // Extract additional fields - only if configured
      const contactName = tab.listviewContactNameAttribute
        ? (isNGSILD
            ? this.extractContactAttributeWithFallbackNGSILD(
                entity,
                tab.listviewContactNameAttribute,
                'name',
              )
            : this.extractContactAttributeWithFallback(
                entity,
                tab.listviewContactNameAttribute,
                'properties.name',
              )) || ''
        : '';

      const contactPhone = tab.listviewContactPhoneAttribute
        ? (isNGSILD
            ? this.extractContactAttributeWithFallbackNGSILD(
                entity,
                tab.listviewContactPhoneAttribute,
                'telephone',
              )
            : this.extractContactAttributeWithFallback(
                entity,
                tab.listviewContactPhoneAttribute,
                'properties.telephone',
              )) || ''
        : '';

      const participants = tab.listviewParticipantsAttribute
        ? (isNGSILD
            ? this.extractContactAttributeWithFallbackNGSILD(
                entity,
                tab.listviewParticipantsAttribute,
                'contactOption',
              )
            : this.extractContactAttributeWithFallback(
                entity,
                tab.listviewParticipantsAttribute,
                'properties.contactOption',
              )) || ''
        : '';

      const supporter = tab.listviewSupporterAttribute
        ? (isNGSILD
            ? this.extractContactAttributeWithFallbackNGSILD(
                entity,
                tab.listviewSupporterAttribute,
                'contactType',
              )
            : this.extractContactAttributeWithFallback(
                entity,
                tab.listviewSupporterAttribute,
                'properties.contactType',
              )) || ''
        : '';

      const email = tab.listviewEmailAttribute
        ? (isNGSILD
            ? this.extractContactAttributeWithFallbackNGSILD(
                entity,
                tab.listviewEmailAttribute,
                'email',
              )
            : this.extractContactAttributeWithFallback(
                entity,
                tab.listviewEmailAttribute,
                'properties.email',
              )) || ''
        : '';

      const website = tab.listviewWebsiteAttribute
        ? (isNGSILD
            ? this.extractContactAttributeWithFallbackNGSILD(
                entity,
                tab.listviewWebsiteAttribute,
                'url',
              )
            : this.extractContactAttributeWithFallback(
                entity,
                tab.listviewWebsiteAttribute,
                'properties.url',
              )) || ''
        : '';

      const description = tab.listviewDescriptionAttribute
        ? (isNGSILD
            ? this.extractAttributeNGSILD(entity, [
                tab.listviewDescriptionAttribute,
              ])
            : this.extractAttribute(entity, [
                tab.listviewDescriptionAttribute,
              ])) || ''
        : '';

      // Set zoom priority (can be enhanced based on business logic)
      const zoomprio = '1';

      return {
        name,
        types: types.length > 0 ? types : [],
        address,
        image,
        imagePreview,
        creator,
        location,
        info,
        zoomprio,
        contactName,
        contactPhone,
        participants,
        supporter,
        email,
        website,
        description,
      };
    } catch (error) {
      console.error(
        'Error transforming entity to InterestingPlace:',
        error,
        entity,
      );
      return null;
    }
  }

  private extractAttribute(
    entity: any,
    attributeNames: string[],
  ): string | null {
    for (const attrName of attributeNames) {
      if (entity[attrName] !== undefined && entity[attrName] !== null) {
        // Handle FIWARE attribute structure
        if (
          typeof entity[attrName] === 'object' &&
          entity[attrName].value !== undefined
        ) {
          return String(entity[attrName].value);
        }
        // Handle direct value
        if (
          typeof entity[attrName] === 'string' ||
          typeof entity[attrName] === 'number'
        ) {
          return String(entity[attrName]);
        }
        // Handle other object types - try to convert to string safely
        if (typeof entity[attrName] === 'object') {
          console.warn(
            `Unexpected object structure for attribute ${attrName}:`,
            entity[attrName],
          );
          // Try to extract first meaningful string value from object
          const stringValue = this.extractStringFromObject(entity[attrName]);
          if (stringValue) {
            return stringValue;
          }
        }
      }
    }
    return null;
  }

  private extractLocation(
    entity: any,
  ): { type: string; coordinates: number[] } | null {
    // Try different location attribute names
    const locationAttrs = ['location', 'position', 'coordinates', 'geo'];

    for (const attrName of locationAttrs) {
      if (entity[attrName]) {
        let locationData = entity[attrName];

        // Handle FIWARE attribute structure
        if (
          typeof locationData === 'object' &&
          locationData.value !== undefined
        ) {
          locationData = locationData.value;
        }

        // Handle GeoJSON Point format
        if (
          locationData.type === 'Point' &&
          Array.isArray(locationData.coordinates)
        ) {
          return {
            type: 'Point',
            coordinates: locationData.coordinates,
          };
        }

        // Handle raw coordinates array
        if (Array.isArray(locationData) && locationData.length >= 2) {
          return {
            type: 'Point',
            coordinates: [Number(locationData[0]), Number(locationData[1])],
          };
        }
      }
    }

    return null;
  }

  private extractTypesFromAttribute(entity: any, attrName: string): string[] {
    if (entity[attrName]) {
      let typeData = entity[attrName];

      // Handle FIWARE attribute structure
      if (typeof typeData === 'object' && typeData.value !== undefined) {
        typeData = typeData.value;
      }

      // Handle array of types
      if (Array.isArray(typeData)) {
        return typeData.map(String).filter((t) => t && t !== '-');
      }

      // Handle single type
      if (typeof typeData === 'string') {
        return typeData
          .split(',')
          .map((t) => t.trim())
          .filter((t) => t && t !== '-');
      }
    }

    return [];
  }

  private extractAddressWithCustomLogic(
    entity: any,
    addressAttributeName: string,
  ): string | null {
    // First try to get the configured address attribute using standard extraction
    const standardAddress = this.extractAttribute(entity, [
      addressAttributeName,
    ]);
    if (standardAddress) {
      return standardAddress;
    }

    // Custom logic: Check for PointOfInterest.properties.address.properties.addressLocality first
    const addressLocality = this.extractNestedAttribute(
      entity,
      'properties.address.properties.addressLocality',
    );
    if (addressLocality) {
      return addressLocality;
    }

    // Build address from components if addressLocality is not available
    const addressComponents = [];

    // Get alternateName (business name)
    const alternateName = this.extractNestedAttribute(
      entity,
      'properties.alternateName',
    );
    if (alternateName) {
      addressComponents.push(alternateName);
    }

    // Get street address and number
    const streetAddress = this.extractNestedAttribute(
      entity,
      'properties.address.properties.streetAddress',
    );
    const streetNr = this.extractNestedAttribute(
      entity,
      'properties.address.properties.streetNr',
    );

    if (streetAddress) {
      const streetPart = streetNr
        ? `${streetAddress} ${streetNr}`
        : streetAddress;
      addressComponents.push(streetPart);
    }

    // Get postal code
    const postalCode = this.extractNestedAttribute(
      entity,
      'properties.address.properties.postalCode',
    );
    if (postalCode) {
      addressComponents.push(postalCode);
    }

    // Return combined address if we have components, otherwise null
    return addressComponents.length > 0 ? addressComponents.join(', ') : null;
  }

  private extractNestedAttribute(entity: any, path: string): string | null {
    const pathParts = path.split('.');
    let current = entity;

    for (const part of pathParts) {
      if (
        current &&
        typeof current === 'object' &&
        current[part] !== undefined
      ) {
        current = current[part];
      } else {
        return null;
      }
    }

    // Handle FIWARE attribute structure
    if (
      typeof current === 'object' &&
      current !== null &&
      current.value !== undefined
    ) {
      return String(current.value);
    }

    // Handle direct value
    if (typeof current === 'string' || typeof current === 'number') {
      return String(current);
    }

    // Handle other object types - try to extract string safely
    if (typeof current === 'object' && current !== null) {
      console.warn(`Unexpected object structure at path ${path}:`, current);
      const stringValue = this.extractStringFromObject(current);
      if (stringValue) {
        return stringValue;
      }
    }

    return null;
  }

  private extractContactAttributeWithFallback(
    entity: any,
    attributeName: string,
    contactPropertyPath: string,
  ): string | null {
    // First try to get the configured attribute using standard extraction
    const standardValue = this.extractAttribute(entity, [attributeName]);
    if (standardValue) {
      return standardValue;
    }

    // Try to extract from contactPoint structure
    // Build path: attributeName + contactPropertyPath
    // e.g., "contactPoint" + "properties.name" = "contactPoint.properties.name"
    const fullPath = `${attributeName}.${contactPropertyPath}`;
    const contactValue = this.extractNestedAttribute(entity, fullPath);
    if (contactValue) {
      return contactValue;
    }

    // Also try with properties prefix for FIWARE structure
    const fiwarePath = `properties.${attributeName}.${contactPropertyPath}`;
    const fiwareValue = this.extractNestedAttribute(entity, fiwarePath);
    if (fiwareValue) {
      return fiwareValue;
    }

    return null;
  }

  private extractStringFromObject(obj: any): string | null {
    if (obj === null || obj === undefined) {
      return null;
    }

    // If it has a value property, use that
    if (obj.value !== undefined) {
      if (typeof obj.value === 'string' || typeof obj.value === 'number') {
        return String(obj.value);
      }
      // If value is also an object, recurse
      if (typeof obj.value === 'object') {
        return this.extractStringFromObject(obj.value);
      }
    }

    // If it has a text property, use that
    if (obj.text !== undefined) {
      return String(obj.text);
    }

    // If it has a name property, use that
    if (obj.name !== undefined) {
      return String(obj.name);
    }

    // If it's an array, try to get the first string item
    if (Array.isArray(obj) && obj.length > 0) {
      for (const item of obj) {
        const result = this.extractStringFromObject(item);
        if (result) {
          return result;
        }
      }
    }

    // Try to get the first string value from any property
    if (typeof obj === 'object') {
      for (const key in obj) {
        if (obj.hasOwnProperty(key)) {
          const value = obj[key];
          if (typeof value === 'string' || typeof value === 'number') {
            return String(value);
          }
        }
      }
    }

    return null;
  }

  // NGSI format detection
  private isNGSILDEntity(entity: any): boolean {
    // NGSI-LD entities have attributes with "type" and "value" properties
    if (!entity || typeof entity !== 'object') return false;

    // Check if any top-level property has the NGSI-LD structure
    for (const key in entity) {
      if (key !== 'id' && key !== 'type' && entity[key]) {
        if (
          typeof entity[key] === 'object' &&
          entity[key].type !== undefined &&
          entity[key].value !== undefined
        ) {
          return true;
        }
      }
    }
    return false;
  }

  // NGSI-LD extraction methods
  private extractAttributeNGSILD(
    entity: any,
    attributeNames: string[],
  ): string | null {
    for (const attrName of attributeNames) {
      if (entity[attrName] !== undefined && entity[attrName] !== null) {
        // Handle NGSI-LD attribute structure { type: "Property", value: "..." }
        if (
          typeof entity[attrName] === 'object' &&
          entity[attrName].value !== undefined
        ) {
          const value = entity[attrName].value;
          if (typeof value === 'string' || typeof value === 'number') {
            return String(value);
          }
          // If value is an object, try to extract string from it
          if (typeof value === 'object') {
            const stringValue = this.extractStringFromObject(value);
            if (stringValue) {
              return stringValue;
            }
          }
        }
        // Handle direct value (fallback)
        if (
          typeof entity[attrName] === 'string' ||
          typeof entity[attrName] === 'number'
        ) {
          return String(entity[attrName]);
        }
      }
    }
    return null;
  }

  private extractLocationNGSILD(
    entity: any,
  ): { type: string; coordinates: number[] } | null {
    // Try different location attribute names for NGSI-LD
    const locationAttrs = ['location', 'position', 'coordinates', 'geo'];

    for (const attrName of locationAttrs) {
      if (entity[attrName]) {
        let locationData = entity[attrName];

        // Handle NGSI-LD attribute structure { type: "GeoProperty", value: {...} }
        if (
          typeof locationData === 'object' &&
          locationData.value !== undefined
        ) {
          locationData = locationData.value;
        }

        // Handle GeoJSON Point format
        if (
          locationData.type === 'Point' &&
          Array.isArray(locationData.coordinates)
        ) {
          return {
            type: 'Point',
            coordinates: locationData.coordinates,
          };
        }

        // Handle raw coordinates array
        if (Array.isArray(locationData) && locationData.length >= 2) {
          return {
            type: 'Point',
            coordinates: [Number(locationData[0]), Number(locationData[1])],
          };
        }
      }
    }

    return null;
  }

  private extractTypesFromAttributeNGSILD(
    entity: any,
    attrName: string,
  ): string[] {
    if (entity[attrName]) {
      let typeData = entity[attrName];

      // Handle NGSI-LD attribute structure
      if (typeof typeData === 'object' && typeData.value !== undefined) {
        typeData = typeData.value;
      }

      // Handle array of types
      if (Array.isArray(typeData)) {
        return typeData.map(String).filter((t) => t && t !== '-');
      }

      // Handle single type
      if (typeof typeData === 'string') {
        return typeData
          .split(',')
          .map((t) => t.trim())
          .filter((t) => t && t !== '-');
      }
    }

    return [];
  }

  private extractAddressWithCustomLogicNGSILD(
    entity: any,
    addressAttributeName: string,
  ): string | null {
    // Custom logic for NGSI-LD: Check for address.value.addressLocality FIRST
    if (
      entity.address &&
      entity.address.value &&
      entity.address.value.addressLocality
    ) {
      const addressLocality = String(entity.address.value.addressLocality);
      if (addressLocality.trim()) {
        return addressLocality;
      }
    }

    // Then try to get the configured address attribute using NGSI-LD extraction
    const standardAddress = this.extractAttributeNGSILD(entity, [
      addressAttributeName,
    ]);
    if (standardAddress) {
      return standardAddress;
    }

    // Build address from components if addressLocality is not available
    const addressComponents = [];

    // Get alternateName (business name)
    if (entity.alternateName && entity.alternateName.value) {
      const alternateName = String(entity.alternateName.value);
      if (alternateName.trim()) {
        addressComponents.push(alternateName);
      }
    }

    // Get street address and number from address.value
    if (entity.address && entity.address.value) {
      const addressValue = entity.address.value;

      if (addressValue.streetAddress) {
        const streetAddress = String(addressValue.streetAddress);
        const streetNr = addressValue.streetNr
          ? String(addressValue.streetNr)
          : '';

        if (streetAddress.trim()) {
          const streetPart = streetNr.trim()
            ? `${streetAddress} ${streetNr}`
            : streetAddress;
          addressComponents.push(streetPart);
        }
      }

      // Get postal code
      if (addressValue.postalCode) {
        const postalCode = String(addressValue.postalCode);
        if (postalCode.trim()) {
          addressComponents.push(postalCode);
        }
      }
    }

    // Return combined address if we have components, otherwise null
    return addressComponents.length > 0 ? addressComponents.join(', ') : null;
  }

  private extractContactAttributeWithFallbackNGSILD(
    entity: any,
    attributeName: string,
    contactProperty: string,
  ): string | null {
    // First try to get the configured attribute using NGSI-LD extraction
    const standardValue = this.extractAttributeNGSILD(entity, [attributeName]);
    if (standardValue) {
      return standardValue;
    }

    // Try to extract from contactPoint structure in NGSI-LD format
    if (entity.contactPoint && entity.contactPoint.value) {
      const contactValue = entity.contactPoint.value[contactProperty];
      if (contactValue !== undefined) {
        if (
          typeof contactValue === 'string' ||
          typeof contactValue === 'number'
        ) {
          return String(contactValue);
        }
        // Handle arrays (like contactOption)
        if (Array.isArray(contactValue) && contactValue.length > 0) {
          return contactValue.map(String).join(', ');
        }
      }
    }

    return null;
  }

  // NGSI-v2 extraction methods (placeholder)
  // private extractAttributeNGSIV2(
  //   entity: any,
  //   attributeNames: string[],
  // ): string | null {
  //   // TODO: Implement NGSI-v2 specific extraction logic
  //   return null;
  // }

  // private extractLocationNGSIV2(
  //   entity: any,
  // ): { type: string; coordinates: number[] } | null {
  //   // TODO: Implement NGSI-v2 specific location extraction logic
  //   return null;
  // }

  // private extractTypesFromAttributeNGSIV2(
  //   entity: any,
  //   attrName: string,
  // ): string[] {
  //   // TODO: Implement NGSI-v2 specific types extraction logic
  //   return [];
  // }

  // private extractAddressWithCustomLogicNGSIV2(
  //   entity: any,
  //   addressAttributeName: string,
  // ): string | null {
  //   // TODO: Implement NGSI-v2 specific address extraction logic
  //   return null;
  // }

  // private extractContactAttributeWithFallbackNGSIV2(
  //   entity: any,
  //   attributeName: string,
  //   contactProperty: string,
  // ): string | null {
  //   // TODO: Implement NGSI-v2 specific contact extraction logic
  //   return null;
  // }
}
