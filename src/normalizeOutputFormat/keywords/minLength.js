/**
 * @import { KeywordHandler } from "../normalizeOutput.js"
 */

/** @type KeywordHandler */
const minLength = {
  appliesTo(type) {
    return type === "string";
  }
};

export default minLength;
