import { JSONSchema7 } from 'json-schema-to-ts'

// This is a helper function to generate a JSON schema for string properties.
// It checks if a string includes '|' which would indicate an enum,
// or if it starts with 'number: ' or 'boolean: ' which would indicate
// a number or boolean type respectively, otherwise it defaults to string.
export const parseStringDescription = (description: string): JSONSchema7 => {
  // Check if the description indicates an enum for string type
  if (description.includes('|')) {
    return { type: 'string', enum: description.split('|').map((v) => v.trim()) }
  } else {
    // Check for 'number: ' prefix
    if (description.startsWith('number: ')) {
      return {
        type: 'number',
        description: description.replace('number: ', ''),
      }
    }
    // Check for 'boolean: ' prefix
    else if (description.startsWith('boolean: ')) {
      return {
        type: 'boolean',
        description: description.replace('boolean: ', ''),
      }
    }
    // Default to string type
    else {
      return { type: 'string', description }
    }
  }
}

/**
 * Given a property description object, generate a JSON schema.
 *
 * @param propDescriptions - A record object with keys as property names
 * and values as descriptions or nested property description objects.
 * @returns A JSON schema object based on the provided descriptions.
 */
export const generateSchema = (
  propDescriptions: Record<string, string | Record<string, any>>
): JSONSchema7 => {
  // If the propDescriptions is for an object structure
  if (
    typeof propDescriptions !== 'object' ||
    propDescriptions === null ||
    Array.isArray(propDescriptions)
  ) {
    throw new Error('The propDescriptions parameter should be an object.')
  }

  const properties: Record<string, JSONSchema7> = {}
  const required: string[] = Object.keys(propDescriptions)

  for (const [key, description] of Object.entries(propDescriptions)) {
    if (typeof description === 'string') {
      // Handle the string description
      properties[key] = parseStringDescription(description)
    } else if (typeof description === 'object' && !Array.isArray(description)) {
      // Recursive call for nested objects
      properties[key] = generateSchema(description)
    } else {
      throw new Error(`Invalid description for key "${key}".`)
    }
  }

  return { type: 'object', properties, required }
}

