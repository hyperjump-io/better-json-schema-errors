import { compile, getKeyword, getSchema } from "@hyperjump/json-schema/experimental";
import * as Instance from "@hyperjump/json-schema/instance/experimental";
import { pointerSegments } from "@hyperjump/json-pointer";
import * as Browser from "@hyperjump/browser";

/**
 * @import { JsonNode } from "@hyperjump/json-schema/instance/experimental"
 * @import { Browser as BrowserType } from "@hyperjump/browser";
 * @import { SchemaDocument } from "@hyperjump/json-schema/experimental";
 * @import * as API from "./index.d.ts"
 */

/** @type Record<string, API.KeywordHandler> */
const keywordHandlers = {};

/** @type API.setNormalizationHandler */
export const setNormalizationHandler = (uri, handler) => {
  keywordHandlers[uri] = handler;
};

/** @type (schemaLocation: string, instance: JsonNode, context: API.EvaluationContext) => API.NormalizedOutput */
export const evaluateSchema = (schemaLocation, instance, context) => {
  const instanceLocation = Instance.uri(instance);

  let valid = true;
  /** @type API.NormalizedOutput */
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

      const validationKeyword = getKeyword(keywordUri);

      const keywordContext = {
        ast: context.ast,
        errorIndex: context.errorIndex,
        plugins: context.plugins
      };
      for (const plugin of context.plugins) {
        plugin.beforeKeyword?.(node, instance, keywordContext, context, validationKeyword);
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
        plugin.afterKeyword?.(node, instance, keywordContext, isKeywordValid, context, validationKeyword);
      }
    }
  }

  for (const plugin of context.plugins) {
    plugin.afterSchema?.(schemaLocation, instance, context, valid);
  }

  return output;
};

/** @type (a: API.NormalizedOutput, b: API.NormalizedOutput) => void */
const mergeOutput = (a, b) => {
  for (const instanceLocation in b) {
    a[instanceLocation] ??= {};
    for (const keywordUri in b[instanceLocation]) {
      a[instanceLocation][keywordUri] ??= {};

      Object.assign(a[instanceLocation][keywordUri], b[instanceLocation][keywordUri]);
    }
  }
};

/** @type (outputUnit: API.OutputUnit, schema: BrowserType<SchemaDocument>, errorIndex?: API.ErrorIndex) => Promise<API.ErrorIndex> */
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

/** @type (instance: API.Json, errorOutput: API.OutputUnit, subjectUri: string) => Promise<API.NormalizedOutput> */
export async function normalizedErrorOuput(instance, errorOutput, subjectUri) {
  const schema = await getSchema(subjectUri);
  const errorIndex = await constructErrorIndex(errorOutput, schema);
  const { schemaUri, ast } = await compile(schema);
  const value = Instance.fromJs(instance);
  /** @type API.EvaluationContext */
  const context = { ast, errorIndex, plugins: [] };
  return evaluateSchema(schemaUri, value, context);
}
