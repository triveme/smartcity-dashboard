/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  AttributeData,
  QueryData,
  QueryDataWithAttributes,
  WidgetWithContent,
} from '@/types';

const attributesToBeExcluded = [
  'query', // combined using a different function due to the structure difference
];

export function combineWidgetAttributes(
  combinedWidgets: WidgetWithContent[],
): Record<string, any[] | null | boolean> {
  const combinedAttributes: Record<string, any[] | null | boolean> = {};

  combinedWidgets.forEach((widget, widgetIndex) => {
    // add mapNames for filter modal
    if (!combinedAttributes['mapNames']) {
      combinedAttributes['mapNames'] = [];
    }
    if (widget.name) {
      (combinedAttributes['mapNames'] as any[]).push(widget.name);
    }

    widget.tabs.forEach((tab: Record<string, any>) => {
      Object.keys(tab).forEach((key) => {
        // skip excluded keys
        if (attributesToBeExcluded.includes(key)) return;

        // initialize combinedAttributes[key] as an array if it's not a boolean
        if (
          !combinedAttributes[key] ||
          typeof combinedAttributes[key] === 'boolean'
        ) {
          combinedAttributes[key] = [];
        }

        // if the value is an array, join it and add the dataSource attribute
        if (Array.isArray(tab[key])) {
          tab[key].forEach((item: any) => {
            // skip null or undefined values
            if (item !== null && item !== undefined) {
              // ensure it's an array before push
              if (Array.isArray(combinedAttributes[key])) {
                combinedAttributes[key].push({
                  ...item,
                  dataSource: widgetIndex,
                });
              }
            }
          });
        } else {
          if (tab[key] !== null && tab[key] !== undefined) {
            // ensure it's an array before push
            if (Array.isArray(combinedAttributes[key])) {
              combinedAttributes[key].push(tab[key]);
            }
          }
        }
      });
    });
  });

  // handle arrays of nulls or booleans
  Object.keys(combinedAttributes).forEach((key) => {
    const values = combinedAttributes[key];

    if (Array.isArray(values)) {
      // handle arrays where all values are null
      if (values.every((value) => value === null)) {
        combinedAttributes[key] = null;
      }
      // handle boolean arrays: if any value is true, set to true
      else if (typeof values[0] === 'boolean') {
        combinedAttributes[key] = values.some((value) => value === true);
      }
    }
  });

  return combinedAttributes;
}

export function combineQueryData(
  widgetQueryDataArrays: QueryData[][],
  mapFilterAttribute: string[],
): QueryDataWithAttributes[] {
  const combinedData: QueryDataWithAttributes = {};

  // Helper to process each widget's queryData
  const processQueryData = (queryData: QueryData[]): void => {
    if (queryData && queryData.length > 0) {
      queryData.forEach((data) => {
        Object.keys(data).forEach((key) => {
          // Only process keys that are included in mapFilterAttribute
          // TODO: come up with another way to include all attributes
          if (mapFilterAttribute) {
            if (
              mapFilterAttribute.length === 0 || // If no filter is provided, include all attributes
              mapFilterAttribute.includes(key)
            ) {
              if (typeof data[key] === 'object' && 'type' in data[key]) {
                const attributeKey = key; // E.g., precipitation, temperature
                const attributeData = data[key] as AttributeData;

                // Initialize an array for the attribute if it doesn't exist yet
                if (!combinedData[attributeKey]) {
                  combinedData[attributeKey] = [];
                }

                // Add the current attribute data into the array
                combinedData[attributeKey].push(attributeData);
              }
            }
          }
        });
      });
    }
  };

  // Process all provided query data arrays dynamically
  widgetQueryDataArrays.forEach(processQueryData);

  // Sort and remove duplicates for each attribute
  Object.keys(combinedData).forEach((attributeKey) => {
    combinedData[attributeKey] = Array.from(
      // Remove duplicates by using a Set and mapping the values
      new Set(
        combinedData[attributeKey].map((attr) => JSON.stringify(attr)), // Convert object to string for Set uniqueness
      ),
    )
      // Convert back to objects after removing duplicates
      .map((attr) => JSON.parse(attr))
      // Sort by the value (smallest to largest)
      .sort((a: AttributeData, b: AttributeData) => {
        if (typeof a.value === 'number' && typeof b.value === 'number') {
          return a.value - b.value;
        } else if (typeof a.value === 'string' && typeof b.value === 'string') {
          return a.value.localeCompare(b.value);
        } else {
          // If mixed types, convert to string for consistent comparison
          return a.value.toString().localeCompare(b.value.toString());
        }
      });
  });

  // Convert the combinedData object to an array of objects where each attribute is separate
  return Object.keys(combinedData).map((attributeKey) => ({
    [attributeKey]: combinedData[attributeKey],
  }));
}
