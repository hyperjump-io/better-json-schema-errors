import { getSchema } from "@hyperjump/json-schema/experimental";
import * as Schema from "@hyperjump/browser";
/**
 * @import { NormalizedOutput, InstanceOutput } from "./index.d.ts";
 * @import { Localization, StringConstraints, NumberConstraints, ArrayConstraints, PropertiesConstraints } from "./localization.js"
 *
 */

/** @type (instanceErrors: InstanceOutput, alternativeErrors: InstanceOutput, localization: Localization) => Promise<string | undefined> */
export const getSchemaDescription = async (instanceErrors, alternativeErrors, localization) => {
  let types = new Set(["null", "boolean", "number", "string", "array", "object"]);

  for (const schemaLocation in instanceErrors["https://json-schema.org/keyword/type"]) {
    const typeNode = await getSchema(schemaLocation);
    /** @type Set<string> */
    let keywordTypes;
    if (Schema.typeOf(typeNode) === "array") {
      keywordTypes = new Set(/** @type string[] */ (Schema.value(typeNode)));
    } else {
      keywordTypes = new Set([/** @type string */(Schema.value(typeNode))]);
    }

    types = types.intersection(keywordTypes);
  }

  for (const schemaLocation in alternativeErrors["https://json-schema.org/keyword/type"]) {
    const typeNode = await getSchema(schemaLocation);
    /** @type Set<string> */
    let keywordTypes;
    if (Schema.typeOf(typeNode) === "array") {
      keywordTypes = new Set(/** @type string[] */ (Schema.value(typeNode)));
    } else {
      keywordTypes = new Set([/** @type string */(Schema.value(typeNode))]);
    }

    types = types.intersection(keywordTypes);
  }

  if (types.size > 1) {
    return undefined;
  }

  // The schema has conflicting types { "allOf": [{ "type": "boolean" }, { "type": "null" }]}
  if (types.size === 0) {
    return localization.getConflictingTypeMessage();
  }

  switch ([...types][0]) {
    case "null":
      return localization.getNullDescription();

    case "boolean":
      return localization.getBooleanDescription();

    case "number":
      /** @type NumberConstraints */
      const numberConstraints = {};
      for (const schemaLocation in alternativeErrors["https://json-schema.org/keyword/minimum"]) {
        const keyword = await getSchema(schemaLocation);
        /** @type number */
        const minLength = Schema.value(keyword);
        numberConstraints.minimum = Math.max(numberConstraints.minimum ?? Number.MIN_VALUE, minLength);
      }

      for (const schemaLocation in alternativeErrors["https://json-schema.org/keyword/exculsiveMinimum"]) {
        const keyword = await getSchema(schemaLocation);
        /** @type number */
        const minimum = Schema.value(keyword);
        numberConstraints.minimum = Math.max(numberConstraints.minimum ?? Number.MIN_VALUE, minimum);
        if (numberConstraints.minimum === minimum) {
          numberConstraints.exclusiveMinimum = true;
        }
      }

      for (const schemaLocation in alternativeErrors["https://json-schema.org/keyword/maximum"]) {
        const keyword = await getSchema(schemaLocation);
        /** @type number */
        const maximum = Schema.value(keyword);
        numberConstraints.maximum = Math.min(numberConstraints.maximum ?? Number.MAX_VALUE, maximum);
      }

      for (const schemaLocation in alternativeErrors["https://json-schema.org/keyword/exculsiveMaximum"]) {
        const keyword = await getSchema(schemaLocation);
        /** @type number */
        const maximum = Schema.value(keyword);
        numberConstraints.minimum = Math.max(numberConstraints.minimum ?? Number.MIN_VALUE, maximum);
        if (numberConstraints.minimum === maximum) {
          numberConstraints.exclusiveMaximum = true;
        }
      }

      for (const schemaLocation in alternativeErrors["https://json-schema.org/keyword/multipleOf"]) {
        const keyword = await getSchema(schemaLocation);
        /** @type string */
        numberConstraints.multipleOf = Schema.value(keyword);
      }

      return localization.getNumberDescription(numberConstraints);

    case "string":
      /** @type StringConstraints */
      const stringConstraints = {};
      for (const schemaLocation in alternativeErrors["https://json-schema.org/keyword/minLength"]) {
        const keyword = await getSchema(schemaLocation);
        /** @type number */
        const minLength = Schema.value(keyword);
        stringConstraints.minLength = Math.max(stringConstraints.minLength ?? Number.MIN_VALUE, minLength);
      }

      for (const schemaLocation in alternativeErrors["https://json-schema.org/keyword/maxLength"]) {
        const keyword = await getSchema(schemaLocation);
        /** @type number */
        const maxLength = Schema.value(keyword);
        stringConstraints.maxLength = Math.min(stringConstraints.maxLength ?? Number.MAX_VALUE, maxLength);
      }

      for (const schemaLocation in alternativeErrors["https://json-schema.org/keyword/pattern"]) {
        const keyword = await getSchema(schemaLocation);
        /** @type string */
        stringConstraints.pattern = Schema.value(keyword);
      }

      return localization.getStringDescription(stringConstraints);

    case "array":
      /** @type ArrayConstraints */
      const arrayConstraints = {};
      for (const schemaLocation in alternativeErrors["https://json-schema.org/keyword/minItems"]) {
        const keyword = await getSchema(schemaLocation);
        /** @type number */
        const minItems = Schema.value(keyword);
        arrayConstraints.minItems = Math.max(arrayConstraints.minItems ?? Number.MIN_VALUE, minItems);
      }

      for (const schemaLocation in alternativeErrors["https://json-schema.org/keyword/maxItems"]) {
        const keyword = await getSchema(schemaLocation);
        /** @type number */
        const maxItems = Schema.value(keyword);
        arrayConstraints.maxItems = Math.min(arrayConstraints.maxItems ?? Number.MAX_VALUE, maxItems);
      }
      return localization.getArrayDescription(arrayConstraints);

    case "object":
      /** @type PropertiesConstraints */
      const propertiesConstraints = {};
      for (const schemaLocation in alternativeErrors["https://json-schema.org/keyword/minProperties"]) {
        const keyword = await getSchema(schemaLocation);
        /** @type number */
        const minProperties = Schema.value(keyword);
        propertiesConstraints.minProperties = Math.max(propertiesConstraints.minProperties ?? Number.MIN_VALUE, minProperties);
      }

      for (const schemaLocation in alternativeErrors["https://json-schema.org/keyword/maxProperties"]) {
        const keyword = await getSchema(schemaLocation);
        /** @type number */
        const maxProperties = Schema.value(keyword);
        propertiesConstraints.maxProperties = Math.min(propertiesConstraints.maxProperties ?? Number.MAX_VALUE, maxProperties);
      }
      return localization.getObjectDescription(propertiesConstraints);
  }
};
