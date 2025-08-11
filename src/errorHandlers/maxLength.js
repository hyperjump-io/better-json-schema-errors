import { getSchema } from "@hyperjump/json-schema/experimental";
import * as Schema from "@hyperjump/browser";
import * as Instance from "@hyperjump/json-schema/instance/experimental";
import { Localization } from "../localization.js";

/**
 * @import {ErrorObject } from "../index.d.ts"
 * @import {ErrorHandler} from "../utilis.js"
 */

/** @type ErrorHandler */
const maxLength = async (normalizedErrors, instance, language) => {
  /** @type ErrorObject[] */
  const errors = [];

  if (normalizedErrors["https://json-schema.org/keyword/maxLength"]) {
    for (const schemaLocation in normalizedErrors["https://json-schema.org/keyword/maxLength"]) {
      if (!normalizedErrors["https://json-schema.org/keyword/maxLength"][schemaLocation]) {
        const keyword = await getSchema(schemaLocation);
        const localization = await Localization.forLocale(language);
        errors.push({
          message: localization.getMaxLengthErrorMessage(Schema.value(keyword)),
          instanceLocation: Instance.uri(instance),
          schemaLocation: schemaLocation
        });
      }
    }
  }

  return errors;
};

export default maxLength;
