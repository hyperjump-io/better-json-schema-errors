import { compile, getSchema } from "@hyperjump/json-schema/experimental";
import * as Instance from "@hyperjump/json-schema/instance/experimental";
import { pointerSegments } from "@hyperjump/json-pointer";
import * as Browser from "@hyperjump/browser";
import additionalProperties from "./keywords/additionalProperties.js";
import allOf from "./keywords/allOf.js";
import anyOf from "./keywords/anyOf.js";
import constKeyword from "./keywords/const.js";
import contains from "./keywords/contains.js";
import dependentRequired from "./keywords/dependentRequired.js";
import dependentSchema from "./keywords/dependentSchema.js";
import definitions from "./keywords/definitions.js";
import elseKeyword from "./keywords/else.js";
import enumKeyword from "./keywords/enum.js";
import exclusiveMaximum from "./keywords/exclusiveMaximum.js";
import exclusiveMinimum from "./keywords/exclusiveMinimum.js";
import items from "./keywords/items.js";
import maxContains from "./keywords/maxContains.js";
import maxItems from "./keywords/maxItems.js";
import maxLength from "./keywords/maxLength.js";
import maxProperties from "./keywords/maxProperties.js";
import maximum from "./keywords/maximum.js";
import minContains from "./keywords/minContains.js";
import minItems from "./keywords/minItems.js";
import minLength from "./keywords/minLength.js";
import minProperties from "./keywords/minProperties.js";
import minimum from "./keywords/minimum.js";
import multipleOf from "./keywords/multipleOf.js";
import not from "./keywords/not.js";
import oneOf from "./keywords/oneOf.js";
import pattern from "./keywords/pattern.js";
import patternProperties from "./keywords/patternProperties.js";
import prefixItems from "./keywords/prefixItems.js";
import properties from "./keywords/properties.js";
import propertyNames from "./keywords/propertyNames.js";
import ref from "./keywords/ref.js";
import required from "./keywords/required.js";
import then from "./keywords/then.js";
import type from "./keywords/type.js";
import unevaluatedItems from "./keywords/unevaluatedItems.js";
import unevaluatedProperties from "./keywords/unevaluatedProperties.js";
import uniqueItems from "./keywords/uniqueItems.js";

/**
 * @import { OutputUnit, Json } from "../index.d.ts"
 * @import { AST, EvaluationPlugin } from "@hyperjump/json-schema/experimental"
 * @import { JsonNode } from "@hyperjump/json-schema/instance/experimental"
 * @import { Browser as BrowserType } from "@hyperjump/browser";
 * @import { SchemaDocument } from "@hyperjump/json-schema/experimental";
 */

/**
 * @typedef {{
 *   [keywordUri: string]: {
 *     [keywordLocation: string]: boolean | NormalizedOutput[]
 *   }
 * }} InstanceOutput
 *
 * @typedef {{
 *   [instanceLocation: string]: InstanceOutput
 * }} NormalizedOutput
 *
 * @typedef {{
 *   ast: AST,
 *   errorIndex: ErrorIndex,
 *   plugins: EvaluationPlugin[]
 * }} EvaluationContext
 */

/** @type Record<string, KeywordHandler> */
const keywordHandlers = {
  "https://json-schema.org/keyword/additionalProperties": additionalProperties,
  "https://json-schema.org/keyword/allOf": allOf,
  "https://json-schema.org/keyword/anyOf": anyOf,
  "https://json-schema.org/keyword/const": constKeyword,
  "https://json-schema.org/keyword/contains": contains,
  "https://json-schema.org/keyword/dependentRequired": dependentRequired,
  "https://json-schema.org/keyword/dependentSchema": dependentSchema,
  "https://json-schema.org/keyword/definitions": definitions,
  "https://json-schema.org/keyword/else": elseKeyword,
  "https://json-schema.org/keyword/enum": enumKeyword,
  "https://json-schema/keyword/exclusiveMaximum": exclusiveMaximum,
  "https://json-schema/keyword/exclusiveMinimum": exclusiveMinimum,
  "https://json-schema.org/keyword/items": items,
  "https://json-schema.org/keyword/maxContains": maxContains,
  "https://json-schema.org/keyword/maxItems": maxItems,
  "https://json-schema.org/keyword/maxLength": maxLength,
  "https://json-schema.org/keyword/maxProperties": maxProperties,
  "https://json-schema.org/keyword/maximum": maximum,
  "https://json-schema.org/keyword/minContains": minContains,
  "https://json-schema.org/keyword/minItems": minItems,
  "https://json-schema.org/keyword/minLength": minLength,
  "https://json-schema.org/keyword/minProperties": minProperties,
  "https://json-schema.org/keyword/minimum": minimum,
  "https://json-schema/keyword/multipleOf": multipleOf,
  "https://json-schema.org/keyword/not": not,
  "https://json-schema.org/keyword/oneOf": oneOf,
  "https://json-schema.org/keyword/pattern": pattern,
  "https://json-schema.org/keyword/patternProperties": patternProperties,
  "https://json-schema.org/keyword/prefixItems": prefixItems,
  "https://json-schema.org/keyword/properties": properties,
  "https://json-schema.org/keyword/propertyNames": propertyNames,
  "https://json-schema.org/keyword/ref": ref,
  "https://json-schema.org/keyword/required": required,
  "https://json-schema.org/keyword/then": then,
  "https://json-schema.org/keyword/type": type,
  "https://json-schema.org/keyword/unevaluatedItems": unevaluatedItems,
  "https://json-schema.org/keyword/unevaluatedProperties": unevaluatedProperties,
  "https://json-schema.org/keyword/uniqueItems": uniqueItems
};

