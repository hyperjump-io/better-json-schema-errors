import { compile, getSchema } from "@hyperjump/json-schema/experimental";
import * as Instance from "@hyperjump/json-schema/instance/experimental";
import { pointerSegments } from "@hyperjump/json-pointer";
import * as Browser from "@hyperjump/browser";

/**
 * @import { OutputUnit, Json } from "../index.d.ts"
 * @import { AST } from "@hyperjump/json-schema/experimental"
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
 */

/** @type (schemaLocation: string, ast: AST, instance: JsonNode, errorIndex: ErrorIndex) => NormalizedOutput */
const evaluateSchema = (schemaLocation, ast, instance, errorIndex) => {
  const instanceLocation = Instance.uri(instance);
  const schemaNode = ast[schemaLocation];
  if (typeof schemaNode === "boolean") {
    return {
      [instanceLocation]: {
        "https://json-schema.org/validation": {
          [schemaLocation]: schemaNode
        }
      }
    };
  }

  /** @type NormalizedOutput */
  const output = { [instanceLocation]: {} };
  for (const [keywordUri, keywordLocation, keywordValue] of schemaNode) {
    const keyword = keywordHandlers[keywordUri] ?? {};

    const keywordOutput = keyword.evaluate?.(keywordValue, ast, instance, errorIndex);
    if (keyword.simpleApplicator) {
      for (const suboutput of (keywordOutput ?? [])) {
        mergeOutput(output, suboutput);
      }
    } else if (errorIndex[keywordLocation]?.[instanceLocation]) {
      output[instanceLocation][keywordUri] ??= {};
      output[instanceLocation][keywordUri][keywordLocation] = keywordOutput ?? false;
    } else if (keyword.appliesTo?.(Instance.typeOf(instance)) !== false) {
      output[instanceLocation][keywordUri] ??= {};
      output[instanceLocation][keywordUri][keywordLocation] = !errorIndex[keywordLocation]?.[instanceLocation];
    }
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
 *   evaluate?(value: any, ast: AST, instance: JsonNode, errorIndex: ErrorIndex):  NormalizedOutput[]
 *   appliesTo?(type: string): boolean;
 *   simpleApplicator?: true;
 * }} KeywordHandler
 */

/** @type Record<string, KeywordHandler> */
const keywordHandlers = {};

keywordHandlers["https://json-schema.org/keyword/anyOf"] = {
  evaluate(/** @type string[] */ anyOf, ast, instance, errorIndex) {
    /** @type NormalizedOutput[] */
    const errors = [];

    for (const schemaLocation of anyOf) {
      errors.push(evaluateSchema(schemaLocation, ast, instance, errorIndex));
    }

    return errors;
  }
};

keywordHandlers["https://json-schema.org/keyword/items"] = {
  evaluate(/** @type string[] */ itemsSchemaLocation, ast, instance, errorIndex) {
    /** @type NormalizedOutput[] */
    const errors = [];
    if (Instance.typeOf(instance) !== "array") {
      return errors;
    }
    for (const itemNode of Instance.iter(instance)) {
      errors.push(evaluateSchema(itemsSchemaLocation[1], ast, itemNode, errorIndex));
    }
    return errors;
  },
  simpleApplicator: true
};

keywordHandlers["https://json-schema.org/keyword/allOf"] = {
  evaluate(/** @type string[] */ allOf, ast, instance, errorIndex) {
    /** @type NormalizedOutput[] */
    const errors = [];
    for (const schemaLocation of allOf) {
      errors.push(evaluateSchema(schemaLocation, ast, instance, errorIndex));
    }

    return errors;
  },
  simpleApplicator: true
};

keywordHandlers["https://json-schema.org/keyword/oneOf"] = {
  evaluate(/** @type string[] */ oneOf, ast, instance, errorIndex) {
    /** @type NormalizedOutput[] */
    const errors = [];

    for (const schemaLocation of oneOf) {
      errors.push(evaluateSchema(schemaLocation, ast, instance, errorIndex));
    }

    return errors;
  }
};

keywordHandlers["https://json-schema.org/keyword/ref"] = {
  evaluate(/** @type string */ ref, ast, instance, errorIndex) {
    return [evaluateSchema(ref, ast, instance, errorIndex)];
  },
  simpleApplicator: true
};

keywordHandlers["https://json-schema.org/keyword/properties"] = {
  evaluate(/** @type Record<string, string> */ properties, ast, instance, errorIndex) {
    /** @type NormalizedOutput[] */
    const errors = [];

    for (const propertyName in properties) {
      const propertyNode = Instance.step(propertyName, instance);
      if (!propertyNode) {
        continue;
      }

      errors.push(evaluateSchema(properties[propertyName], ast, propertyNode, errorIndex));
    }

    return errors;
  },
  simpleApplicator: true
};

keywordHandlers["https://json-schema.org/keyword/definitions"] = {
  appliesTo() {
    return false;
  }
};

keywordHandlers["https://json-schema.org/keyword/minLength"] = {
  appliesTo(type) {
    return type === "string";
  }
};

keywordHandlers["https://json-schema.org/keyword/maxLength"] = {
  appliesTo(type) {
    return type === "string";
  }
};

keywordHandlers["https://json-schema.org/keyword/minimum"] = {
  appliesTo(type) {
    return type === "number";
  }
};

keywordHandlers["https://json-schema.org/keyword/maximum"] = {
  appliesTo(type) {
    return type === "number";
  }
};

keywordHandlers["https://json-schema.org/keyword/pattern"] = {
  appliesTo(type) {
    return type === "string";
  }
};

keywordHandlers["https://json-schema/keyword/exclusiveMinimum"] = {
  appliesTo(type) {
    return type === "number";
  }
};

keywordHandlers["https://json-schema/keyword/exclusiveMaximum"] = {
  appliesTo(type) {
    return type === "number";
  }
};

keywordHandlers["https://json-schema/keyword/multipleOf"] = {
  appliesTo(type) {
    return type === "number";
  }
};

keywordHandlers["https://json-schema.org/keyword/maximum"] = {
  appliesTo(type) {
    return type === "number";
  }
};
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
    const instanceLocation = /** @type string */ (normalizeInstanceLocation(errorOutputUnit.instanceLocation));
    errorIndex[absoluteKeywordLocation] ??= {};
    errorIndex[absoluteKeywordLocation][instanceLocation] = true;
    await constructErrorIndex(errorOutputUnit, schema, errorIndex);
  }
  return errorIndex;
};

/**
 * Convert keywordLocation to absoluteKeywordLocation
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

/** @type {(location: string | undefined) => string | undefined} */
function normalizeInstanceLocation(location) {
  return location?.startsWith("/") || location === "" ? `#${location}` : location;
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
  return evaluateSchema(schemaUri, ast, value, errorIndex);
}
