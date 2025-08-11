import * as Instance from "@hyperjump/json-schema/instance/experimental";
import { normalizedErrorOuput } from "./normalizeOutputFormat/normalizeOutput.js";
import { getErrors } from "./utilis.js";

/**
 * @import {betterJsonSchemaErrors } from "./index.d.ts"
 */

/** @type betterJsonSchemaErrors */
export async function betterJsonSchemaErrors(instance, errorOutput, schemaUri, language = "en-US") {
  const normalizedErrors = await normalizedErrorOuput(instance, errorOutput, schemaUri);
  const rootInstance = Instance.fromJs(instance);
  return { errors: await getErrors(normalizedErrors, rootInstance, language) };
};
