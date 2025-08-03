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

class EvaluationContext {
  evaluatedProperties =/** @type {Set<string>} */ (new Set());
  evaluatedIndices =/** @type {Set<number>} */ (new Set());
}

/** @type (schemaLocation: string, ast: AST, instance: JsonNode, errorIndex: ErrorIndex, context: EvaluationContext) => NormalizedOutput */
const evaluateSchema = (schemaLocation, ast, instance, errorIndex, context) => {
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

    const keywordOutput = keyword.evaluate?.(keywordValue, ast, instance, errorIndex, context);
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
 *   evaluate?(value: any, ast: AST, instance: JsonNode, errorIndex: ErrorIndex, context: EvaluationContext):  NormalizedOutput[]
 *   appliesTo?(type: string): boolean;
 *   simpleApplicator?: true;
 * }} KeywordHandler
 */

/** @type Record<string, KeywordHandler> */
const keywordHandlers = {};

keywordHandlers["https://json-schema.org/keyword/anyOf"] = {
  evaluate(/** @type string[] */ anyOf, ast, instance, errorIndex, context) {
    /** @type NormalizedOutput[] */
    const errors = [];
    for (const schemaLocation of anyOf) {
      errors.push(evaluateSchema(schemaLocation, ast, instance, errorIndex, context));
    }

    return errors;
  }
};

keywordHandlers["https://json-schema.org/keyword/allOf"] = {
  evaluate(/** @type string[] */ allOf, ast, instance, errorIndex, context) {
    /** @type NormalizedOutput[] */
    const errors = [];
    for (const schemaLocation of allOf) {
      errors.push(evaluateSchema(schemaLocation, ast, instance, errorIndex, context));
    }

    return errors;
  },
  simpleApplicator: true
};

keywordHandlers["https://json-schema.org/keyword/oneOf"] = {
  evaluate(/** @type string[] */ oneOf, ast, instance, errorIndex, context) {
    /** @type NormalizedOutput[] */
    const errors = [];

    for (const schemaLocation of oneOf) {
      errors.push(evaluateSchema(schemaLocation, ast, instance, errorIndex, context));
    }

    return errors;
  }
};

keywordHandlers["https://json-schema.org/keyword/ref"] = {
  evaluate(/** @type string */ ref, ast, instance, errorIndex, context) {
    return [evaluateSchema(ref, ast, instance, errorIndex, context)];
  },
  simpleApplicator: true
};

keywordHandlers["https://json-schema.org/keyword/properties"] = {
  evaluate(/** @type Record<string, string> */ properties, ast, instance, errorIndex, context) {
    /** @type NormalizedOutput[] */
    const errors = [];

    for (const propertyName in properties) {
      const propertyNode = Instance.step(propertyName, instance);
      if (!propertyNode) {
        continue;
      }
      context.evaluatedProperties.add(propertyName);
      errors.push(evaluateSchema(properties[propertyName], ast, propertyNode, errorIndex, context));
    }

    return errors;
  },
  simpleApplicator: true
};

keywordHandlers["https://json-schema.org/keyword/items"] = {
  evaluate(/** @type string[] */ [,itemsSchemaLocation], ast, instance, errorIndex, context) {
    /** @type NormalizedOutput[] */
    const errors = [];
    if (Instance.typeOf(instance) !== "array") {
      return errors;
    }
    let index = 0;
    for (const itemNode of Instance.iter(instance)) {
      context.evaluatedIndices.add(index++);
      errors.push(evaluateSchema(itemsSchemaLocation, ast, itemNode, errorIndex, context));
    }
    return errors;
  },
  simpleApplicator: true
};

keywordHandlers["https://json-schema.org/keyword/prefixItems"] = {
  evaluate(/** @type string[] */ prefixItemsSchemaLocations, ast, instance, errorIndex, context) {
    /** @type NormalizedOutput[] */
    const outputs = [];
    if (Instance.typeOf(instance) !== "array") {
      return outputs;
    }
    for (const [index, schemaLocation] of prefixItemsSchemaLocations.entries()) {
      context.evaluatedIndices.add(index);
      const itemNode = Instance.step(String(index), instance);
      if (itemNode) {
        outputs.push(evaluateSchema(schemaLocation, ast, itemNode, errorIndex, context));
      }
    }
    return outputs;
  },
  simpleApplicator: true
};

