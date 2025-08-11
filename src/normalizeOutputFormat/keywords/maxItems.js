/**
 * @import { KeywordHandler } from "../normalizeOutput.js"
 */

/** @type KeywordHandler */
const maxItems = {
  appliesTo(type) {
    return type === "array";
  }
};

export default maxItems;
