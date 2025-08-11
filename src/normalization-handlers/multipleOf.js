/**
 * @import { KeywordHandler } from "../index.d.ts"
 */

/** @type KeywordHandler */
const multipleOf = {
  appliesTo(type) {
    return type === "number";
  }
};

export default multipleOf;
