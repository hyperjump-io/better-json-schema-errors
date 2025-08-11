import * as Instance from "@hyperjump/json-schema/instance/experimental";
import { getErrors } from "../utilis.js";
import { Localization } from "../localization.js";

/**
 * @import {ErrorObject } from "../index.d.ts"
 * @import { NormalizedOutput } from "../normalizeOutputFormat/normalizeOutput.js"
 * @import {ErrorHandler} from "../utilis.js"
 */
/** @type ErrorHandler */
const contains = async (normalizedErrors, instance, language) => {
  /** @type ErrorObject[] */
  const errors = [];
  if (normalizedErrors["https://json-schema.org/keyword/contains"]) {
    for (const schemaLocation in normalizedErrors["https://json-schema.org/keyword/contains"]) {
      const localization = await Localization.forLocale(language);
      errors.push({
        message: localization.getContainsErrorMessage(),
        instanceLocation: Instance.uri(instance),
        schemaLocation: schemaLocation
      });
      const containsNodes = /** @type NormalizedOutput[] */(normalizedErrors["https://json-schema.org/keyword/contains"][schemaLocation]);
      for (const errorOutput of containsNodes) {
        const containsSubErrors = await getErrors(errorOutput, instance, language);
        errors.push(...containsSubErrors);
      }
    }
  }

  return errors;
};

export default contains;
