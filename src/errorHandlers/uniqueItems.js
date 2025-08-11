import * as Instance from "@hyperjump/json-schema/instance/experimental";
import { Localization } from "../localization.js";

/**
 * @import {ErrorObject } from "../index.d.ts"
 * @import {ErrorHandler} from "../utilis.js"
 */

/** @type ErrorHandler */
const uniqueItems = async (normalizedErrors, instance, language) => {
  /** @type ErrorObject[] */
  const errors = [];

  if (normalizedErrors["https://json-schema.org/keyword/uniqueItems"]) {
    for (const schemaLocation in normalizedErrors["https://json-schema.org/keyword/uniqueItems"]) {
      if (!normalizedErrors["https://json-schema.org/keyword/uniqueItems"][schemaLocation]) {
        const localization = await Localization.forLocale(language);
        errors.push({
          message: localization.getUniqueItemsErrorMessage(),
          instanceLocation: Instance.uri(instance),
          schemaLocation: schemaLocation
        });
      }
    }
  }

  return errors;
};

export default uniqueItems;
