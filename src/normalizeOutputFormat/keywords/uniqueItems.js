/**
 * @import { KeywordHandler } from "../normalizeOutput.js"
 */

/** @type KeywordHandler */
const uniqueItems = {
  appliesTo(type) {
    return type === "array";
  }
};

export default uniqueItems;
