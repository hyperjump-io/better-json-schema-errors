/**
 * @import { KeywordHandler } from "../index.d.ts"
 */

/** @type KeywordHandler */
const minLength = {
  appliesTo(type) {
    return type === "string";
  }
};

export default minLength;
