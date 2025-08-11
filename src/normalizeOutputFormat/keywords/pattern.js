/**
 * @import { KeywordHandler } from "../normalizeOutput.js"
 */

/** @type KeywordHandler */
const pattern = {
  appliesTo(type) {
    return type === "string";
  }
};

export default pattern;
