import * as Browser from "@hyperjump/browser";
import { getSchema, getKeywordId } from "@hyperjump/json-schema/experimental";
import { pointerSegments } from "@hyperjump/json-pointer";

/**
 * @import { OutputFormat, OutputUnit, NormalizedError, SchemaObject} from "../index.d.ts";
 * @import { SchemaDocument } from "@hyperjump/json-schema/experimental";
 * @import { Browser as BrowserType } from "@hyperjump/browser";
 */

/**
 * @param {OutputFormat} errorOutput
 * @param {string} [schemaUri]
 * @returns {Promise<NormalizedError[]>}
 */
export async function normalizeOutputFormat(errorOutput, schemaUri) {
  /** @type {NormalizedError[]} */
  const output = [];

  if (!errorOutput || errorOutput.valid !== false) {
    throw new Error("error Output must follow Draft 2019-09");
  }

  const keywords = new Set([
    "type", "minLength", "maxLength", "minimum", "maximum", "format", "pattern",
    "enum", "const", "required", "items", "properties", "allOf", "anyOf", "oneOf",
    "not", "contains", "uniqueItems", "additionalProperties", "minItems", "maxItems",
    "minProperties", "maxProperties", "dependentRequired", "dependencies"
  ]);

  /** @type {(errorOutput: OutputUnit) => Promise<void>} */
  async function collectErrors(error) {
    if (error.valid) return;

    if (!("instanceLocation" in error) || !("absoluteKeywordLocation" in error || "keywordLocation" in error)) {
      throw new Error("error Output must follow Draft 2019-09");
    }

    const absoluteKeywordLocation = error.absoluteKeywordLocation
      ?? await toAbsoluteKeywordLocation(/** @type string */ (schemaUri), /** @type string */ (error.keywordLocation));

    const fragment = absoluteKeywordLocation.split("#")[1];
    const lastSegment = fragment.split("/").filter(Boolean).pop();

    // make a check here to remove the schemaLocation.
    if (lastSegment && keywords.has(lastSegment)) {
      output.push({
        valid: false,
        keyword: error.keyword ?? getKeywordId(lastSegment, "https://json-schema.org/draft/2020-12/schema"),
        absoluteKeywordLocation,
        instanceLocation: normalizeInstanceLocation(error.instanceLocation)
      });
    }

    if (error.errors) {
      for (const nestedError of error.errors) {
        await collectErrors(nestedError); // Recursive
      }
    }
  }

  if (!errorOutput.errors) {
    throw new Error("error Output must follow Draft 2019-09");
  }

  for (const err of errorOutput.errors) {
    await collectErrors(err);
  }

  return output;
}

/** @type {(location: string) => string} */
function normalizeInstanceLocation(location) {
  return location.startsWith("/") || location === "" ? `#${location}` : location;
}

/**
 * Convert keywordLocation to absoluteKeywordLocation
 * @param {string} uri
 * @param {string} keywordLocation
 * @returns {Promise<string>}
 */
export async function toAbsoluteKeywordLocation(uri, keywordLocation) {
  let browser = await getSchema(uri);
  for (const segment of pointerSegments(keywordLocation)) {
    browser = /** @type BrowserType<SchemaDocument> */ (await Browser.step(segment, browser));
  }

  return `${browser.document.baseUri}#${browser.cursor}`;
}
