import { normalizeOutputFormat } from "./normalizeOutputFormat/normalizeOutput.js";
import * as Schema from "@hyperjump/browser";
import { getKeywordByName, getSchema } from "@hyperjump/json-schema/experimental";
import * as Instance from "@hyperjump/json-pointer";
import leven from "leven";

/**
 * @import { Browser } from "@hyperjump/browser";
 * @import { SchemaDocument } from "@hyperjump/json-schema/experimental";
 * @import { Json } from "@hyperjump/json-pointer";
 * @import {betterJsonSchemaErrors, NormalizedError, OutputUnit, BetterJsonSchemaErrors, ErrorObject } from "./index.d.ts"
 */

/** @type betterJsonSchemaErrors */
export async function betterJsonSchemaErrors(instance, errorOutput, schemaUri) {
  const schema = await getSchema(schemaUri);
  const normalizedErrors = await normalizeOutputFormat(errorOutput, schema);
  /** @type BetterJsonSchemaErrors */
  const output = { errors: [] };

  for (const errorHandler of errorHandlers) {
    const errorObject = await errorHandler(normalizedErrors, instance, schema);
    if (errorObject) {
      output.errors.push(...errorObject);
    }
  }

  return output;
}

/**
 * @typedef {(normalizedErrors: NormalizedError[], instance: Json, schema: Browser<SchemaDocument>) => Promise<ErrorObject[]>} ErrorHandler
 */

