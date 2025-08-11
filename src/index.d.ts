export const betterJsonSchemaErrors: (
  instance: Json,
  errorOutput: OutputFormat,
  schemaUri: string,
  language?: string
) => Promise<BetterJsonSchemaErrors>;

export type BetterJsonSchemaErrors = {
  errors: ErrorObject[];
};

export type ErrorObject = {
  schemaLocation: string | string[];
  instanceLocation: string;
  message: string;
};

export type Json = string | number | boolean | null | JsonObject | Json[];
export type JsonObject = {
  [property: string]: Json;
};

export type SchemaFragment = string | number | boolean | null | SchemaObject | SchemaFragment[];
export type SchemaObject = {
  [keyword: string]: SchemaFragment;
};

export type OutputFormat = OutputUnit & {
  valid: boolean;
};

export type OutputUnit = {
  valid?: boolean;
  absoluteKeywordLocation?: string;
  keywordLocation?: string;
  instanceLocation?: string;
  errors?: OutputUnit[];
};

export type NormalizedError = {
  valid: false;
  keyword: string;
  absoluteKeywordLocation: string;
  instanceLocation: string;
};
