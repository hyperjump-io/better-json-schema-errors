import { getSchema } from "@hyperjump/json-schema/experimental";
import * as Schema from "@hyperjump/browser";
import * as Instance from "@hyperjump/json-schema/instance/experimental";
import { getErrors } from "../utilis.js";
import { Localization } from "../localization.js";

/**
 * @import {ErrorObject } from "../index.d.ts"
 * @import { NormalizedOutput } from "../normalizeOutputFormat/normalizeOutput.js"
 * @import {ErrorHandler} from "../utilis.js"
 */

/** @type ErrorHandler */
const anyOf = async (normalizedErrors, instance, language) => {
  /** @type ErrorObject[] */
  const errors = [];

  if (normalizedErrors["https://json-schema.org/keyword/anyOf"]) {
    for (const schemaLocation in normalizedErrors["https://json-schema.org/keyword/anyOf"]) {
      /** @type NormalizedOutput[] */
      const alternatives = [];
      const allAlternatives = /** @type NormalizedOutput[] */ (normalizedErrors["https://json-schema.org/keyword/anyOf"][schemaLocation]);
      for (const alternative of allAlternatives) {
        if (Object.values(alternative[Instance.uri(instance)]["https://json-schema.org/keyword/type"]).every((valid) => valid)) {
          alternatives.push(alternative);
        }
      }
      // case 1 where no. alternative matched the type of the instance.
      if (alternatives.length === 0) {
        /** @type Set<string> */
        const expectedTypes = new Set();
        const localization = await Localization.forLocale(language);
        for (const alternative of allAlternatives) {
          for (const instanceLocation in alternative) {
            if (instanceLocation === Instance.uri(instance)) {
              for (const schemaLocation in alternative[instanceLocation]["https://json-schema.org/keyword/type"]) {
                const keyword = await getSchema(schemaLocation);
                const expectedType = /** @type string */ (Schema.value(keyword));
                expectedTypes.add(expectedType);
              }
            }
          }
        }
        errors.push({
          message: localization.getTypeErrorMessage([...expectedTypes], Instance.typeOf(instance)),
          instanceLocation: Instance.uri(instance),
          schemaLocation: schemaLocation
        });
      } else if (alternatives.length === 1) { // case 2 when only one type match
        return getErrors(alternatives[0], instance, language);
      } else if (instance.type === "object") {
        let targetAlternativeIndex = -1;
        for (const alternative of alternatives) {
          targetAlternativeIndex++;
          for (const instanceLocation in alternative) {
            if (instanceLocation !== "#") {
              return getErrors(alternatives[targetAlternativeIndex], instance, language);
            }
          }
        }
      }
    }
  }

  return errors;
};

export default anyOf;
