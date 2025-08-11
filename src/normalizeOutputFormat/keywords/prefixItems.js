import { evaluateSchema } from "../normalizeOutput.js";
import * as Instance from "@hyperjump/json-schema/instance/experimental";

/**
 * @import { KeywordHandler, NormalizedOutput } from "../normalizeOutput.js"
 * @import { EvaluatedItemsContext } from "./unevaluatedItems.js"
 */

/** @type KeywordHandler */
const prefixItems = {
  evaluate(/** @type string[] */ prefixItemsSchemaLocations, instance, /** @type EvaluatedItemsContext */ context) {
    /** @type NormalizedOutput[] */
    const outputs = [];
    if (Instance.typeOf(instance) !== "array") {
      return outputs;
    }
    for (const [index, schemaLocation] of prefixItemsSchemaLocations.entries()) {
      const itemNode = Instance.step(String(index), instance);
      if (itemNode) {
        outputs.push(evaluateSchema(schemaLocation, itemNode, context));
        context.evaluatedItems?.add(index);
      }
    }
    return outputs;
  },
  simpleApplicator: true
};

export default prefixItems;
