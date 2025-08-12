import { afterEach, describe, test, expect } from "vitest";
import { betterJsonSchemaErrors } from "./index.js";
import { registerSchema } from "@hyperjump/json-schema/draft-2020-12";
import { unregisterSchema } from "@hyperjump/json-schema";
import { Localization } from "./localization.js";

/**
 * @import { OutputFormat} from "./index.d.ts"
 */

describe("Error messages", async () => {
  const localization = await Localization.forLocale("en-US");
  const schemaUri = "https://example.com/main";

  afterEach(() => {
    unregisterSchema(schemaUri);
  });

  test("minLength", async () => {
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

    const result = await betterJsonSchemaErrors(output, schemaUri, instance);
    expect(result.errors).to.eql([{
      schemaLocation: "https://example.com/main#/minLength",
      instanceLocation: "#",
      message: localization.getStringErrorMessage({ minLength: 3 })
    }]);
  });

  test("maxLength", async () => {
    registerSchema({
      $schema: "https://json-schema.org/draft/2020-12/schema",
      maxLength: 3
    }, schemaUri);

    const instance = "aaaa";

    /** @type OutputFormat */
    const output = {
      valid: false,
      errors: [
        {
          absoluteKeywordLocation: "https://example.com/main#/maxLength",
          instanceLocation: "#"
        }
      ]
    };

    const result = await betterJsonSchemaErrors(output, schemaUri, instance);
    expect(result.errors).to.eql([{
      schemaLocation: "https://example.com/main#/maxLength",
      instanceLocation: "#",
      message: localization.getStringErrorMessage({ maxLength: 3 })
    }]);
  });

  test("type", async () => {
    registerSchema({
      $schema: "https://json-schema.org/draft/2020-12/schema",
      type: "number"
    }, schemaUri);

    const instance = "aaaa";

    /** @type OutputFormat */
    const output = {
      valid: false,
      errors: [
        {
          absoluteKeywordLocation: "https://example.com/main#/type",
          instanceLocation: "#"
        }
      ]
    };

    const result = await betterJsonSchemaErrors(output, schemaUri, instance);
    expect(result.errors).to.eql([{
      schemaLocation: "https://example.com/main#/type",
      instanceLocation: "#",
      message: localization.getTypeErrorMessage("number", "string")
    }]);
  });

  test("maxmimum", async () => {
    registerSchema({
      $schema: "https://json-schema.org/draft/2020-12/schema",
      maximum: 10
    }, schemaUri);

    const instance = 11;

    /** @type OutputFormat */
    const output = {
      valid: false,
      errors: [
        {
          absoluteKeywordLocation: "https://example.com/main#/maximum",
          instanceLocation: "#"
        }
      ]
    };

    const result = await betterJsonSchemaErrors(output, schemaUri, instance);
    expect(result.errors).to.eql([{
      schemaLocation: "https://example.com/main#/maximum",
      instanceLocation: "#",
      message: localization.getNumberErrorMessage({ maximum: 10 })
    }]);
  });

  test("mimimum", async () => {
    registerSchema({
      $schema: "https://json-schema.org/draft/2020-12/schema",
      minimum: 10
    }, schemaUri);

    const instance = 9.9;

    /** @type OutputFormat */
    const output = {
      valid: false,
      errors: [
        {
          absoluteKeywordLocation: "https://example.com/main#/minimum",
          instanceLocation: "#"
        }
      ]
    };

    const result = await betterJsonSchemaErrors(output, schemaUri, instance);
    expect(result.errors).to.eql([{
      schemaLocation: "https://example.com/main#/minimum",
      instanceLocation: "#",
      message: localization.getNumberErrorMessage({ minimum: 10 })
    }]);
  });

  test("exclusiveMaximum", async () => {
    registerSchema({
      $schema: "https://json-schema.org/draft/2020-12/schema",
      exclusiveMaximum: 10
    }, schemaUri);

    const instance = 11;

    /** @type OutputFormat */
    const output = {
      valid: false,
      errors: [
        {
          absoluteKeywordLocation: "https://example.com/main#/exclusiveMaximum",
          instanceLocation: "#"
        }
      ]
    };

    const result = await betterJsonSchemaErrors(output, schemaUri, instance);
    expect(result.errors).to.eql([{
      schemaLocation: "https://example.com/main#/exclusiveMaximum",
      instanceLocation: "#",
      message: localization.getNumberErrorMessage({ maximum: 10, exclusiveMaximum: true })
    }]);
  });

  test("exclusiveMinimum", async () => {
    registerSchema({
      $schema: "https://json-schema.org/draft/2020-12/schema",
      exclusiveMinimum: 10
    }, schemaUri);

    const instance = 9;

    /** @type OutputFormat */
    const output = {
      valid: false,
      errors: [
        {
          absoluteKeywordLocation: "https://example.com/main#/exclusiveMinimum",
          instanceLocation: "#"
        }
      ]
    };

    const result = await betterJsonSchemaErrors(output, schemaUri, instance);
    expect(result.errors).to.eql([{
      schemaLocation: "https://example.com/main#/exclusiveMinimum",
      instanceLocation: "#",
      message: localization.getNumberErrorMessage({ minimum: 10, exclusiveMinimum: true })
    }]);
  });

  test("Combine multiple minimum keywords", async () => {
    registerSchema({
      $schema: "https://json-schema.org/draft/2020-12/schema",
      allOf: [
        { minimum: 2 },
        { minimum: 3 }
      ]
    }, schemaUri);

    const instance = 1;

    /** @type OutputFormat */
    const output = {
      valid: false,
      errors: [
        {
          absoluteKeywordLocation: "https://example.com/main#/allOf/0/minimum",
          instanceLocation: "#"
        },
        {
          absoluteKeywordLocation: "https://example.com/main#/allOf/1/minimum",
          instanceLocation: "#"
        }
      ]
    };

    const result = await betterJsonSchemaErrors(output, schemaUri, instance);
    expect(result.errors).to.eql([{
      schemaLocation: [
        "https://example.com/main#/allOf/0/minimum",
        "https://example.com/main#/allOf/1/minimum"
      ],
      instanceLocation: "#",
      message: localization.getNumberErrorMessage({ minimum: 3 })
    }]);
  });

  test("Combine multiple maximum keywords", async () => {
    registerSchema({
      $schema: "https://json-schema.org/draft/2020-12/schema",
      allOf: [
        { maximum: 5 },
        { maximum: 6 }
      ]
    }, schemaUri);

    const instance = 42;

    /** @type OutputFormat */
    const output = {
      valid: false,
      errors: [
        {
          absoluteKeywordLocation: "https://example.com/main#/allOf/0/maximum",
          instanceLocation: "#"
        },
        {
          absoluteKeywordLocation: "https://example.com/main#/allOf/1/maximum",
          instanceLocation: "#"
        }
      ]
    };

    const result = await betterJsonSchemaErrors(output, schemaUri, instance);
    expect(result.errors).to.eql([{
      schemaLocation: [
        "https://example.com/main#/allOf/0/maximum",
        "https://example.com/main#/allOf/1/maximum"
      ],
      instanceLocation: "#",
      message: localization.getNumberErrorMessage({ maximum: 5 })
    }]);
  });

  test("minimum/maximum range", async () => {
    registerSchema({
      $schema: "https://json-schema.org/draft/2020-12/schema",
      allOf: [
        { minimum: 3 },
        { maximum: 5 }
      ]
    }, schemaUri);

    const instance = 42;

    /** @type OutputFormat */
    const output = {
      valid: false,
      errors: [
        {
          absoluteKeywordLocation: "https://example.com/main#/allOf/0/minimum",
          instanceLocation: "#"
        },
        {
          absoluteKeywordLocation: "https://example.com/main#/allOf/1/maximum",
          instanceLocation: "#"
        }
      ]
    };

    const result = await betterJsonSchemaErrors(output, schemaUri, instance);
    expect(result.errors).to.eql([{
      schemaLocation: [
        "https://example.com/main#/allOf/0/minimum",
        "https://example.com/main#/allOf/1/maximum"
      ],
      instanceLocation: "#",
      message: localization.getNumberErrorMessage({ minimum: 3, maximum: 5 })
    }]);
  });

  test("required", async () => {
    registerSchema({
      $schema: "https://json-schema.org/draft/2020-12/schema",
      required: ["foo", "bar", "baz"]

    }, schemaUri);

    const instance = { foo: 1, bar: 2, extra: true };

    /** @type OutputFormat */
    const output = {
      valid: false,
      errors: [
        {
          absoluteKeywordLocation: "https://example.com/main#/required",
          instanceLocation: "#"
        }
      ]
    };

    const result = await betterJsonSchemaErrors(output, schemaUri, instance);
    expect(result.errors).to.eql([{
      schemaLocation: "https://example.com/main#/required",
      instanceLocation: "#",
      message: localization.getRequiredErrorMessage("#", ["baz"])
    }]);
  });

  test("multipleOf", async () => {
    registerSchema({
      $schema: "https://json-schema.org/draft/2020-12/schema",
      multipleOf: 5

    }, schemaUri);

    const instance = 11;

    /** @type OutputFormat */
    const output = {
      valid: false,
      errors: [
        {
          absoluteKeywordLocation: "https://example.com/main#/multipleOf",
          instanceLocation: "#"
        }
      ]
    };

    const result = await betterJsonSchemaErrors(output, schemaUri, instance);
    expect(result.errors).to.eql([{
      schemaLocation: "https://example.com/main#/multipleOf",
      instanceLocation: "#",
      message: localization.getMultipleOfErrorMessage(5)
    }]);
  });

  test("maxProperties", async () => {
    registerSchema({
      $schema: "https://json-schema.org/draft/2020-12/schema",
      maxProperties: 2

    }, schemaUri);

    const instance = { foo: 1, bar: 2, baz: 3 };

    /** @type OutputFormat */
    const output = {
      valid: false,
      errors: [
        {
          absoluteKeywordLocation: "https://example.com/main#/maxProperties",
          instanceLocation: "#"
        }
      ]
    };

    const result = await betterJsonSchemaErrors(output, schemaUri, instance);
    expect(result.errors).to.eql([{
      schemaLocation: "https://example.com/main#/maxProperties",
      instanceLocation: "#",
      message: localization.getMaxPropertiesErrorMessage(2)
    }]);
  });

  test("minProperties", async () => {
    registerSchema({
      $schema: "https://json-schema.org/draft/2020-12/schema",
      minProperties: 2

    }, schemaUri);

    const instance = { foo: 1 };

    /** @type OutputFormat */
    const output = {
      valid: false,
      errors: [
        {
          absoluteKeywordLocation: "https://example.com/main#/minProperties",
          instanceLocation: "#"
        }
      ]
    };

    const result = await betterJsonSchemaErrors(output, schemaUri, instance);
    expect(result.errors).to.eql([{
      schemaLocation: "https://example.com/main#/minProperties",
      instanceLocation: "#",
      message: localization.getMinPropertiesErrorMessage(2)
    }]);
  });

  test("const", async () => {
    registerSchema({
      $schema: "https://json-schema.org/draft/2020-12/schema",
      const: 2

    }, schemaUri);

    const instance = 3;

    /** @type OutputFormat */
    const output = {
      valid: false,
      errors: [
        {
          absoluteKeywordLocation: "https://example.com/main#/const",
          instanceLocation: "#"
        }
      ]
    };

    const result = await betterJsonSchemaErrors(output, schemaUri, instance);
    expect(result.errors).to.eql([{
      schemaLocation: "https://example.com/main#/const",
      instanceLocation: "#",
      message: localization.getConstErrorMessage(2)
    }]);
  });

  test("enum", async () => {
    registerSchema({
      $schema: "https://json-schema.org/draft/2020-12/schema",
      enum: ["red", "green", "blue"]

    }, schemaUri);

    const instance = "rwd";

    /** @type OutputFormat */
    const output = {
      valid: false,
      errors: [
        {
          absoluteKeywordLocation: "https://example.com/main#/enum",
          instanceLocation: "#"
        }
      ]
    };

    const result = await betterJsonSchemaErrors(output, schemaUri, instance);
    expect(result.errors).to.eql([{
      schemaLocation: "https://example.com/main#/enum",
      instanceLocation: "#",
      message: localization.getEnumErrorMessage({ variant: "suggestion", instanceValue: "rwd", suggestion: "red" })
    }]);
  });

  test("maxItems", async () => {
    registerSchema({
      $schema: "https://json-schema.org/draft/2020-12/schema",
      maxItems: 3
    }, schemaUri);

    const instance = [1, 3, 4, 5];

    /** @type OutputFormat */
    const output = {
      valid: false,
      errors: [
        {
          absoluteKeywordLocation: "https://example.com/main#/maxItems",
          instanceLocation: "#"
        }
      ]
    };

    const result = await betterJsonSchemaErrors(output, schemaUri, instance);
    expect(result.errors).to.eql([{
      schemaLocation: "https://example.com/main#/maxItems",
      instanceLocation: "#",
      message: localization.getMaxItemsErrorMessage(3)
    }]);
  });

  test("minItems", async () => {
    registerSchema({
      $schema: "https://json-schema.org/draft/2020-12/schema",
      minItems: 3
    }, schemaUri);

    const instance = [1, 3];

    /** @type OutputFormat */
    const output = {
      valid: false,
      errors: [
        {
          absoluteKeywordLocation: "https://example.com/main#/minItems",
          instanceLocation: "#"
        }
      ]
    };

    const result = await betterJsonSchemaErrors(output, schemaUri, instance);
    expect(result.errors).to.eql([{
      schemaLocation: "https://example.com/main#/minItems",
      instanceLocation: "#",
      message: localization.getMinItemsErrorMessage(3)
    }]);
  });

  test("uniqueItems", async () => {
    registerSchema({
      $schema: "https://json-schema.org/draft/2020-12/schema",
      uniqueItems: true
    }, schemaUri);

    const instance = [1, 1];

    /** @type OutputFormat */
    const output = {
      valid: false,
      errors: [
        {
          absoluteKeywordLocation: "https://example.com/main#/uniqueItems",
          instanceLocation: "#"
        }
      ]
    };

    const result = await betterJsonSchemaErrors(output, schemaUri, instance);
    expect(result.errors).to.eql([{
      schemaLocation: "https://example.com/main#/uniqueItems",
      instanceLocation: "#",
      message: localization.getUniqueItemsErrorMessage()
    }]);
  });

  test("format: email", async () => {
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

    const result = await betterJsonSchemaErrors(output, schemaUri, instance);
    expect(result.errors).to.eql([
      {
        schemaLocation: "https://example.com/main#/format",
        instanceLocation: "#",
        message: localization.getFormatErrorMessage("email")
      }
    ]);
  });

  test("pattern", async () => {
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

    const result = await betterJsonSchemaErrors(output, schemaUri, instance);
    expect(result.errors).to.eql([
      {
        schemaLocation: "https://example.com/main#/pattern",
        instanceLocation: "#",
        message: localization.getPatternErrorMessage("^[a-z]+$")
      }
    ]);
  });

  test("items", async () => {
    registerSchema({
      $schema: "https://json-schema.org/draft/2020-12/schema",
      items: { type: "number" }
    }, schemaUri);

    const instance = [1, -3.4, "", "foo"];

    /** @type OutputFormat */
    const output = {
      valid: false,
      errors: [
        {
          absoluteKeywordLocation: "https://example.com/main#/items/type",
          instanceLocation: "#/3"
        },
        {
          absoluteKeywordLocation: "https://example.com/main#/items/type",
          instanceLocation: "#/2"
        }
      ]
    };
    const result = await betterJsonSchemaErrors(output, schemaUri, instance);
    expect(result.errors).to.eql([
      {
        instanceLocation: "#/2",
        message: localization.getTypeErrorMessage("number", "string"),
        schemaLocation: "https://example.com/main#/items/type"
      },
      {
        instanceLocation: "#/3",
        message: localization.getTypeErrorMessage("number", "string"),
        schemaLocation: "https://example.com/main#/items/type"
      }
    ]);
  });

  test("prefixItems", async () => {
    registerSchema({
      $schema: "https://json-schema.org/draft/2020-12/schema",
      prefixItems: [
        { type: "number" },
        { type: "boolean" },
        { type: "string" }
      ]
    }, schemaUri);
    const instance = [42, "hehe", 100];
    /** @type OutputFormat */
    const output = {
      valid: false,
      errors: [
        {
          absoluteKeywordLocation: "https://example.com/main#/prefixItems/1/type",
          instanceLocation: "#/1",
          valid: false
        },
        {
          absoluteKeywordLocation: "https://example.com/main#/prefixItems/2/type",
          instanceLocation: "#/2",
          valid: false
        },
        {
          absoluteKeywordLocation: "https://example.com/main#/prefixItems",
          instanceLocation: "#",
          valid: false
        }
      ]
    };
    const result = await betterJsonSchemaErrors(output, schemaUri, instance);
    expect(result.errors).to.eql([
      {
        instanceLocation: "#/1",
        message: localization.getTypeErrorMessage("boolean", "string"),
        schemaLocation: "https://example.com/main#/prefixItems/1/type"
      },
      {
        instanceLocation: "#/2",
        message: localization.getTypeErrorMessage("string", "number"),
        schemaLocation: "https://example.com/main#/prefixItems/2/type"
      }
    ]);
  });

  test("items only validates values not evaluated by prefixItems", async () => {
    registerSchema({
      $schema: "https://json-schema.org/draft/2020-12/schema",
      prefixItems: [
        {
          type: "boolean"
        },
        {
          type: "number"
        }
      ],
      items: {
        type: "string"
      }
    }, schemaUri);
    const instance = [false, "", 2, ""];

    /** @type OutputFormat */
    const output = {
      valid: false,
      errors: [
        {
          absoluteKeywordLocation: "https://example.com/main#/prefixItems/1/type",
          instanceLocation: "#/1"
        },
        {
          absoluteKeywordLocation: "https://example.com/main#/items/type",
          instanceLocation: "#/2"
        }
      ]
    };
    const result = await betterJsonSchemaErrors(output, schemaUri, instance);

    expect(result.errors).to.eql([
      {
        schemaLocation: "https://example.com/main#/prefixItems/1/type",
        instanceLocation: "#/1",
        message: localization.getTypeErrorMessage("number", "string")
      },
      {
        schemaLocation: "https://example.com/main#/items/type",
        instanceLocation: "#/2",
        message: localization.getTypeErrorMessage("string", "number")
      }
    ]);
  });

  test("anyOf where the instance doesn't match type of either of the alternatives", async () => {
    registerSchema({
      $schema: "https://json-schema.org/draft/2020-12/schema",
      anyOf: [
        { type: "string" },
        { type: "number" }
      ]
    }, schemaUri);
    const instance = false;

    /** @type OutputFormat */
    const output = {
      valid: false,
      errors: [
        {
          absoluteKeywordLocation: "https://example.com/main#/anyOf/0/type",
          instanceLocation: "#"
        },
        {
          absoluteKeywordLocation: "https://example.com/main#/anyOf/1/type",
          instanceLocation: "#"
        },
        {
          absoluteKeywordLocation: "https://example.com/main#/anyOf",
          instanceLocation: "#"
        }
      ]
    };

    const result = await betterJsonSchemaErrors(output, schemaUri, instance);
    expect(result.errors).to.eql([
      {
        schemaLocation: "https://example.com/main#/anyOf",
        instanceLocation: "#",
        message: localization.getTypeErrorMessage(["string", "number"], "boolean")
      }
    ]);
  });

  test("anyOf - one type matches, but fails constraint (minLength)", async () => {
    registerSchema({
      $schema: "https://json-schema.org/draft/2020-12/schema",
      anyOf: [
        { type: "string", minLength: 5 },
        { type: "number" }
      ]
    }, schemaUri);

    const instance = "abc";

    const output = {
      valid: false,
      errors: [
        {
          absoluteKeywordLocation: "https://example.com/main#/anyOf/0/minLength",
          instanceLocation: "#"
        },
        {
          absoluteKeywordLocation: "https://example.com/main#/anyOf/1/type",
          instanceLocation: "#"
        },
        {
          absoluteKeywordLocation: "https://example.com/main#/anyOf",
          instanceLocation: "#"
        }
      ]
    };

    const result = await betterJsonSchemaErrors(output, schemaUri, instance);
    expect(result.errors).to.eql([
      {
        schemaLocation: `https://example.com/main#/anyOf/0/minLength`,
        instanceLocation: "#",
        message: localization.getStringErrorMessage({ minLength: 5 })
      }
    ]);
  });

  test("anyOf - multiple types match, pick based on field overlap", async () => {
    registerSchema({
      $schema: "https://json-schema.org/draft/2020-12/schema",
      anyOf: [
        {
          type: "object",
          properties: {
            name: { type: "string" },
            age: { type: "number" }
          },
          required: ["name", "age"]
        },
        {
          type: "object",
          properties: {
            title: { type: "string" },
            author: { type: "string" },
            ID: { type: "string", pattern: "^[0-9\\-]+$" }
          },
          required: ["title", "author", "ID"]
        }
      ]
    }, schemaUri);

    const instance = {
      title: "Clean Code",
      author: "Robert Martin",
      ID: "NotValidId"
    };

    const output = {
      valid: false,
      errors: [
        {
          absoluteKeywordLocation: "https://example.com/main#/anyOf/1/properties/ID/pattern",
          instanceLocation: "#/ID"
        },
        {
          absoluteKeywordLocation: "https://example.com/main#/anyOf/0/required",
          instanceLocation: "#"
        },
        {
          absoluteKeywordLocation: "https://example.com/main#/anyOf/1/properties",
          instanceLocation: "#"
        },
        {
          absoluteKeywordLocation: "https://example.com/main#/anyOf",
          instanceLocation: "#"
        }
      ]
    };
    const result = await betterJsonSchemaErrors(output, schemaUri, instance);
    expect(result.errors).to.eql([
      {
        schemaLocation: "https://example.com/main#/anyOf/1/properties/ID/pattern",
        instanceLocation: "#/ID",
        message: localization.getPatternErrorMessage("^[0-9\\-]+$")
      }
    ]);
  });

  test.skip("anyOf - const-based discriminator mismatch", async () => {
    registerSchema({
      $schema: "https://json-schema.org/draft/2020-12/schema",
      anyOf: [
        {
          type: "object",
          properties: {
            type: { const: "a" },
            apple: { type: "string" },
            angle: { type: "number" }
          },
          required: ["type", "apple", "angle"]
        },
        {
          type: "object",
          properties: {
            type: { const: "b" },
            banana: { type: "string" },
            box: { type: "number" }
          },
          required: ["type", "banana", "box"]
        }
      ]
    }, schemaUri);

    const instance = {
      type: "d",
      banana: "yellow",
      box: 10
    };

    /** @type OutputFormat */
    const output = {
      valid: false,
      errors: [
        {
          absoluteKeywordLocation: `https://example.com/main#/anyOf/0/properties/type/const`,
          instanceLocation: "#/type"
        },
        {
          absoluteKeywordLocation: `https://example.com/main#/anyOf/1/properties/type/const`,
          instanceLocation: "#/type"
        },
        {
          absoluteKeywordLocation: `https://example.com/main#/anyOf`,
          instanceLocation: "#"
        }
      ]
    };

    const result = await betterJsonSchemaErrors(output, schemaUri, instance);

    expect(result.errors).to.eql([
      {
        schemaLocation: `https://example.com/main#/anyOf`,
        instanceLocation: "#/type",
        message: `Invalid value. Expected "a", "b". Found "d".`
      }
    ]);
  });

  test("anyOf - using $ref in alternatives", async () => {
    const subjectUri = "https://example.com/main";

    registerSchema({
      $schema: "https://json-schema.org/draft/2020-12/schema",
      properties: {
        foo: {
          anyOf: [
            { $ref: "#/$defs/stringSchema" },
            { $ref: "#/$defs/numberSchema" }
          ]
        },
        bar: { type: "boolean" }
      },

      $defs: {
        stringSchema: {
          type: "string",
          minLength: 5
        },
        numberSchema: {
          type: "number",
          minimum: 10
        }
      }
    }, subjectUri);

    const instance = { foo: 3 };

    const output = {
      valid: false,
      errors: [
        {
          valid: false,
          keywordLocation: "/properties/foo/anyOf",
          instanceLocation: "/foo",
          errors: [
            {
              valid: false,
              keywordLocation: "/properties/foo/anyOf/0/$ref",
              instanceLocation: "/foo",
              errors: [
                {
                  valid: false,
                  keywordLocation: "/properties/foo/anyOf/0/$ref/type",
                  instanceLocation: "/foo"
                }
              ]
            },
            {
              valid: false,
              keywordLocation: "/properties/foo/anyOf/1/$ref",
              instanceLocation: "/foo",
              errors: [
                {
                  valid: true,
                  keywordLocation: "/properties/foo/anyOf/1/$ref/type",
                  instanceLocation: "/foo"
                },
                {
                  valid: false,
                  keywordLocation: "/properties/foo/anyOf/1/$ref/minimum",
                  instanceLocation: "/foo"
                }
              ]
            }
          ]
        }
      ]
    };

    const result = await betterJsonSchemaErrors(output, schemaUri, instance);

    expect(result.errors).to.eql([
      {
        schemaLocation: "https://example.com/main#/$defs/numberSchema/minimum",
        instanceLocation: "#/foo",
        message: localization.getNumberErrorMessage({ minimum: 10 })
      }
    ]);
  });

  test("normalized output for a failing 'contains' keyword", async () => {
    registerSchema({
      $schema: "https://json-schema.org/draft/2020-12/schema",
      contains: {
        type: "number",
        multipleOf: 2
      }
    }, schemaUri);
    const instance = ["", 3, 5];
    const output = {
      valid: false,
      errors: [
        {
          valid: false,
          keywordLocation: "/contains",
          instanceLocation: "#",
          absoluteKeywordLocation: "https://example.com/main#/contains",
          errors: [
            {
              valid: false,
              instanceLocation: "#/0",
              absoluteKeywordLocation: "https://example.com/main#/contains/type"
            },
            {
              valid: false,
              instanceLocation: "#/1",
              absoluteKeywordLocation: "https://example.com/main#/contains/multipleOf"
            },
            {
              valid: false,
              instanceLocation: "#/2",
              absoluteKeywordLocation: "https://example.com/main#/contains/multipleOf"
            }
          ]
        }
      ]
    };
    const result = await betterJsonSchemaErrors(output, schemaUri, instance);
    expect(result.errors).to.eql([
      {
        instanceLocation: "#",
        message: localization.getContainsErrorMessage({ minContains: 1 }),
        schemaLocation: "https://example.com/main#/contains"
      },
      {
        instanceLocation: "#/0",
        message: localization.getTypeErrorMessage("number", "string"),
        schemaLocation: "https://example.com/main#/contains/type"
      },
      {
        instanceLocation: "#/1",
        message: localization.getMultipleOfErrorMessage(2),
        schemaLocation: "https://example.com/main#/contains/multipleOf"
      },
      {
        instanceLocation: "#/2",
        message: localization.getMultipleOfErrorMessage(2),
        schemaLocation: "https://example.com/main#/contains/multipleOf"
      }
    ]);
  });

  test("normalized output for a failing 'contains' keyword with only minContains", async () => {
    registerSchema({
      $schema: "https://json-schema.org/draft/2020-12/schema",
      contains: {
        type: "number",
        multipleOf: 2
      },
      minContains: 2
    }, schemaUri);
    const instance = ["", 3, 5];
    const output = {
      valid: false,
      errors: [
        {
          valid: false,
          keywordLocation: "/contains",
          instanceLocation: "#",
          absoluteKeywordLocation: "https://example.com/main#/contains",
          errors: [
            {
              valid: false,
              instanceLocation: "#/0",
              absoluteKeywordLocation: "https://example.com/main#/contains/type"
            },
            {
              valid: false,
              instanceLocation: "#/1",
              absoluteKeywordLocation: "https://example.com/main#/contains/multipleOf"
            },
            {
              valid: false,
              instanceLocation: "#/2",
              absoluteKeywordLocation: "https://example.com/main#/contains/multipleOf"
            }
          ]
        }
      ]
    };
    const result = await betterJsonSchemaErrors(output, schemaUri, instance);
    expect(result.errors).to.eql([
      {
        instanceLocation: "#",
        message: localization.getContainsErrorMessage({ minContains: 2 }),
        schemaLocation: "https://example.com/main#/contains"
      },
      {
        instanceLocation: "#/0",
        message: localization.getTypeErrorMessage("number", "string"),
        schemaLocation: "https://example.com/main#/contains/type"
      },
      {
        instanceLocation: "#/1",
        message: localization.getMultipleOfErrorMessage(2),
        schemaLocation: "https://example.com/main#/contains/multipleOf"
      },
      {
        instanceLocation: "#/2",
        message: localization.getMultipleOfErrorMessage(2),
        schemaLocation: "https://example.com/main#/contains/multipleOf"
      }
    ]);
  });

  test("`contains` with `minContains` and `maxContains` keyword", async () => {
    registerSchema({
      $schema: "https://json-schema.org/draft/2020-12/schema",
      contains: {
        type: "number",
        multipleOf: 2
      },
      minContains: 2,
      maxContains: 4
    }, schemaUri);
    const instance = ["", 3, 5];
    const output = {
      valid: false,
      errors: [
        {
          valid: false,
          keywordLocation: "/contains",
          instanceLocation: "#",
          absoluteKeywordLocation: "https://example.com/main#/contains",
          errors: [
            {
              valid: false,
              instanceLocation: "#/0",
              absoluteKeywordLocation: "https://example.com/main#/contains/type"
            },
            {
              valid: false,
              instanceLocation: "#/1",
              absoluteKeywordLocation: "https://example.com/main#/contains/multipleOf"
            },
            {
              valid: false,
              instanceLocation: "#/2",
              absoluteKeywordLocation: "https://example.com/main#/contains/multipleOf"
            }
          ]
        }
      ]
    };
    const result = await betterJsonSchemaErrors(output, schemaUri, instance);
    expect(result.errors).to.eql([
      {
        instanceLocation: "#",
        message: localization.getContainsErrorMessage({ minContains: 2, maxContains: 4 }),
        schemaLocation: "https://example.com/main#/contains"
      },
      {
        instanceLocation: "#/0",
        message: localization.getTypeErrorMessage("number", "string"),
        schemaLocation: "https://example.com/main#/contains/type"
      },
      {
        instanceLocation: "#/1",
        message: localization.getMultipleOfErrorMessage(2),
        schemaLocation: "https://example.com/main#/contains/multipleOf"
      },
      {
        instanceLocation: "#/2",
        message: localization.getMultipleOfErrorMessage(2),
        schemaLocation: "https://example.com/main#/contains/multipleOf"
      }
    ]);
  });

  test("when then fails in if-then-else", async () => {
    registerSchema({
      $schema: "https://json-schema.org/draft/2020-12/schema",
      if: { multipleOf: 2 },
      then: { minimum: 0 }
    }, schemaUri);
    const instance = -2;
    const errorOutput = {
      valid: false,
      errors: [
        {
          valid: false,
          absoluteKeywordLocation: "https://example.com/main#/then/minimum",
          instanceLocation: "#"
        }
      ]
    };

    const result = await betterJsonSchemaErrors(errorOutput, schemaUri, instance);
    expect(result.errors).to.eql([
      {
        instanceLocation: "#",
        message: localization.getNumberErrorMessage({ minimum: 0 }),
        schemaLocation: "https://example.com/main#/then/minimum"
      }
    ]);
  });

  test("when else fails in if-then-else", async () => {
    registerSchema({
      $schema: "https://json-schema.org/draft/2020-12/schema",
      if: { multipleOf: 2 },
      else: { minimum: 0 }
    }, schemaUri);
    const instance = -3;
    const errorOutput = {
      valid: false,
      errors: [
        {
          valid: false,
          absoluteKeywordLocation: "https://example.com/main#/else/minimum",
          instanceLocation: "#"
        }
      ]
    };

    const result = await betterJsonSchemaErrors(errorOutput, schemaUri, instance);
    expect(result.errors).to.eql([
      {
        instanceLocation: "#",
        message: localization.getNumberErrorMessage({ minimum: 0 }),
        schemaLocation: "https://example.com/main#/else/minimum"
      }
    ]);
  });

  test("not case", async () => {
    registerSchema({
      $schema: "https://json-schema.org/draft/2020-12/schema",
      not: {
        const: "Prohibited"
      }
    }, schemaUri);
    const instance = "Prohibited";
    const errorOutput = {
      valid: false,
      errors: [
        {
          valid: false,
          absoluteKeywordLocation: "https://example.com/main#/not",
          instanceLocation: "#"
        }
      ]
    };

    const result = await betterJsonSchemaErrors(errorOutput, schemaUri, instance);
    expect(result.errors).to.eql([
      {
        instanceLocation: "#",
        message: `The instance is not allowed to be used in this schema.`,
        schemaLocation: "https://example.com/main#/not"
      }
    ]);
  });

  test("patternProperties case", async () => {
    registerSchema({
      $schema: "https://json-schema.org/draft/2020-12/schema",
      patternProperties: {
        "^[a-z]+$": { type: "integer" }
      }
    }, schemaUri);
    const instance = { foo: "should have been an integer" };
    const errorOutput = {
      valid: false,
      errors: [
        {
          valid: false,
          absoluteKeywordLocation: "https://example.com/main#/patternProperties/%5E%5Ba-z%5D+$/type",
          instanceLocation: "#/foo"
        }
      ]
    };

    const result = await betterJsonSchemaErrors(errorOutput, schemaUri, instance);
    expect(result.errors).to.eql([
      {
        instanceLocation: "#/foo",
        message: localization.getTypeErrorMessage("integer", "string"),
        schemaLocation: "https://example.com/main#/patternProperties/%5E%5Ba-z%5D+$/type"
      }
    ]);
  });

  test("propertyName case", async () => {
    registerSchema({
      $schema: "https://json-schema.org/draft/2020-12/schema",
      propertyNames: { pattern: "^[a-z]*$" }
    }, schemaUri);
    const instance = { Foo: 1 };
    const errorOutput = {
      valid: false,
      errors: [
        {
          valid: false,
          absoluteKeywordLocation: "https://example.com/main#/propertyNames/pattern",
          instanceLocation: "#*/Foo"
        }
      ]
    };

    const result = await betterJsonSchemaErrors(errorOutput, schemaUri, instance);
    expect(result.errors).to.eql([
      {
        instanceLocation: "#/Foo",
        message: localization.getPatternErrorMessage("^[a-z]*$"),
        schemaLocation: "https://example.com/main#/propertyNames/pattern"
      }
    ]);
  });

  test("propertyName case -- without star notation", async () => {
    registerSchema({
      $schema: "https://json-schema.org/draft/2020-12/schema",
      propertyNames: { pattern: "^[a-z]*$" }
    }, schemaUri);
    const instance = { Foo: 1 };
    const errorOutput = {
      valid: false,
      errors: [
        {
          valid: false,
          absoluteKeywordLocation: "https://example.com/main#/propertyNames/pattern",
          instanceLocation: "#/Foo"
        }
      ]
    };

    const result = await betterJsonSchemaErrors(errorOutput, schemaUri, instance);
    expect(result.errors).to.eql([
      {
        instanceLocation: "#/Foo",
        message: localization.getPatternErrorMessage("^[a-z]*$"),
        schemaLocation: "https://example.com/main#/propertyNames/pattern"
      }
    ]);
  });

  test.skip("propertyName case -- error on the object, not the key", async () => {
    registerSchema({
      $schema: "https://json-schema.org/draft/2020-12/schema",
      propertyNames: { pattern: "^[a-z]*$" }
    }, schemaUri);
    const instance = { Foo: 1 };
    const errorOutput = {
      valid: false,
      errors: [
        {
          valid: false,
          absoluteKeywordLocation: "https://example.com/main#/propertyNames",
          instanceLocation: "#"
        }
      ]
    };

    const result = await betterJsonSchemaErrors(errorOutput, schemaUri, instance);
    expect(result.errors).to.eql([
      {
        instanceLocation: "#*/Foo",
        message: localization.getPatternErrorMessage("^[a-z]*$"),
        schemaLocation: "https://example.com/main#/propertyNames/pattern"
      }
    ]);
  });

  test("should fail when an additional property is found and additionalProperties is false", async () => {
    registerSchema({
      $schema: "https://json-schema.org/draft/2020-12/schema",
      properties: {
        known_property: { type: "string" }
      },
      patternProperties: {
        "^known_pattern_": { type: "string" }
      },
      additionalProperties: false
    }, schemaUri);

    const instance = {
      known_property: "This is allowed.",
      known_pattern_abc: "This is also allowed.",
      unknown_property: "This property is not allowed.",
      unknown_property1: "This property is not allowed."
    };

    const errorOutput = {
      valid: false,
      errors: [
        {
          valid: false,
          absoluteKeywordLocation: "https://example.com/main#/additionalProperties",
          instanceLocation: "#/unkownProperty"
        },
        {
          valid: false,
          absoluteKeywordLocation: "https://example.com/main#/additionalProperties",
          instanceLocation: "#/unkownProperty1"
        }
      ]
    };

    const result = await betterJsonSchemaErrors(errorOutput, schemaUri, instance);

    expect(result.errors).to.eql([
      {
        instanceLocation: "#/unknown_property",
        message: localization.getAdditionalPropertiesErrorMessage("unknown_property"),
        schemaLocation: "https://example.com/main#/additionalProperties"
      },
      {
        instanceLocation: "#/unknown_property1",
        message: localization.getAdditionalPropertiesErrorMessage("unknown_property1"),
        schemaLocation: "https://example.com/main#/additionalProperties"
      }
    ]);
  });

  test("dependentRequired case", async () => {
    registerSchema({
      $schema: "https://json-schema.org/draft/2020-12/schema",
      dependentRequired: {
        foo: ["bar", "baz"]
      }
    }, schemaUri);

    const instance = { foo: 1, bar: 2 };

    const errorOutput = {
      valid: false,
      errors: [
        {
          valid: false,
          absoluteKeywordLocation: "https://example.com/main#/dependentRequired",
          instanceLocation: "#"
        }
      ]
    };

    const result = await betterJsonSchemaErrors(errorOutput, schemaUri, instance);

    expect(result.errors).to.eql([
      {
        instanceLocation: "#",
        message: localization.getDependentRequiredErrorMessage("foo", ["baz"]),
        schemaLocation: "https://example.com/main#/dependentRequired"
      }
    ]);
  });

  test("minLength/maxLength and pattern test", async () => {
    registerSchema({
      $schema: "https://json-schema.org/draft/2020-12/schema",
      allOf: [
        { minLength: 3 },
        { maxLength: 5 }
      ]
    }, schemaUri);

    const instance = "AAAAAAA";

    /** @type OutputFormat */
    const output = {
      valid: false,
      errors: [
        {
          absoluteKeywordLocation: "https://example.com/main#/allOf/0/minLength",
          instanceLocation: "#"
        },
        {
          absoluteKeywordLocation: "https://example.com/main#/allOf/1/maxLength",
          instanceLocation: "#"
        }
      ]
    };

    const result = await betterJsonSchemaErrors(output, schemaUri, instance);
    expect(result.errors).to.eql([{
      schemaLocation: [
        "https://example.com/main#/allOf/0/minLength",
        "https://example.com/main#/allOf/1/maxLength"
      ],
      instanceLocation: "#",
      message: localization.getStringErrorMessage({ minLength: 3, maxLength: 5 })
    }]);
  });
});
