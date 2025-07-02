import { normalizeOutputFormat } from "./normalizeOutputFormat/normalizeOutput.js";
import * as Schema from "@hyperjump/browser";
import { getSchema, getKeyword } from "@hyperjump/json-schema/experimental";
import * as Instance from "@hyperjump/json-pointer";
import leven from "leven";

/**
 * @import { Browser } from "@hyperjump/browser";
 * @import { SchemaDocument } from "@hyperjump/json-schema/experimental";
 * @import { Json } from "@hyperjump/json-pointer";
 * @import {betterJsonSchemaErrors, OutputUnit } from "./index.d.ts"
 */

/** @type betterJsonSchemaErrors */
export async function betterJsonSchemaErrors(instance, errorOutput, schemaUri) {
  const schema = await getSchema(schemaUri);
  const normalizedErrors = await normalizeOutputFormat(errorOutput, schema);
  const errors = [];
  for (const error of normalizedErrors) {
    const keywordHandler = getKeyword(error.keyword);
    if (keywordHandler.simpleApplicator) {
      continue;
    }

    /** @type Browser<SchemaDocument> */
    const schema = await getSchema(error.absoluteKeywordLocation);
    errors.push({
      message: getErrorMessage(error, schema, instance),
      instanceLocation: error.instanceLocation,
      schemaLocation: error.absoluteKeywordLocation
    });
  }

  return { errors };
}

/** @type (outputUnit: OutputUnit, schema: Browser<SchemaDocument>, instance: Json) => string */
const getErrorMessage = (outputUnit, schema, instance) => {
  if (outputUnit.keyword === "https://json-schema.org/keyword/minLength") {
    return `The instance should be at least ${Schema.value(schema)} characters`;
  }

  if (outputUnit.keyword === "https://json-schema.org/keyword/maxLength") {
    return `The instance should be at most ${Schema.value(schema)} characters long.`;
  }

  if (outputUnit.keyword === "https://json-schema.org/keyword/type") {
    const pointer = outputUnit.instanceLocation.replace(/^#/, "");
    const actualValue = Instance.get(pointer, instance);
    return `The instance should be of type "${Schema.value(schema)}" but found "${typeof actualValue}".`;
  }

  if (outputUnit.keyword === "https://json-schema.org/keyword/maximum") {
    return `The instance should be less than or equal to ${Schema.value(schema)}.`;
  }

  if (outputUnit.keyword === "https://json-schema.org/keyword/minimum") {
    return `The instance should be greater than or equal to ${Schema.value(schema)}.`;
  }

  if (outputUnit.keyword === "https://json-schema.org/keyword/exclusiveMaximum") {
    return `The instance should be less than ${Schema.value(schema)}.`;
  }

  if (outputUnit.keyword === "https://json-schema.org/keyword/exclusiveMinimum") {
    return `The instance should be greater than ${Schema.value(schema)}.`;
  }

  if (outputUnit.keyword === "https://json-schema.org/keyword/required") {
    /** @type {Set<string>} */
    const required = new Set(Schema.value(schema));
    const pointer = outputUnit.instanceLocation.replace(/^#/, "");
    const object = /** @type Object */ (Instance.get(pointer, instance));
    for (const propertyName of Object.keys(object)) {
      required.delete(propertyName);
    }

    return `"${outputUnit.instanceLocation}" is missing required property(s): ${[...required].join(", ")}.`;
  }

  if (outputUnit.keyword === "https://json-schema.org/keyword/multipleOf") {
    return `The instance should be of multiple of ${Schema.value(schema)}.`;
  }

  if (outputUnit.keyword === "https://json-schema.org/keyword/maxProperties") {
    return `The instance should have maximum ${Schema.value(schema)} properties.`;
  }

  if (outputUnit.keyword === "https://json-schema.org/keyword/minProperties") {
    return `The instance should have minimum ${Schema.value(schema)} properties.`;
  }

  if (outputUnit.keyword === "https://json-schema.org/keyword/const") {
    return `The instance should be equal to ${Schema.value(schema)}.`;
  }

  if (outputUnit.keyword === "https://json-schema.org/keyword/enum") {
    /** @type {Array<string>} */
    const allowedValues = Schema.value(schema);
    const pointer = outputUnit.instanceLocation.replace(/^#/, "");
    const currentValue = /** @type {string} */ (Instance.get(pointer, instance));

    const bestMatch = allowedValues
      .map((value) => ({
        value,
        weight: leven(value, currentValue)
      }))
      .sort((a, b) => a.weight - b.weight)[0];

    let suggestion = "";
    if (
      allowedValues.length === 1
      || (bestMatch && bestMatch.weight < bestMatch.value.length)
    ) {
      suggestion = ` Did you mean "${bestMatch.value}"?`;
      return `Unexpected value "${currentValue}". ${suggestion}`;
    }

    return `Unexpected value "${currentValue}". Expected one of: ${allowedValues.join(",")}.`;
  }

  if (outputUnit.keyword === "https://json-schema.org/keyword/pattern") {
    return `The instance should match the pattern: ${Schema.value(schema)}.`;
  }

  if (outputUnit.keyword === "https://json-schema.org/keyword/minItems") {
    return `The instance should have at least ${Schema.value(schema)} items.`;
  }

  if (outputUnit.keyword === "https://json-schema.org/keyword/maxItems") {
    return `The instance should have at most ${Schema.value(schema)} items.`;
  }

  if (outputUnit.keyword === "https://json-schema.org/keyword/uniqueItems") {
    return `The array should not contain duplicate items.`;
  }

  if (outputUnit.keyword === "https://json-schema.org/keyword/format") {
    return `The instance should match the format: ${Schema.value(schema)}.`;
  }
  throw Error("TODO: Error message not implemented");
};
