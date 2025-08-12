import { getSchema } from "@hyperjump/json-schema/experimental";
import * as Schema from "@hyperjump/browser";
import * as Instance from "@hyperjump/json-schema/instance/experimental";

/**
 * @import { PropertiesConstraints } from "../localization.js"
 * @import { ErrorHandler } from "../index.d.ts"
 */

/** @type ErrorHandler */
const propertiesRangeHandler = async (normalizedErrors, instance, localization) => {
  /** @type PropertiesConstraints */
  const constraints = {};

  /** @type string[] */
  const failedSchemaLocations = [];

  for (const schemaLocation in normalizedErrors["https://json-schema.org/keyword/minProperties"]) {
    if (!normalizedErrors["https://json-schema.org/keyword/minProperties"][schemaLocation]) {
      failedSchemaLocations.push(schemaLocation);
    }

    const keyword = await getSchema(schemaLocation);
    /** @type number */
    const minProperties = Schema.value(keyword);
    constraints.minProperties = Math.max(constraints.minProperties ?? Number.MIN_VALUE, minProperties);
  }

  for (const schemaLocation in normalizedErrors["https://json-schema.org/keyword/maxProperties"]) {
    if (!normalizedErrors["https://json-schema.org/keyword/maxProperties"][schemaLocation]) {
      failedSchemaLocations.push(schemaLocation);
    }

    const keyword = await getSchema(schemaLocation);
    /** @type number */
    const maxProperties = Schema.value(keyword);
    constraints.maxProperties = Math.min(constraints.maxProperties ?? Number.MAX_VALUE, maxProperties);
  }

  if (failedSchemaLocations.length > 0) {
    return [
      {
        message: localization.getPropertiesErrorMessage(constraints),
        instanceLocation: Instance.uri(instance),
        schemaLocation: failedSchemaLocations.length > 1 ? failedSchemaLocations : failedSchemaLocations[0]
      }
    ];
  }

  return [];
};

export default propertiesRangeHandler;
