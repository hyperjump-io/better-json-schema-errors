import { getSchema } from "@hyperjump/json-schema/experimental";
import * as Schema from "@hyperjump/browser";
import * as Instance from "@hyperjump/json-schema/instance/experimental";

/**
 * @import { ErrorHandler, ErrorObject } from "../index.d.ts"
 */

/** @type ErrorHandler */
const minimum = async (normalizedErrors, instance, localization) => {
  /** @type ErrorObject[] */
  const errors = [];

  if (normalizedErrors["https://json-schema.org/keyword/minimum"]) {
    for (const schemaLocation in normalizedErrors["https://json-schema.org/keyword/minimum"]) {
      if (!normalizedErrors["https://json-schema.org/keyword/minimum"][schemaLocation]) {
        const keyword = await getSchema(schemaLocation);
        errors.push({
          message: localization.getMinimumErrorMessage(Schema.value(keyword)),
          instanceLocation: Instance.uri(instance),
          schemaLocation: schemaLocation
        });
      }
    }
  }

  return errors;
};

export default minimum;
