import { normalizeOutputFormat } from "./normalizeOutputFormat/normalizeOutput.js";
import * as Schema from "@hyperjump/browser";
import { getSchema } from "@hyperjump/json-schema/experimental";
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
    const errorObject = await errorHandler(normalizedErrors, instance);
    if (errorObject) {
      output.errors.push(...errorObject);
    }
  }

  return output;
}

/**
 * @typedef {(normalizedErrors: NormalizedError[], instance: Json) => Promise<ErrorObject[]>} ErrorHandler
 */

/** @type ErrorHandler[] */
const errorHandlers = [
  // async (normalizedErrors) => {
  //   /** @type ErrorObject[] */
  //   const errors = [];
  //   for (const error of normalizedErrors) {
  //     if (error.keyword === "https://json-schema.org/keyword/anyOf") {
  //       // const outputArray = applicatorChildErrors(outputUnit.absoluteKeywordLocation, normalizedErrors);
  //       // const failingTypeErrors = outputArray
  //       //   .filter((err) => err.keyword === "https://json-schema.org/keyword/type")
  //       //   .map((err) => err.instanceLocation);
  //       // const numberOfAlternatives = /** @type any[] */ (Schema.value(schema)).length;
  //       errors.push({
  //         message: `The instance must be a 'string' or 'number'. Found 'boolean'`,
  //         instanceLocation: error.instanceLocation,
  //         schemaLocation: error.absoluteKeywordLocation
  //       });
  //     }
  //   }

  //   return errors;
  // },

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

// /**
//  * Groups errors whose absoluteKeywordLocation starts with a given prefix.
//  * @param {string} parentKeywordLocation
//  * @param {NormalizedError[]} allErrors
//  * @returns {NormalizedError[]}
//  */
// function applicatorChildErrors(parentKeywordLocation, allErrors) {
//   return allErrors.filter((err) =>
//   /** @type string */ (err.absoluteKeywordLocation).startsWith(parentKeywordLocation + "/")
//   );
// }
