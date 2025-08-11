/**
 * @import { KeywordHandler } from "../index.d.ts"
 */

/** @type KeywordHandler */
const minProperties = {
  appliesTo(type) {
    return type === "object";
  }
};

export default minProperties;
