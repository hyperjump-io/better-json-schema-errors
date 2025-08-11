import { evaluateSchema } from "../normalized-output.js";

/**
 * @import { KeywordHandler } from "../index.d.ts"
 */

/** @type KeywordHandler */
const then = {
  evaluate(/** @type [string, string] */ [, then], instance, context) {
    return [evaluateSchema(then, instance, context)];
  },
  simpleApplicator: true
};

export default then;
