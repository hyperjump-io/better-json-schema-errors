/**
 * @import { KeywordHandler } from "../normalizeOutput.js"
 */

/** @type KeywordHandler */
const dependentRequired = {
  appliesTo(type) {
    return type === "object";
  }
};

export default dependentRequired;
