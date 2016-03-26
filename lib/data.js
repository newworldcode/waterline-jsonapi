"use strict"

const utils = require("./utils")

/**
 * Generate a payload or array of payloads that match the spec.
 *
 * @example
 *   {
 *     "type": "articles",
 *     "id": "1",
 *     "attributes": { ... },
 *     "relationships": { ... }
 *   }
 *
 * @param  {Waterline_JSONAPI} generator calling this function.
 * @param  {Function} done callback.
 * @return {Object|Array} JSONAPI compliant data payload.
 */
class Data_Payload_Generator {
  constructor(generator) {
    // Set the generator.
    this.generator = generator

    // Generate the payload(s)
    return generator.run(this.generate, this)
  }

  generate(values) {
    return Data_Payload_Generator.resource_object(this.generator, values) || {}
  }

  static resource_object(generator, values, related) {
    // Relationships aren't always populated,
    // check if we got an object of values
    // or just the related identifier.
    if (!values || (values).constructor !== Object) {
      return false
    }

    // Create the basics.
    const out = {
      type: generator.collection.adapter.identity.toString(),
      id: values.id.toString()
    }

    // If it's not related, it's a
    // relationship object.
    if (!related) {
      out.attributes = this.get_attributes(generator, values)
      out.relationships = this.get_relationships(generator, values)
    }

    // Return the object.
    return out
  }

  static get_relationships(generator, values) {
    const collection = generator.collection
    const relationships = {}
    const meta = utils.clone(generator.meta)

    // Set the context.
    meta.context = "relationship"

    // Delete keys that are associations.
    generator.associations
      .forEach(key => {
        if (!relationships.hasOwnProperty(key)) {
          relationships[key] = []
        }

        // Try to generate a payload.
        const data = Data_Payload_Generator.resource_object(generator, values, true)

        // If the payload generator returned
        // a falsey result, exit this iteration.
        if (!data) {
          return
        }

        // Get the payload.
        const payload = {
          data,
          links: {
            self: `${generator.api_root || ""}/${key}/${values.id || ""}`,
            related: collection.get_related_link && collection.get_related_link(values, meta),
            next: collection.get_next_link && collection.get_next_link(values, meta),
            last: collection.get_last_link && collection.get_last_link(values, meta)
          }
        }

        // Re-set the type to the right one.
        payload.data.type = key

        // Push the data into the array.
        relationships[key].push(payload)
      })

    // Optimise the output.
    Object.keys(relationships)
      .forEach(related_collection => {
        // Get the associated collection.
        const collection = generator.associated_collections.get(related_collection)

        // If it's a one to many, leave it alone.
        if (collection.is_array) {
          return
        }
        // Otherwise, if it's only one item
        // squash it down into just one object.
        else if (relationships[related_collection].length === 1) {
          relationships[related_collection] = relationships[related_collection][0]
        }
      })

    return relationships
  }

  static get_attributes(generator, values) {
    // Clone the values to prevent modification.
    const object = utils.clone(values)

    // Delete keys that are associations.
    generator.associations
      .forEach(key => delete object[key.toString()])

    // Also remove the id.
    delete object.id

    return object
  }
}

// Export our functions.
module.exports = Data_Payload_Generator
