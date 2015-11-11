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
    if (attributes[attribute].hasOwnProperty("model") ||
      attributes[attribute].hasOwnProperty("collection")) {
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
 * @return {Array} Array of the keys that have `model|collection` properties.
 */
function get_association_keys(collection) {
  // Loop over the keys, filter irrelevant ones and fetch alias'
  return Object.keys(collection._attributes)
    // We only care about attributes with a model or collection property.
    .filter(function association_key_filter(key) {
      return collection._attributes[key].hasOwnProperty("model") ||
       collection._attributes[key].hasOwnProperty("collection")
    })
}

/**
 * Get the collections assigned to each association
 * within the collection.
 * @param  {Waterline.Collection} collection to get associations from.
 * @return {Array} Array of the collections that have `model|collection` properties.
 */
function get_associated_collections(collection) {
  var map = {}

  get_association_keys(collection)
    // Return the identity to the related resource.
    .forEach(function association_key_map(key) {
      if (collection._attributes[key].hasOwnProperty("model")) {
        map[key] = collection.waterline.collections[collection._attributes[key].model]
      }
      else if (collection._attributes[key].hasOwnProperty("collection")) {
        map[key] = collection.waterline.collections[collection._attributes[key].collection]
      }
    })

  return map
}

/**
 * Clone an object, usually to prevent accidental
 * modification of an original object.
 * NOTE: Does NOT clone prototype or any `undefined` value.
 *
 * @param  {Object} object to clone.
 * @return {Object} cloned object.
 */
function clone_object(object) {
  return JSON.parse(JSON.stringify(object))
}

// Export our tools.
module.exports.make_associations_joi_object = make_associations_joi_object
module.exports.validate_against_collection = validate_against_collection
module.exports.get_association_keys = get_association_keys
module.exports.get_associated_collections = get_associated_collections
module.exports.clone = clone_object
