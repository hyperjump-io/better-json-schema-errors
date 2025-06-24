import { describe, test, expect } from "vitest";
import { betterJsonSchemaErrors } from "./index.js";
import { registerSchema } from "@hyperjump/json-schema/draft-2020-12";

describe("Error messages", () => {
  test("minLength", async () => {
    registerSchema({
      $id: "https://example.com/main",
      $schema: "https://json-schema.org/draft/2020-12/schema",
      minLength: 3
    });

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
  });
});
