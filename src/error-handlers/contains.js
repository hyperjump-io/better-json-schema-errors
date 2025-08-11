import * as Instance from "@hyperjump/json-schema/instance/experimental";
import { getErrors } from "../error-handling.js";

/**
 * @import { ErrorHandler, ErrorObject, NormalizedOutput } from "../index.d.ts"
 */

/** @type ErrorHandler */
const contains = async (normalizedErrors, instance, localization) => {
  /** @type ErrorObject[] */
  const errors = [];
  if (normalizedErrors["https://json-schema.org/keyword/contains"]) {
    for (const schemaLocation in normalizedErrors["https://json-schema.org/keyword/contains"]) {
      errors.push({
        message: localization.getContainsErrorMessage(),
        instanceLocation: Instance.uri(instance),
        schemaLocation: schemaLocation
      });
      const containsNodes = /** @type NormalizedOutput[] */(normalizedErrors["https://json-schema.org/keyword/contains"][schemaLocation]);
      for (const errorOutput of containsNodes) {
        const containsSubErrors = await getErrors(errorOutput, instance, localization);
        errors.push(...containsSubErrors);
      }
    }
  }

  return errors;
};

export default contains;
