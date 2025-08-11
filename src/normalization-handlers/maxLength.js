/**
 * @import { KeywordHandler } from "../index.d.ts"
 */

/** @type KeywordHandler */
const maxLength = {
  appliesTo(type) {
    return type === "string";
  }
};

export default maxLength;
