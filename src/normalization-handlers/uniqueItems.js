/**
 * @import { KeywordHandler } from "../index.d.ts"
 */

/** @type KeywordHandler */
const uniqueItems = {
  appliesTo(type) {
    return type === "array";
  }
};

export default uniqueItems;
