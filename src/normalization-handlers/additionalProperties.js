import { evaluateSchema } from "../normalized-output.js";
import * as Instance from "@hyperjump/json-schema/instance/experimental";

/**
 * @import { KeywordHandler, NormalizedOutput } from "../index.d.ts"
 * @import { EvaluatedPropertiesContext } from "./unevaluatedProperties.js"
 */

/**
 * @typedef {[
 *  regexExp: RegExp,
 *  schemaLocation: string
 * ]} AdditionalPropertiesKeyword
 */

/** @type KeywordHandler */
const additionalProperties = {
  evaluate(/** @type AdditionalPropertiesKeyword */ [isDefinedProperty, additionalProperties], instance, /** @type EvaluatedPropertiesContext */ context) {
    /** @type NormalizedOutput[] */
    const outputs = [];
    if (Instance.typeOf(instance) !== "object") {
      return outputs;
    }
    for (const [propertyNameNode, property] of Instance.entries(instance)) {
      const propertyName = /** @type string */ (Instance.value(propertyNameNode));
      if (isDefinedProperty.test(propertyName)) {
        continue;
      }
      outputs.push(evaluateSchema(additionalProperties, property, context));
      context.evaluatedProperties?.add(propertyName);
    }
    return outputs;
  },
  simpleApplicator: true
};

export default additionalProperties;
