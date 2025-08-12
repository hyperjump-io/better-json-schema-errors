import { getSchema } from "@hyperjump/json-schema/experimental";
import * as Schema from "@hyperjump/browser";
import * as Instance from "@hyperjump/json-schema/instance/experimental";

/**
 * @import { StringConstraints } from "../localization.js"
 * @import { ErrorHandler } from "../index.d.ts"
 */

/** @type ErrorHandler */
const stringHandler = async (normalizedErrors, instance, localization) => {
  /** @type StringConstraints */
  const constraints = {};

  /** @type string[] */
  const failedSchemaLocations = [];

  for (const schemaLocation in normalizedErrors["https://json-schema.org/keyword/minLength"]) {
    if (!normalizedErrors["https://json-schema.org/keyword/minLength"][schemaLocation]) {
      failedSchemaLocations.push(schemaLocation);
    }

    const keyword = await getSchema(schemaLocation);
    /** @type number */
    const minLength = Schema.value(keyword);
    constraints.minLength = Math.max(constraints.minLength ?? Number.MIN_VALUE, minLength);
  }

  for (const schemaLocation in normalizedErrors["https://json-schema.org/keyword/maxLength"]) {
    if (!normalizedErrors["https://json-schema.org/keyword/maxLength"][schemaLocation]) {
      failedSchemaLocations.push(schemaLocation);
    }

    const keyword = await getSchema(schemaLocation);
    /** @type number */
    const maxLength = Schema.value(keyword);
    constraints.maxLength = Math.min(constraints.maxLength ?? Number.MAX_VALUE, maxLength);
  }

  if (failedSchemaLocations.length > 0) {
    return [
      {
        message: localization.getStringErrorMessage(constraints),
        instanceLocation: Instance.uri(instance),
        schemaLocation: failedSchemaLocations.length > 1 ? failedSchemaLocations : failedSchemaLocations[0]
      }
    ];
  }

  return [];
};

export default stringHandler;
