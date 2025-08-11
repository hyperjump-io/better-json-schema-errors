import * as Instance from "@hyperjump/json-schema/instance/experimental";
import { Localization } from "../localization.js";

/**
 * @import {ErrorObject } from "../index.d.ts"
 * @import {ErrorHandler} from "../utilis.js"
 */
/** @type ErrorHandler */
const additionalProperties = async (normalizedErrors, instance, language) => {
  /** @type ErrorObject[] */
  const errors = [];
  if (normalizedErrors["https://json-schema.org/validation"]) {
    for (const schemaLocation in normalizedErrors["https://json-schema.org/validation"]) {
      if (!normalizedErrors["https://json-schema.org/validation"][schemaLocation] && schemaLocation.endsWith("/additionalProperties")) {
        const notAllowedValue = /** @type string */(Instance.uri(instance).split("/").pop());
        const localization = await Localization.forLocale(language);
        errors.push({
          message: localization.getAdditionalPropertiesErrorMessage(notAllowedValue),
          instanceLocation: Instance.uri(instance),
          schemaLocation: schemaLocation
        });
      }
    }
  }
  return errors;
};

export default additionalProperties;
