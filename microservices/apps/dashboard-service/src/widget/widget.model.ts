import { Tab, Widget } from '@app/postgres-db/schemas';
import { QueryConfig } from '@app/postgres-db/schemas/query-config.schema';
import { DataSource } from '@app/postgres-db/schemas/data-source.schema';
import { DataModel } from '@app/postgres-db/schemas/data-model.schema';
import { Query } from '@app/postgres-db/schemas/query.schema';
import { PgEnum } from 'drizzle-orm/pg-core';
import {
  tabComponentSubTypeEnum,
  tabComponentTypeEnum,
} from '@app/postgres-db/schemas/enums.schema';

export type WidgetWithChildren = {
  widget: Widget;
  tab: Tab;
  queryConfig: QueryConfig;
  datasource: DataSource;
};

export type WidgetWithComponentTypes = {
  id: string;
  name: string;
  description: string;
  visibility: string;
  componentType: string;
  componentSubType: string;
};

export type FlatWidgetData = {
  widget: Widget;
  tab: Tab;
  data_model: DataModel;
  query: Query;
};

export type PaginatedResult<T> = {
  data: T[];
  meta: PaginationMeta;
};

export type PaginationMeta = {
  totalItems: number;
  totalPages: number;
  currentPage: number;
  pageSize: number;
};

export type TabComponentType =
  typeof tabComponentTypeEnum extends PgEnum<infer T> ? T[number] : never;

export type TabSubComponentType =
  typeof tabComponentSubTypeEnum extends PgEnum<infer T> ? T[number] : never;
