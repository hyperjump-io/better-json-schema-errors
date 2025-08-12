import * as Instance from "@hyperjump/json-schema/instance/experimental";
import * as JsonPointer from "@hyperjump/json-pointer";
import { evaluateSchema } from "../normalized-output.js";

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
        errors.push({
          [JsonPointer.append(propertyName, Instance.uri(instance))]: {}
        });
      } else {
        errors.push(evaluateSchema(properties[propertyName], propertyNode, context));
        context.evaluatedProperties?.add(propertyName);
      }
    }

    return errors;
  },
  simpleApplicator: true
};

export default properties;
