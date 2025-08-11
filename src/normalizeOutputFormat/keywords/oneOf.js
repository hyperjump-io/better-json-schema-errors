import { evaluateSchema } from "../normalizeOutput.js";

/**
 * @import { KeywordHandler, NormalizedOutput } from "../normalizeOutput.js"
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
