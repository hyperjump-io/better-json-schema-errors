import { evaluateSchema } from "../normalized-output.js";
import * as Instance from "@hyperjump/json-schema/instance/experimental";

/**
 * @import { KeywordHandler, NormalizedOutput } from "../index.d.ts"
 * @import { EvaluatedPropertiesContext } from "./unevaluatedProperties.js"
 */

/** @type KeywordHandler */
const properties = {
  evaluate(/** @type Record<string, string> */ properties, instance, /** @type EvaluatedPropertiesContext */ context) {
    /** @type NormalizedOutput[] */
    const errors = [];

    for (const propertyName in properties) {
      const propertyNode = Instance.step(propertyName, instance);
      if (!propertyNode) {
        continue;
      }
      errors.push(evaluateSchema(properties[propertyName], propertyNode, context));
      context.evaluatedProperties?.add(propertyName);
    }

    return errors;
  },
  simpleApplicator: true
};

export default properties;
