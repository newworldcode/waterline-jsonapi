"use strict"

/**
 * If a blueprint has associations, make them
 * a Joi.object() so it passes validation.
 * @param  {Object} attributes to scan.
 * @return {Object} fixed object.
 */
function make_associations_joi_object(attributes) {
  // Fix any relationship attributes.
  for (var attribute in attributes) {
    if (attributes[attribute].hasOwnProperty("model")) {
      attributes[attribute] = "object"
    }
  }

  return attributes
}

/**
 * Check that the values are a valid object
 * compared against the target collection.
 * @param  {Object}  values to check validity of.
 * @param  {Waterline.Collection}  collection to build schema from.
 * @return {Boolean} whether or not an error occured during the validation.
 */
function validate_against_collection(values, collection) {
  // Get our tools.
  var joi = require("joi")
  var to_joi = require("waterline-joi")

  // Clone the attributes and fix any association attributes.
  var attributes = make_associations_joi_object(JSON.parse(JSON.stringify(collection._attributes)))

  // Create a schema from the collection.
  var schema = to_joi(attributes)

  // Validate the values against the collection schema.
  return joi.validate(values, schema).hasOwnProperty("error")
}

/**
 * Get the keys that are associations.
 * @param  {Waterline.Collection} collection to get keys from.
 * @return {Array} Array of the keys that have `model` properties.
 */
function get_association_keys(collection) {
  return Object.keys(collection._attributes)
    // We only care about attributes with a model or collection property.
    .filter(function association_key_filter(key) {
      collection._attributes[key].hasOwnProperty("model") ||
       collection._attributes[key].hasOwnProperty("collection")
    })
    // Return the identity to the related resource.
    .map(function association_key_map(key) {
      if (collection._attributes[key].hasOwnProperty("model")) {
        return collection._attributes[key].model
      }
      else if (collection._attributes[key].hasOwnProperty("model")) {
        return collection._attributes[key].collection
      }
    })
}

// Export our tools.
module.exports.make_associations_joi_object = make_associations_joi_object
module.exports.validate_against_collection = validate_against_collection
module.exports.get_association_keys = get_association_keys
