/**
 * @import { KeywordHandler } from "../index.d.ts"
 */

/** @type KeywordHandler */
const maximum = {
  appliesTo(type) {
    return type === "number";
  }
};

export default maximum;
