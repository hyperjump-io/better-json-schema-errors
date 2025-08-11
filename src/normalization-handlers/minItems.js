/**
 * @import { KeywordHandler } from "../index.d.ts"
 */

/** @type KeywordHandler */
const minItems = {
  appliesTo(type) {
    return type === "array";
  }
};

export default minItems;
