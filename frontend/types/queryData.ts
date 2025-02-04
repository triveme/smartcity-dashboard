export type AttributeData = {
  type: string;
  value: number | string;
  metadata: Record<string, unknown>;
};

export type QueryData = {
  id: string;
  type: string;
  [key: string]: AttributeData | string;
};

export type QueryDataEntities = {
  type: string;
  value: string | number;
};

export type QueryDataWithAttributes = {
  [attribute: string]: AttributeData[];
};
