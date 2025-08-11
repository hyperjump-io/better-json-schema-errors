/**
 * @import { KeywordHandler } from "../normalizeOutput.js"
 */

/** @type KeywordHandler */
const minimum = {
  appliesTo(type) {
    return type === "number";
  }
};

export default minimum;
