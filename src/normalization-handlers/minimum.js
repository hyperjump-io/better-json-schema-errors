/**
 * @import { KeywordHandler } from "../index.d.ts"
 */

/** @type KeywordHandler */
const minimum = {
  appliesTo(type) {
    return type === "number";
  }
};

export default minimum;
