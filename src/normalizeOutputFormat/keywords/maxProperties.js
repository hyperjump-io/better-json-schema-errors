/**
 * @import { KeywordHandler } from "../normalizeOutput.js"
 */

/** @type KeywordHandler */
const maxProperties = {
  appliesTo(type) {
    return type === "object";
  }
};

export default maxProperties;
