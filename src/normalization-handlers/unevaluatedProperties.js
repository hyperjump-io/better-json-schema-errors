import { evaluateSchema } from "../normalized-output.js";
import * as Instance from "@hyperjump/json-schema/instance/experimental";

/**
 * @import { EvaluationPlugin } from "@hyperjump/json-schema/experimental"
 * @import { EvaluationContext, KeywordHandler, NormalizedOutput } from "../index.d.ts"
 */

/**
 * @typedef {{
 *   rootSchema: string;
 *   evaluatedProperties: Set<string>;
 *   schemaEvaluatedProperties: Set<string>;
 * } & EvaluationContext} EvaluatedPropertiesContext
 */

/** @type KeywordHandler */
const unevaluatedProperties = {
  evaluate(/** @type [string, string] */ [schemaUrl, unevaluatedProperties], instance, /** @type EvaluatedPropertiesContext */ context) {
    /** @type NormalizedOutput[] */
    const outputs = [];

    if (Instance.typeOf(instance) !== "object") {
      return outputs;
    }

    // Because order matters, we re-evaluate this schema skipping this keyword
    // just to collect all the evalauted properties.
    if (context.rootSchema === schemaUrl) {
      return outputs;
    }
    const evaluatedPropertiesPlugin = new EvaluatedPropertiesPlugin(schemaUrl);
    evaluateSchema(schemaUrl, instance, {
      ...context,
      plugins: [...context.ast.plugins, evaluatedPropertiesPlugin]
    });
    const evaluatedProperties = evaluatedPropertiesPlugin.evaluatedProperties;

    for (const [propertyNameNode, property] of Instance.entries(instance)) {
      const propertyName = /** @type string */ (Instance.value(propertyNameNode));
      if (evaluatedProperties.has(propertyName)) {
        continue;
      }

      outputs.push(evaluateSchema(unevaluatedProperties, property, context));
      context.evaluatedProperties?.add(propertyName);
    }
    return outputs;
  },
  simpleApplicator: true
};

class EvaluatedPropertiesPlugin {
  /**
   * @param {string} rootSchema
   */
  constructor(rootSchema) {
    this.rootSchema = rootSchema;
    this.evaluatedProperties = new Set();
  }

  /** @type NonNullable<EvaluationPlugin<EvaluatedPropertiesContext>["beforeSchema"]> */
  beforeSchema(_url, _instance, context) {
    context.evaluatedProperties ??= new Set();
    context.schemaEvaluatedProperties ??= new Set();
  }

  /** @type NonNullable<EvaluationPlugin<EvaluatedPropertiesContext>["beforeKeyword"]> */
  beforeKeyword(_node, _instance, context) {
    context.rootSchema = this.rootSchema;
    context.evaluatedProperties = new Set();
  }

  /** @type NonNullable<EvaluationPlugin<EvaluatedPropertiesContext>["afterKeyword"]> */
  afterKeyword(_node, _instance, context, valid, schemaContext) {
    if (valid) {
      for (const property of context.evaluatedProperties) {
        schemaContext.schemaEvaluatedProperties.add(property);
      }
    }
  }

  /** @type NonNullable<EvaluationPlugin<EvaluatedPropertiesContext>["afterSchema"]> */
  afterSchema(_url, _instance, context, valid) {
    if (valid) {
      for (const property of context.schemaEvaluatedProperties) {
        context.evaluatedProperties.add(property);
      }
    }

    this.evaluatedProperties = context.evaluatedProperties;
  }
}

export default unevaluatedProperties;
