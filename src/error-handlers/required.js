import { getSchema } from "@hyperjump/json-schema/experimental";
import * as Schema from "@hyperjump/browser";
import * as Instance from "@hyperjump/json-schema/instance/experimental";

/**
 * @import { ErrorHandler, ErrorObject } from "../index.d.ts"
 */

/** @type ErrorHandler */
const required = async (normalizedErrors, instance, localization) => {
  /** @type ErrorObject[] */
  const errors = [];

  if (normalizedErrors["https://json-schema.org/keyword/required"]) {
    for (const schemaLocation in normalizedErrors["https://json-schema.org/keyword/required"]) {
      if (!normalizedErrors["https://json-schema.org/keyword/required"][schemaLocation]) {
        const keyword = await getSchema(schemaLocation);
        /** @type Set<string> */
        const required = new Set(Schema.value(keyword));
        for (const propertyName in Instance.value(instance)) {
          required.delete(propertyName);
        }
        errors.push({
          message: localization.getRequiredErrorMessage(Instance.uri(instance), [...required]),
          instanceLocation: Instance.uri(instance),
          schemaLocation: schemaLocation
        });
      }
    }
  }

  return errors;
};

export default required;
