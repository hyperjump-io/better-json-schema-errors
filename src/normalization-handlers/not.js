import { evaluateSchema } from "../normalized-output.js";

/**
 * @import { KeywordHandler } from "../index.d.ts"
 */

/** @type KeywordHandler */
const not = {
  evaluate(/** @type string */ not, instance, context) {
    return [evaluateSchema(not, instance, context)];
  }
};

export default not;
