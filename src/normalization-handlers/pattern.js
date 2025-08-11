/**
 * @import { KeywordHandler } from "../index.d.ts"
 */

/** @type KeywordHandler */
const pattern = {
  appliesTo(type) {
    return type === "string";
  }
};

export default pattern;
