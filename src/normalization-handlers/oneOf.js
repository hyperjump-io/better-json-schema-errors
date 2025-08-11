import { evaluateSchema } from "../normalized-output.js";

/**
 * @import { KeywordHandler, NormalizedOutput } from "../index.d.ts"
 */

/** @type KeywordHandler */
const oneOf = {
  evaluate(/** @type string[] */ oneOf, instance, context) {
    /** @type NormalizedOutput[] */
    const errors = [];

    for (const schemaLocation of oneOf) {
      errors.push(evaluateSchema(schemaLocation, instance, context));
    }

    return errors;
  }
};

export default oneOf;
