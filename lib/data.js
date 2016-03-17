"use strict"

const utils = require("./utils")

/**
 * Generate a payload or array of payloads that match the spec.
 *
 * @example
 * 	 {
 * 	 	 "type": "articles",
 * 	 	 "id": "1",
 * 	 	 "attributes": { ... },
 * 	 	 "relationships": { ... }
 * 	 }
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

  static resource_object(generator, values, related) {
    // Create the basics.
    const out = {
      type: generator.collection.adapter.identity.toString(),
      id: values.id.toString()
    }

    // If it's not related, it's a
    // relationship object.
    if (!related) {
      // out.relationships = this.get_relationships(values)
      out.attributes = this.get_attributes(generator, values)
    }

    // Return the object.
    return out
  }

  generate(values) {
    return Data_Payload_Generator.resource_object(this.generator, values)
  }

  get_relationships(values) {
    return
  }

  static get_attributes(generator, values) {
    // Clone the values to prevent modification.
    const object = utils.clone(values)

    // Delete keys that are associations.
    generator.associations
      .forEach(key => delete object[key.toString()])

    return object
  }
}

// Export our functions.
module.exports = Data_Payload_Generator
