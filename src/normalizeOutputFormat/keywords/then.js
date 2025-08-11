import { evaluateSchema } from "../normalizeOutput.js";

/**
 * @import { KeywordHandler } from "../normalizeOutput.js"
 */

/** @type KeywordHandler */
const then = {
  evaluate(/** @type [string, string] */ [, then], instance, context) {
    return [evaluateSchema(then, instance, context)];
  },
  simpleApplicator: true
};

export default then;
