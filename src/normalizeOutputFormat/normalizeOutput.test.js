import { afterEach, describe, expect, test } from "vitest";
import { normalizeOutputFormat } from "./normalizeOutput.js";
import { betterJsonSchemaErrors } from "../index.js";
import { registerSchema, unregisterSchema } from "@hyperjump/json-schema/draft-2020-12";
import { getSchema } from "@hyperjump/json-schema/experimental";
/**
 * @import { OutputFormat} from "../index.d.ts"
 */

describe("Error Output Normalization", () => {
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
      message: "The instance should be at least 3 characters"
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
      message: "The instance should be at least 3 characters"
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
      message: "The instance should be at least 3 characters"
    }]);
  });

  test("checking for the basic output format", async () => {
    const schemaUri = "https://example.com/polygon";
    registerSchema({
      $schema: "https://json-schema.org/draft/2020-12/schema",
      $defs: {
        point: {
          type: "object",
          properties: {
            x: { type: "number" },
            y: { type: "number" }
          },
          additionalProperties: false,
          required: ["x", "y"]
        }
      },
      type: "array",
      items: { $ref: "#/$defs/point" }
    }, schemaUri);

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

    const schema = await getSchema(schemaUri);
    expect(await normalizeOutputFormat(errorOutput, schema)).to.eql([
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
    const schemaUri = "https://example.com/polygon";
    registerSchema({
      $schema: "https://json-schema.org/draft/2020-12/schema",
      $defs: {
        point: {
          type: "object",
          properties: {
            x: { type: "number" },
            y: { type: "number" }
          },
          additionalProperties: false,
          required: ["x", "y"]
        }
      },
      type: "array",
      items: { $ref: "#/$defs/point" }
    }, schemaUri);

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

    const schema = await getSchema(schemaUri);
    expect(await normalizeOutputFormat(errorOutput, schema)).to.eql([
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
    registerSchema({
      $schema: "https://json-schema.org/draft/2020-12/schema",
      type: "object",
      properties: {},
      additionalProperties: false
    }, schemaUri);

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

    const schema = await getSchema(schemaUri);
    expect(await normalizeOutputFormat(errorOutput, schema)).to.eql([
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
    registerSchema({
      $schema: "https://json-schema.org/draft/2020-12/schema",
      items: { $ref: "#/$defs/foo" },
      $defs: {
        foo: {
          additionalProperties: false
        }
      }
    }, schemaUri);

    const errorOutput = {
      valid: false,
      errors: [
        {
          valid: false,
          keywordLocation: "#/items/$ref/additionalProperties"
        }
      ]
    };

    const schema = await getSchema(schemaUri);
    await expect(async () => normalizeOutputFormat(/** @type any */(errorOutput), schema)).to.rejects.toThrow("error Output must follow Draft 2019-09");
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
          instanceLocation: "#"
        }
      ]
    };
    const result = await betterJsonSchemaErrors(instance, output, schemaUri);
    expect(result.errors).to.eql([
      {
        schemaLocation: "https://example.com/main#/$defs/lengthDefinition/minLength",
        instanceLocation: "#",
        message: "The instance should be at least 3 characters"
      }
    ]);
  });

  test("removes schemaLocation nodes from the error output", async () => {
    registerSchema({
      $schema: "https://json-schema.org/draft/2020-12/schema",
      $defs: {
        point: {
          type: "object",
          properties: {
            x: { type: "number" },
            y: { type: "number" }
          },
          additionalProperties: false,
          required: ["x", "y"]
        }
      },
      type: "array",
      items: { $ref: "#/$defs/point" },
      minItems: 3
    }, schemaUri);

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

    const schema = await getSchema(schemaUri);
    expect(await normalizeOutputFormat(errorOutput, schema)).to.eql([
      {
        valid: false,
        keyword: "https://json-schema.org/keyword/required",
        absoluteKeywordLocation: "https://example.com/polygon#/$defs/point/required",
        instanceLocation: "#/1"
      }
    ]);
  });

  test("should return a pattern error message", async () => {
    registerSchema({
      $schema: "https://json-schema.org/draft/2020-12/schema",
      pattern: "^[a-z]+$"
    }, schemaUri);

    const instance = "ABC123";

    const output = {
      valid: false,
      errors: [
        {
          absoluteKeywordLocation: "https://example.com/main#/pattern",
          instanceLocation: "#"
        }
      ]
    };

    const result = await betterJsonSchemaErrors(instance, output, schemaUri);
    expect(result.errors).to.eql([{
      schemaLocation: "https://example.com/main#/pattern",
      instanceLocation: "#",
      message: "The instance should match the pattern: ^[a-z]+$."
    }]);
  });

  test("should return a minItems error message", async () => {
    registerSchema({
      $schema: "https://json-schema.org/draft/2020-12/schema",
      type: "array",
      minItems: 3
    }, schemaUri);

    const instance = [1];

    const output = {
      valid: false,
      errors: [
        {
          absoluteKeywordLocation: "https://example.com/main#/minItems",
          instanceLocation: "#"
        }
      ]
    };

    const result = await betterJsonSchemaErrors(instance, output, schemaUri);
    expect(result.errors).to.eql([{
      schemaLocation: "https://example.com/main#/minItems",
      instanceLocation: "#",
      message: "The instance should have at least 3 items."
    }]);
  });

  test("should return a maxItems error message", async () => {
    registerSchema({
      $schema: "https://json-schema.org/draft/2020-12/schema",
      type: "array",
      maxItems: 2
    }, schemaUri);

    const instance = [1, 2, 3];

    const output = {
      valid: false,
      errors: [
        {
          absoluteKeywordLocation: "https://example.com/main#/maxItems",
          instanceLocation: "#"
        }
      ]
    };

    const result = await betterJsonSchemaErrors(instance, output, schemaUri);
    expect(result.errors).to.eql([{
      schemaLocation: "https://example.com/main#/maxItems",
      instanceLocation: "#",
      message: "The instance should have at most 2 items."
    }]);
  });

  test("should return a uniqueItems error message", async () => {
    registerSchema({
      $schema: "https://json-schema.org/draft/2020-12/schema",
      type: "array",
      uniqueItems: true
    }, schemaUri);

    const instance = [1, 1];
    const output = {
      valid: false,
      errors: [
        {
          absoluteKeywordLocation: "https://example.com/main#/uniqueItems",
          instanceLocation: "#"
        }
      ]
    };

    const result = await betterJsonSchemaErrors(instance, output, schemaUri);
    expect(result.errors).to.eql([{
      schemaLocation: "https://example.com/main#/uniqueItems",
      instanceLocation: "#",
      message: "The array should not contain duplicate items."
    }]);
  });

  test("should return a format error message for email", async () => {
    registerSchema({
      $schema: "https://json-schema.org/draft/2020-12/schema",
      format: "email"
    }, schemaUri);

    const instance = "not-an-email";

    const output = {
      valid: false,
      errors: [
        {
          absoluteKeywordLocation: "https://example.com/main#/format",
          instanceLocation: "#"
        }
      ]
    };

    const result = await betterJsonSchemaErrors(instance, output, schemaUri);
    expect(result.errors).to.eql([{
      schemaLocation: "https://example.com/main#/format",
      instanceLocation: "#",
      message: "The instance should match the format: email."
    }]);
  });
});
