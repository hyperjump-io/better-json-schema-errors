import { evaluateSchema } from "../normalized-output.js";

/**
 * @import { KeywordHandler } from "../index.d.ts"
 */

/** @type KeywordHandler */
const ref = {
  evaluate(/** @type string */ ref, instance, context) {
    return [evaluateSchema(ref, instance, context)];
  },
  simpleApplicator: true
};

export default ref;
