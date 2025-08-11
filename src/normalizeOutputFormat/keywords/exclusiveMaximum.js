/**
 * @import { KeywordHandler } from "../normalizeOutput.js"
 */

/** @type KeywordHandler */
const exclusiveMaximum = {
  appliesTo(type) {
    return type === "number";
  }
};

export default exclusiveMaximum;
