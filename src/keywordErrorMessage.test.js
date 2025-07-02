import { afterEach, describe, test, expect } from "vitest";
import { betterJsonSchemaErrors } from "./index.js";
import { registerSchema } from "@hyperjump/json-schema/draft-2020-12";
import { unregisterSchema } from "@hyperjump/json-schema";

/**
 * @import { OutputFormat} from "./index.d.ts"
 */

describe("Error messages", () => {
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

    const result = await betterJsonSchemaErrors(instance, output, schemaUri);
    expect(result.errors).to.eql([{
      schemaLocation: "https://example.com/main#/minLength",
      instanceLocation: "#",
      message: "The instance should be at least 3 characters"
    }
    ]);
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

    const result = await betterJsonSchemaErrors(instance, output, schemaUri);
    expect(result.errors).to.eql([{
      schemaLocation: "https://example.com/main#/maxLength",
      instanceLocation: "#",
      message: "The instance should be at most 3 characters long."
    }
    ]);
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

    const result = await betterJsonSchemaErrors(instance, output, schemaUri);
    expect(result.errors).to.eql([{
      schemaLocation: "https://example.com/main#/type",
      instanceLocation: "#",
      message: `The instance should be of type "number" but found "string".`
    }
    ]);
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

    const result = await betterJsonSchemaErrors(instance, output, schemaUri);
    expect(result.errors).to.eql([{
      schemaLocation: "https://example.com/main#/maximum",
      instanceLocation: "#",
      message: `The instance should be less than or equal to 10.`
    }
    ]);
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

    const result = await betterJsonSchemaErrors(instance, output, schemaUri);
    expect(result.errors).to.eql([{
      schemaLocation: "https://example.com/main#/minimum",
      instanceLocation: "#",
      message: `The instance should be greater than or equal to 10.`
    }
    ]);
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

    const result = await betterJsonSchemaErrors(instance, output, schemaUri);
    expect(result.errors).to.eql([{
      schemaLocation: "https://example.com/main#/exclusiveMaximum",
      instanceLocation: "#",
      message: `The instance should be less than 10.`
    }
    ]);
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

    const result = await betterJsonSchemaErrors(instance, output, schemaUri);
    expect(result.errors).to.eql([{
      schemaLocation: "https://example.com/main#/exclusiveMinimum",
      instanceLocation: "#",
      message: `The instance should be greater than 10.`
    }
    ]);
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

    const result = await betterJsonSchemaErrors(instance, output, schemaUri);
    expect(result.errors).to.eql([{
      schemaLocation: "https://example.com/main#/required",
      instanceLocation: "#",
      message: `"#" is missing required property(s): baz.`
    }
    ]);
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

    const result = await betterJsonSchemaErrors(instance, output, schemaUri);
    expect(result.errors).to.eql([{
      schemaLocation: "https://example.com/main#/multipleOf",
      instanceLocation: "#",
      message: `The instance should be of multiple of 5.`
    }
    ]);
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

    const result = await betterJsonSchemaErrors(instance, output, schemaUri);
    expect(result.errors).to.eql([{
      schemaLocation: "https://example.com/main#/maxProperties",
      instanceLocation: "#",
      message: `The instance should have maximum 2 properties.`
    }
    ]);
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

    const result = await betterJsonSchemaErrors(instance, output, schemaUri);
    expect(result.errors).to.eql([{
      schemaLocation: "https://example.com/main#/minProperties",
      instanceLocation: "#",
      message: `The instance should have minimum 2 properties.`
    }
    ]);
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

    const result = await betterJsonSchemaErrors(instance, output, schemaUri);
    expect(result.errors).to.eql([{
      schemaLocation: "https://example.com/main#/const",
      instanceLocation: "#",
      message: `The instance should be equal to 2.`
    }
    ]);
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

    const result = await betterJsonSchemaErrors(instance, output, schemaUri);
    expect(result.errors).to.eql([{
      schemaLocation: "https://example.com/main#/enum",
      instanceLocation: "#",
      message: `Unexpected value "rwd".  Did you mean "red"?`
    }]);
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

    const result = await betterJsonSchemaErrors(instance, output, schemaUri);
    expect(result.errors).to.eql([
      {
        schemaLocation: "https://example.com/main#/pattern",
        instanceLocation: "#",
        message: "The instance should match the pattern: ^[a-z]+$."
      }
    ]);
  });

  test("minItems", async () => {
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
    expect(result.errors).to.eql([
      {
        schemaLocation: "https://example.com/main#/minItems",
        instanceLocation: "#",
        message: "The instance should have at least 3 items."
      }
    ]);
  });

  test("maxItems", async () => {
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
    expect(result.errors).to.eql([
      {
        schemaLocation: "https://example.com/main#/maxItems",
        instanceLocation: "#",
        message: "The instance should have at most 2 items."
      }
    ]);
  });

  test("uniqueItems", async () => {
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
    expect(result.errors).to.eql([
      {
        schemaLocation: "https://example.com/main#/uniqueItems",
        instanceLocation: "#",
        message: "The array should not contain duplicate items."
      }
    ]);
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

    const result = await betterJsonSchemaErrors(instance, output, schemaUri);
    expect(result.errors).to.eql([
      {
        schemaLocation: "https://example.com/main#/format",
        instanceLocation: "#",
        message: "The instance should match the format: email."
      }
    ]);
  });
});
