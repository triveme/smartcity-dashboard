class EventBus {
  listeners: { [id: string]: ((value: Event) => void)[] };

  constructor() {
    this.listeners = {};
  }

  on(event: string, callback: (value: Event) => void): void {
    if (!this.listeners[event]) {
      this.listeners[event] = [];
    }
    if (!this.listeners[event].includes(callback)) {
      this.listeners[event].push(callback);
    }
  }

  off(event: string, callback: (value: Event) => void): void {
    if (this.listeners[event]) {
      this.listeners[event] = this.listeners[event].filter(
        (listener: (value: Event) => void) => listener !== callback,
      );
    }
  }

  emit(event: string, data: Event): void {
    if (this.listeners[event]) {
      this.listeners[event].forEach((listener: (value: Event) => void) =>
        listener(data),
      );
    }
  }
}

export type Event = {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  data: any;
};

const eventBus = new EventBus();
export default eventBus;

//Pre Defined Events
export const GEOJSON_FEATURE_SELECTION_EVENT: string =
  'mapGeoJSONFeatureSelectionChanged';
export const GEOJSON_FEATURE_HOVER_EVENT: string =
  'mapGeoJSONFeatureHoverChanged';
export const YEAR_INDEX_SELECTION_EVENT: string = 'selectedYearIndexUpdated';
export const PLACES_FILTER_CHANGED_EVENT: string = 'filteredPlacesChanged';
export const MAP_FOCUS_EVENT: string = 'focusLocationEvent';
export const DETAILS_PAGE_OPEN_EVENT: string = 'detailsPageOpenEvent';
