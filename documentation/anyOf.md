##  Handling `anyOf` with Clarity

**Better JSON Schema Errors** intelligently simplifies error output, providing clear, consolidated error messages that are easier to debug.
Here are the differnt cases and how better-json-schema-errors handles them to produces better errors.

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