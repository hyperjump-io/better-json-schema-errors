/**
 * @import { KeywordHandler } from "../index.d.ts"
 */

/** @type KeywordHandler */
const minContains = {
  appliesTo(type) {
    return type === "array";
  }
};

export default minContains;
