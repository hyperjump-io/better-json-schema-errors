/**
 * @import { KeywordHandler } from "../normalizeOutput.js"
 */

/** @type KeywordHandler */
const exclusiveMinimum = {
  appliesTo(type) {
    return type === "number";
  }
};

export default exclusiveMinimum;
