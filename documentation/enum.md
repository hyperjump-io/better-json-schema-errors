# Handling `enum` in Better JSON Schema Errors

The `enum` keyword restricts a value to a fixed set of allowed options.  
This library enhances `enum` errors with **two strategies**:

---

## 1. Suggestion Strategy (Levenshtein Distance)

If the user-provided value is close to one of the allowed values (based on string similarity),  
the error message will include a **suggestion**.

Example Schema:
**Schema:**
```json
{
  "type": "string",
  "enum": ["apple", "banana", "orange"]
}
```

Invalid Instance:-
``` Json
{ "fruit": "appl" }
```
BetterJSONSchemaErrors Output:-
``` Json
{
  "errros": {
    "message": "Unexpected value 'appl'. Did you mean 'apple'?",
    "instanceLocation": "#/fruit",
    "schemaLocation": "https://example.com/main#/properties/fruit/enum"
  }
}
```
## 2.  Fallback Strategy (List All Options)

If no close match is found, the error lists all valid values:

Example Schema:
**Schema:**
```json
{
  "type": "string",
  "enum": ["apple", "banana", "orange"]
}
```

Invalid Instance:-
``` Json
{ "fruit": "grape" }
```
BetterJSONSchemaErrors Output:-
``` Json
{
  "errros": {
    "message": "Unexpected value 'grape'. Expected one of: 'apple', 'banana', or 'orange'.",
    "instanceLocation": "#/fruit",
    "schemaLocation": "https://example.com/main#/properties/fruit/enum"
  }
}
```