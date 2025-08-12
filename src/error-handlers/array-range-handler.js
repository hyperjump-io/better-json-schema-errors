import { getSchema } from "@hyperjump/json-schema/experimental";
import * as Schema from "@hyperjump/browser";
import * as Instance from "@hyperjump/json-schema/instance/experimental";

/**
 * @import { ArrayConstraints } from "../localization.js"
 * @import { ErrorHandler } from "../index.d.ts"
 */

/** @type ErrorHandler */
const arrayRangeHandler = async (normalizedErrors, instance, localization) => {
  /** @type ArrayConstraints */
  const constraints = {};

  /** @type string[] */
  const failedSchemaLocations = [];

  for (const schemaLocation in normalizedErrors["https://json-schema.org/keyword/minItems"]) {
    if (!normalizedErrors["https://json-schema.org/keyword/minItems"][schemaLocation]) {
      failedSchemaLocations.push(schemaLocation);
    }

    const keyword = await getSchema(schemaLocation);
    /** @type number */
    const minItems = Schema.value(keyword);
    constraints.minItems = Math.max(constraints.minItems ?? Number.MIN_VALUE, minItems);
  }

  for (const schemaLocation in normalizedErrors["https://json-schema.org/keyword/maxItems"]) {
    if (!normalizedErrors["https://json-schema.org/keyword/maxItems"][schemaLocation]) {
      failedSchemaLocations.push(schemaLocation);
    }

    const keyword = await getSchema(schemaLocation);
    /** @type number */
    const maxItems = Schema.value(keyword);
    constraints.maxItems = Math.min(constraints.maxItems ?? Number.MAX_VALUE, maxItems);
  }

  if (failedSchemaLocations.length > 0) {
    return [
      {
        message: localization.getArrayErrorMessage(constraints),
        instanceLocation: Instance.uri(instance),
        schemaLocation: failedSchemaLocations.length > 1 ? failedSchemaLocations : failedSchemaLocations[0]
      }
    ];
  }

  return [];
};

export default arrayRangeHandler;
