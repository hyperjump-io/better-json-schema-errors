import { getSchema } from "@hyperjump/json-schema/experimental";
import * as Schema from "@hyperjump/browser";
import * as Instance from "@hyperjump/json-schema/instance/experimental";

/**
 * @import { ErrorHandler, ErrorObject } from "../index.d.ts"
 */

/** @type ErrorHandler */
const dependentRequired = async (normalizedErrors, instance, localization) => {
  /** @type ErrorObject[] */
  const errors = [];

  if (normalizedErrors["https://json-schema.org/keyword/dependentRequired"]) {
    for (const schemaLocation in normalizedErrors["https://json-schema.org/keyword/dependentRequired"]) {
      if (!normalizedErrors["https://json-schema.org/keyword/dependentRequired"][schemaLocation]) {
        const keyword = await getSchema(schemaLocation);
        const dependentRequired = /** @type {Record<string, string[]>} */(Schema.value(keyword));
        for (const propertyName in dependentRequired) {
          if (Instance.has(propertyName, instance)) {
            const required = dependentRequired[propertyName];
            const missing = required.filter((prop) => !Instance.has(prop, instance));

            if (missing.length > 0) {
              errors.push({
                message: localization.getDependentRequiredErrorMessage(propertyName, [...missing]),
                instanceLocation: Instance.uri(instance),
                schemaLocation: schemaLocation
              });
            }
          }
        }
      }
    }
  }

  return errors;
};

export default dependentRequired;
