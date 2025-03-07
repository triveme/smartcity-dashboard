export type TableConfig<T> = {
  columns: Array<TableColumn<T>>;
  viewsPerPage: number;
  maxPages: number;
};

export type TableColumn<T> = {
  name: keyof T;
  displayName: string;
};

export type GenericTableContentItem<T> = {
  [P in keyof T]?: T[P];
};
