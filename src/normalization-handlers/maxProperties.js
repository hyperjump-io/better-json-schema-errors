/**
 * @import { KeywordHandler } from "../index.d.ts"
 */

/** @type KeywordHandler */
const maxProperties = {
  appliesTo(type) {
    return type === "object";
  }
};

export default maxProperties;
