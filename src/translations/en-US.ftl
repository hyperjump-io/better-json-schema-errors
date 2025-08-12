type-error = The instance should be of type {$expected} but found {$actual}.

string-error = Expected a string {$constraints}.
string-error-minLength = at least {$minLength} characters long
string-error-maxLength = at most {$maxLength} characters long

number-error = Expected a number {$constraints}.
number-error-minimum = greater than {$minimum}
number-error-exclusive-minimum = greater than or equal to {$minimum}
number-error-maximum = less than {$maximum}
number-error-exclusive-maximum = less than or equal to {$maximum}

required-error = "{$instanceLocation}" is missing required property(s): {$missingProperties}.
multiple-of-error = The instance should be a multiple of {$divisor}.

properties-error = Expected object to have {$constraints}
properties-error-max = at most {$maxProperties} properties.
properties-error-min = at least {$minProperties} properties.

const-error = The instance should be equal to {$expectedValue}.

array-error = Expected the array to have {$constraints}.
array-error-min = at least {$minItems} items
array-error-max = at most {$maxItems} items

unique-items-error = The instance should have unique items in the array.
format-error = The instance should match the format: {$format}.
pattern-error = The instance should match the pattern: {$pattern}.

contains-error-min = The array must contain at least {$minContains -> 
  [one] item that passes
	*[other] items that pass
} the 'contains' schema.
contains-error-min-max = The array must contain at least {$minContains} and at most {$maxContains ->
  [one] item that passes
	*[other] items that pass
} the 'contains' schema.

not-error = The instance is not allowed to be used in this schema.
additional-properties-error = The property "{$propertyName}" is not allowed.
dependent-required-error = Property "{$property}" requires property(s): {$missingDependents}.
enum-error = { $variant ->
	[suggestion] Unexpected value {$instanceValue}. Did you mean {$suggestion}?
	*[fallback] Unexpected value {$instanceValue}. Expected one of: {$allowedValues}.
}
