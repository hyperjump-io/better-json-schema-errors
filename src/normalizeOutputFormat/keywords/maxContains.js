/**
 * @import { KeywordHandler } from "../normalizeOutput.js"
 */

/** @type KeywordHandler */
const maxContains = {
  appliesTo(type) {
    return type === "array";
  }
};

export default maxContains;
