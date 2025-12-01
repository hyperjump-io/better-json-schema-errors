import { getSchema } from "@hyperjump/json-schema/experimental";
import * as Schema from "@hyperjump/browser";
import * as Instance from "@hyperjump/json-schema/instance/experimental";

/**
 * @import { ErrorHandler, ErrorObject } from "../index.d.ts"
 */

/** @type ErrorHandler */
const type = async (normalizedErrors, instance, localization) => {
  /** @type ErrorObject[] */
  const errors = [];

  if (normalizedErrors["https://json-schema.org/keyword/type"]) {
    let allowedTypes = new Set(["null", "boolean", "number", "string", "array", "object", "integer"]);
    const failedTypeLocations = [];

    for (const schemaLocation in normalizedErrors["https://json-schema.org/keyword/type"]) {
      const isValid = normalizedErrors["https://json-schema.org/keyword/type"][schemaLocation];
      if (!isValid) {
        failedTypeLocations.push(schemaLocation);
      }

      const keyword = await getSchema(schemaLocation);
      /** @type {string|string[]} */
      const value = Schema.value(keyword);
      const types = Array.isArray(value) ? value : [value];
      /** @type {Set<string>} */
      const keywordTypes = new Set(types);
      allowedTypes = allowedTypes.intersection(keywordTypes);
    }

    if (allowedTypes.size === 0) {
      if (failedTypeLocations.length > 0) {
        errors.push({
          message: localization.getConflictingTypeMessage(),
          instanceLocation: Instance.uri(instance),
          schemaLocation: failedTypeLocations[0]
        });
      }
    } else {
      for (const schemaLocation of failedTypeLocations) {
        const keyword = await getSchema(schemaLocation);
        errors.push({
          message: localization.getTypeErrorMessage(Schema.value(keyword), Instance.typeOf(instance)),
          instanceLocation: Instance.uri(instance),
          schemaLocation: schemaLocation
        });
      }
    }
  }

  return errors;
};

export default type;
