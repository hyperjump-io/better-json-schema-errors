# Hyperjump - Better JSON Schema Errors 
It transforms standard, machine-oriented validation output into clear, human-friendly error messages ideal for API responses and developer tools. Built upon the official JSON Schema Output Format introduced in draft 2019-09, it ensures seamless compatibility with any compliant validator.


> **Note:** This package is not yet published to npm. You can clone this repository locally to experiment with it:
> This project is currently a **work in progress** and will be published to npm once completed.


## API Error Message Format
  
Our API Error Format includes :-
- **`schemaLocation`**  - A URI that points to the specific keyword(s) within the schema that failed validation. This can be a single string or an array of absolute keyword locations for errors that are grouped together.

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
Better JSON Schema Errors works with **any JSON Schema validator** that follows the official [JSON Schema Output Format](https://json-schema.org/draft/2020-12/json-schema-core#name-output-structure).  
In this example, we’ll showcase it with the [Hyperjump JSON Schema Validator](https://github.com/hyperjump-io/json-schema).  

Now let's define a schema and some invalid data, then run the validation and process the output with `better-json-schema-errors`. :-
```js
import { registerSchema, validate, unregisterSchema } from "@hyperjump/json-schema/draft-2020-12";
import { betterJsonSchemaErrors } from "@hyperjump/better-json-schema-errors";

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

### 1. Works with All Output Formats
Supports all three standardized output formats:  
- **BASIC** —   The "Basic" structure is a flat list of output units
- **DETAILED** — The "Detailed" structure is based on the schema and can be more readable for both
humans and machines.
- **VERBOSE** —  The "Verbose" structure is a fully realised hierarchy that exactly matches that of the
schema.

No matter which output format your validator produces, Better JSON Schema Errors can process it.  

### 2. Multiple Schema Locations
Sometimes a single validation issue is tied to **more than one schema keyword**.  
For example, when both `minimum` and `exclusiveMinimum` apply, or when `minLength` and `maxLength` constraints overlap or when when both `minimum` and `maximum` apply.  

Instead of multiple related error messages, It groups these into an **array of schema locations** and produces one concise, human-friendly message :-

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
### 3. Localization

The library uses [fluent](https://projectfluent.org) `.ftl` files to provide localized error messages. By default, only English is supported.

We need contributions from different countries to add more languages.

To change the language, pass a language option to the betterJsonSchemaErrors function, like this:  

```js
const friendlyErrors = await betterJsonSchemaErrors(result, schemaUri, instance, { language: "en-US" });
```

### 4. Handling `anyOf`/`oneOf` with Clarity

The `anyOf`/`oneOf` keyword is a powerful but complex JSON Schema feature. **better-json-schema-errors** intelligently simplifies its output by providing clear, consolidated error messages that are easier to debug. Whenever possible it will try to determine which alternative the user intended and focus the error output to only those errors related to correcting the data for that alternative.

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
```json
"abc"
```
BetterJSONSchemaErrors Output:-
```json
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

For detailed examples, see the dedicated [**anyOf** documentation](./documentation/anyOf.md).

### 5. Handling `enum` with Suggestions

When data doesn’t match an allowed `enum` value, Better JSON Schema Errors produces clear messages.  
It can also suggest the closest valid value (using string similarity).

Example:

```json
{
  "errors": [
    {
      "message": "Unexpected value 'appl'. Did you mean 'apple'?",
      "instanceLocation": "#/fruit",
      "schemaLocation": "https://example.com/main#/properties/fruit/enum"
    }
  ]
}
```
This makes typos or near-misses much easier to debug.
For full details and strategies, see the dedicated [enum documentation](./documentation/enum.md).

### 6. Range constraint keywords
Better JSON Schema Errors consolidates multiple range-related validation errors (`minimum`, `maxLength`, `minItems`, etc.) into a single, clear message.  
For example, a schema like:
```json
{ "allOf": [
    { "minimum": 3 },
    { "minimum": 5 }
  ]
}
```
Instance:-
```json
2
```
BetterJSONSchemaErrors Output:-
```json
{
  "errors": [
    {
      "schemaLocation": "https://example.com/main#/allOf/1/minimum",
      "instanceLocation": "#",
      "message": "Expected a number greater than 5."
    }
  ]
}
```
Instead of 2 error message it manages to give a single concise error message. For details, see the dedicated [Range documenetation](./documentation/range-handler.md)

### 7. Custom Keywords and Error Handlers
In order to create the custom keywords and error handlers we need to create and
register two types of handlers: **Normalization Handler** and **Error Handlers**.

1. Normalization: This phase takes the raw, often deeply nested, error output
from the validator and converts it into a NormalizedOutput (you can check type of
normalizedOutput in the index.d.ts file).

2. Error Handling: This phase takes the normalized output and uses it to generate the final error messages. This is the job of the Error Handlers.  

Fist step -: Creating the keywordHandler
```js
/**
 * @import { KeywordHandler } from "@hyperjump/better-json-schema-errors"
 */

/** @type KeywordHandler */
const multipleOfTen = {
  appliesTo(type) {
    return type === "number"
  }
};

export default multipleOfTen;

```

Second step -: Creating the errorHandler
```js
import { getSchema } from "@hyperjump/json-schema/experimental";
import * as Schema from "@hyperjump/browser";
import * as Instance from "@hyperjump/json-schema/instance/experimental";

/**
 * @import { ErrorHandler, ErrorObject } from "@hyperjump/better-json-schema-errors"
 */

/** @type ErrorHandler */
const ErrorHandler = async (normalizedErrors, instance, localization) => {
  /** @type ErrorObject[] */
  const errors = [];

  if (normalizedErrors["https://json-schema.org/keyword/multipleOfTen"]) {
    for (const schemaLocation in normalizedErrors["https://json-schema.org/keyword/multipleOfTen"]) {
      if (!normalizedErrors["https://json-schema.org/keyword/multipleOfTen"][schemaLocation]) {
        errors.push({
          message: "Instance must be multiple of 10",
          instanceLocation: Instance.uri(instance),
          schemaLocation: schemaLocation
        });
      }
    }
  }

  return errors;
};


```

Step 3:- Register the handlers:

```js
import { setNormalizationHandler, addErrorHandler  } from "@hyperjump/better-json-schema-errors";
const KEYWORD_URI = "https://json-schema.org/keyword/multipleOfTen";

setNormalizationHandler(KEYWORD_URI, multipleOften);

addErrorHandler(errorHandler);
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
