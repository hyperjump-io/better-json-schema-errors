import { evaluateSchema } from "../normalizeOutput.js";

/**
 * @import { KeywordHandler } from "../normalizeOutput.js"
 */

/** @type KeywordHandler */
const else_ = {
  evaluate(/** @type [string, string] */ [, elseSchema], instance, context) {
    return [evaluateSchema(elseSchema, instance, context)];
  },
  simpleApplicator: true
};

export default else_;
