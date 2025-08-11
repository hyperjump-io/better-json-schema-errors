/**
 * @import { KeywordHandler } from "../index.d.ts"
 */

/** @type KeywordHandler */
const maxContains = {
  appliesTo(type) {
    return type === "array";
  }
};

export default maxContains;
