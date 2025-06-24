import { describe, expect, test } from "vitest";
import { normalizeOutputFormat } from "./normalizeOutput.js";
import { betterJsonSchemaErrors } from "../index.js";
import { registerSchema, unregisterSchema } from "@hyperjump/json-schema/draft-2020-12";
/**
 * @import { OutputFormat, OutputUnit} from "../index.d.ts"
 */

describe("Error Output Normalization", () => {
  test("Simple keyword with a standard Basic output format", async () => {
    const schemaUri = "https://example.com/main";
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

    const result = await betterJsonSchemaErrors(instance, output);
    expect(result.errors).to.eql([{
      schemaLocation: "https://example.com/main#/minLength",
      instanceLocation: "#",
      message: "The instance should be at least 3 characters"
    }
    ]);
    unregisterSchema(schemaUri);
  });

  test("Checking when output contain only instanceLocation and keywordLocation ", async () => {
    const schemaUri = "https://example.com/main";
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

    const result = await betterJsonSchemaErrors(instance, output, { schemaUri });
    expect(result.errors).to.eql([{
      schemaLocation: "https://example.com/main#/minLength",
      instanceLocation: "#",
      message: "The instance should be at least 3 characters"
    }]);
    unregisterSchema(schemaUri);
  });

  test("adding # if instanceLocation doesn't have it", async () => {
    const schemaUri = "https://example.com/main";
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

    const result = await betterJsonSchemaErrors(instance, output);
    expect(result.errors).to.eql([{
      schemaLocation: "https://example.com/main#/minLength",
      instanceLocation: "#",
      message: "The instance should be at least 3 characters"
    }]);
    unregisterSchema(schemaUri);
  });

  test("checking for the basic output format", async () => {
    const errorOutput = {
      valid: false,
      errors: [
        {
          valid: false,
          keywordLocation: "#/items/$ref",
          absoluteKeywordLocation: "https://example.com/polygon#/$defs/point",
          instanceLocation: "#/1",
          error: "A subschema had errors."
        },
        {
          valid: false,
          keywordLocation: "#/items/$ref/required",
          absoluteKeywordLocation: "https://example.com/polygon#/$defs/point/required",
          instanceLocation: "#/1",
          error: "Required property 'y' not found."
        },
        {
          valid: false,
          keywordLocation: "#/items/$ref/additionalProperties",
          absoluteKeywordLocation: "https://example.com/polygon#/$defs/point/additionalProperties",
          instanceLocation: "#/1/z",
          error: "Additional property 'z' found but was invalid."
        }
      ]
    };

    expect(await normalizeOutputFormat(errorOutput)).to.eql([
      {
        valid: false,
        keyword: "https://json-schema.org/keyword/required",
        absoluteKeywordLocation: "https://example.com/polygon#/$defs/point/required",
        instanceLocation: "#/1"
      },
      {
        valid: false,
        keyword: "https://json-schema.org/keyword/additionalProperties",
        absoluteKeywordLocation: "https://example.com/polygon#/$defs/point/additionalProperties",
        instanceLocation: "#/1/z"
      }
    ]);
  });

  test("checking for the detailed output format", async () => {
    const errorOutput = {
      valid: false,
      keywordLocation: "#",
      instanceLocation: "#",
      errors: [
        {
          valid: false,
          keywordLocation: "#/items/$ref",
          absoluteKeywordLocation: "https://example.com/polygon#/$defs/point",
          instanceLocation: "#/1",
          errors: [
            {
              valid: false,
              keywordLocation: "#/items/$ref/required",
              absoluteKeywordLocation: "https://example.com/polygon#/$defs/point/required",
              instanceLocation: "#/1",
              error: "Required property 'y' not found."
            },
            {
              valid: false,
              keywordLocation: "#/items/$ref/additionalProperties",
              absoluteKeywordLocation: "https://example.com/polygon#/$defs/point/additionalProperties",
              instanceLocation: "#/1/z",
              error: "Additional property 'z' found but was invalid."
            }
          ]
        }
      ]
    };

    expect(await normalizeOutputFormat(errorOutput)).to.eql([
      {
        valid: false,
        keyword: "https://json-schema.org/keyword/required",
        absoluteKeywordLocation: "https://example.com/polygon#/$defs/point/required",
        instanceLocation: "#/1"
      },
      {
        valid: false,
        keyword: "https://json-schema.org/keyword/additionalProperties",
        absoluteKeywordLocation: "https://example.com/polygon#/$defs/point/additionalProperties",
        instanceLocation: "#/1/z"
      }
    ]);
  });

  test("checking for the verbose output format", async () => {
    const errorOutput = {
      valid: false,
      keywordLocation: "#",
      instanceLocation: "#",
      errors: [
        {
          valid: true,
          absoluteKeywordLocation: "https://example.com/main4#/type",
          instanceLocation: "#"
        },
        {
          valid: true,
          absoluteKeywordLocation: "https://example.com/main4#/properties",
          instanceLocation: "#"
        },
        {
          valid: false,
          absoluteKeywordLocation: "https://example.com/main4#/additionalProperties",
          instanceLocation: "#",
          errors: [
            {
              valid: false,
              absoluteKeywordLocation: "https://example.com/main4#/additionalProperties",
              instanceLocation: "#/disallowedProp",
              error: "Additional property 'disallowedProp' found but was invalid."
            }
          ]
        }
      ]
    };

    expect(await normalizeOutputFormat(errorOutput)).to.eql([
      {
        valid: false,
        keyword: "https://json-schema.org/keyword/additionalProperties",
        absoluteKeywordLocation: "https://example.com/main4#/additionalProperties",
        instanceLocation: "#"
      },
      {
        valid: false,
        keyword: "https://json-schema.org/keyword/additionalProperties",
        absoluteKeywordLocation: "https://example.com/main4#/additionalProperties",
        instanceLocation: "#/disallowedProp"
      }
    ]);
  });

  test("when error output doesnot contain any of these three keyword (valid, absoluteKeywordLocation, instanceLocation)", async () => {
    const errorOutput = {
      valid: false,
      errors: [
        {
          valid: false,
          keywordLocation: "#/items/$ref/additionalProperties"
        }
      ]
    };
    await expect(async () => normalizeOutputFormat(/** @type any */(errorOutput))).to.rejects.toThrow("error Output must follow Draft 2019-09");
  });

  test("correctly resolves keywordLocation through $ref in $defs", async () => {
    const schemaUri = "https://example.com/main";
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
          instanceLocation: "#"
        }
      ]
    };
    const result = await betterJsonSchemaErrors(instance, output, { schemaUri });
    expect(result.errors).to.eql([
      {
        schemaLocation: "https://example.com/main#/$defs/lengthDefinition/minLength",
        instanceLocation: "#",
        message: "The instance should be at least 3 characters"
      }
    ]);
    unregisterSchema(schemaUri);
  });

  test("removes schemaLocation nodes from the error output", async () => {
    const errorOutput = {
      valid: false,
      errors: [
        {
          valid: false,
          keywordLocation: "#/items/$ref",
          absoluteKeywordLocation: "https://example.com/polygon#/$defs/point",
          instanceLocation: "#/1",
          error: "A subschema had errors."
        },
        {
          valid: false,
          keywordLocation: "#/items/$ref/required",
          absoluteKeywordLocation: "https://example.com/polygon#/$defs/point/required",
          instanceLocation: "#/1",
          error: "Required property 'y' not found."
        }
      ]
    };

    expect(await normalizeOutputFormat(errorOutput)).to.eql([
      {
        valid: false,
        keyword: "https://json-schema.org/keyword/required",
        absoluteKeywordLocation: "https://example.com/polygon#/$defs/point/required",
        instanceLocation: "#/1"
      }
    ]);
  });
});
