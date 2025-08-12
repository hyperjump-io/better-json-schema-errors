# Non-type specific messages
type-error = The instance should be of type {$expected} but found {$actual}.
const-error = The instance should be equal to {$expectedValue}.
enum-error = { $variant ->
	[suggestion] Unexpected value {$instanceValue}. Did you mean {$suggestion}?
	*[fallback] Unexpected value {$instanceValue}. Expected one of: {$allowedValues}.
}

# String messages
string-error = Expected a string {$constraints}.
string-error-minLength = at least {$minLength} characters long
string-error-maxLength = at most {$maxLength} characters long
pattern-error = The instance should match the pattern: {$pattern}.
format-error = The instance should match the format: {$format}.

# Number messages
number-error = Expected a number {$constraints}.
number-error-minimum = greater than {$minimum}
number-error-exclusive-minimum = greater than or equal to {$minimum}
number-error-maximum = less than {$maximum}
number-error-exclusive-maximum = less than or equal to {$maximum}
multiple-of-error = The instance should be a multiple of {$divisor}.

# Object messages
properties-error = Expected object to have {$constraints}
properties-error-max = at most {$maxProperties} properties.
properties-error-min = at least {$minProperties} properties.
required-error = This instance is missing required property(s): {$missingProperties}.
additional-properties-error = The property "{$propertyName}" is not allowed.

# Array messages
array-error = Expected the array to have {$constraints}.
array-error-min = at least {$minItems} items
array-error-max = at most {$maxItems} items
unique-items-error = The instance should have unique items in the array.
contains-error-min = The array must contain at least {$minContains -> 
  [one] item that passes
	*[other] items that pass
} the 'contains' schema.
contains-error-min-max = The array must contain at least {$minContains} and at most {$maxContains ->
  [one] item that passes
	*[other] items that pass
} the 'contains' schema.

# Conditional messages
anyOf-error = The instance must pass at least one of the given schemas.
not-error = The instance is not allowed to be used in this schema.
