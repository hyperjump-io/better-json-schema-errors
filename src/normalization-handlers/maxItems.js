/**
 * @import { KeywordHandler } from "../index.d.ts"
 */

/** @type KeywordHandler */
const maxItems = {
  appliesTo(type) {
    return type === "array";
  }
};

export default maxItems;
