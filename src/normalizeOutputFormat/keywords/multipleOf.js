/**
 * @import { KeywordHandler } from "../normalizeOutput.js"
 */

/** @type KeywordHandler */
const multipleOf = {
  appliesTo(type) {
    return type === "number";
  }
};

export default multipleOf;
