/**
* @import { KeywordHandler } from "../index.d.ts"
*/

/** @type KeywordHandler */
const required = {
  appliesTo(type) {
    return type === "object";
  }
};

export default required;
