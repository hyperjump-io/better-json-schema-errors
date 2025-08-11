import { evaluateSchema } from "../normalized-output.js";

/**
 * @import { KeywordHandler, NormalizedOutput } from "../index.d.ts"
 */

/** @type KeywordHandler */
const allOf = {
  evaluate(/** @type string[] */ allOf, instance, context) {
    /** @type NormalizedOutput[] */
    const errors = [];
    for (const schemaLocation of allOf) {
      errors.push(evaluateSchema(schemaLocation, instance, context));
    }

    return errors;
  },
  simpleApplicator: true
};

export default allOf;
