type-error = The instance should be of type {$expected} but found {$actual}.
min-length-error = The instance should be atleast {$limit} characters.
max-length-error = The instance should be atmost {$limit} characters long.
maximum-error = The instance should be less than or equal to {$limit}.
minimum-error = The instance should be greater than or equal to {$limit}.
exclusive-maximum-error = The instance should be less than {$limit}.
exclusive-minimum-error = The instance should be greater than {$limit}.
required-error = "{$instanceLocation}" is missing required property(s): {$missingProperties}.
multiple-of-error = The instance should be a multiple of {$divisor}.
max-properties-error = The instance should have a maximum of {$limit} properties.
min-properties-error = The instance should have a minimum of {$limit} properties.
const-error = The instance should be equal to {$expectedValue}.
max-items-error = The instance should contain a maximum of {$limit} items in the array.
min-items-error = The instance should contain a minimum of {$limit} items in the array.
unique-items-error = The instance should have unique items in the array.
format-error = The instance should match the format: {$format}.
pattern-error = The instance should match the pattern: {$pattern}.
contains-error = A required value is missing from the list.
not-error = The instance is not allowed to be used in this schema.
additional-properties-error = The property "{$propertyName}" is not allowed.
dependent-required-error = Property "{$property}" requires property(s): {$missingDependents}.
enum-error = { $variant ->
	[suggestion] Unexpected value {$instanceValue}. Did you mean {$suggestion}?
	*[fallback] Unexpected value {$instanceValue}. Expected one of: {$allowedValues}.
}