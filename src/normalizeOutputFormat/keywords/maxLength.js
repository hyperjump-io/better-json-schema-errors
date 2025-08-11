/**
 * @import { KeywordHandler } from "../normalizeOutput.js"
 */

/** @type KeywordHandler */
const maxLength = {
  appliesTo(type) {
    return type === "string";
  }
};

export default maxLength;
