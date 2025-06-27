import * as Browser from "@hyperjump/browser";
import { getKeywordByName } from "@hyperjump/json-schema/experimental";
import { pointerSegments } from "@hyperjump/json-pointer";

/**
 * @import {
 *   OutputFormat,
 *   OutputUnit,
 *   NormalizedError,
 *   SchemaObject
 * } from "../index.d.ts";
 * @import { SchemaDocument } from "@hyperjump/json-schema/experimental";
 * @import { Browser as BrowserType } from "@hyperjump/browser";
 */

/**
 * @param {OutputFormat} errorOutput
 * @param {BrowserType<SchemaDocument>} schema
 * @returns {Promise<NormalizedError[]>}
 */
export async function normalizeOutputFormat(errorOutput, schema) {
  /** @type {NormalizedError[]} */
  const output = [];

  if (!errorOutput || errorOutput.valid !== false) {
    throw new Error("error Output must follow Draft 2019-09");
  }

  if (!errorOutput.errors) {
    throw new Error("error Output must follow Draft 2019-09");
  }

  for (const err of errorOutput.errors) {
    await collectErrors(err, output, schema);
  }

  return output;
}

/** @type {(errorOutput: OutputUnit, output: NormalizedError[], schema: BrowserType<SchemaDocument>) => Promise<void>} */
async function collectErrors(error, output, schema) {
  if (error.valid) return;

  if (!("instanceLocation" in error) || !("absoluteKeywordLocation" in error || "keywordLocation" in error)) {
    throw new Error("error Output must follow Draft 2019-09");
  }

  const absoluteKeywordLocation = error.absoluteKeywordLocation
    ?? await toAbsoluteKeywordLocation(schema, /** @type string */ (error.keywordLocation));

  const fragment = absoluteKeywordLocation.split("#")[1];
  const lastSegment = fragment.split("/").filter(Boolean).pop();
  const keywordHandler = getKeywordByName(/** @type string */ (lastSegment), schema.document.dialectId);

  // make a check here to remove the schemaLocation.
  if (lastSegment && !keywordHandler.id.startsWith("https://json-schema.org/keyword/unknown")) {
    output.push({
      valid: false,
      keyword: error.keyword ?? keywordHandler.id,
      absoluteKeywordLocation,
      instanceLocation: normalizeInstanceLocation(error.instanceLocation)
    });
  }

  if (error.errors) {
    for (const nestedError of error.errors) {
      await collectErrors(nestedError, output, schema); // Recursive
    }
  }
}

/** @type {(location: string) => string} */
function normalizeInstanceLocation(location) {
  return location.startsWith("/") || location === "" ? `#${location}` : location;
}

/**
 * Convert keywordLocation to absoluteKeywordLocation
 * @param {BrowserType<SchemaDocument>} schema
 * @param {string} keywordLocation
 * @returns {Promise<string>}
 */
export async function toAbsoluteKeywordLocation(schema, keywordLocation) {
  for (const segment of pointerSegments(keywordLocation)) {
    schema = /** @type BrowserType<SchemaDocument> */ (await Browser.step(segment, schema));
  }

  return `${schema.document.baseUri}#${schema.cursor}`;
}
