import { normalizeOutputFormat } from "./normalizeOutputFormat/normalizeOutput.js";
import * as Schema from "@hyperjump/browser";
import { getSchema } from "@hyperjump/json-schema/experimental";

/**
 * @import { Browser } from "@hyperjump/browser";
 * @import { SchemaDocument } from "@hyperjump/json-schema/experimental";
 * @import { Json } from "@hyperjump/json-pointer";
 * @import {betterJsonSchemaErrors, OutputUnit } from "./index.d.ts"
 */

/** @type betterJsonSchemaErrors */
export async function betterJsonSchemaErrors(instance, errorOutput, options = {}) {
  const normalizedErrors = await normalizeOutputFormat(errorOutput, options.schemaUri);
  const errors = [];
  for (const error of normalizedErrors) {
    if (skip.has(error.keyword)) {
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
const getErrorMessage = (outputUnit, schema) => {
  if (outputUnit.keyword === "https://json-schema.org/keyword/minLength") {
    return `The instance should be at least ${Schema.value(schema)} characters`;
  }

  throw Error("TODO: Error message not implemented");
  // if (outputUnit.keyword === "https://json-schema.org/keyword/required") {
  //   const schemaDocument = await Schema.get(outputUnit.absoluteKeywordLocation);
  //   const required = new Set(Schema.value(schemaDocument));
  //   const object = Instance.get(outputUnit.instanceLocation, instance);
  //   for (const propertyName of Instance.keys(object)) {
  //     required.delete(propertyName);
  //   }

  //   return `"${outputUnit.instanceLocation}" is missing required property(s): ${[...required]}. Schema location: ${outputUnit.absoluteKeywordLocation}`;
  // } else {
  //   // Default message
  //   return `"${outputUnit.instanceLocation}" fails schema constraint ${outputUnit.absoluteKeywordLocation}`;
  // }
};

// These are probably not very useful for human readable messaging, so we'll skip them.
const skip = new Set([
  "https://json-schema.org/evaluation/validate",
  "https://json-schema.org/keyword/ref",
  "https://json-schema.org/keyword/properties",
  "https://json-schema.org/keyword/patternProperties",
  "https://json-schema.org/keyword/items",
  "https://json-schema.org/keyword/prefixItems",
  "https://json-schema.org/keyword/if",
  "https://json-schema.org/keyword/then",
  "https://json-schema.org/keyword/else"
]);
