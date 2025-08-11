import { getSchema } from "@hyperjump/json-schema/experimental";
import * as Schema from "@hyperjump/browser";
import * as Instance from "@hyperjump/json-schema/instance/experimental";

/**
 * @import { ErrorHandler, ErrorObject } from "../index.d.ts"
 */

/** @type ErrorHandler */
const maximum = async (normalizedErrors, instance, localization) => {
  /** @type ErrorObject[] */
  const errors = [];

  if (normalizedErrors["https://json-schema.org/keyword/maximum"]) {
    for (const schemaLocation in normalizedErrors["https://json-schema.org/keyword/maximum"]) {
      if (!normalizedErrors["https://json-schema.org/keyword/maximum"][schemaLocation]) {
        const keyword = await getSchema(schemaLocation);
        errors.push({
          message: localization.getMaximumErrorMessage(Schema.value(keyword)),
          instanceLocation: Instance.uri(instance),
          schemaLocation: schemaLocation
        });
      }
    }
  }

  return errors;
};

export default maximum;
