/**
 * @import { KeywordHandler } from "../normalizeOutput.js"
 */

/** @type KeywordHandler */
const minProperties = {
  appliesTo(type) {
    return type === "object";
  }
};

export default minProperties;
