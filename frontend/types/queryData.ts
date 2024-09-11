export type QueryData = {
  attrs: QueryDataAttributes[];
  attributes?: QueryDataAttributeValues[];
};

export type QueryDataAttributes = {
  attrName: string;
  types: QueryDataAttributeTypes[];
};

export type QueryDataAttributeValues = {
  attrName: string;
  values?: number[];
};

export type QueryDataAttributeTypes = {
  entities: QueryDataEntities[];
  entityType: string;
};

export type QueryDataEntities = {
  entityId: string;
  index: string[];
  values: (string | number)[];
};
