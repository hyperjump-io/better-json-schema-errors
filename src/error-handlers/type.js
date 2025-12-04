import { getSchema } from "@hyperjump/json-schema/experimental";
import * as Schema from "@hyperjump/browser";
import * as Instance from "@hyperjump/json-schema/instance/experimental";

/**
 * @import { ErrorHandler, ErrorObject } from "../index.d.ts"
 */

const ALL_TYPES = ["null", "boolean", "number", "string", "array", "object", "integer"];

/** @type ErrorHandler */
const type = async (normalizedErrors, instance, localization) => {
  /** @type ErrorObject[] */
  const errors = [];

  if (normalizedErrors["https://json-schema.org/keyword/type"]) {
    let allowedTypes = new Set(ALL_TYPES);
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
      allowedTypes = intersectTypeSets(allowedTypes, keywordTypes);
    }

    if (allowedTypes.size === 0) {
      if (failedTypeLocations.length > 0) {
        errors.push({
          message: localization.getConflictingTypeMessage(),
          instanceLocation: Instance.uri(instance),
          schemaLocation: failedTypeLocations
        });
      }
    } else if (failedTypeLocations.length > 0) {
      if (allowedTypes.has("number")) {
        allowedTypes.delete("integer");
      }
      errors.push({
        message: localization.getTypeErrorMessage([...allowedTypes], Instance.typeOf(instance)),
        instanceLocation: Instance.uri(instance),
        schemaLocation: failedTypeLocations.length === 1 ? failedTypeLocations[0] : failedTypeLocations
      });
    }
  }

  return errors;
};

/**
 * @param {Set<string>} a
 * @param {Set<string>} b
 * @returns {Set<string>}
 */
const intersectTypeSets = (a, b) => {
  /** @type {Set<string>} */
  const intersection = new Set();
  for (const type of a) {
    if (b.has(type)) {
      intersection.add(type);
    } else if (type === "integer" && b.has("number")) {
      intersection.add("integer");
    } else if (type === "number" && b.has("integer")) {
      intersection.add("integer");
    }
  }
  return intersection;
};

export default type;
