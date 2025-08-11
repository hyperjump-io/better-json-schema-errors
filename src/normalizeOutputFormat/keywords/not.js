import { evaluateSchema } from "../normalizeOutput.js";

/**
 * @import { KeywordHandler } from "../normalizeOutput.js"
 */

/** @type KeywordHandler */
const not = {
  evaluate(/** @type string */ not, instance, context) {
    return [evaluateSchema(not, instance, context)];
  }
};

export default not;
