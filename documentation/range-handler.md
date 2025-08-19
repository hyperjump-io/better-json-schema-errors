# Range Constraint Keywords

`better-json-schema-errors` processes validation errors for keywords that define a numeric range or count, such as `minimum`/`maximum`/`exclusiveMinimum`/`exculsiveMaximum` for numbers, `minLength`/`maxLength` for strings, `minItems`/`maxItems` for arrays, and `minProperties`/`maxProperties` for objects.  
The primary goal is to consolidate multiple, separate validation errors related to these constraints into a single, clear, and human-readable message that describes the effective valid range for the instance.

---

### Explaination

When a JSON schema uses combinators like `allOf`, it's possible for an instance to fail validation against multiple range constraints simultaneously. For example, a schema might require an array to have at least 3 items and also at least 5 items. A standard validator might produce two separate errors for this.  

This handler improves the user experience by implementing a unified consolidation strategy for all data types:

1. Collect All Range Failures: It gathers all failed validation errors for a given type (e.g., all minItems and maxItems failures for an array).

2. Determine the Strictest Bounds:  

    - It calculates the most restrictive lower bound by finding the highest min value (e.g., minimum: 5 is stricter than minimum: 3).

    - It calculates the most restrictive upper bound by finding the lowest max value (e.g., maxLength: 10 is stricter than maxLength: 20).

    - It correctly tracks exclusivity for numbers (e.g., exclusiveMinimum).

3. Produce a Single, Unified Error: After calculating the effective range, it generates a single error message that combines these constraints into one statement. This prevents overwhelming the user with redundant information and clearly states what is allowed.

### Examples
### 1. **Number** (`minimum`, `maximum`, `exclusiveMinimum`, `exclusiveMaximum`)
Schema:
```json
{
  "allOf": [
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

### 2. **String** (`minLength`, `maxLength`)
Schema:
```json
{
  "allOf": [
    { "minLength": 3 },
    { "minLegth": 5 }
  ]
}
```
Instance:-
```json
"helo"
```
`better-json-schema-errors` Output:-
```json
{
  "errors": [
    {
      "schemaLocation": "https://example.com/main#/allOf/1/minLength",
      "instanceLocation": "#",
      "message": "Expected a string at least 5 characters long"
    }
  ]
}

```

### 3. **Array** (`minItems`, `maxItems`)
Schema:
```json
{
  "allOf": [
    { "minItems": 3 },
    { "maxItems": 7 }
  ]
}
```
Instance:-
```json
[1,2]
```
BetterJSONSchemaErrors Output:-
```json
{
  "errors": [
    {
      "schemaLocation": [
        "https://example.com/main#/allOf/0/minItems",
        "https://example.com/main#/allOf/1/maxItems"
      ],
      "instanceLocation": "#",
      "message": "Expected the array to have at least 2 items and at most 7 items."
    }
  ]
}

```
### 4. **Object** (`minProperties`, `maxProperties`)
Schema:
```json
{
  "allOf": [
    { "minProperties": 2 },
    { "maxProperties": 5 }
  ]
}
```
Instance:-
```json
{"a": 1}
```
BetterJSONSchemaErrors Output:-
```json
{
  "errors": [
    {
      "schemaLocation": [
        "https://example.com/main#/allOf/0/minProperteis",
        "https://example.com/main#/allOf/1/maxProperties"
      ],
      "instanceLocation": "#",
      "message": "Expected the object to have at least 2 properties and at most 5 Properties."
    }
  ]
}

```