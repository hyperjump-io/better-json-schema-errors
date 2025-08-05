import { readFile } from "node:fs/promises";
import { FluentBundle, FluentResource } from "@fluent/bundle";

/**
 * @import { Pattern} from "@fluent/bundle/esm/ast.d.ts"
 * @import { FluentVariable, Message } from "@fluent/bundle"
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

  /** @type (limit: number) => string */
  getMinLengthErrorMessage(limit) {
    const message =/** @type Message */ (this.bundle.getMessage("min-length-error"));
    return this.bundle.formatPattern(/** @type Pattern */ (message.value), { limit });
  }

  /** @type (limit: number) => string */
  getMaxLengthErrorMessage(limit) {
    const message =/** @type Message */ (this.bundle.getMessage("max-length-error"));
    return this.bundle.formatPattern(/** @type Pattern */ (message.value), { limit });
  }

  /** @type (limit: number) => string */
  getMaximumErrorMessage(limit) {
    const message =/** @type Message */ (this.bundle.getMessage("maximum-error"));
    return this.bundle.formatPattern(/** @type Pattern */ (message.value), { limit });
  }

  /** @type (limit: number) => string */
  getMinimumErrorMessage(limit) {
    const message =/** @type Message */ (this.bundle.getMessage("minimum-error"));
    return this.bundle.formatPattern(/** @type Pattern */ (message.value), { limit });
  }

  /** @type (limit: number) => string */
  getExclusiveMinimumErrorMessage(limit) {
    const message =/** @type Message */ (this.bundle.getMessage("exclusive-minimum-error"));
    return this.bundle.formatPattern(/** @type Pattern */ (message.value), { limit });
  }

  /** @type (limit: number) => string */
  getExclusiveMaximumErrorMessage(limit) {
    const message =/** @type Message */ (this.bundle.getMessage("exclusive-maximum-error"));
    return this.bundle.formatPattern(/** @type Pattern */ (message.value), { limit });
  }

  /** @type (instanceLocation: string, missingProperties: string | string[]) => string */
  getRequiredErrorMessage(instanceLocation, missingProperties) {
    const requiredList = new Intl.ListFormat(this.locale, { type: "conjunction" }).format(missingProperties);
    const message =/** @type Message */ (this.bundle.getMessage("required-error"));
    return this.bundle.formatPattern(/** @type Pattern */ (message.value), {
      instanceLocation,
      missingProperties: requiredList
    });
  }

  /** @type (divisor: number) => string */
  getMultipleOfErrorMessage(divisor) {
    const message =/** @type Message */ (this.bundle.getMessage("multiple-of-error"));
    return this.bundle.formatPattern(/** @type Pattern */ (message.value), { divisor });
  }

  /** @type (limit: number) => string */
  getMaxPropertiesErrorMessage(limit) {
    const message =/** @type Message */ (this.bundle.getMessage("max-properties-error"));
    return this.bundle.formatPattern(/** @type Pattern */ (message.value), { limit });
  }

  /** @type (limit: number) => string */
  getMinPropertiesErrorMessage(limit) {
    const message =/** @type Message */ (this.bundle.getMessage("min-properties-error"));
    return this.bundle.formatPattern(/** @type Pattern */ (message.value), { limit });
  }

  /** @type (expectedValue: FluentVariable) => string */
  getConstErrorMessage(expectedValue) {
    const message =/** @type Message */ (this.bundle.getMessage("const-error")); // type doubt here
    return this.bundle.formatPattern(/** @type Pattern */ (message.value), { expectedValue });
  }

  /** @type (limit: number) => string */
  getMaxItemsErrorMessage(limit) {
    const message =/** @type Message */ (this.bundle.getMessage("max-items-error"));
    return this.bundle.formatPattern(/** @type Pattern */ (message.value), { limit });
  }

  /** @type (limit: number) => string */
  getMinItemsErrorMessage(limit) {
    const message =/** @type Message */ (this.bundle.getMessage("min-items-error"));
    return this.bundle.formatPattern(/** @type Pattern */ (message.value), { limit });
  }

  /** @type () => string */
  getUniqueItemsErrorMessage() {
    const message =/** @type Message */ (this.bundle.getMessage("unique-items-error"));
    return this.bundle.formatPattern(/** @type Pattern */ (message.value));
  }

  /** @type (format: string) => string */
  getFormatErrorMessage(format) {
    const message =/** @type Message */ (this.bundle.getMessage("format-error"));
    return this.bundle.formatPattern(/** @type Pattern */ (message.value), { format });
  }

  /** @type (pattern: string) => string */
  getPatternErrorMessage(pattern) {
    const message =/** @type Message */ (this.bundle.getMessage("pattern-error"));
    return this.bundle.formatPattern(/** @type Pattern */ (message.value), { pattern });
  }

  /** @type () => string */
  getContainsErrorMessage() {
    const message =/** @type Message */ (this.bundle.getMessage("contains-error"));
    return this.bundle.formatPattern(/** @type Pattern */ (message.value));
  }

  /** @type () => string */
  getNotErrorMessage() {
    const message =/** @type Message */ (this.bundle.getMessage("not-error"));
    return this.bundle.formatPattern(/** @type Pattern */ (message.value));
  }

  /** @type (propertyName: string) => string */
  getAdditionalPropertiesErrorMessage(propertyName) {
    const message =/** @type Message */ (this.bundle.getMessage("additional-properties-error"));
    return this.bundle.formatPattern(/** @type Pattern */ (message.value), { propertyName });
  }

  /** @type (property: string, missingDependents: string | string[]) => string */
  getDependentRequiredErrorMessage(property, missingDependents) {
    const dependentsList = new Intl.ListFormat(this.locale, { type: "conjunction" }).format(missingDependents);
    const message =/** @type Message */ (this.bundle.getMessage("dependent-required-error"));
    return this.bundle.formatPattern(/** @type Pattern */ (message.value), {
      property,
      missingDependents: dependentsList
    });
  }

  /**
   * @typedef {Object} EnumSuggestionArgs
   * @property {"suggestion"} variant
   * @property {string} instanceValue
   * @property {string} suggestion
   */

  /**
   * @typedef {Object} EnumFallbackArgs
   * @property {"fallback"} variant
   * @property {string} instanceValue
   * @property {string[]} allowedValues
   */

  /**
   * @param {EnumSuggestionArgs | EnumFallbackArgs} args
   * @returns {string}
   */
  getEnumErrorMessage(args) {
    const message = /** @type Message */ (this.bundle.getMessage("enum-error"));
    if (args.variant === "fallback") {
      const quotedValues = args.allowedValues.map((value) => JSON.stringify(value));
      const formattedList = new Intl.ListFormat(this.locale, { type: "disjunction" }).format(quotedValues);
      return this.bundle.formatPattern(/** @type Pattern */ (message.value), {
        variant: "fallback",
        instanceValue: `"${args.instanceValue}"`,
        allowedValues: formattedList
      });
    } else {
      return this.bundle.formatPattern(/** @type Pattern */ (message.value), {
        variant: "suggestion",
        instanceValue: `"${args.instanceValue}"`,
        suggestion: args.suggestion
      });
    }
  }
}
