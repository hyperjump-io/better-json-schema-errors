/**
 * @import {OutputFormat, OutputUnit, NormalizedError } from "../index.d.ts"
 */

/** @type {(errorOutput: OutputFormat) => NormalizedError[]} */
export function normalizeOutputFormat(errorOutput) {
  /** @type NormalizedError[] */
  const output = [];
  if (!errorOutput || errorOutput.valid !== false) {
    throw new Error("error Output must follow Draft 2019-09");
  }

  /** @type {(errorOutput: OutputUnit) => void} */
  function collectErrors(error) {
    if (error.valid) return;

    if (!("instanceLocation" in error) || !("absoluteKeywordLocation" in error || "keywordLocation" in error)) {
      throw new Error("error Output must follow Draft 2019-09");
    }

    // TODO: Convert keywordLocation to absoluteKeywordLocation
    error.absoluteKeywordLocation ??= "https://example.com/main#/minLength";

    output.push({
      valid: false,
      absoluteKeywordLocation: error.absoluteKeywordLocation,
      instanceLocation: normalizeInstanceLocation(error.instanceLocation)
    });

    if (error.errors) {
      for (const nestedError of error.errors) {
        collectErrors(nestedError);
      }
    }
  }

  if (!errorOutput.errors) {
    throw new Error("error Output must follow Draft 2019-09");
  }

  for (const err of errorOutput.errors) {
    collectErrors(err);
  }

  return output;
}

/** @type (location: string) => string */
function normalizeInstanceLocation(location) {
  if (location.startsWith("/") || location === "") return "#" + location;
  return location;
}
