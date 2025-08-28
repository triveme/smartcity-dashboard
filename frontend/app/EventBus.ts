/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/explicit-function-return-type */
/* eslint-disable @typescript-eslint/ban-types */
class EventBus {
  listeners: { [id: string]: ((value: any) => void)[] };

  constructor() {
    this.listeners = {};
  }

  on(event: string, callback: (value: any) => void) {
    if (!this.listeners[event]) {
      this.listeners[event] = [];
    }
    if (!this.listeners[event].includes(callback)) {
      this.listeners[event].push(callback);
    }
  }

  off(event: string, callback: (value: any) => void) {
    if (this.listeners[event]) {
      this.listeners[event] = this.listeners[event].filter(
        (listener: any) => listener !== callback,
      );
    }
  }

  emit(event: string, data: any) {
    if (this.listeners[event]) {
      this.listeners[event].forEach((listener: (value: any) => any) =>
        listener(data),
      );
    }
  }
}

const eventBus = new EventBus();
export default eventBus;

//Pre Defined Events
export const GEOJSON_FEATURE_SELECTION_EVENT: string =
  'mapGeoJSONFeatureSelectionChanged';
export const YEAR_INDEX_SELECTION_EVENT: string = 'selectedYearIndexUpdated';
