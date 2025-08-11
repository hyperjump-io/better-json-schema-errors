/**
 * @import { KeywordHandler } from "../normalizeOutput.js"
 */

/** @type KeywordHandler */
const minItems = {
  appliesTo(type) {
    return type === "array";
  }
};

export default minItems;
