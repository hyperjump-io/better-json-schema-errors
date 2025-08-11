import { evaluateSchema } from "../normalizeOutput.js";

/**
 * @import { KeywordHandler } from "../normalizeOutput.js"
 */

/** @type KeywordHandler */
const ref = {
  evaluate(/** @type string */ ref, instance, context) {
    return [evaluateSchema(ref, instance, context)];
  },
  simpleApplicator: true
};

export default ref;
