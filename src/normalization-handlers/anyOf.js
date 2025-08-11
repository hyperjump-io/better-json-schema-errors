import { evaluateSchema } from "../normalized-output.js";

/**
 * @import { KeywordHandler, NormalizedOutput } from "../index.d.ts"
 */

/** @type KeywordHandler */
const anyOf = {
  evaluate(/** @type string[] */ anyOf, instance, context) {
    /** @type NormalizedOutput[] */
    const errors = [];
    for (const schemaLocation of anyOf) {
      errors.push(evaluateSchema(schemaLocation, instance, context));
    }

    return errors;
  }
};

export default anyOf;