keywordHandlers["https://json-schema.org/keyword/dependentSchemas"] = {
  evaluate(/** @type [string, string][] */dependentSchemas, ast, instance, errorIndex, context) {
    /** @type NormalizedOutput[] */
    const outputs = [];
    if (Instance.typeOf(instance) !== "object") {
      return outputs;
    }
    const instanceKeys = Object.keys(Instance.value(instance));
    for (const [propertyName, schemaLocation] of dependentSchemas) {
      if (instanceKeys.includes(propertyName)) {
        outputs.push(evaluateSchema(schemaLocation, ast, instance, errorIndex, context));
      }
    }
    return outputs;
  },
  simpleApplicator: true
};

/**
 * @typedef {{
 *   minContains: number;
 *   maxContains: number;
 *   contains: string;
 * }} ContainsKeyword
 */
keywordHandlers["https://json-schema.org/keyword/contains"] = {
  evaluate(/** @type ContainsKeyword */contains, ast, instance, errorIndex, context) {
    /** @type NormalizedOutput[] */
    const outputs = [];
    if (Instance.typeOf(instance) !== "array") {
      return outputs;
    }
    let index = 0;
    for (const itemNode of Instance.iter(instance)) {
      context.evaluatedIndices.add(index++);
      outputs.push(evaluateSchema(contains.contains, ast, itemNode, errorIndex, context));
    }
    return outputs;
  }
};

keywordHandlers["https://json-schema.org/keyword/then"] = {
  evaluate(/** @type [string, string] */ [, then], ast, instance, errorIndex, context) {
    return [evaluateSchema(then, ast, instance, errorIndex, context)];
  },
  simpleApplicator: true
};

keywordHandlers["https://json-schema.org/keyword/else"] = {
  evaluate(/** @type [string, string] */ [, elseSchema], ast, instance, errorIndex, context) {
    return [evaluateSchema(elseSchema, ast, instance, errorIndex, context)];
  },
  simpleApplicator: true
};

keywordHandlers["https://json-schema.org/keyword/not"] = {
  evaluate(/** @type string */ not, ast, instance, errorIndex, context) {
    return [evaluateSchema(not, ast, instance, errorIndex, context)];
  }
};

keywordHandlers["https://json-schema.org/keyword/patternProperties"] = {
  evaluate(/** @type [string,string][] */ patternProperties, ast, instance, errorIndex, context) {
    /** @type NormalizedOutput[] */
    const outputs = [];
    if (Instance.typeOf(instance) !== "object") {
      return outputs;
    }

    for (const [pattern, schemaLocation] of patternProperties) {
      const regex = new RegExp(pattern);

      for (const [propertyNameNode, propertyValue] of Instance.entries(instance)) {
        const propertyName = /** @type string */ (Instance.value(propertyNameNode));
        if (regex.test(propertyName)) {
          context.evaluatedProperties.add(propertyName);
          outputs.push(evaluateSchema(schemaLocation, ast, propertyValue, errorIndex, context));
        }
      }
    }
    return outputs;
  },
  simpleApplicator: true
};

keywordHandlers["https://json-schema.org/keyword/propertyNames"] = {
  evaluate(/** @type string */ propertyNamesSchemaLocation, ast, instance, errorIndex, context) {
    /** @type NormalizedOutput[] */
    const outputs = [];
    if (Instance.typeOf(instance) !== "object") {
      return outputs;
    }
    for (const propertyName of Instance.keys(instance)) {
      outputs.push(evaluateSchema(propertyNamesSchemaLocation, ast, propertyName, errorIndex, context));
    }
    return outputs;
  },
  simpleApplicator: true
};
/**
 * @typedef {[
 *  regexExp: RegExp,
 *  schemaLocation: string
 * ]} AdditionalPropertiesKeyword
 */
