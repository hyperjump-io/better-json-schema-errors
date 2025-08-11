/**
 * @import { KeywordHandler } from "../index.d.ts"
 */

/** @type KeywordHandler */
const dependentRequired = {
  appliesTo(type) {
    return type === "object";
  }
};

export default dependentRequired;
