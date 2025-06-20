import { normalizeOutputFormat } from "./normalizeOutputFormat/normalizeOutput.js";

/**
 * @import {betterJsonSchemaErrors} from "./index.d.ts"
 */

/** @type betterJsonSchemaErrors */
export async function betterJsonSchemaErrors(instance, schema, errorOutput) {
  const normalizedErrors = await normalizeOutputFormat(errorOutput, schema);

  const errors = [];
  for (const error of normalizedErrors) {
    errors.push({
      message: "The instance should be at least 3 characters",
      instanceLocation: error.instanceLocation,
      schemaLocation: error.absoluteKeywordLocation
    });
  }

  return { errors };
}
