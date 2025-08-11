import { evaluateSchema } from "../normalized-output.js";

/**
 * @import { KeywordHandler } from "../index.d.ts"
 */

/** @type KeywordHandler */
const else_ = {
  evaluate(/** @type [string, string] */ [, elseSchema], instance, context) {
    return [evaluateSchema(elseSchema, instance, context)];
  },
  simpleApplicator: true
};

export default else_;