/** @type (schemaLocation: string, instance: JsonNode, context: EvaluationContext) => NormalizedOutput */
export const evaluateSchema = (schemaLocation, instance, context) => {
  const instanceLocation = Instance.uri(instance);

  let valid = true;
  /** @type NormalizedOutput */
  const output = { [instanceLocation]: {} };

  for (const plugin of context.plugins) {
    plugin.beforeSchema?.(schemaLocation, instance, context);
  }

  const schemaNode = context.ast[schemaLocation];
  if (typeof schemaNode === "boolean") {
    output[instanceLocation] = {
      "https://json-schema.org/validation": {
        [schemaLocation]: schemaNode
      }
    };
  } else {
    for (const node of schemaNode) {
      const [keywordUri, keywordLocation, keywordValue] = node;
      const keyword = keywordHandlers[keywordUri] ?? {};

      const keywordContext = {
        ast: context.ast,
        errorIndex: context.errorIndex,
        plugins: context.plugins
      };
      for (const plugin of context.plugins) {
        plugin.beforeKeyword?.(node, instance, keywordContext, context, keyword);
      }

      const keywordOutput = keyword.evaluate?.(keywordValue, instance, keywordContext);
      const isKeywordValid = !context.errorIndex[keywordLocation]?.[instanceLocation];
      if (!isKeywordValid) {
        valid = false;
      }

      if (keyword.simpleApplicator) {
        for (const suboutput of (keywordOutput ?? [])) {
          mergeOutput(output, suboutput);
        }
      } else if (!isKeywordValid) {
        output[instanceLocation][keywordUri] ??= {};
        output[instanceLocation][keywordUri][keywordLocation] = keywordOutput ?? false;
      } else if (keyword.appliesTo?.(Instance.typeOf(instance)) !== false) {
        output[instanceLocation][keywordUri] ??= {};
        output[instanceLocation][keywordUri][keywordLocation] = isKeywordValid;
      }

      for (const plugin of context.plugins) {
        plugin.afterKeyword?.(node, instance, keywordContext, isKeywordValid, context, keyword);
      }
    }
  }

  for (const plugin of context.plugins) {
    plugin.afterSchema?.(schemaLocation, instance, context, valid);
  }

  return output;
};

/** @type (a: NormalizedOutput, b: NormalizedOutput) => void */
const mergeOutput = (a, b) => {
  for (const instanceLocation in b) {
    for (const keywordUri in b[instanceLocation]) {
      a[instanceLocation] ??= {};
      a[instanceLocation][keywordUri] ??= {};

      Object.assign(a[instanceLocation][keywordUri], b[instanceLocation][keywordUri]);
    }
  }
};

/**
 * @typedef {{
 *   evaluate?(value: any, instance: JsonNode, context: EvaluationContext):  NormalizedOutput[]
 *   appliesTo?(type: string): boolean;
 *   simpleApplicator?: true;
 * }} KeywordHandler
 */

/** @typedef {Record<string, Record<string, true>>} ErrorIndex */

/** @type (outputUnit: OutputUnit, schema: BrowserType<SchemaDocument>, errorIndex?: ErrorIndex) => Promise<ErrorIndex> */
export const constructErrorIndex = async (outputUnit, schema, errorIndex = {}) => {
  if (outputUnit.valid) {
    return errorIndex;
  }

  for (const errorOutputUnit of outputUnit.errors ?? []) {
    if (errorOutputUnit.valid) {
      continue;
    }
    if (!("instanceLocation" in errorOutputUnit) || !("keywordLocation" in errorOutputUnit || "absoluteKeywordLocation" in errorOutputUnit)) {
      throw new Error("error Output must follow Draft 2019-09");
    }
    const absoluteKeywordLocation = errorOutputUnit.absoluteKeywordLocation
      ?? await toAbsoluteKeywordLocation(schema, /** @type string */ (errorOutputUnit.keywordLocation));
    const instanceLocation = normalizeInstanceLocation(/** @type string */ (errorOutputUnit.instanceLocation));
    errorIndex[absoluteKeywordLocation] ??= {};
    errorIndex[absoluteKeywordLocation][instanceLocation] = true;
    await constructErrorIndex(errorOutputUnit, schema, errorIndex);
  }
  return errorIndex;
};

/**
 * @param {BrowserType<SchemaDocument>} schema
 * @param {string} keywordLocation
 * @returns {Promise<string>}
 */
export async function toAbsoluteKeywordLocation(schema, keywordLocation) {
  for (const segment of pointerSegments(keywordLocation)) {
    schema = /** @type BrowserType<SchemaDocument> */ (await Browser.step(segment, schema));
  }
  return `${schema.document.baseUri}#${schema.cursor}`;
}

/** @type {(location: string) => string} */
function normalizeInstanceLocation(location) {
  const instanceLocation = location.startsWith("/") || location === "" ? `#${location}` : location;
  return instanceLocation.replace(/(#|^)\*\//, "$1/");
}

/**
 * @param {Json} instance
 * @param {OutputUnit} errorOutput
 * @param {string} subjectUri
 * @returns {Promise<NormalizedOutput>}
 */
export async function normalizedErrorOuput(instance, errorOutput, subjectUri) {
  const schema = await getSchema(subjectUri);
  const errorIndex = await constructErrorIndex(errorOutput, schema);
  const { schemaUri, ast } = await compile(schema);
  const value = Instance.fromJs(instance);
  /** @type EvaluationContext */
  const context = { ast, errorIndex, plugins: [] };
  return evaluateSchema(schemaUri, value, context);
}
