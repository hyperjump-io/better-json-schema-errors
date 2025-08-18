import { getSchema } from "@hyperjump/json-schema/experimental";
import * as Instance from "@hyperjump/json-schema/instance/experimental";
import * as Schema from "@hyperjump/browser";
import * as JsonPointer from "@hyperjump/json-pointer";
import { getErrors } from "../error-handling.js";

/**
 * @import { ErrorHandler, ErrorObject, Json, NormalizedOutput } from "../index.d.ts"
 */

/** @type ErrorHandler */
const anyOfErrorHandler = async (normalizedErrors, instance, localization) => {
  /** @type ErrorObject[] */
  const errors = [];

  if (normalizedErrors["https://json-schema.org/keyword/anyOf"]) {
    for (const schemaLocation in normalizedErrors["https://json-schema.org/keyword/anyOf"]) {
      const allAlternatives = normalizedErrors["https://json-schema.org/keyword/anyOf"][schemaLocation];
      if (typeof allAlternatives === "boolean") {
        continue;
      }

      /** @type NormalizedOutput[] */
      const alternatives = [];
      for (const alternative of allAlternatives) {
        const schemaErrors = alternative[Instance.uri(instance)];
        const isTypeValid = schemaErrors["https://json-schema.org/keyword/type"]
          ? Object.values(schemaErrors["https://json-schema.org/keyword/type"]).every((valid) => valid)
          : undefined;
        const isEnumValid = schemaErrors["https://json-schema.org/keyword/enum"]
          ? Object.values(schemaErrors["https://json-schema.org/keyword/enum"] ?? {}).every((valid) => valid)
          : undefined;
        const isConstValid = schemaErrors["https://json-schema.org/keyword/const"]
          ? Object.values(schemaErrors["https://json-schema.org/keyword/const"] ?? {}).every((valid) => valid)
          : undefined;

        if (isTypeValid === true || isEnumValid === true || isConstValid === true) {
          alternatives.push(alternative);
        }

        if (isConstValid === undefined && isEnumValid === undefined && isTypeValid === undefined) {
          alternatives.push(alternative);
        }
      }

      // No alternative matched the type/enum/const of the instance.
      if (alternatives.length === 0) {
        /** @type Set<string> */
        const expectedTypes = new Set();

        /** @type Set<Json> */
        const expectedEnums = new Set();

        for (const alternative of allAlternatives) {
          for (const instanceLocation in alternative) {
            if (instanceLocation === Instance.uri(instance)) {
              for (const schemaLocation in alternative[instanceLocation]["https://json-schema.org/keyword/type"]) {
                const keyword = await getSchema(schemaLocation);
                const expectedType = /** @type string */ (Schema.value(keyword));
                expectedTypes.add(expectedType);
              }
              for (const schemaLocation in alternative[instanceLocation]["https://json-schema.org/keyword/enum"]) {
                const keyword = await getSchema(schemaLocation);
                const enums = /** @type Json[] */ (Schema.value(keyword));
                for (const enumValue of enums) {
                  expectedEnums.add(enumValue);
                }
              }
              for (const schemaLocation in alternative[instanceLocation]["https://json-schema.org/keyword/const"]) {
                const keyword = await getSchema(schemaLocation);
                const constValue = /** @type Json */ (Schema.value(keyword));
                expectedEnums.add(constValue);
              }
            }
          }
        }

        errors.push({
          message: localization.getEnumErrorMessage({
            allowedValues: [...expectedEnums],
            allowedTypes: [...expectedTypes]
          }, Instance.value(instance)),
          instanceLocation: Instance.uri(instance),
          schemaLocation: schemaLocation
        });
        continue;
      }

      // Only one alternative matches the type of the instance
      if (alternatives.length === 1) {
        errors.push(...await getErrors(alternatives[0], instance, localization));
        continue;
      }

      if (instance.type === "object") {
        const definedProperties = allAlternatives.map((alternative) => {
          /** @type Set<string> */
          const alternativeProperties = new Set();

          for (const instanceLocation in alternative) {
            const pointer = instanceLocation.slice(Instance.uri(instance).length + 1);
            if (pointer.length > 0) {
              const position = pointer.indexOf("/");
              const propertyName = pointer.slice(0, position === -1 ? undefined : position);
              const location = JsonPointer.append(propertyName, Instance.uri(instance));
              alternativeProperties.add(location);
            }
          }
          return alternativeProperties;
        });

        const discriminator = definedProperties.reduce((acc, properties) => {
          return acc.intersection(properties);
        }, definedProperties[0]);
        const discriminatedAlternatives = allAlternatives.filter((alternative) => {
          for (const instanceLocation in alternative) {
            if (!discriminator.has(instanceLocation)) {
              continue;
            }

            let valid = true;
            for (const keyword in alternative[instanceLocation]) {
              for (const schemaLocation in alternative[instanceLocation][keyword]) {
                if (alternative[instanceLocation][keyword][schemaLocation] !== true) {
                  valid = false;
                  break;
                }
              }
            }
            if (valid) {
              return true;
            }
          }
          return false;
        });

        // Discriminator match
        if (discriminatedAlternatives.length === 1) {
          errors.push(...await getErrors(discriminatedAlternatives[0], instance, localization));
          continue;
        }

        // Discriminator identified, but none of the alternatives match
        if (discriminatedAlternatives.length === 0) {
          // TODO: How do we handle this case?
          // errors.push(...await getErrors(allAlternatives[0], instance, localization));
        }

        // Last resort, select the alternative with the most properties matching the instance
        // TODO: We shouldn't use this strategy if alternatives have the same number of matching instances "UPDATED"
        const instanceProperties = new Set(Instance.values(instance)
          .map((node) => Instance.uri(node)));
        let maxMatches = -1;
        let selectedIndex = 0;
        let index = -1;
        for (const alternativeProperties of definedProperties) {
          index++;
          const matches = alternativeProperties.intersection(instanceProperties).size;
          if (matches > maxMatches) {
            selectedIndex = index;
          }
        }

        errors.push(...await getErrors(alternatives[selectedIndex], instance, localization));
        continue;
      }

      // TODO: Handle alternatives with const
      // TODO: Handle alternatives with enum
      // TODO: Handle null alternatives
      // TODO: Handle boolean alternatives
      // TODO: Handle string alternatives
      // TODO: Handle array alternatives
      // TODO: Handle alternatives without a type

      // TODO: If we get here, we don't know what else to do and give a very generic message
      // Ideally this should be replace by something that can handle whatever case is missing.
      errors.push({
        message: localization.getAnyOfErrorMessage(),
        instanceLocation: Instance.uri(instance),
        schemaLocation: schemaLocation
      });
    }
  }

  return errors;
};

export default anyOfErrorHandler;
