import { AST } from "@hyperjump/json-schema/experimental";
import { JsonNode } from "@hyperjump/json-schema/instance/experimental";
import { Localization } from "./localization.js";

export const betterJsonSchemaErrors: (
  errorOutput: OutputFormat,
  schemaUri: string,
  instance: Json,
  options?: BetterJsonSchemaOptions
) => Promise<BetterJsonSchemaErrors>;

export type BetterJsonSchemaOptions = {
  language?: string;
};

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

export const setNormalizationHandler: (uri: string, handler: KeywordHandler) => void;

export type KeywordHandler = {
  evaluate?(value: unknown, instance: JsonNode, context: EvaluationContext): NormalizedOutput[];
  appliesTo?(type: string): boolean;
  simpleApplicator?: true;
};

export type EvaluationContext = {
  ast: AST;
  errorIndex: ErrorIndex;
};

export type ErrorIndex = {
  [schemaLocation: string]: {
    [instanceLocation: string]: boolean;
  };
};

export type InstanceOutput = {
  [keywordUri: string]: {
    [keywordLocation: string]: boolean | NormalizedOutput[];
  };
};

export type NormalizedOutput = {
  [instanceLocation: string]: InstanceOutput;
};

export const addErrorHandler: (handler: ErrorHandler) => void;

export type ErrorHandler = (normalizedErrors: InstanceOutput, instance: JsonNode, localization: Localization) => Promise<ErrorObject[]>;