/** @type ErrorHandler[] */
const errorHandlers = [

  // `anyOf` handler
  async (normalizedErrors, instance, schema) => {
    /** @type ErrorObject[] */
    const errors = [];

    for (const error of normalizedErrors) {
      if (error.keyword === "https://json-schema.org/keyword/anyOf") {
        const anyOfSchema = await getSchema(error.absoluteKeywordLocation);
        const numberOfAlternatives = Schema.length(anyOfSchema);
        // const discriminatorKeys = await findDiscriminatorKeywords(anyOfSchema);
        const outputArray = applicatorChildErrors(error.absoluteKeywordLocation, normalizedErrors);

        const keyword = getKeywordByName("type", schema.document.dialectId);
        const matchingKeywordErrors = outputArray.filter((e) => e.keyword === keyword.id);

        if (isOnlyOneTypeValid(matchingKeywordErrors, numberOfAlternatives)) {
          // all the matchingKeywordErrors are filter out from the outputArray and push in the normalizedErrors array to produce the output.
          const remainingErrors = outputArray.filter((err) => {
            return !matchingKeywordErrors.some((matchingErr) => {
              return matchingErr.absoluteKeywordLocation === err.absoluteKeywordLocation;
            });
          });
          normalizedErrors.push(...remainingErrors);
        } else if (matchingKeywordErrors.length === numberOfAlternatives) {
          const noMatchFound = await noDiscriminatorKeyMatchError(matchingKeywordErrors, error, instance);
          errors.push(noMatchFound);
        } else if (false) {
          // Discriminator cases
        } else if (jsonTypeOf(instance) === "object") {
          // Number of matching properties
          const selectedAlternative = outputArray.find((error) => {
            return error.keyword = "https://json-schema.org/keyword/properties";
          })?.absoluteKeywordLocation;
          const remainingErrors = outputArray.filter((err) => {
            return err.absoluteKeywordLocation.startsWith(/** @type string */ (selectedAlternative));
          });
          normalizedErrors.push(...remainingErrors);
        } else {
          // I don't know yet what to do

          // {
          //   "$schema": "https://json-schema.org/draft/2020-12/schema",
          //   "anyOf": [
          //     { "required": [ "foo" ] },
          //     { "required": [ "bar" ] }
          //   ]
          // }
        }
      }
    }
    return errors;
  },

  async (normalizedErrors) => {
    /** @type ErrorObject[] */
    const errors = [];
    for (const error of normalizedErrors) {
      if (error.keyword === "https://json-schema.org/keyword/minLength") {
        const keyword = await getSchema(error.absoluteKeywordLocation);
        errors.push({
          message: `The instance should be at least ${Schema.value(keyword)} characters`,
          instanceLocation: error.instanceLocation,
          schemaLocation: error.absoluteKeywordLocation
        });
      }
    }

    return errors;
  },

  async (normalizeErrors) => {
    /** @type ErrorObject[] */
    const errors = [];
    for (const error of normalizeErrors) {
      if (error.keyword === "https://json-schema.org/keyword/maxLength") {
        const keyword = await getSchema(error.absoluteKeywordLocation);
        errors.push({
          message: `The instance should be atmost ${Schema.value(keyword)} characters long.`,
          instanceLocation: error.instanceLocation,
          schemaLocation: error.absoluteKeywordLocation
        });
      }
    }

    return errors;
  },

  async (normalizeErrors, instance) => {
    /** @type ErrorObject[] */
    const errors = [];
    for (const error of normalizeErrors) {
      if (error.keyword === "https://json-schema.org/keyword/type") {
        const keyword = await getSchema(error.absoluteKeywordLocation);
        const pointer = error.instanceLocation.replace(/^#/, "");
        const actualValue = Instance.get(pointer, instance);
        errors.push({
          message: `The instance should be of type "${Schema.value(keyword)}" but found "${typeof actualValue}".`,
          instanceLocation: error.instanceLocation,
          schemaLocation: error.absoluteKeywordLocation
        });
      }
    }

    return errors;
  },

  async (normalizeErrors) => {
    /** @type ErrorObject[] */
    const errors = [];
    for (const error of normalizeErrors) {
      if (error.keyword === "https://json-schema.org/keyword/maximum") {
        const keyword = await getSchema(error.absoluteKeywordLocation);
        errors.push({
          message: `The instance should be less than or equal to ${Schema.value(keyword)}.`,
          instanceLocation: error.instanceLocation,
          schemaLocation: error.absoluteKeywordLocation
        });
      }
    }

    return errors;
  },

  async (normalizeErrors) => {
    /** @type ErrorObject[] */
    const errors = [];
    for (const error of normalizeErrors) {
      if (error.keyword === "https://json-schema.org/keyword/minimum") {
        const keyword = await getSchema(error.absoluteKeywordLocation);
        errors.push({
          message: `The instance should be greater than or equal to ${Schema.value(keyword)}.`,
          instanceLocation: error.instanceLocation,
          schemaLocation: error.absoluteKeywordLocation
        });
      }
    }

    return errors;
  },

  async (normalizeErrors) => {
    /** @type ErrorObject[] */
    const errors = [];
    for (const error of normalizeErrors) {
      if (error.keyword === "https://json-schema.org/keyword/exclusiveMinimum") {
        const keyword = await getSchema(error.absoluteKeywordLocation);
        errors.push({
          message: `The instance should be greater than ${Schema.value(keyword)}.`,
          instanceLocation: error.instanceLocation,
          schemaLocation: error.absoluteKeywordLocation
        });
      }
    }

    return errors;
  },

  async (normalizeErrors) => {
    /** @type ErrorObject[] */
    const errors = [];
    for (const error of normalizeErrors) {
      if (error.keyword === "https://json-schema.org/keyword/exclusiveMaximum") {
        const keyword = await getSchema(error.absoluteKeywordLocation);
        errors.push({
          message: `The instance should be less than ${Schema.value(keyword)}.`,
          instanceLocation: error.instanceLocation,
          schemaLocation: error.absoluteKeywordLocation
        });
      }
    }

    return errors;
  },

  async (normalizeErrors, instance) => {
    /** @type ErrorObject[] */
    const errors = [];
    for (const error of normalizeErrors) {
      if (error.keyword === "https://json-schema.org/keyword/required") {
        const keyword = await getSchema(error.absoluteKeywordLocation);
        /** @type {Set<string>} */
        const required = new Set(Schema.value(keyword));
        const pointer = error.instanceLocation.replace(/^#/, "");
        const object = /** @type Object */ (Instance.get(pointer, instance));
        for (const propertyName of Object.keys(object)) {
          required.delete(propertyName);
        }
        errors.push({
          message: `"${error.instanceLocation}" is missing required property(s): ${[...required].join(", ")}.`,
          instanceLocation: error.instanceLocation,
          schemaLocation: error.absoluteKeywordLocation
        });
      }
    }

    return errors;
  },

  async (normalizedErrors) => {
    /** @type ErrorObject[] */
    const errors = [];
    for (const error of normalizedErrors) {
      if (error.keyword === "https://json-schema.org/keyword/multipleOf") {
        const keyword = await getSchema(error.absoluteKeywordLocation);
        errors.push({
          message: `The instance should be of multiple of ${Schema.value(keyword)}.`,
          instanceLocation: error.instanceLocation,
          schemaLocation: error.absoluteKeywordLocation
        });
      }
    }

    return errors;
  },

  async (normalizedErrors) => {
    /** @type ErrorObject[] */
    const errors = [];
    for (const error of normalizedErrors) {
      if (error.keyword === "https://json-schema.org/keyword/maxProperties") {
        const keyword = await getSchema(error.absoluteKeywordLocation);
        errors.push({
          message: `The instance should have maximum ${Schema.value(keyword)} properties.`,
          instanceLocation: error.instanceLocation,
          schemaLocation: error.absoluteKeywordLocation
        });
      }
    }

    return errors;
  },

  async (normalizedErrors) => {
    /** @type ErrorObject[] */
    const errors = [];
    for (const error of normalizedErrors) {
      if (error.keyword === "https://json-schema.org/keyword/minProperties") {
        const keyword = await getSchema(error.absoluteKeywordLocation);
        errors.push({
          message: `The instance should have minimum ${Schema.value(keyword)} properties.`,
          instanceLocation: error.instanceLocation,
          schemaLocation: error.absoluteKeywordLocation
        });
      }
    }

    return errors;
  },

  async (normalizedErrors) => {
    /** @type ErrorObject[] */
    const errors = [];
    for (const error of normalizedErrors) {
      if (error.keyword === "https://json-schema.org/keyword/const") {
        const keyword = await getSchema(error.absoluteKeywordLocation);
        errors.push({
          message: `The instance should be equal to ${Schema.value(keyword)}.`,
          instanceLocation: error.instanceLocation,
          schemaLocation: error.absoluteKeywordLocation
        });
      }
    }

    return errors;
  },

  async (normalizedErrors, instance) => {
    /** @type ErrorObject[] */
    const errors = [];
    for (const error of normalizedErrors) {
      if (error.keyword === "https://json-schema.org/keyword/enum") {
        const keyword = await getSchema(error.absoluteKeywordLocation);

        /** @type {Array<string>} */
        const allowedValues = Schema.value(keyword);
        const pointer = error.instanceLocation.replace(/^#/, "");
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
          errors.push({
            message: `Unexpected value "${currentValue}". ${suggestion}`,
            instanceLocation: error.instanceLocation,
            schemaLocation: error.absoluteKeywordLocation
          });
          continue;
        }

        errors.push({
          message: `Unexpected value "${currentValue}". Expected one of: ${allowedValues.join(",")}.`,
          instanceLocation: error.instanceLocation,
          schemaLocation: error.absoluteKeywordLocation
        });
      }
    }
    return errors;
  },

  async (normalizedErrors) => {
    /** @type ErrorObject[] */
    const errors = [];
    for (const error of normalizedErrors) {
      if (error.keyword === "https://json-schema.org/keyword/maxItems") {
        const keyword = await getSchema(error.absoluteKeywordLocation);
        errors.push({
          // can improve this by adding the how many items are more in the arrary and for unique what are the duplicate items.
          message: `The instance should contain maximum ${Schema.value(keyword)} items in the array.`,
          instanceLocation: error.instanceLocation,
          schemaLocation: error.absoluteKeywordLocation
        });
      }
    }
    return errors;
  },

  async (normalizedErrors) => {
    /** @type ErrorObject[] */
    const errors = [];
    for (const error of normalizedErrors) {
      if (error.keyword === "https://json-schema.org/keyword/minItems") {
        const keyword = await getSchema(error.absoluteKeywordLocation);
        errors.push({
          message: `The instance should contain minimum ${Schema.value(keyword)} items in the array.`,
          instanceLocation: error.instanceLocation,
          schemaLocation: error.absoluteKeywordLocation
        });
      }
    }
    return errors;
  },

  // eslint-disable-next-line @typescript-eslint/require-await
  async (normalizedErrors) => {
    /** @type ErrorObject[] */
    const errors = [];
    for (const error of normalizedErrors) {
      if (error.keyword === "https://json-schema.org/keyword/uniqueItems") {
        errors.push({
          message: `The instance should have unique items in the array.`,
          instanceLocation: error.instanceLocation,
          schemaLocation: error.absoluteKeywordLocation
        });
      }
    }
    return errors;
  },

  async (normalizedErrors) => {
    /** @type ErrorObject[] */
    const errors = [];
    for (const error of normalizedErrors) {
      if (error.keyword === "https://json-schema.org/keyword/format") {
        const keyword = await getSchema(error.absoluteKeywordLocation);
        errors.push({
          message: `The instance should match the format: ${Schema.value(keyword)}.`,
          instanceLocation: error.instanceLocation,
          schemaLocation: error.absoluteKeywordLocation
        });
      }
    }
    return errors;
  },

  async (normalizedErrors) => {
    /** @type ErrorObject[] */
    const errors = [];
    for (const error of normalizedErrors) {
      if (error.keyword === "https://json-schema.org/keyword/pattern") {
        const keyword = await getSchema(error.absoluteKeywordLocation);
        errors.push({
          message: `The instance should match the pattern: ${Schema.value(keyword)}.`,
          instanceLocation: error.instanceLocation,
          schemaLocation: error.absoluteKeywordLocation
        });
      }
    }
    return errors;
  }
];

/**
 * Groups errors whose absoluteKeywordLocation starts with a given prefix.
 * @param {string} parentKeywordLocation
 * @param {NormalizedError[]} allErrors
 * @returns {NormalizedError[]}
 */
function applicatorChildErrors(parentKeywordLocation, allErrors) {
  const matching = [];

  for (let i = allErrors.length - 1; i >= 0; i--) {
    const err = allErrors[i];
    if (err.absoluteKeywordLocation.startsWith(parentKeywordLocation + "/")) {
      matching.push(err);
      allErrors.splice(i, 1);
    }
  }

  return matching;
}

/**
 * @param {NormalizedError[]} matchingErrors
 * @param {number} numOfAlternatives
 * @returns {boolean}
 */
function isOnlyOneTypeValid(matchingErrors, numOfAlternatives) {
  const typeErrors = matchingErrors.filter(
    (e) => e.keyword === "https://json-schema.org/keyword/type"
  );
  return numOfAlternatives - typeErrors.length === 1;
}

/**
 * @param {NormalizedError[]} matchingErrors
 * @param {NormalizedError} parentError
 * @param {Json} instance
 * @returns {Promise<ErrorObject>}
 */
async function noDiscriminatorKeyMatchError(matchingErrors, parentError, instance) {
  const expectedTypes = [];

  for (const err of matchingErrors) {
    const typeSchema = await getSchema(err.absoluteKeywordLocation);
    const typeValue = /** @type any[] */ (Schema.value(typeSchema));
    expectedTypes.push(typeValue);
  }

  const pointer = parentError.instanceLocation.replace(/^#/, "");
  const actualValue = /** @type Json */ (Instance.get(pointer, instance));
  const actualType = jsonTypeOf(actualValue);

  const expectedString = expectedTypes.join(" or ");

  return {
    message: `The instance must be a ${expectedString}. Found '${actualType}'.`,
    instanceLocation: parentError.instanceLocation,
    schemaLocation: parentError.absoluteKeywordLocation
  };
}

/** @type (value: Json) => "null" | "boolean" | "number" | "string" | "array" | "object" | "undefined" */
const jsonTypeOf = (value) => {
  const jsType = typeof value;

  switch (jsType) {
    case "number":
    case "string":
    case "boolean":
    case "undefined":
      return jsType;
    case "object":
      if (Array.isArray(value)) {
        return "array";
      } else if (value === null) {
        return "null";
      } else if (Object.getPrototypeOf(value) === Object.prototype) {
        return "object";
      }
    default: {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
      const type = jsType === "object" ? Object.getPrototypeOf(value).constructor.name ?? "anonymous" : jsType;
      throw Error(`Not a JSON compatible type: ${type}`);
    }
  }
};
