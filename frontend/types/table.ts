export type TableConfig<T> = {
  columns: Array<keyof T>;
  viewsPerPage: number;
  maxPages: number;
};

export type GenericTableContentItem<T> = {
  [P in keyof T]?: T[P];
};
