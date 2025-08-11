/**
 * @import { KeywordHandler } from "../normalizeOutput.js"
 */

/** @type KeywordHandler */
const maximum = {
  appliesTo(type) {
    return type === "number";
  }
};

export default maximum;
