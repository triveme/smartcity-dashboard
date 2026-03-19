/* eslint-disable @typescript-eslint/no-explicit-any */
import { QueryDataWithAttributes, WidgetWithContent } from '@/types';

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
                // Special handling for primitives (strings, numbers) to prevent them from being spread character by character
                if (typeof item === 'string' || typeof item === 'number') {
                  combinedAttributes[key].push({
                    value: item,
                    dataSource: widgetIndex,
                  });
                } else {
                  combinedAttributes[key].push({
                    ...item,
                    dataSource: widgetIndex,
                  });
                }
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
        // Special handling for map-related boolean arrays that need to be preserved per data source
        if (
          key === 'mapIsIconColorValueBased' ||
          key === 'mapIsFormColorValueBased'
        ) {
          // Keep as array for map value-based coloring properties
          combinedAttributes[key] = values;
        } else {
          // For other boolean arrays, collapse to single boolean
          combinedAttributes[key] = values.some((value) => value === true);
        }
      }
      // Special handling for chartStaticValuesColors and chartStaticValues
      // These need to be transformed into arrays organized by dataSource
      else if (
        key === 'chartStaticValuesColors' ||
        key === 'chartStaticValues' ||
        key === 'chartStaticValuesLogos' ||
        key === 'chartStaticValuesTexts'
      ) {
        // Group by dataSource and extract the values
        const groupedByDataSource: { [dataSource: number]: any[] } = {};

        values.forEach((item: any) => {
          if (item && typeof item === 'object' && 'dataSource' in item) {
            const dataSource = item.dataSource;
            if (!groupedByDataSource[dataSource]) {
              groupedByDataSource[dataSource] = [];
            }
            // Extract the actual value (handle both wrapped and unwrapped values)
            const actualValue = item.value !== undefined ? item.value : item;
            groupedByDataSource[dataSource].push(actualValue);
          }
        });

        // Convert to array format expected by the Map component
        const maxDataSource = Math.max(
          ...Object.keys(groupedByDataSource).map(Number),
        );
        const result: any[][] = [];
        for (let i = 0; i <= maxDataSource; i++) {
          result[i] = groupedByDataSource[i] || [];
        }
        combinedAttributes[key] = result;
      }
    }
  });

  return combinedAttributes;
}

export function combineQueryData(
  widgetQueryDataArrays: any,
  mapFilterAttribute: string[],
): {
  filteredData: QueryDataWithAttributes[];
  uiGroups: QueryDataWithAttributes[];
} {
  const filterOptions: Record<string, any[]> = {};
  const allItems: any[] = Array.isArray(widgetQueryDataArrays)
    ? widgetQueryDataArrays.flat(Infinity)
    : [];

  const rawFilter = Array.isArray(mapFilterAttribute)
    ? mapFilterAttribute[0]
    : mapFilterAttribute;
  const filterDefinitions = (rawFilter || '').split('|').filter(Boolean);
  const parsedFilters = filterDefinitions.map((def) => {
    const [key, values] = def.split(':');
    return {
      key: key.trim(),
      values: values
        ? values
            .split(',')
            .map((v) => v.trim())
            .filter(Boolean)
        : [],
    };
  });

  allItems.forEach((item) => {
    if (!item || typeof item !== 'object') return;

    parsedFilters.forEach((filter) => {
      const actualKey = Object.keys(item).find(
        (k) => k.toLowerCase() === filter.key.toLowerCase(),
      );
      if (actualKey) {
        if (!filterOptions[filter.key]) filterOptions[filter.key] = [];
        const rawVal = item[actualKey];
        filterOptions[filter.key].push(
          rawVal && typeof rawVal === 'object' && 'value' in rawVal
            ? rawVal
            : { value: rawVal ?? 'N/A', type: typeof rawVal, metadata: {} },
        );
      }
    });
  });

  const filteredData = allItems.filter((item) => {
    if (!item || typeof item !== 'object') return false;

    return parsedFilters.every((filter) => {
      const { key, values } = filter;
      const actualKey = Object.keys(item).find(
        (k) => k.toLowerCase() === key.toLowerCase(),
      );

      // If the row doesn't have the key, we keep it (e.g. Streets for Project data)
      if (!actualKey) return true;

      if (values.length > 0) {
        const rawVal = item[actualKey];
        const valueToCompare =
          rawVal && typeof rawVal === 'object' && 'value' in rawVal
            ? rawVal.value
            : rawVal;

        return values.includes(String(valueToCompare));
      }

      return true;
    });
  });

  const uiGroups = Object.keys(filterOptions).map((key) => {
    const unique = Array.from(
      new Set(filterOptions[key].map((attr) => JSON.stringify(attr))),
    ).map((attr) => JSON.parse(attr));
    return { [key]: unique };
  });

  return { filteredData, uiGroups };
}
