import * as Instance from "@hyperjump/json-schema/instance/experimental";

/**
 * @import { ErrorHandler, ErrorObject } from "../index.d.ts"
 */

/** @type ErrorHandler */
// eslint-disable-next-line @typescript-eslint/require-await
const not = async (normalizedErrors, instance, localization) => {
  /** @type ErrorObject[] */
  const errors = [];

  if (normalizedErrors["https://json-schema.org/keyword/not"]) {
    for (const schemaLocation in normalizedErrors["https://json-schema.org/keyword/not"]) {
      errors.push({
        message: localization.getNotErrorMessage(),
        instanceLocation: Instance.uri(instance),
        schemaLocation: schemaLocation
      });
    }
  }

  return errors;
};

export default not;
