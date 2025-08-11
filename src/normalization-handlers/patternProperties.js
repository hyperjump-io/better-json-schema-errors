import { evaluateSchema } from "../normalized-output.js";
import * as Instance from "@hyperjump/json-schema/instance/experimental";

/**
 * @import { KeywordHandler, NormalizedOutput } from "../index.d.ts"
 * @import { EvaluatedPropertiesContext } from "./unevaluatedProperties.js"
 */

/** @type KeywordHandler */
const patternProperties = {
  evaluate(/** @type [RegExp, string][] */ patternProperties, instance, /** @type EvaluatedPropertiesContext */ context) {
    /** @type NormalizedOutput[] */
    const outputs = [];
    if (Instance.typeOf(instance) !== "object") {
      return outputs;
    }

    for (const [pattern, schemaLocation] of patternProperties) {
      const regex = new RegExp(pattern);

      for (const [propertyNameNode, propertyValue] of Instance.entries(instance)) {
        const propertyName = /** @type string */ (Instance.value(propertyNameNode));
        if (regex.test(propertyName)) {
          outputs.push(evaluateSchema(schemaLocation, propertyValue, context));
          context.evaluatedProperties?.add(propertyName);
        }
      }
    }
    return outputs;
  },
  simpleApplicator: true
};

export default patternProperties;
