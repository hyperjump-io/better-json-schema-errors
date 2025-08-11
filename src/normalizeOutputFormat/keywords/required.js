/**
* @import { KeywordHandler } from "../normalizeOutput.js"
*/

/** @type KeywordHandler */
const required = {
  appliesTo(type) {
    return type === "object";
  }
};

export default required;
