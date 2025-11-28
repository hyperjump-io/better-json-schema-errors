import { getSchema } from "@hyperjump/json-schema/experimental";
import * as Schema from "@hyperjump/browser";
import * as Instance from "@hyperjump/json-schema/instance/experimental";

/**
 * @import { ErrorHandler, ErrorObject } from "../index.d.ts"
 */

/** @type ErrorHandler */
const format = async (normalizedErrors, instance, localization) => {
  /** @type ErrorObject[] */
  const errors = [];

  const formats = [
    "https://json-schema.org/keyword/draft-2020-12/format",
    "https://json-schema.org/keyword/draft-2019-09/format",
    "https://json-schema.org/keyword/draft-07/format",
    "https://json-schema.org/keyword/draft-06/format",
    "https://json-schema.org/keyword/draft-04/format"
  ];

  for (const formatKeyword of formats) {
    if (!normalizedErrors[formatKeyword]) {
      continue;
    }

    for (const schemaLocation in normalizedErrors[formatKeyword]) {
      const valid = normalizedErrors[formatKeyword][schemaLocation];
      if (valid) {
        continue;
      }

      const keyword = await getSchema(schemaLocation);

      errors.push({
        message: localization.getFormatErrorMessage(Schema.value(keyword)),
        instanceLocation: Instance.uri(instance),
        schemaLocation
      });
    }
  }

  return errors;
};

export default format;
