import { evaluateSchema } from "../normalized-output.js";
import * as Instance from "@hyperjump/json-schema/instance/experimental";
import * as Pact from "@hyperjump/pact";

/**
 * @import { KeywordHandler, NormalizedOutput } from "../index.d.ts"
 * @import { EvaluatedItemsContext } from "./unevaluatedItems.js"
 */

/** @type KeywordHandler */
const items = {
  evaluate(/** @type [number, string] */ [numberOfPrefixItems, itemsSchemaLocation], instance, /** @type EvaluatedItemsContext */ context) {
    /** @type NormalizedOutput[] */
    const errors = [];
    if (Instance.typeOf(instance) !== "array") {
      return errors;
    }

    let index = 0;
    for (const itemNode of Pact.drop(numberOfPrefixItems, Instance.iter(instance))) {
      errors.push(evaluateSchema(itemsSchemaLocation, itemNode, context));
      context.evaluatedItems?.add(index++);
    }
    return errors;
  },
  simpleApplicator: true
};

export default items;
