import { evaluateSchema } from "../normalized-output.js";
import * as Instance from "@hyperjump/json-schema/instance/experimental";
/**
 * @import { KeywordHandler, NormalizedOutput } from "../index.d.ts"
 * @import { EvaluatedItemsContext } from "./unevaluatedItems.js"
 */

/**
 * @typedef {{
 *   minContains: number;
 *   maxContains: number;
 *   contains: string;
 * }} ContainsKeyword
 */

/** @type KeywordHandler */
const contains = {
  evaluate(/** @type ContainsKeyword */contains, instance, /** @type EvaluatedItemsContext */ context) {
    /** @type NormalizedOutput[] */
    const outputs = [];
    if (Instance.typeOf(instance) !== "array") {
      return outputs;
    }
    let index = 0;
    for (const itemNode of Instance.iter(instance)) {
      outputs.push(evaluateSchema(contains.contains, itemNode, context));
      context.evaluatedItems?.add(index++);
    }
    return outputs;
  }
};

export default contains;
