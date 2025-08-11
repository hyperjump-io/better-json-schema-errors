import { evaluateSchema } from "../normalizeOutput.js";
import * as Instance from "@hyperjump/json-schema/instance/experimental";

/**
 * @import { KeywordHandler, NormalizedOutput, EvaluationContext} from "../normalizeOutput.js"
 * @import { EvaluationPlugin } from "@hyperjump/json-schema/experimental"
 */

/**
 * @typedef {{
 *   rootSchema: string;
 *   evaluatedItems: Set<number>;
 *   schemaEvaluatedItems: Set<number>;
 * } & EvaluationContext} EvaluatedItemsContext
 */

/** @type KeywordHandler */
const unevaluatedItems = {
  evaluate(/** @type string[] */ [schemaUrl, unevaluatedItems], instance, /** @type EvaluatedItemsContext */ context) {
    /** @type NormalizedOutput[] */
    const outputs = [];

    if (Instance.typeOf(instance) !== "array") {
      return outputs;
    }

    if (context.rootSchema === schemaUrl) {
      return outputs;
    }
    const evaluatedItemsPlugin = new EvaluatedItemsPlugin(schemaUrl);
    evaluateSchema(schemaUrl, instance, {
      ...context,
      plugins: [...context.ast.plugins, evaluatedItemsPlugin]
    });
    const evaluatedItems = evaluatedItemsPlugin.evaluatedItems;

    let index = 0;
    for (const item of Instance.iter(instance)) {
      if (!evaluatedItems.has(index)) {
        outputs.push(evaluateSchema(unevaluatedItems, item, context));
        context.evaluatedItems?.add(index);
      }

      index++;
    }

    return outputs;
  },
  simpleApplicator: true
};

class EvaluatedItemsPlugin {
  /**
   * @param {string} rootSchema
   */
  constructor(rootSchema) {
    this.rootSchema = rootSchema;
    this.evaluatedItems = new Set();
  }

  /** @type NonNullable<EvaluationPlugin<EvaluatedItemsContext>["beforeSchema"]> */
  beforeSchema(_url, _instance, context) {
    context.evaluatedItems ??= new Set();
    context.schemaEvaluatedItems ??= new Set();
  }

  /** @type NonNullable<EvaluationPlugin<EvaluatedItemsContext>["beforeKeyword"]> */
  beforeKeyword(_node, _instance, context) {
    context.rootSchema = this.rootSchema;
    context.evaluatedItems = new Set();
  }

  /** @type NonNullable<EvaluationPlugin<EvaluatedItemsContext>["afterKeyword"]> */
  afterKeyword(_node, _instance, context, valid, schemaContext) {
    if (valid) {
      for (const property of context.evaluatedItems) {
        schemaContext.schemaEvaluatedItems.add(property);
      }
    }
  }

  /** @type NonNullable<EvaluationPlugin<EvaluatedItemsContext>["afterSchema"]> */
  afterSchema(_url, _instance, context, valid) {
    if (valid) {
      for (const property of context.schemaEvaluatedItems) {
        context.evaluatedItems.add(property);
      }
    }

    this.evaluatedItems = context.evaluatedItems;
  }
}

export default unevaluatedItems;
