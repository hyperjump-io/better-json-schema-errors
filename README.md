# Hyperjump - Better JSON Schema Errors 
It transforms standard, machine-oriented validation output into clear, human-friendly error messages ideal for API responses and developer tools. Built upon the official JSON Schema Output Format introduced in draft 2019-09, it ensures seamless compatibility with any compliant validator.

### Node.js

```bash
npm install @hyperjump/better-json-schema-errors
```

## API Error Message Format
  
Our API Error Format includes :-
- **`schemaLocation`**  - A JSON Pointer or URI that points to the specific keyword(s) within the schema that failed validation. This can be a single string or an array of absolute keyword locations for errors that are grouped together.

- **`instanceLocation`**  - JSON Pointer to the invalid piece of input data.  

- **`message`** - Human-friendly explanation of the validation error.  

Example:-
```json
{
  "errors": [
    {
      "schemaLocation": "https://example.com/main#/properties/name/minLength",
      "instanceLocation": "#/name",
      "message": "Expected a string at least 5 characters long."
    }
  ]
}
```

## Install

This module is designed for node.js (ES Modules, TypeScript) and browsers. It
should work in Bun and Deno as well, but the test runner doesn't work in these
environments, so this module may be less stable in those environments.



## Examples and Basic Usage
Better JSON Schema Errors works with **any JSON Schema validator** that follows the official [JSON Schema Output Format](https://json-schema.org/draft/2019-09).  
In this example, we’ll showcase it with the [Hyperjump JSON Schema Validator](https://github.com/hyperjump-io/json-schema).  

Now let's define a schema and some invalid data, then run the validation and process the output with `better-json-schema-errors`. :-
```js
import { registerSchema, validate, unregisterSchema } from "@hyperjump/json-schema/draft-2020-12";
import { betterJsonSchemaErrors } from "@hyperjump/better-json-schema-errors";

async function runExample() {
  const schemaUri = "https://example.com/main";
  registerSchema({
    $schema: "https://json-schema.org/draft/2020-12/schema",
    anyOf: [
      { enum: ["a", "b", "c"] }
    ]
  }, schemaUri);

  const instance = 4;
  const result = await validate(schemaUri, instance, "BASIC");

  if (result.valid) {
    console.log("Valid instance!");
  } else {
    const friendlyErrors = await betterJsonSchemaErrors(result, schemaUri, instance);
    console.log(JSON.stringify(friendlyErrors, null, 2));
  }

  unregisterSchema(schemaUri);
}

await runExample();
```
Output:- 
```json
{
  "errors": [
    {
      "message": "Unexpected value 4. Expected one of: 'a', 'b', or 'c'.",
      "instanceLocation": "#",
      "schemaLocation": "https://example.com/main#/enum"
    }
  ]
}
```

## Features and Advanced Usage
Better JSON Schema Errors goes beyond simply rephrasing validation messages. It provides a **robust error normalization layer** on top of the official [JSON Schema Output Format](https://json-schema.org/draft/2019-09), ensuring consistent, human-friendly results across different validators and error formats.  
### 1. Works with All Output Formats
Supports all three standardized output formats:  
- **BASIC** —   The "Basic" structure is a flat list of output units
- **DETAILED** — The "Detailed" structure is based on the schema and can be more readable for both
humans and machines.
- **VERBOSE** —  The "Verbose" structure is a fully realised hierarchy that exactly matches that of the
schema.

No matter which output format your validator produces, Better JSON Schema Errors can process it.  

### 2. Resolves Output Ambiguities
Some validators may provide inconsistent or ambiguous data, such as using `keywordLocation` instead of the required `absoluteKeywordLocation`. Our library resolves these issues by normalizing both the `keywordLocation` and `instanceLocation`. It adds the leading `#` to `instanceLocation` and standardizes the path, so everything is a valid JSON Pointer and can be used predictably. This helps resolve ambiguities and provides a unified, reliable format for all error messages.

### 3. Multiple Schema Locations
Sometimes a single validation issue is tied to **more than one schema keyword**.  
For example, when both `minimum` and `exclusiveMinimum` apply, or when `minLength` and `maxLength` constraints overlap or when when both `minimum` and `maximum` apply.  

Instead of generating duplicate error messages, It groups these into an **array of schema locations** and produces one concise, human-friendly message :-

```json
{
  "schemaLocation": [
    "https://example.com/main#/minimum",
    "https://example.com/main#/maximum"
  ],
  "instanceLocation": "#/age",
  "message": "Expected a number greater than 5 and less than 10."
}
```
### 4. Localization

The library uses a [fluent/bundle](https://github.com/projectfluent/fluent.js/tree/main/fluent-bundle) to provide localized error messages. By default, only English is supported.

We need contributions from different countries to add more languages.

To change the language, pass a language option to the betterJsonSchemaErrors function, like this:  

```
    const friendlyErrors = await betterJsonSchemaErrors(result, schemaUri, instance, "en-US");
```
### 5. Handling `anyOf` with Clarity

The `anyOf` keyword is a powerful but complex JSON Schema feature. When an instance fails to validate against all subschemas within an `anyOf`, standard validator output can be verbose and confusing, often returning an error for each failed subschema.

**Better JSON Schema Errors** intelligently simplifies this output, providing clear, consolidated error messages that are easier to debug.

---

#### 1. Mismatched Types

If the instance's type doesn't match any of the alternatives in an `anyOf`, the library provides a concise error message listing the expected types.

**Schema:**
```json
{
  "anyOf": [
    { "type": "string" },
    { "type": "number" }
  ]
}
```

Invalid Instance:-
``` Json
false
```
BetterJSONSchemaErrors Output:-
``` Json
{
  "errors": [
    {
      "schemaLocation": "https://example.com/main#/anyOf",
      "instanceLocation": "#",
      "message": "The instance should be of type 'string' or 'number' but found 'boolean'."
    }
  ]
}

```
#### 2. Partial Match with a Failed Constraint

If the instance's type matches one of the `anyOf` alternatives but fails a subsequent constraint (like `minLength`), our library correctly identifies the specific rule that was violated.

**Schema:**
```json
{
  "anyOf": [
    { "type": "string", "minLength": 5 },
    { "type": "number" }
  ]
}
```

Invalid Instance:-
``` Json
"abc"
```
BetterJSONSchemaErrors Output:-
``` Json
{
  "errors": [
    {
      "schemaLocation": "https://example.com/main#/anyOf/0/minLength",
      "instanceLocation": "#",
      "message": "Expected a string at least 5 characters long."
    }
  ]
}

```

#### 3. Multiple types match, pick based on field overlap

When an instance matches multiple `anyOf` alternatives type, the library prioritizes the one with the most relevant error based on the instance's fields.

**Schema:**
```json
{
  "anyOf": [
    {
      "type": "object",
      "properties": {
        "name": { "type": "string" },
        "age": { "type": "number" }
      },
      "required": ["name", "age"]
    },
    {
      "type": "object",
      "properties": {
        "title": { "type": "string" },
        "author": { "type": "string" },
        "ID": { "type": "string", "pattern": "^[0-9\\-]+$" }
      },
      "required": ["title", "author", "ID"]
    }
  ]
}
```

Invalid Instance:-
``` Json
{
  "title": "Clean Code",
  "author": "Robert Martin",
  "ID": "NotValidId"
}
```
BetterJSONSchemaErrors Output:-
``` Json
{
  "errors": [
    {
      "schemaLocation": "https://example.com/main#/anyOf/1/properties/ID/pattern",
      "instanceLocation": "#/ID",
      "message": "The instance should match the format: \"^[0-9\\-]+$\". "
    }
  ]
}

```
## API

<https://better-json-schema-errors.hyperjump.io/modules.html>

## Contributing

Contributions are welcome! Please create an issue to propose and discuss any
changes you'd like to make before implementing it. If it's an obvious bug with
an obvious solution or something simple like a fixing a typo, creating an issue
isn't required. You can just send a PR without creating an issue. Before
submitting any code, please remember to first run the following tests.
- `npm test` (Tests can also be run continuously using `npm test -- --watch`)
- `npm run lint`
- `npm run type-check`
