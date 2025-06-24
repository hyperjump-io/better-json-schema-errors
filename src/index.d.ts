export const betterJsonSchemaErrors: (
  instance: Json,
  errorOutput: OutputFormat,
  options?: BetterJsonSchemaErrorsOptions
) => Promise<BetterJsonSchemaErrors>;

export type BetterJsonSchemaErrors = {
  errors: ErrorObject[];
};

export type BetterJsonSchemaErrorsOptions = {
  schemaUri?: string;
};

export type ErrorObject = {
  schemaLocation: string;
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

export type OutputFormat = {
  valid: boolean;
  errors: OutputUnit[];
};

export type OutputUnit = {
  valid?: boolean;
  keyword?: string;
  absoluteKeywordLocation?: string;
  keywordLocation?: string;
  instanceLocation: string;
  error?: string;
  errors?: OutputUnit[];
};

export type NormalizedError = {
  valid: false;
  keyword: string;
  absoluteKeywordLocation: string;
  instanceLocation: string;
};
