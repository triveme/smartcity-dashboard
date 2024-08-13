export type QueryData = {
  attrs: QueryDataAttributes[];
};

export type QueryDataAttributes = {
  attrName: string;
  types: QueryDataAttributeTypes[];
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
