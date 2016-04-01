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
    if (!generator) {
      throw new ReferenceError("Data_Payload_Generator: No generator passed in.")
    }

    // Generate the payload(s)
    return generator.run(document => Data_Payload_Generator.resource_object(generator, document), this)
  }

  static resource_object(generator, document, no_relationships) {
    // If the document doesn't have an id,
    // we should assume that the data element
    // in the response will just be null.
    if (!document.hasOwnProperty("id")) {
      return null
    }

    // Relationships aren't always populated,
    // check if we got an object of document
    // or just the related identifier.
    if (!document || (document).constructor !== Object) {
      return false
    }

    // Create the basics.
    const out = {
      type: generator.collection.adapter.identity.toString(),
      id: document.id.toString(),
      attributes: this.get_attributes(generator, document)
    }

    // Get the relationships, unless we specified not to.
    if (!no_relationships) {
      const relationships = this.get_relationships(generator, document)

      // Check any made it past the optimiser.
      if (Object.keys(relationships).length > 0) {
        out.relationships = relationships
      }
    }

    // Return the object.
    return out
  }

  static get_relationships(generator, values) {
    const document = utils.clone(values)
    const collection = generator.collection
    const relationships = {}
    const meta = utils.clone(generator.meta)

    // Set the context on the meta object
    // for the link functions (if any).
    meta.context = "relationship"

    // Helper function for generating the payload.
    const get_payload = (doc, type) => ({
      data: {
        id: doc.id,
        type
      },
      links: {
        self: collection.get_self_link ? collection.get_self_link(doc, meta) : `${generator.api_root || ""}/${type}/${doc.id || ""}`,
        related: collection.get_related_link && collection.get_related_link(doc, meta),
        next: collection.get_next_link && collection.get_next_link(doc, meta),
        last: collection.get_last_link && collection.get_last_link(doc, meta)
      }
    })

    // Delete keys that are associations.
    generator.associations
      .forEach(key => {
        const attribute = generator.associated_collections.get(key).collection._attributes[key]
        const related_identity = attribute.model || attribute.collection

        // Check the value is set.
        if (!document.hasOwnProperty(key)) {
          return null
        }

        // Does this relationship exist within the table?
        if (!relationships.hasOwnProperty(key)) {
          relationships[key] = []
        }

        // Create the relationships.
        if (Array.isArray(document[key])) {
          document[key].forEach(related_document => {
            relationships[key].push(get_payload(related_document, related_identity))
          })
        }
        else if ((document[key]).constructor === Object) {
          relationships[key].push(get_payload(document, related_identity))
        }
        else {
          relationships[key].push(get_payload({ id: document[key] }, related_identity))
        }
      })

    // Optimise the output.
    Object.keys(relationships)
      .forEach(related_collection => {
        // Get the associated collection.
        const collection = generator.associated_collections.get(related_collection)

        // If it's a one to many or many to many, leave it alone.
        if (collection.is_array) {
          return
        }
        // Otherwise, if it's only one item
        // squash it down into just one object.
        else if (relationships[related_collection].length === 1) {
          relationships[related_collection] = relationships[related_collection][0]
        }
        else if (relationships[related_collection].length === 0) {
          relationships[related_collection] = null
        }
      })

    // Return the relationships object.
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
