import { compile, getSchema } from "@hyperjump/json-schema/experimental";
import * as Instance from "@hyperjump/json-schema/instance/experimental";
import { pointerSegments } from "@hyperjump/json-pointer";
import * as Browser from "@hyperjump/browser";

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

/** @type (schemaLocation: string, instance: JsonNode, context: EvaluationContext) => NormalizedOutput */
const evaluateSchema = (schemaLocation, instance, context) => {
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

/** @type Record<string, KeywordHandler> */
const keywordHandlers = {};

keywordHandlers["https://json-schema.org/keyword/anyOf"] = {
  evaluate(/** @type string[] */ anyOf, instance, context) {
    /** @type NormalizedOutput[] */
    const errors = [];
    for (const schemaLocation of anyOf) {
      errors.push(evaluateSchema(schemaLocation, instance, context));
    }

    return errors;
  }
};

keywordHandlers["https://json-schema.org/keyword/allOf"] = {
  evaluate(/** @type string[] */ allOf, instance, context) {
    /** @type NormalizedOutput[] */
    const errors = [];
    for (const schemaLocation of allOf) {
      errors.push(evaluateSchema(schemaLocation, instance, context));
    }

    return errors;
  },
  simpleApplicator: true
};

keywordHandlers["https://json-schema.org/keyword/oneOf"] = {
  evaluate(/** @type string[] */ oneOf, instance, context) {
    /** @type NormalizedOutput[] */
    const errors = [];

    for (const schemaLocation of oneOf) {
      errors.push(evaluateSchema(schemaLocation, instance, context));
    }

    return errors;
  }
};

keywordHandlers["https://json-schema.org/keyword/ref"] = {
  evaluate(/** @type string */ ref, instance, context) {
    return [evaluateSchema(ref, instance, context)];
  },
  simpleApplicator: true
};

keywordHandlers["https://json-schema.org/keyword/properties"] = {
  evaluate(/** @type Record<string, string> */ properties, instance, /** @type EvaluatedPropertiesContext */ context) {
    /** @type NormalizedOutput[] */
    const errors = [];

    for (const propertyName in properties) {
      const propertyNode = Instance.step(propertyName, instance);
      if (!propertyNode) {
        continue;
      }
      errors.push(evaluateSchema(properties[propertyName], propertyNode, context));
      context.evaluatedProperties?.add(propertyName);
    }

    return errors;
  },
  simpleApplicator: true
};

keywordHandlers["https://json-schema.org/keyword/items"] = {
  evaluate(/** @type string[] */ [, itemsSchemaLocation], instance, /** @type EvaluatedItemsContext */ context) {
    /** @type NormalizedOutput[] */
    const errors = [];
    if (Instance.typeOf(instance) !== "array") {
      return errors;
    }

    let index = 0;
    for (const itemNode of Instance.iter(instance)) {
      errors.push(evaluateSchema(itemsSchemaLocation, itemNode, context));
      context.evaluatedItems?.add(index++);
    }
    return errors;
  },
  simpleApplicator: true
};

keywordHandlers["https://json-schema.org/keyword/prefixItems"] = {
  evaluate(/** @type string[] */ prefixItemsSchemaLocations, instance, /** @type EvaluatedItemsContext */ context) {
    /** @type NormalizedOutput[] */
    const outputs = [];
    if (Instance.typeOf(instance) !== "array") {
      return outputs;
    }
    for (const [index, schemaLocation] of prefixItemsSchemaLocations.entries()) {
      const itemNode = Instance.step(String(index), instance);
      if (itemNode) {
        outputs.push(evaluateSchema(schemaLocation, itemNode, context));
        context.evaluatedItems?.add(index);
      }
    }
    return outputs;
  },
  simpleApplicator: true
};

keywordHandlers["https://json-schema.org/keyword/dependentSchemas"] = {
  evaluate(/** @type [string, string][] */dependentSchemas, instance, context) {
    /** @type NormalizedOutput[] */
    const outputs = [];
    if (Instance.typeOf(instance) !== "object") {
      return outputs;
    }
    const instanceKeys = Object.keys(Instance.value(instance));
    for (const [propertyName, schemaLocation] of dependentSchemas) {
      if (instanceKeys.includes(propertyName)) {
        outputs.push(evaluateSchema(schemaLocation, instance, context));
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
  evaluate(/** @type ContainsKeyword */contains, instance, /** @type EvaluatedItemsContext */context) {
    /** @type NormalizedOutput[] */
    const outputs = [];
    if (Instance.typeOf(instance) !== "array") {
      return outputs;
    }
    let index = 0;
    for (const itemNode of Instance.iter(instance)) {
      outputs.push(evaluateSchema(contains.contains, itemNode, context));
      context.evaluatedItems?.add(index++);
    }
    return outputs;
  }
};

keywordHandlers["https://json-schema.org/keyword/then"] = {
  evaluate(/** @type [string, string] */ [, then], instance, context) {
    return [evaluateSchema(then, instance, context)];
  },
  simpleApplicator: true
};

keywordHandlers["https://json-schema.org/keyword/else"] = {
  evaluate(/** @type [string, string] */ [, elseSchema], instance, context) {
    return [evaluateSchema(elseSchema, instance, context)];
  },
  simpleApplicator: true
};

keywordHandlers["https://json-schema.org/keyword/not"] = {
  evaluate(/** @type string */ not, instance, context) {
    return [evaluateSchema(not, instance, context)];
  }
};

keywordHandlers["https://json-schema.org/keyword/patternProperties"] = {
  evaluate(/** @type [RegExp, string][] */ patternProperties, instance, /** @type EvaluatedPropertiesContext */ context) {
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
          outputs.push(evaluateSchema(schemaLocation, propertyValue, context));
          context.evaluatedProperties?.add(propertyName);
        }
      }
    }
    return outputs;
  },
  simpleApplicator: true
};

keywordHandlers["https://json-schema.org/keyword/propertyNames"] = {
  evaluate(/** @type string */ propertyNamesSchemaLocation, instance, context) {
    /** @type NormalizedOutput[] */
    const outputs = [];
    if (Instance.typeOf(instance) !== "object") {
      return outputs;
    }
    for (const propertyName of Instance.keys(instance)) {
      outputs.push(evaluateSchema(propertyNamesSchemaLocation, propertyName, context));
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
  evaluate(/** @type AdditionalPropertiesKeyword */ [isDefinedProperty, additionalProperties], instance, /** @type EvaluatedPropertiesContext */ context) {
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
      outputs.push(evaluateSchema(additionalProperties, property, context));
      context.evaluatedProperties?.add(propertyName);
    }
    return outputs;
  },
  simpleApplicator: true
};

keywordHandlers["https://json-schema.org/keyword/unevaluatedItems"] = {
  evaluate(/** @type string[] */ [schemaUrl, unevaluatedItems], instance, /** @type EvaluatedItemsContext */ context) {
    /** @type NormalizedOutput[] */
    const outputs = [];

    if (Instance.typeOf(instance) !== "array") {
      return outputs;
    }

    // Because order matters, we re-evaluate this schema skipping this keyword
    // just to collect all the evalauted properties.
    if (context.rootSchema === schemaUrl) {
      return outputs;
    }
    const evaluatedItemsPlugin = new EvaluatedItemsPlugin(schemaUrl);
    evaluateSchema(schemaUrl, instance, {
      ...context,
      plugins: [...context.ast.plugins, evaluatedItemsPlugin]
    });
    const evaluatedItems = evaluatedItemsPlugin.evaluatedItems;

    let index = 0;
    for (const item of Instance.iter(instance)) {
      if (!evaluatedItems.has(index)) {
        outputs.push(evaluateSchema(unevaluatedItems, item, context));
        context.evaluatedItems?.add(index);
      }

      index++;
    }

    return outputs;
  },
  simpleApplicator: true
};

/**
 * @typedef {{
 *   rootSchema: string;
 *   evaluatedItems: Set<number>;
 *   schemaEvaluatedItems: Set<number>;
 * } & EvaluationContext} EvaluatedItemsContext
 */

class EvaluatedItemsPlugin {
  /**
   * @param {string} rootSchema
   */
  constructor(rootSchema) {
    this.rootSchema = rootSchema;
    this.evaluatedItems = new Set();
  }

  /** @type NonNullable<EvaluationPlugin<EvaluatedItemsContext>["beforeSchema"]> */
  beforeSchema(_url, _instance, context) {
    context.evaluatedItems ??= new Set();
    context.schemaEvaluatedItems ??= new Set();
  }

  /** @type NonNullable<EvaluationPlugin<EvaluatedItemsContext>["beforeKeyword"]> */
  beforeKeyword(_node, _instance, context) {
    context.rootSchema = this.rootSchema;
    context.evaluatedItems = new Set();
  }

  /** @type NonNullable<EvaluationPlugin<EvaluatedItemsContext>["afterKeyword"]> */
  afterKeyword(_node, _instance, context, valid, schemaContext) {
    if (valid) {
      for (const property of context.evaluatedItems) {
        schemaContext.schemaEvaluatedItems.add(property);
      }
    }
  }

  /** @type NonNullable<EvaluationPlugin<EvaluatedItemsContext>["afterSchema"]> */
  afterSchema(_url, _instance, context, valid) {
    if (valid) {
      for (const property of context.schemaEvaluatedItems) {
        context.evaluatedItems.add(property);
      }
    }

    this.evaluatedItems = context.evaluatedItems;
  }
}

keywordHandlers["https://json-schema.org/keyword/unevaluatedProperties"] = {
  evaluate(/** @type [string, string] */ [schemaUrl, unevaluatedProperties], instance, /** @type EvaluatedPropertiesContext */ context) {
    /** @type NormalizedOutput[] */
    const outputs = [];

    if (Instance.typeOf(instance) !== "object") {
      return outputs;
    }

    // Because order matters, we re-evaluate this schema skipping this keyword
    // just to collect all the evalauted properties.
    if (context.rootSchema === schemaUrl) {
      return outputs;
    }
    const evaluatedPropertiesPlugin = new EvaluatedPropertiesPlugin(schemaUrl);
    evaluateSchema(schemaUrl, instance, {
      ...context,
      plugins: [...context.ast.plugins, evaluatedPropertiesPlugin]
    });
    const evaluatedProperties = evaluatedPropertiesPlugin.evaluatedProperties;

    for (const [propertyNameNode, property] of Instance.entries(instance)) {
      const propertyName = /** @type string */ (Instance.value(propertyNameNode));
      if (evaluatedProperties.has(propertyName)) {
        continue;
      }

      outputs.push(evaluateSchema(unevaluatedProperties, property, context));
      context.evaluatedProperties?.add(propertyName);
    }
    return outputs;
  },
  simpleApplicator: true
};

/**
 * @typedef {{
 *   rootSchema: string;
 *   evaluatedProperties: Set<string>;
 *   schemaEvaluatedProperties: Set<string>;
 * } & EvaluationContext} EvaluatedPropertiesContext
 */

class EvaluatedPropertiesPlugin {
  /**
   * @param {string} rootSchema
   */
  constructor(rootSchema) {
    this.rootSchema = rootSchema;
    this.evaluatedProperties = new Set();
  }

  /** @type NonNullable<EvaluationPlugin<EvaluatedPropertiesContext>["beforeSchema"]> */
  beforeSchema(_url, _instance, context) {
    context.evaluatedProperties ??= new Set();
    context.schemaEvaluatedProperties ??= new Set();
  }

  /** @type NonNullable<EvaluationPlugin<EvaluatedPropertiesContext>["beforeKeyword"]> */
  beforeKeyword(_node, _instance, context) {
    context.rootSchema = this.rootSchema;
    context.evaluatedProperties = new Set();
  }

  /** @type NonNullable<EvaluationPlugin<EvaluatedPropertiesContext>["afterKeyword"]> */
  afterKeyword(_node, _instance, context, valid, schemaContext) {
    if (valid) {
      for (const property of context.evaluatedProperties) {
        schemaContext.schemaEvaluatedProperties.add(property);
      }
    }
  }

  /** @type NonNullable<EvaluationPlugin<EvaluatedPropertiesContext>["afterSchema"]> */
  afterSchema(_url, _instance, context, valid) {
    if (valid) {
      for (const property of context.schemaEvaluatedProperties) {
        context.evaluatedProperties.add(property);
      }
    }

    this.evaluatedProperties = context.evaluatedProperties;
  }
}

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
    const instanceLocation = /** @type string */ (normalizeInstanceLocation(errorOutputUnit.instanceLocation, errorOutputUnit.absoluteKeywordLocation));
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

/** @type {(location: string | undefined, keywordLocation: string | undefined) => string | undefined} */
function normalizeInstanceLocation(location, keywordLocation) {
  if (typeof location !== "string") {
    return location;
  }

  if (location.includes("*/")) {
    return location.startsWith("#") ? location : `#${location}`;
  }

  const isPropertyNameError = keywordLocation?.includes("/propertyNames/");
  const purePointer = location.startsWith("#") ? location.substring(1) : location;

  if (isPropertyNameError) {
    const segments = [...pointerSegments(purePointer)];
    const key = segments.pop() ?? "";
    const parentPath = segments.join("/");
    return `#${parentPath}*/${key}`;
  } else {
    return `#${purePointer}`;
  }
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
