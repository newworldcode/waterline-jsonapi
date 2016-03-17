"use strict"

/**
 * Get the keys that are associations.
 * @param  {Waterline.Collection} collection to get keys from.
 * @return {Array} Array of the keys that have model, collection or foreignKey properties.
 */
function get_association_keys(collection) {
  // Loop over the keys, filter irrelevant ones and fetch alias'
  return Object.keys(collection._attributes)
    // We only care about attributes with model, collection or foreignKey properties.
    .filter(key =>
      collection._attributes[key].hasOwnProperty("model") ||
      collection._attributes[key].hasOwnProperty("collection") ||
      (
        collection._attributes[key].hasOwnProperty("foreignKey") &&
        collection._attributes[key].hasOwnProperty("references")
      )
    )
}

/**
 * Get the collections assigned to each association
 * within the collection.
 * @param  {Waterline.Collection} collection to get associations from.
 * @return {Map} Map of the collections that have `model|collection` properties and their type.
 */
function get_associated_collections(collection) {
  const map = new Map()

  get_association_keys(collection)
    // Return the identity to the related resource.
    .forEach(key => {
      // Get the attributes
      const collection_attributes = collection._attributes[key]

      // Most of the time, it's a one to one
      // relationship so it's not an array.
      let is_array = false

      // But sometimes, it's a one to many
      // so array must be true.
      if (collection_attributes.hasOwnProperty("collection")) {
        is_array = true
      }

      // Set the values.
      map.set(key, { is_array, collection })
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
module.exports.get_association_keys = get_association_keys
module.exports.get_associated_collections = get_associated_collections
module.exports.clone = clone_object
