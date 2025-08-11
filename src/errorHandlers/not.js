import * as Instance from "@hyperjump/json-schema/instance/experimental";
import { Localization } from "../localization.js";

/**
 * @import {ErrorObject } from "../index.d.ts"
 * @import {ErrorHandler} from "../utilis.js"
 */

/** @type ErrorHandler */
const not = async (normalizedErrors, instance, language) => {
  /** @type ErrorObject[] */
  const errors = [];

  if (normalizedErrors["https://json-schema.org/keyword/not"]) {
    for (const schemaLocation in normalizedErrors["https://json-schema.org/keyword/not"]) {
      const localization = await Localization.forLocale(language);
      errors.push({
        message: localization.getNotErrorMessage(),
        instanceLocation: Instance.uri(instance),
        schemaLocation: schemaLocation
      });
    }
  }

  return errors;
};

export default not;
