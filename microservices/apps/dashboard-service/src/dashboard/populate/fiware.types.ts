export type FiwareAttributeData = {
  value: string;
  type: string;
  metadata: object;
};

export type FiwareAttribute = {
  attrName: string;
  types: FiwareAttributeType[];
};

export type FiwareAttributeType = {
  entities: FiwareAttributeEntity[];
  entityType: string;
};

export type FiwareAttributeEntity = {
  entityId: string;
  index: string[];
  values: number[];
};
