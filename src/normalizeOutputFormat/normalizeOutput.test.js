import { afterEach, describe, expect, test } from "vitest";
import { normalizedErrorOuput } from "./normalizeOutput.js";
import { betterJsonSchemaErrors } from "../index.js";
import { registerSchema, unregisterSchema } from "@hyperjump/json-schema/draft-2020-12";
import { Localization } from "../localization.js";
/**
 * @import { OutputFormat} from "../index.d.ts"
 */

describe("Error Output Normalization", async () => {
  const localization = await Localization.forLocale("en-US");
  const schemaUri = "https://example.com/main";
  const schemaUri1 = "https://example.com/polygon";

  afterEach(() => {
    unregisterSchema(schemaUri);
    unregisterSchema(schemaUri1);
  });

  test("Simple keyword with a standard Basic output format", async () => {
    registerSchema({
      $schema: "https://json-schema.org/draft/2020-12/schema",
      minLength: 3
    }, schemaUri);

    const instance = "aa";

    /** @type OutputFormat */
    const output = {
      valid: false,
      errors: [
        {
          absoluteKeywordLocation: "https://example.com/main#/minLength",
          instanceLocation: "#"
        }
      ]
    };

    const result = await betterJsonSchemaErrors(instance, output, schemaUri);
    expect(result.errors).to.eql([{
      schemaLocation: "https://example.com/main#/minLength",
      instanceLocation: "#",
      message: localization.getMinLengthErrorMessage(3)
    }
    ]);
  });

  test("Checking when output contain only instanceLocation and keywordLocation ", async () => {
    registerSchema({
      $schema: "https://json-schema.org/draft/2020-12/schema",
      minLength: 3
    }, schemaUri);

    const instance = "aa";

    /** @type OutputFormat */
    const output = {
      valid: false,
      errors: [
        {
          keywordLocation: "/minLength",
          instanceLocation: "#"
        }
      ]
    };

    const result = await betterJsonSchemaErrors(instance, output, schemaUri);
    expect(result.errors).to.eql([{
      schemaLocation: "https://example.com/main#/minLength",
      instanceLocation: "#",
      message: localization.getMinLengthErrorMessage(3)
    }]);
  });

  test("adding # if instanceLocation doesn't have it", async () => {
    registerSchema({
      $schema: "https://json-schema.org/draft/2020-12/schema",
      minLength: 3
    }, schemaUri);

    const instance = "aa";

    /** @type OutputFormat */
    const output = {
      valid: false,
      errors: [
        {
          valid: false,
          absoluteKeywordLocation: "https://example.com/main#/minLength",
          instanceLocation: ""
        }
      ]
    };
    const result = await betterJsonSchemaErrors(instance, output, schemaUri);
    expect(result.errors).to.eql([{
      schemaLocation: "https://example.com/main#/minLength",
      instanceLocation: "#",
      message: localization.getMinLengthErrorMessage(3)
    }]);
  });

  test("checking for the basic output format", async () => {
    registerSchema({
      $schema: "https://json-schema.org/draft/2020-12/schema",
      type: "object",
      properties: {
        name: { type: "string" },
        age: { type: "number" }
      },
      required: ["name", "age"]
    }, schemaUri);

    const instance = {
      age: "twenty"
    };
    /** @type OutputFormat */
    const errorOutput = {
      valid: false,
      errors: [
        {
          absoluteKeywordLocation: "https://example.com/main#/required",
          instanceLocation: "#"
        },
        {
          absoluteKeywordLocation: "https://example.com/main#/properties/age/type",
          instanceLocation: "#/age"
        }
      ]
    };

    expect(await normalizedErrorOuput(instance, errorOutput, schemaUri)).to.eql({
      "#": {
        "https://json-schema.org/keyword/required": {
          "https://example.com/main#/required": false
        },
        "https://json-schema.org/keyword/type": {
          "https://example.com/main#/type": true
        }
      },
      "#/age": {
        "https://json-schema.org/keyword/type": {
          "https://example.com/main#/properties/age/type": false
        }
      }
    });
  });

  test("checking for the detailed output format", async () => {
    registerSchema({
      $schema: "https://json-schema.org/draft/2020-12/schema",
      $id: schemaUri,
      type: "object",
      properties: {
        profile: { $ref: "#/$defs/profile" }
      },
      required: ["profile"],
      $defs: {
        profile: {
          type: "object",
          properties: {
            name: { type: "string" },
            age: { type: "integer" }
          },
          required: ["name", "age"]
        }
      }
    }, schemaUri);
    const instance = {
      profile: {
        name: 123
      }
    };
    /** @type OutputFormat */
    const errorOutput = {
      valid: false,
      errors: [
        {
          absoluteKeywordLocation: "https://example.com/main#/$defs/profile",
          instanceLocation: "/profile",
          errors: [
            {
              absoluteKeywordLocation: "https://example.com/main#/$defs/profile/properties/name/type",
              instanceLocation: "/profile/name"
            },
            {
              absoluteKeywordLocation: "https://example.com/main#/$defs/profile/required",
              instanceLocation: "/profile"
            }
          ]
        }
      ]
    };

    expect(await normalizedErrorOuput(instance, errorOutput, schemaUri)).to.eql({
      "#": {
        "https://json-schema.org/keyword/required": {
          "https://example.com/main#/required": true
        },
        "https://json-schema.org/keyword/type": {
          "https://example.com/main#/type": true
        }
      },
      "#/profile": {
        "https://json-schema.org/keyword/required": {
          "https://example.com/main#/$defs/profile/required": false
        },
        "https://json-schema.org/keyword/type": {
          "https://example.com/main#/$defs/profile/type": true
        }
      },
      "#/profile/name": {
        "https://json-schema.org/keyword/type": {
          "https://example.com/main#/$defs/profile/properties/name/type": false
        }
      }
    });
  });

  test("checking for the verbose output format", async () => {
    registerSchema({
      $schema: "https://json-schema.org/draft/2020-12/schema",
      $id: schemaUri,
      type: "object",
      properties: {
        profile: { $ref: "#/$defs/profile" }
      },
      required: ["profile"],
      $defs: {
        profile: {
          type: "object",
          properties: {
            name: { type: "string" },
            age: { type: "integer" }
          },
          required: ["name", "age"]
        }
      }
    }, schemaUri);

    const instance = {
      profile: {
        name: 123
      }
    };
    /** @type {OutputFormat} */
    const errorOutput = {
      valid: false,
      keywordLocation: "",
      instanceLocation: "",
      errors: [
        {
          valid: true,
          keywordLocation: "/type",
          instanceLocation: ""
        },
        {
          valid: false,
          keywordLocation: "/properties/profile/$ref",
          absoluteKeywordLocation: "https://example.com/main#/$defs/profile",
          instanceLocation: "/profile",
          errors: [
            {
              valid: true,
              keywordLocation: "/properties/profile/$ref/type",
              instanceLocation: "/profile"
            },
            {
              valid: true,
              keywordLocation: "/properties/profile/$ref/properties",
              instanceLocation: "/profile"
            },
            {
              valid: false,
              keywordLocation: "/properties/profile/$ref/properties/name/type",
              absoluteKeywordLocation: "https://example.com/main#/$defs/profile/properties/name/type",
              instanceLocation: "/profile/name"
            },
            {
              valid: false,
              keywordLocation: "/properties/profile/$ref/required",
              absoluteKeywordLocation: "https://example.com/main#/$defs/profile/required",
              instanceLocation: "/profile"
            }
          ]
        },
        {
          valid: true,
          keywordLocation: "/required",
          instanceLocation: ""
        }
      ]
    };

    expect(await normalizedErrorOuput(instance, errorOutput, schemaUri)).to.eql({
      "#": {
        "https://json-schema.org/keyword/required": {
          "https://example.com/main#/required": true
        },
        "https://json-schema.org/keyword/type": {
          "https://example.com/main#/type": true
        }
      },
      "#/profile": {
        "https://json-schema.org/keyword/required": {
          "https://example.com/main#/$defs/profile/required": false
        },
        "https://json-schema.org/keyword/type": {
          "https://example.com/main#/$defs/profile/type": true
        }
      },
      "#/profile/name": {
        "https://json-schema.org/keyword/type": {
          "https://example.com/main#/$defs/profile/properties/name/type": false
        }
      }
    });
  });

  test("when error output doesnot contain any of these three keyword (valid, absoluteKeywordLocation, instanceLocation)", async () => {
    registerSchema({
      $schema: "https://json-schema.org/draft/2020-12/schema",
      items: { $ref: "#/$defs/foo" },
      $defs: {
        foo: {
          additionalProperties: false
        }
      }
    }, schemaUri);
    const instance = "";
    const errorOutput = {
      valid: false,
      errors: [
        {
          valid: false,
          keywordLocation: "#/items/$ref/additionalProperties"
        }
      ]
    };
    await expect(async () => normalizedErrorOuput(instance, /** @type any */(errorOutput), schemaUri)).to.rejects.toThrow("error Output must follow Draft 2019-09");
  });

  test("correctly resolves keywordLocation through $ref in $defs", async () => {
    registerSchema({
      $schema: "https://json-schema.org/draft/2020-12/schema",
      properties: {
        foo: { $ref: "#/$defs/lengthDefinition" }
      },
      $defs: {
        lengthDefinition: {
          minLength: 3
        }
      }
    }, schemaUri);
    const instance = { foo: "aa" };
    /** @type OutputFormat */
    const output = {
      valid: false,
      errors: [
        {
          keywordLocation: "/properties/foo/$ref/minLength",
          instanceLocation: "#/foo"
        }
      ]
    };

    const result = await betterJsonSchemaErrors(instance, output, schemaUri);

    expect(result.errors).to.eql([
      {
        schemaLocation: "https://example.com/main#/$defs/lengthDefinition/minLength",
        instanceLocation: "#/foo",
        message: localization.getMinLengthErrorMessage(3)
      }
    ]);
  });
});
