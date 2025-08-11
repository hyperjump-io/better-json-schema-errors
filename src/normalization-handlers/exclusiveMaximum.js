/**
 * @import { KeywordHandler } from "../index.d.ts"
 */

/** @type KeywordHandler */
const exclusiveMaximum = {
  appliesTo(type) {
    return type === "number";
  }
};

export default exclusiveMaximum;
