import { getSchema } from "@hyperjump/json-schema/experimental";
import * as Schema from "@hyperjump/browser";
import * as Instance from "@hyperjump/json-schema/instance/experimental";

/**
 * @import { ErrorHandler, ErrorObject } from "../index.d.ts"
 */

/** @type ErrorHandler */
const enum_ = async (normalizedErrors, instance, localization) => {
  /** @type ErrorObject[] */
  const errors = [];

  if (normalizedErrors["https://json-schema.org/keyword/enum"]) {
    for (const schemaLocation in normalizedErrors["https://json-schema.org/keyword/enum"]) {
      if (!normalizedErrors["https://json-schema.org/keyword/enum"][schemaLocation]) {
        const keyword = await getSchema(schemaLocation);

        /** @type {Array<string>} */
        let allowedValues = Schema.value(keyword);
        const currentValue = /** @type {string} */ (Instance.value(instance));

        errors.push({
          message: localization.getEnumErrorMessage({ allowedValues }, currentValue),
          instanceLocation: Instance.uri(instance),
          schemaLocation: schemaLocation
        });
      }
    }
  }

  return errors;
};

export default enum_;
