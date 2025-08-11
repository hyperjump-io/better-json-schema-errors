import { getSchema } from "@hyperjump/json-schema/experimental";
import * as Schema from "@hyperjump/browser";
import * as Instance from "@hyperjump/json-schema/instance/experimental";
import leven from "leven";
import { Localization } from "../localization.js";

/**
 * @import {ErrorObject } from "../index.d.ts"
 * @import {ErrorHandler} from "../utilis.js"
 */

/** @type ErrorHandler */
const enum_ = async (normalizedErrors, instance, language) => {
  /** @type ErrorObject[] */
  const errors = [];

  if (normalizedErrors["https://json-schema.org/keyword/enum"]) {
    for (const schemaLocation in normalizedErrors["https://json-schema.org/keyword/enum"]) {
      if (!normalizedErrors["https://json-schema.org/keyword/enum"][schemaLocation]) {
        const keyword = await getSchema(schemaLocation);
        const localization = await Localization.forLocale(language);

        /** @type {Array<string>} */
        const allowedValues = Schema.value(keyword);
        const currentValue = /** @type {string} */ (Instance.value(instance));

        const bestMatch = allowedValues
          .map((value) => ({
            value,
            weight: leven(value, currentValue)
          }))
          .sort((a, b) => a.weight - b.weight)[0];
        let message;
        if (
          allowedValues.length === 1
          || (bestMatch && bestMatch.weight < bestMatch.value.length)
        ) {
          message = localization.getEnumErrorMessage({
            variant: "suggestion",
            instanceValue: currentValue,
            suggestion: bestMatch.value
          });
        } else {
          message = localization.getEnumErrorMessage({
            variant: "fallback",
            instanceValue: currentValue,
            allowedValues: allowedValues
          });
        }
        errors.push({
          message,
          instanceLocation: Instance.uri(instance),
          schemaLocation: schemaLocation
        });
      }
    }
  }

  return errors;
};

export default enum_;
