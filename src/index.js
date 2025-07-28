import * as Schema from "@hyperjump/browser";
import { getSchema } from "@hyperjump/json-schema/experimental";
import * as Instance from "@hyperjump/json-schema/instance/experimental";
import leven from "leven";
import { normalizedErrorOuput } from "./normalizeOutputFormat/normalizeOutput.js";

/**
 * @import { Browser } from "@hyperjump/browser";
 * @import { SchemaDocument } from "@hyperjump/json-schema/experimental";
 * @import { JsonNode } from "@hyperjump/json-schema/instance/experimental";
 * @import { Json } from "@hyperjump/json-pointer";
 * @import {betterJsonSchemaErrors, NormalizedError, OutputUnit, BetterJsonSchemaErrors, ErrorObject } from "./index.d.ts"
 * @import { NormalizedOutput, InstanceOutput } from "./normalizeOutputFormat/normalizeOutput.js"
 */

/** @type betterJsonSchemaErrors */
export async function betterJsonSchemaErrors(instance, errorOutput, schemaUri) {
  const normalizedErrors = await normalizedErrorOuput(instance, errorOutput, schemaUri);
  const rootInstance = Instance.fromJs(instance);
  return { errors: await getErrors(normalizedErrors, rootInstance) };
}

/** @type (normalizedErrors: NormalizedOutput, rootInstance: JsonNode) => Promise<ErrorObject[]> */
const getErrors = async (normalizedErrors, rootInstance) => {
  /** @type ErrorObject[] */
  const errors = [];

  for (const instanceLocation in normalizedErrors) {
    const instance = Instance.get(instanceLocation, rootInstance);
    for (const errorHandler of errorHandlers) {
      const errorObject = await errorHandler(normalizedErrors[instanceLocation], /** @type JsonNode */ (instance));
      if (errorObject) {
        errors.push(...errorObject);
      }
    }
  }

  return errors;
};

/**
 * @typedef {(normalizedErrors: InstanceOutput, instance: JsonNode) => Promise<ErrorObject[]>} ErrorHandler
 */

