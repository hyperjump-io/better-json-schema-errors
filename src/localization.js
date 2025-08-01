import { readFile } from "node:fs/promises";
import { FluentBundle, FluentResource } from "@fluent/bundle";

/**
 * @import { Message, Pattern } from "@fluent/bundle/esm/ast.d.ts"
 */
export class Localization {
  /**
   * @param {string} locale
   * @param {FluentBundle} bundle
   */
  constructor(locale, bundle) {
    this.locale = locale;
    this.bundle = bundle;
  }

  /** @type (locale: string) => Promise<Localization> */
  static async forLocale(locale) {
    const ftl = await readFile(`${import.meta.dirname}/translations/${locale}.ftl`, "utf-8");
    const resource = new FluentResource(ftl);

    const bundle = new FluentBundle("en-US");
    let errors = bundle.addResource(resource);
    if (errors.length) {
      throw Error("Failed to load localization file");
    }

    return new Localization(locale, bundle);
  }

  /** @type (expectedTypes: string | string[], actualType: string) => string */
  getTypeErrorMessage(expectedTypes, actualType) {
    const message =/** @type Message */ (this.bundle.getMessage("type-error"));

    if (typeof expectedTypes === "string") {
      expectedTypes = [expectedTypes];
    }

    const expected = expectedTypes.map((type) => JSON.stringify(type));
    return this.bundle.formatPattern(/** @type Pattern */(message.value), {
      expected: new Intl.ListFormat(this.locale, { type: "disjunction" }).format(expected),
      actual: JSON.stringify(actualType)
    });
  }
}
