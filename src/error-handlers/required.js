import { getSchema } from "@hyperjump/json-schema/experimental";
import * as Schema from "@hyperjump/browser";
import * as Instance from "@hyperjump/json-schema/instance/experimental";

/**
 * @import { ErrorHandler } from "../index.d.ts"
 */

/** @type ErrorHandler */
const required = async (normalizedErrors, instance, localization) => {
  /** @type Set<string> */
  const required = new Set();

  /** @type string[] */
  const failedSchemaLocations = [];

  if (normalizedErrors["https://json-schema.org/keyword/required"]) {
    for (const schemaLocation in normalizedErrors["https://json-schema.org/keyword/required"]) {
      if (!normalizedErrors["https://json-schema.org/keyword/required"][schemaLocation]) {
        failedSchemaLocations.push(schemaLocation);
        const keyword = await getSchema(schemaLocation);
        /** @type Set<string> */
        for (const propertyName of /** @type string[] */ (Schema.value(keyword))) {
          required.add(propertyName);
        }
        for (const propertyName in Instance.value(instance)) {
          required.delete(propertyName);
        }
      }
    }
  }

  if (normalizedErrors["https://json-schema.org/keyword/dependentRequired"]) {
    for (const schemaLocation in normalizedErrors["https://json-schema.org/keyword/dependentRequired"]) {
      if (!normalizedErrors["https://json-schema.org/keyword/dependentRequired"][schemaLocation]) {
        const keyword = await getSchema(schemaLocation);
        const dependentRequired = /** @type {Record<string, string[]>} */(Schema.value(keyword));
        for (const propertyName in dependentRequired) {
          if (Instance.has(propertyName, instance)) {
            failedSchemaLocations.push(schemaLocation);
            for (const requiredPropertyName of dependentRequired[propertyName]) {
              required.add(requiredPropertyName);
            }
            for (const propertyName in Instance.value(instance)) {
              required.delete(propertyName);
            }
          }
        }
      }
    }
  }

  if (required.size > 0) {
    return [
      {
        message: localization.getRequiredErrorMessage([...required]),
        instanceLocation: Instance.uri(instance),
        schemaLocation: failedSchemaLocations
      }
    ];
  } else {
    return [];
  }
};

export default required;
