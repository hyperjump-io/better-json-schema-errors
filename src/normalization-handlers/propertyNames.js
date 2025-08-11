import { evaluateSchema } from "../normalized-output.js";
import * as Instance from "@hyperjump/json-schema/instance/experimental";

/**
 * @import { KeywordHandler, NormalizedOutput } from "../index.d.ts"
 */

/** @type KeywordHandler */
const propertyNames = {
  evaluate(/** @type string */ propertyNamesSchemaLocation, instance, context) {
    /** @type NormalizedOutput[] */
    const outputs = [];
    if (Instance.typeOf(instance) !== "object") {
      return outputs;
    }
    for (const propertyName of Instance.keys(instance)) {
      propertyName.pointer = propertyName.pointer.replace(/^\*/, "");
      outputs.push(evaluateSchema(propertyNamesSchemaLocation, propertyName, context));
    }
    return outputs;
  },
  simpleApplicator: true
};

export default propertyNames;
