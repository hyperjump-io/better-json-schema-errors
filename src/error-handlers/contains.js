import * as Instance from "@hyperjump/json-schema/instance/experimental";
import { getSchema } from "@hyperjump/json-schema/experimental";
import * as Schema from "@hyperjump/browser";
import * as JsonPointer from "@hyperjump/json-pointer";
import { getErrors } from "../error-handling.js";

/**
 * @import { ContainsConstraints } from "../localization.js"
 * @import { ErrorHandler, ErrorObject, NormalizedOutput } from "../index.d.ts"
 */

/** @type ErrorHandler */
const contains = async (normalizedErrors, instance, localization) => {
  /** @type ErrorObject[] */
  const errors = [];
  if (normalizedErrors["https://json-schema.org/keyword/contains"]) {
    for (const schemaLocation in normalizedErrors["https://json-schema.org/keyword/contains"]) {
      const position = schemaLocation.lastIndexOf("/");
      const parentLocation = schemaLocation.slice(0, position);

      /** @type ContainsConstraints */
      const containsConstraints = {};
      const minContainsLocation = JsonPointer.append("minContains", parentLocation);
      const minContainsNode = await getSchema(minContainsLocation);
      /** @type number */
      containsConstraints.minContains = Schema.value(minContainsNode) ?? 1;

      const maxContainsLocation = JsonPointer.append("maxContains", parentLocation);
      const maxContainsNode = await getSchema(maxContainsLocation);
      /** @type number */
      const maxContains = Schema.value(maxContainsNode);
      if (maxContains !== undefined) {
        containsConstraints.maxContains = maxContains;
      }

      errors.push({
        message: localization.getContainsErrorMessage(containsConstraints),
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
