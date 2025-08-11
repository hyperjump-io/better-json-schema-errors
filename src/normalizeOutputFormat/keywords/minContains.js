/**
 * @import { KeywordHandler } from "../normalizeOutput.js"
 */

/** @type KeywordHandler */
const minContains = {
  appliesTo(type) {
    return type === "array";
  }
};

export default minContains;
