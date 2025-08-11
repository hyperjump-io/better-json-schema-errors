import * as Instance from "@hyperjump/json-schema/instance/experimental";
import anyOf from "./errorHandlers/anyOf.js";
import additionalProperties from "./errorHandlers/additionalProperties.js";
import const_ from "./errorHandlers/const.js";
import contains from "./errorHandlers/contains.js";
import dependentRequired from "./errorHandlers/dependentRequired.js";
import enum_ from "./errorHandlers/enum.js";
import exclusiveMaximum from "./errorHandlers/exclusiveMaximum.js";
import exclusiveMinimum from "./errorHandlers/exclusiveMinimum.js";
import format from "./errorHandlers/format.js";
import maximum from "./errorHandlers/maximum.js";
import minimum from "./errorHandlers/minimum.js";
import maxItems from "./errorHandlers/maxItems.js";
import minItems from "./errorHandlers/minItems.js";
import maxProperties from "./errorHandlers/maxProperties.js";
import minProperties from "./errorHandlers/minProperties.js";
import minLength from "./errorHandlers/minLength.js";
import multipleOf from "./errorHandlers/multipleOf.js";
import not from "./errorHandlers/not.js";
import pattern from "./errorHandlers/pattern.js";
import required from "./errorHandlers/required.js";
import type from "./errorHandlers/type.js";
import uniqueItems from "./errorHandlers/uniqueItems.js";
import maxLength from "./errorHandlers/maxLength.js";

/**
 * @import { JsonNode } from "@hyperjump/json-schema/instance/experimental";
 * @import { ErrorObject } from "./index.d.ts"
 * @import { NormalizedOutput, InstanceOutput } from "./normalizeOutputFormat/normalizeOutput.js"
 */

/** @type (normalizedErrors: NormalizedOutput, rootInstance: JsonNode, language: string) => Promise<ErrorObject[]> */
export const getErrors = async (normalizedErrors, rootInstance, language) => {
  /** @type ErrorObject[] */
  const errors = [];

  for (const instanceLocation in normalizedErrors) {
    const instance = Instance.get(instanceLocation, rootInstance);
    for (const errorHandler of errorHandlers) {
      const errorObject = await errorHandler(normalizedErrors[instanceLocation], /** @type JsonNode */ (instance), language);
      if (errorObject) {
        errors.push(...errorObject);
      }
    }
  }

  return errors;
};

/**
 * @typedef {(normalizedErrors: InstanceOutput, instance: JsonNode, language: string) => Promise<ErrorObject[]>} ErrorHandler
 */

/** @type ErrorHandler[] */
export const errorHandlers = [
  anyOf,
  additionalProperties,
  const_,
  contains,
  dependentRequired,
  enum_,
  exclusiveMaximum,
  exclusiveMinimum,
  format,
  maximum,
  minimum,
  maxItems,
  minItems,
  maxProperties,
  minProperties,
  minLength,
  maxLength,
  multipleOf,
  not,
  pattern,
  required,
  type,
  uniqueItems
];