/** @type ErrorHandler[] */
const errorHandlers = [

  async (normalizedErrors, instance) => {
    /** @type ErrorObject[] */
    const errors = [];

    if (normalizedErrors["https://json-schema.org/keyword/anyOf"]) {
      for (const schemaLocation in normalizedErrors["https://json-schema.org/keyword/anyOf"]) {
        /** @type NormalizedOutput[] */
        const alternatives = [];
        const allAlternatives = /** @type NormalizedOutput[] */ (normalizedErrors["https://json-schema.org/keyword/anyOf"][schemaLocation]);
        for (const alternative of allAlternatives) {
          if (Object.values(alternative[Instance.uri(instance)]["https://json-schema.org/keyword/type"]).every((valid) => valid)) {
            alternatives.push(alternative);
          }
        }
        // case 1 where no. alternative matched the type of the instance.
        if (alternatives.length === 0) {
          /** @type Set<string> */
          const expectedTypes = new Set();

          for (const alternative of allAlternatives) {
            for (const instanceLocation in alternative) {
              if (instanceLocation === Instance.uri(instance)) {
                for (const schemaLocation in alternative[instanceLocation]["https://json-schema.org/keyword/type"]) {
                  const keyword = await getSchema(schemaLocation);
                  const expectedType = /** @type string */ (Schema.value(keyword));
                  expectedTypes.add(expectedType);
                }
              }
            }
          }
          errors.push({
            message: `The instance must be a ${[...expectedTypes].join(", ")}. Found '${Instance.typeOf(instance)}'.`,
            instanceLocation: Instance.uri(instance),
            schemaLocation: schemaLocation
          });
        } else if (alternatives.length === 1) {
          return getErrors(alternatives[0], instance);
        }

        // const anyOfSchema = await getSchema(schemaLocation);
        // const numberOfAlternatives = Schema.length(anyOfSchema);
        // Instance.typeOf(instance);
        // const instance = Instance.fromJs(instance)
        // if(numberOfAlternatives == )
        // errors.push({
        //   message: `The instance should be at least ${Schema.value(keyword)} characters`,
        //   instanceLocation: Instance.uri(instance),
        //   schemaLocation: schemaLocation
        // });
      }
    }

    return errors;
  },

  async (normalizedErrors, instance) => {
    /** @type ErrorObject[] */
    const errors = [];

    if (normalizedErrors["https://json-schema.org/keyword/minLength"]) {
      for (const schemaLocation in normalizedErrors["https://json-schema.org/keyword/minLength"]) {
        if (!normalizedErrors["https://json-schema.org/keyword/minLength"][schemaLocation]) {
          const keyword = await getSchema(schemaLocation);
          errors.push({
            message: `The instance should be at least ${Schema.value(keyword)} characters`,
            instanceLocation: Instance.uri(instance),
            schemaLocation: schemaLocation
          });
        }
      }
    }

    return errors;
  },

  async (normalizedErrors, instance) => {
    /** @type ErrorObject[] */
    const errors = [];

    if (normalizedErrors["https://json-schema.org/keyword/maxLength"]) {
      for (const schemaLocation in normalizedErrors["https://json-schema.org/keyword/maxLength"]) {
        if (!normalizedErrors["https://json-schema.org/keyword/maxLength"][schemaLocation]) {
          const keyword = await getSchema(schemaLocation);
          errors.push({
            message: `The instance should be atmost ${Schema.value(keyword)} characters long.`,
            instanceLocation: Instance.uri(instance),
            schemaLocation: schemaLocation
          });
        }
      }
    }

    return errors;
  },

  async (normalizedErrors, instance) => {
    /** @type ErrorObject[] */
    const errors = [];

    if (normalizedErrors["https://json-schema.org/keyword/type"]) {
      for (const schemaLocation in normalizedErrors["https://json-schema.org/keyword/type"]) {
        if (!normalizedErrors["https://json-schema.org/keyword/type"][schemaLocation]) {
          const keyword = await getSchema(schemaLocation);
          errors.push({
            message: `The instance should be of type "${Schema.value(keyword)}" but found "${Instance.typeOf(instance)}".`,
            instanceLocation: Instance.uri(instance),
            schemaLocation: schemaLocation
          });
        }
      }
    }

    return errors;
  },

  async (normalizedErrors, instance) => {
    /** @type ErrorObject[] */
    const errors = [];

    if (normalizedErrors["https://json-schema.org/keyword/maximum"]) {
      for (const schemaLocation in normalizedErrors["https://json-schema.org/keyword/maximum"]) {
        if (!normalizedErrors["https://json-schema.org/keyword/maximum"][schemaLocation]) {
          const keyword = await getSchema(schemaLocation);
          errors.push({
            message: `The instance should be less than or equal to ${Schema.value(keyword)}.`,
            instanceLocation: Instance.uri(instance),
            schemaLocation: schemaLocation
          });
        }
      }
    }

    return errors;
  },

  async (normalizedErrors, instance) => {
    /** @type ErrorObject[] */
    const errors = [];

    if (normalizedErrors["https://json-schema.org/keyword/minimum"]) {
      for (const schemaLocation in normalizedErrors["https://json-schema.org/keyword/minimum"]) {
        if (!normalizedErrors["https://json-schema.org/keyword/minimum"][schemaLocation]) {
          const keyword = await getSchema(schemaLocation);
          errors.push({
            message: `The instance should be greater than or equal to ${Schema.value(keyword)}.`,
            instanceLocation: Instance.uri(instance),
            schemaLocation: schemaLocation
          });
        }
      }
    }

    return errors;
  },

  async (normalizedErrors, instance) => {
    /** @type ErrorObject[] */
    const errors = [];

    if (normalizedErrors["https://json-schema.org/keyword/exclusiveMinimum"]) {
      for (const schemaLocation in normalizedErrors["https://json-schema.org/keyword/exclusiveMinimum"]) {
        if (!normalizedErrors["https://json-schema.org/keyword/exclusiveMinimum"][schemaLocation]) {
          const keyword = await getSchema(schemaLocation);
          errors.push({
            message: `The instance should be greater than ${Schema.value(keyword)}.`,
            instanceLocation: Instance.uri(instance),
            schemaLocation: schemaLocation
          });
        }
      }
    }

    return errors;
  },

  async (normalizedErrors, instance) => {
    /** @type ErrorObject[] */
    const errors = [];

    if (normalizedErrors["https://json-schema.org/keyword/exclusiveMaximum"]) {
      for (const schemaLocation in normalizedErrors["https://json-schema.org/keyword/exclusiveMaximum"]) {
        if (!normalizedErrors["https://json-schema.org/keyword/exclusiveMaximum"][schemaLocation]) {
          const keyword = await getSchema(schemaLocation);
          errors.push({
            message: `The instance should be less than ${Schema.value(keyword)}.`,
            instanceLocation: Instance.uri(instance),
            schemaLocation: schemaLocation
          });
        }
      }
    }

    return errors;
  },

  async (normalizedErrors, instance) => {
    /** @type ErrorObject[] */
    const errors = [];

    if (normalizedErrors["https://json-schema.org/keyword/required"]) {
      for (const schemaLocation in normalizedErrors["https://json-schema.org/keyword/required"]) {
        if (!normalizedErrors["https://json-schema.org/keyword/required"][schemaLocation]) {
          const keyword = await getSchema(schemaLocation);
          /** @type Set<string> */
          const required = new Set(Schema.value(keyword));
          for (const propertyName in Instance.value(instance)) {
            required.delete(propertyName);
          }
          errors.push({
            message: `"${Instance.uri(instance)}" is missing required property(s): ${[...required].join(", ")}.`,
            instanceLocation: Instance.uri(instance),
            schemaLocation: schemaLocation
          });
        }
      }
    }

    return errors;
  },

  async (normalizedErrors, instance) => {
    /** @type ErrorObject[] */
    const errors = [];

    if (normalizedErrors["https://json-schema.org/keyword/multipleOf"]) {
      for (const schemaLocation in normalizedErrors["https://json-schema.org/keyword/multipleOf"]) {
        if (!normalizedErrors["https://json-schema.org/keyword/multipleOf"][schemaLocation]) {
          const keyword = await getSchema(schemaLocation);
          errors.push({
            message: `The instance should be of multiple of ${Schema.value(keyword)}.`,
            instanceLocation: Instance.uri(instance),
            schemaLocation: schemaLocation
          });
        }
      }
    }

    return errors;
  },

  async (normalizedErrors, instance) => {
    /** @type ErrorObject[] */
    const errors = [];

    if (normalizedErrors["https://json-schema.org/keyword/maxProperties"]) {
      for (const schemaLocation in normalizedErrors["https://json-schema.org/keyword/maxProperties"]) {
        if (!normalizedErrors["https://json-schema.org/keyword/maxProperties"][schemaLocation]) {
          const keyword = await getSchema(schemaLocation);
          errors.push({
            message: `The instance should have maximum ${Schema.value(keyword)} properties.`,
            instanceLocation: Instance.uri(instance),
            schemaLocation: schemaLocation
          });
        }
      }
    }

    return errors;
  },

  async (normalizedErrors, instance) => {
    /** @type ErrorObject[] */
    const errors = [];

    if (normalizedErrors["https://json-schema.org/keyword/minProperties"]) {
      for (const schemaLocation in normalizedErrors["https://json-schema.org/keyword/minProperties"]) {
        if (!normalizedErrors["https://json-schema.org/keyword/minProperties"][schemaLocation]) {
          const keyword = await getSchema(schemaLocation);
          errors.push({
            message: `The instance should have minimum ${Schema.value(keyword)} properties.`,
            instanceLocation: Instance.uri(instance),
            schemaLocation: schemaLocation
          });
        }
      }
    }

    return errors;
  },

  async (normalizedErrors, instance) => {
    /** @type ErrorObject[] */
    const errors = [];

    if (normalizedErrors["https://json-schema.org/keyword/const"]) {
      for (const schemaLocation in normalizedErrors["https://json-schema.org/keyword/const"]) {
        if (!normalizedErrors["https://json-schema.org/keyword/const"][schemaLocation]) {
          const keyword = await getSchema(schemaLocation);
          errors.push({
            message: `The instance should be equal to ${Schema.value(keyword)}.`,
            instanceLocation: Instance.uri(instance),
            schemaLocation: schemaLocation
          });
        }
      }
    }

    return errors;
  },

  async (normalizedErrors, instance) => {
    /** @type ErrorObject[] */
    const errors = [];

    if (normalizedErrors["https://json-schema.org/keyword/enum"]) {
      for (const schemaLocation in normalizedErrors["https://json-schema.org/keyword/enum"]) {
        if (!normalizedErrors["https://json-schema.org/keyword/enum"][schemaLocation]) {
          const keyword = await getSchema(schemaLocation);

          /** @type {Array<string>} */
          const allowedValues = Schema.value(keyword);
          const currentValue = /** @type {string} */ (Instance.value(instance));

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
              instanceLocation: Instance.uri(instance),
              schemaLocation: schemaLocation
            });
            continue;
          }

          errors.push({
            message: `Unexpected value "${currentValue}". Expected one of: ${allowedValues.join(",")}.`,
            instanceLocation: Instance.uri(instance),
            schemaLocation: schemaLocation
          });
        }
      }
    }

    return errors;
  },

  async (normalizedErrors, instance) => {
    /** @type ErrorObject[] */
    const errors = [];

    if (normalizedErrors["https://json-schema.org/keyword/maxItems"]) {
      for (const schemaLocation in normalizedErrors["https://json-schema.org/keyword/maxItems"]) {
        if (!normalizedErrors["https://json-schema.org/keyword/maxItems"][schemaLocation]) {
          const keyword = await getSchema(schemaLocation);
          errors.push({
            message: `The instance should contain maximum ${Schema.value(keyword)} items in the array.`,
            instanceLocation: Instance.uri(instance),
            schemaLocation: schemaLocation
          });
        }
      }
    }

    return errors;
  },

  async (normalizedErrors, instance) => {
    /** @type ErrorObject[] */
    const errors = [];

    if (normalizedErrors["https://json-schema.org/keyword/minItems"]) {
      for (const schemaLocation in normalizedErrors["https://json-schema.org/keyword/minItems"]) {
        if (!normalizedErrors["https://json-schema.org/keyword/minItems"][schemaLocation]) {
          const keyword = await getSchema(schemaLocation);
          errors.push({
            message: `The instance should contain minimum ${Schema.value(keyword)} items in the array.`,
            instanceLocation: Instance.uri(instance),
            schemaLocation: schemaLocation
          });
        }
      }
    }

    return errors;
  },

  // eslint-disable-next-line @typescript-eslint/require-await
  async (normalizedErrors, instance) => {
    /** @type ErrorObject[] */
    const errors = [];

    if (normalizedErrors["https://json-schema.org/keyword/uniqueItems"]) {
      for (const schemaLocation in normalizedErrors["https://json-schema.org/keyword/uniqueItems"]) {
        if (!normalizedErrors["https://json-schema.org/keyword/uniqueItems"][schemaLocation]) {
          errors.push({
            message: `The instance should have unique items in the array.`,
            instanceLocation: Instance.uri(instance),
            schemaLocation: schemaLocation
          });
        }
      }
    }

    return errors;
  },

  async (normalizedErrors, instance) => {
    /** @type ErrorObject[] */
    const errors = [];

    if (normalizedErrors["https://json-schema.org/keyword/format"]) {
      for (const schemaLocation in normalizedErrors["https://json-schema.org/keyword/format"]) {
        if (!normalizedErrors["https://json-schema.org/keyword/format"][schemaLocation]) {
          const keyword = await getSchema(schemaLocation);
          errors.push({
            message: `The instance should match the format: ${Schema.value(keyword)}.`,
            instanceLocation: Instance.uri(instance),
            schemaLocation: schemaLocation
          });
        }
      }
    }

    return errors;
  },
  async (normalizedErrors, instance) => {
    /** @type ErrorObject[] */
    const errors = [];

    if (normalizedErrors["https://json-schema.org/keyword/pattern"]) {
      for (const schemaLocation in normalizedErrors["https://json-schema.org/keyword/pattern"]) {
        if (!normalizedErrors["https://json-schema.org/keyword/pattern"][schemaLocation]) {
          const keyword = await getSchema(schemaLocation);
          errors.push({
            message: `The instance should match the pattern: ${Schema.value(keyword)}.`,
            instanceLocation: Instance.uri(instance),
            schemaLocation: schemaLocation
          });
        }
      }
    }

    return errors;
  }
];

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
