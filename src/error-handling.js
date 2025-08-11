import * as Instance from "@hyperjump/json-schema/instance/experimental";

/**
 * @import { JsonNode } from "@hyperjump/json-schema/instance/experimental";
 * @import { Localization } from "./localization.js"
 * @import * as API from "./index.d.ts"
 */

/** @type (normalizedErrors: API.NormalizedOutput, rootInstance: JsonNode, language: Localization) => Promise<API.ErrorObject[]> */
export const getErrors = async (normalizedErrors, rootInstance, localization) => {
  /** @type API.ErrorObject[] */
  const errors = [];

  for (const instanceLocation in normalizedErrors) {
    const instance = Instance.get(instanceLocation, rootInstance);
    for (const errorHandler of errorHandlers) {
      const errorObject = await errorHandler(normalizedErrors[instanceLocation], /** @type JsonNode */ (instance), localization);
      if (errorObject) {
        errors.push(...errorObject);
      }
    }
  }

  return errors;
};

/** @type API.ErrorHandler[] */
export const errorHandlers = [];

/** @type API.addErrorHandler */
export const addErrorHandler = (errorHandler) => {
  errorHandlers.push(errorHandler);
};
