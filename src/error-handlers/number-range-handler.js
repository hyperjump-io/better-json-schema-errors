import { getSchema } from "@hyperjump/json-schema/experimental";
import * as Schema from "@hyperjump/browser";
import * as Instance from "@hyperjump/json-schema/instance/experimental";

/**
 * @import { NumberConstraints } from "../localization.js"
 * @import { ErrorHandler } from "../index.d.ts"
 */

/** @type ErrorHandler */
const numberRangeHandler = async (normalizedErrors, instance, localization) => {
  /** @type NumberConstraints */
  const constraints = {};

  /** @type string[] */
  const failedSchemaLocations = [];

  for (const schemaLocation in normalizedErrors["https://json-schema.org/keyword/minimum"]) {
    if (!normalizedErrors["https://json-schema.org/keyword/minimum"][schemaLocation]) {
      failedSchemaLocations.push(schemaLocation);
    }

    const keyword = await getSchema(schemaLocation);
    /** @type number */
    const minimum = Schema.value(keyword);
    constraints.minimum = Math.max(constraints.minimum ?? Number.MIN_VALUE, minimum);
  }

  for (const schemaLocation in normalizedErrors["https://json-schema.org/keyword/exclusiveMinimum"]) {
    if (!normalizedErrors["https://json-schema.org/keyword/exclusiveMinimum"][schemaLocation]) {
      failedSchemaLocations.push(schemaLocation);
    }

    const keyword = await getSchema(schemaLocation);
    /** @type number */
    const minimum = Schema.value(keyword);
    constraints.minimum = Math.max(constraints.minimum ?? Number.MIN_VALUE, minimum);
    if (constraints.minimum === minimum) {
      constraints.exclusiveMinimum = true;
    }
  }

  for (const schemaLocation in normalizedErrors["https://json-schema.org/keyword/maximum"]) {
    if (!normalizedErrors["https://json-schema.org/keyword/maximum"][schemaLocation]) {
      failedSchemaLocations.push(schemaLocation);
    }

    const keyword = await getSchema(schemaLocation);
    /** @type number */
    const maximum = Schema.value(keyword);
    constraints.maximum = Math.min(constraints.maximum ?? Number.MAX_VALUE, maximum);
  }

  for (const schemaLocation in normalizedErrors["https://json-schema.org/keyword/exclusiveMaximum"]) {
    if (!normalizedErrors["https://json-schema.org/keyword/exclusiveMaximum"][schemaLocation]) {
      failedSchemaLocations.push(schemaLocation);
    }

    const keyword = await getSchema(schemaLocation);
    /** @type number */
    const maximum = Schema.value(keyword);
    constraints.maximum = Math.min(constraints.maximum ?? Number.MAX_VALUE, maximum);
    if (constraints.maximum === maximum) {
      constraints.exclusiveMaximum = true;
    }
  }

  if (failedSchemaLocations.length > 0) {
    return [
      {
        message: localization.getNumberErrorMessage(constraints),
        instanceLocation: Instance.uri(instance),
        schemaLocation: failedSchemaLocations.length > 1 ? failedSchemaLocations : failedSchemaLocations[0]
      }
    ];
  }

  return [];
};

export default numberRangeHandler;
