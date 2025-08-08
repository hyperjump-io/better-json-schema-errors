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

  /**
   * @private
   * @param {string} messageId
   * @param {Record<string, FluentVariable>} [args]
   * @returns {string}
   */
  _formatMessage(messageId, args) {
    const message = this.bundle.getMessage(messageId);
    if (!message?.value) {
      return `Localization error: message '${messageId}' not found.`;
    }
    return this.bundle.formatPattern(message.value, args);
  }

  /** @type (expectedTypes: string | string[], actualType: string) => string */
  getTypeErrorMessage(expectedTypes, actualType) {
    const types = Array.isArray(expectedTypes) ? expectedTypes : [expectedTypes];
    const expected = new Intl.ListFormat(this.locale, { type: "disjunction" }).format(
      types.map((type) => JSON.stringify(type))
    );

    return this._formatMessage("type-error", {
      expected,
      actual: JSON.stringify(actualType)
    });
  }

  /** @type (limit: number) => string */
  getMinLengthErrorMessage(limit) {
    return this._formatMessage("min-length-error", { limit });
  }

  /** @type (limit: number) => string */
  getMaxLengthErrorMessage(limit) {
    return this._formatMessage("max-length-error", { limit });
  }

  /** @type (limit: number) => string */
  getMaximumErrorMessage(limit) {
    return this._formatMessage("maximum-error", { limit });
  }

  /** @type (limit: number) => string */
  getMinimumErrorMessage(limit) {
    return this._formatMessage("minimum-error", { limit });
  }

  /** @type (limit: number) => string */
  getExclusiveMinimumErrorMessage(limit) {
    return this._formatMessage("exclusive-minimum-error", { limit });
  }

  /** @type (limit: number) => string */
  getExclusiveMaximumErrorMessage(limit) {
    return this._formatMessage("exclusive-maximum-error", { limit });
  }

  /** @type (instanceLocation: string, missingProperties: string[]) => string */
  getRequiredErrorMessage(instanceLocation, missingProperties) {
    return this._formatMessage("required-error", {
      instanceLocation,
      missingProperties: new Intl.ListFormat(this.locale, { type: "conjunction" }).format(missingProperties)
    });
  }

  /** @type (divisor: number) => string */
  getMultipleOfErrorMessage(divisor) {
    return this._formatMessage("multiple-of-error", { divisor });
  }

  /** @type (limit: number) => string */
  getMaxPropertiesErrorMessage(limit) {
    return this._formatMessage("max-properties-error", { limit });
  }

  /** @type (limit: number) => string */
  getMinPropertiesErrorMessage(limit) {
    return this._formatMessage("min-properties-error", { limit });
  }

  /** @type (expectedValue: FluentVariable) => string */
  getConstErrorMessage(expectedValue) {
    return this._formatMessage("const-error", { expectedValue });
  }

  /** @type (limit: number) => string */
  getMaxItemsErrorMessage(limit) {
    return this._formatMessage("max-items-error", { limit });
  }

  /** @type (limit: number) => string */
  getMinItemsErrorMessage(limit) {
    return this._formatMessage("min-items-error", { limit });
  }

  /** @type () => string */
  getUniqueItemsErrorMessage() {
    return this._formatMessage("unique-items-error");
  }

  /** @type (format: string) => string */
  getFormatErrorMessage(format) {
    return this._formatMessage("format-error", { format });
  }

  /** @type (pattern: string) => string */
  getPatternErrorMessage(pattern) {
    return this._formatMessage("pattern-error", { pattern });
  }

  /** @type () => string */
  getContainsErrorMessage() {
    return this._formatMessage("contains-error");
  }

  /** @type () => string */
  getNotErrorMessage() {
    return this._formatMessage("not-error");
  }

  /** @type (propertyName: string) => string */
  getAdditionalPropertiesErrorMessage(propertyName) {
    return this._formatMessage("additional-properties-error", { propertyName });
  }

  /** @type (property: string, missingDependents: string[]) => string */
  getDependentRequiredErrorMessage(property, missingDependents) {
    return this._formatMessage("dependent-required-error", {
      property,
      missingDependents: new Intl.ListFormat(this.locale, { type: "conjunction" }).format(missingDependents)
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
    const formattedArgs = {
      variant: args.variant,
      instanceValue: `"${args.instanceValue}"`,
      suggestion: "",
      allowedValues: ""
    };

    if (args.variant === "fallback") {
      const quotedValues = args.allowedValues.map((value) => JSON.stringify(value));
      formattedArgs.allowedValues = new Intl.ListFormat(this.locale, { type: "disjunction" }).format(quotedValues);
    } else {
      formattedArgs.suggestion = args.suggestion;
    }

    return this._formatMessage("enum-error", formattedArgs);
  }
}
