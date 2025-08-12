type-error = The instance should be of type {$expected} but found {$actual}.

string-error = Expected a string {$constraints}.
string-error-minLength = atleast {$minLength} characters long
string-error-maxLength = atmost {$maxLength} characters long
string-error-pattern = to match the pattern {$pattern}

number-error = Expected a number {$constraints}.
number-error-minimum = greater than {$minimum}
number-error-exclusive-minimum = greater than or equal to {$minimum}
number-error-maximum = less than {$maximum}
number-error-exclusive-maximum = less than or equal to {$maximum}

required-error = "{$instanceLocation}" is missing required property(s): {$missingProperties}.
multiple-of-error = The instance should be a multiple of {$divisor}.
max-properties-error = The instance should have a maximum of {$limit} properties.
min-properties-error = The instance should have a minimum of {$limit} properties.
const-error = The instance should be equal to {$expectedValue}.
max-items-error = The instance should contain a maximum of {$limit} items in the array.
min-items-error = The instance should contain a minimum of {$limit} items in the array.
unique-items-error = The instance should have unique items in the array.
format-error = The instance should match the format: {$format}.
contains-error = A required value is missing from the list.
not-error = The instance is not allowed to be used in this schema.
additional-properties-error = The property "{$propertyName}" is not allowed.
dependent-required-error = Property "{$property}" requires property(s): {$missingDependents}.
enum-error = { $variant ->
	[suggestion] Unexpected value {$instanceValue}. Did you mean {$suggestion}?
	*[fallback] Unexpected value {$instanceValue}. Expected one of: {$allowedValues}.
}
