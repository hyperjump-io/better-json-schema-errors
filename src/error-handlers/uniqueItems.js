import * as Instance from "@hyperjump/json-schema/instance/experimental";

/**
 * @import { ErrorHandler, ErrorObject } from "../index.d.ts"
 */

/** @type ErrorHandler */
// eslint-disable-next-line @typescript-eslint/require-await
const uniqueItems = async (normalizedErrors, instance, localization) => {
  /** @type ErrorObject[] */
  const errors = [];

  if (normalizedErrors["https://json-schema.org/keyword/uniqueItems"]) {
    for (const schemaLocation in normalizedErrors["https://json-schema.org/keyword/uniqueItems"]) {
      if (!normalizedErrors["https://json-schema.org/keyword/uniqueItems"][schemaLocation]) {
        errors.push({
          message: localization.getUniqueItemsErrorMessage(),
          instanceLocation: Instance.uri(instance),
          schemaLocation: schemaLocation
        });
      }
    }
  }

  return errors;
};

export default uniqueItems;