keywordHandlers["https://json-schema.org/keyword/additionalProperties"] = {
  evaluate(/** @type AdditionalPropertiesKeyword */ [isDefinedProperty, additionalProperties], ast, instance, errorIndex, context) {
    /** @type NormalizedOutput[] */
    const outputs = [];
    if (Instance.typeOf(instance) !== "object") {
      return outputs;
    }
    for (const [propertyNameNode, property] of Instance.entries(instance)) {
      const propertyName = /** @type string */ (Instance.value(propertyNameNode));
      if (isDefinedProperty.test(propertyName)) {
        continue;
      }
      context.evaluatedProperties.add(propertyName);
      outputs.push(evaluateSchema(additionalProperties, ast, property, errorIndex, context));
    }
    return outputs;
  }
};

keywordHandlers["https://json-schema.org/keyword/unevaluatedItems"] = {
  evaluate(/** @type string[] */ [, unevaluatedItemsSchemaLocation], ast, instance, errorIndex, context) {
    /** @type NormalizedOutput[] */
    const outputs = [];
    if (Instance.typeOf(instance) !== "array") {
      return outputs;
    }

    let index = 0;
    for (const itemNode of Instance.iter(instance)) {
      if (!context.evaluatedIndices.has(index)) {
        outputs.push(evaluateSchema(unevaluatedItemsSchemaLocation, ast, itemNode, errorIndex, context));
      }
      index++;
    }
    return outputs;
  },
  simpleApplicator: true
};

keywordHandlers["https://json-schema.org/keyword/unevaluatedProperties"] = {
  evaluate(/** @type string[] */ [, unevaluatedPropertiesSchemaLocation], ast, instance, errorIndex, context) {
    /** @type NormalizedOutput[] */
    const outputs = [];
    if (Instance.typeOf(instance) !== "object") {
      return outputs;
    }

    for (const [propertyNameNode, propertyValue] of Instance.entries(instance)) {
      const propertyName = /** @type string */ (Instance.value(propertyNameNode));
      if (!context.evaluatedProperties.has(propertyName)) {
        outputs.push(evaluateSchema(unevaluatedPropertiesSchemaLocation, ast, propertyValue, errorIndex, context));
      }
    }
    return outputs;
  },
  simpleApplicator: true
};

keywordHandlers["https://json-schema.org/keyword/definitions"] = {
  appliesTo() {
    return false;
  }
};

keywordHandlers["https://json-schema.org/keyword/type"] = {
  appliesTo() {
    return true;
  }
};
keywordHandlers["https://json-schema.org/keyword/enum"] = {
  appliesTo() {
    return true;
  }
};
keywordHandlers["https://json-schema.org/keyword/const"] = {
  appliesTo() {
    return true;
  }
};
keywordHandlers["https://json-schema.org/keyword/required"] = {
  appliesTo(type) {
    return type === "object";
  }
};
keywordHandlers["https://json-schema.org/keyword/maxProperties"] = {
  appliesTo(type) {
    return type === "object";
  }
};
keywordHandlers["https://json-schema.org/keyword/minProperties"] = {
  appliesTo(type) {
    return type === "object";
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

keywordHandlers["https://json-schema.org/keyword/maxItems"] = {
  appliesTo(type) {
    return type === "array";
  }
};
keywordHandlers["https://json-schema.org/keyword/minItems"] = {
  appliesTo(type) {
    return type === "array";
  }
};
keywordHandlers["https://json-schema.org/keyword/uniqueItems"] = {
  appliesTo(type) {
    return type === "array";
  }
};
keywordHandlers["https://json-schema.org/keyword/maxContains"] = {
  appliesTo(type) {
    return type === "array";
  }
};
keywordHandlers["https://json-schema.org/keyword/minContains"] = {
  appliesTo(type) {
    return type === "array";
  }
};

keywordHandlers["https://json-schema.org/keyword/dependentRequired"] = {
  appliesTo(type) {
    return type === "object";
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
  const context = new EvaluationContext();
  return evaluateSchema(schemaUri, ast, value, errorIndex, context);
}
