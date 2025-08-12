import { readFile } from "node:fs/promises";
import { FluentBundle, FluentResource } from "@fluent/bundle";

/**
 * @import { FluentVariable} from "@fluent/bundle"
 */

/**
 * @typedef {{
 *   minimum?: number;
 *   exclusiveMinimum?: boolean;
 *   maximum?: number;
 *   exclusiveMaximum?: boolean;
 * }} NumberConstraints
 */

/**
 * @typedef {{
 *   minLength?: number;
 *   maxLength?: number;
 *   pattern?: string;
 * }} StringConstraints
 */

/**
 * @typedef {{
 *   maxContains?: number;
 *   minContains: number;
 * }} ContainsConstraints
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

    const bundle = new FluentBundle(locale);
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

  /** @type (constraints: NumberConstraints) => string */
  getNumberErrorMessage(constraints) {
    /** @type string[] */
    const messages = [];

    if (constraints.minimum !== undefined) {
      if (constraints.exclusiveMinimum) {
        messages.push(this._formatMessage("number-error-exclusive-minimum", constraints));
      } else {
        messages.push(this._formatMessage("number-error-minimum", constraints));
      }
    }

    if (constraints.maximum !== undefined) {
      if (constraints.exclusiveMaximum) {
        messages.push(this._formatMessage("number-error-exclusive-maximum", constraints));
      } else {
        messages.push(this._formatMessage("number-error-maximum", constraints));
      }
    }

    return this._formatMessage("number-error", {
      constraints: new Intl.ListFormat(this.locale, { type: "conjunction" }).format(messages)
    });
  }

  /** @type (constraints: StringConstraints) => string */
  getStringErrorMessage(constraints) {
    /** @type string[] */
    const messages = [];

    if (constraints.minLength) {
      messages.push(this._formatMessage("string-error-minLength", constraints));
    }

    if (constraints.maxLength) {
      messages.push(this._formatMessage("string-error-maxLength", constraints));
    }

    if (constraints.pattern) {
      messages.push(this._formatMessage("string-error-pattern", constraints));
    }

    return this._formatMessage("string-error", {
      constraints: new Intl.ListFormat(this.locale, { type: "conjunction" }).format(messages)
    });
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

  /** @type (constraints: ContainsConstraints) => string */
  getContainsErrorMessage(constraints) {
    if (constraints.maxContains) {
      return this._formatMessage("contains-error-min-max", constraints);
    } else {
      return this._formatMessage("contains-error-min", constraints);
    }
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
