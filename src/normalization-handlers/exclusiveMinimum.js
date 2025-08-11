/**
 * @import { KeywordHandler } from "../index.d.ts"
 */

/** @type KeywordHandler */
const exclusiveMinimum = {
  appliesTo(type) {
    return type === "number";
  }
};

export default exclusiveMinimum;
