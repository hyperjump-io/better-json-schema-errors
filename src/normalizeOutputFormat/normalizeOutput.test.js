import { describe, expect, test } from "vitest";
import { normalizeOutputFormat } from "./normalizeOutput.js";
import { betterJsonSchemaErrors } from "../index.js";

/**
 * @import { OutputFormat, OutputUnit, SchemaObject } from "../index.d.ts"
 */

describe("Error Output Normalization", () => {
  test("Simple keyword with a standard Basic output format", () => {
    /** @type SchemaObject */
    const schema = {
      minLength: 3
    };

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

    const result = betterJsonSchemaErrors(instance, schema, output);
    expect(result.errors).to.eql([{
      schemaLocation: "https://example.com/main#/minLength",
      instanceLocation: "#",
      message: "The instance should be at least 3 characters"
    }
    ]);
  });

  test("Checking when output contain only instanceLocation and keywordLocation ", () => {
    /** @type SchemaObject */
    const schema = {
      minLength: 3
    };

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

    const result = betterJsonSchemaErrors(instance, schema, output);
    expect(result.errors).to.eql([{
      schemaLocation: "https://example.com/main#/minLength",
      instanceLocation: "#",
      message: "The instance should be at least 3 characters"
    }]);
  });

  test("adding # if instanceLocation doesn't have it", () => {
    /** @type SchemaObject */
    const schema = {
      minlength: 3
    };

    const instance = "aa";

    /** @type OutputFormat */
    const output = {
      valid: false,
      errors: [
        {
          valid: false,
          keywordLocation: "",
          instanceLocation: ""
        }
      ]
    };

    const result = betterJsonSchemaErrors(instance, schema, output);
    expect(result.errors).to.eql([{
      schemaLocation: "https://example.com/main#/minLength",
      instanceLocation: "#",
      message: "The instance should be at least 3 characters"
    }]);
  });

  // const schema = {
  //   type: "object",
  //   properties: {
  //     foo: { $ref: "#/$defs/foo" }
  //   },
  //   $defs: {
  //     foo: { type: "number" }
  //   }
  // };
  // const instance = { foo: true };
  // const absoluteKeywordLocation = "/$defs/foo/type";
  // const keywordLocation = "/properties/foo/$ref/type";

  test("checking for the basic output format", () => {
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

    expect(normalizeOutputFormat(errorOutput)).to.eql([
      {
        valid: false,
        absoluteKeywordLocation: "https://example.com/polygon#/$defs/point",
        instanceLocation: "#/1"
      },
      {
        valid: false,
        absoluteKeywordLocation: "https://example.com/polygon#/$defs/point/required",
        instanceLocation: "#/1"
      },
      {
        valid: false,
        absoluteKeywordLocation: "https://example.com/polygon#/$defs/point/additionalProperties",
        instanceLocation: "#/1/z"
      }
    ]);
  });

  test("checking for the detailed output format", () => {
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

    expect(normalizeOutputFormat(errorOutput)).to.eql([
      {
        valid: false,
        absoluteKeywordLocation: "https://example.com/polygon#/$defs/point",
        instanceLocation: "#/1"
      },
      {
        valid: false,
        absoluteKeywordLocation: "https://example.com/polygon#/$defs/point/required",
        instanceLocation: "#/1"
      },
      {
        valid: false,
        absoluteKeywordLocation: "https://example.com/polygon#/$defs/point/additionalProperties",
        instanceLocation: "#/1/z"
      }
    ]);
  });

  test("checking for the verbose output format", () => {
    const errorOutput = {
      valid: false,
      keywordLocation: "#",
      instanceLocation: "#",
      errors: [
        {
          valid: true,
          absoluteKeywordLocation: "https://example.com/schema#/type",
          instanceLocation: "#"
        },
        {
          valid: true,
          absoluteKeywordLocation: "https://example.com/schema#/properties",
          instanceLocation: "#"
        },
        {
          valid: false,
          absoluteKeywordLocation: "https://example.com/schema#/additionalProperties",
          instanceLocation: "#",
          errors: [
            {
              valid: false,
              absoluteKeywordLocation: "https://example.com/schema#/additionalProperties",
              instanceLocation: "#/disallowedProp",
              error: "Additional property 'disallowedProp' found but was invalid."
            }
          ]
        }
      ]
    };

    expect(normalizeOutputFormat(errorOutput)).to.eql([
      {
        valid: false,
        absoluteKeywordLocation: "https://example.com/schema#/additionalProperties",
        instanceLocation: "#"
      },
      {
        valid: false,
        absoluteKeywordLocation: "https://example.com/schema#/additionalProperties",
        instanceLocation: "#/disallowedProp"
      }
    ]);
  });

  test("when error output doesnot contain any of these three keyword (valid, absoluteKeywordLocation, instanceLocation)", () => {
    const errorOutput = {
      valid: false,
      errors: [
        {
          valid: false,
          keywordLocation: "#/items/$ref/additionalProperties"
        }
      ]
    };
    expect(() => normalizeOutputFormat(/** @type any */ (errorOutput))).to.throw("error Output must follow Draft 2019-09");
  });
});
