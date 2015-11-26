"use strict"

/**
 * Generate the payload used in the relationships
 * portion of the main payload.
 * @param  {String} identity of the collection as the type.
 * @param  {Object} from this object.
 * @return {Object} relationships member payload.
 */
function generated_related_payload(identity, from) {
  return {
    type: identity,
    id: from.id ? from.id.toString() : from
  }
}

/**
 * Discover relationships within this value set
 * that are declared in the blueprint so we can
 * pull them out and apply them to the right key
 * in our payload.
 *
 * @param  {Object} values to check for relationships.
 * @param  {JSONAPIModel} model to update with results.
 * @return {Object} relationships discovered.
 */
function discover_relationships(values, model) {
  var relationships = {}

  // Loop over the discovered association alias'
  // from the model and create the payloads.
  model.associations.forEach(function associations_map(association) {
    // Get the collection and it's identity.
    var collection = model.associated_collections[association]
    var identity = collection.adapter.identity

    // Get our target and start the work.
    var target = values.attributes[association]

    // If there was no target, there's nothing to do.
    if (!target) {
      return
    }

    // To comply with the spec, if there's only one value
    // it should not be an array.
    if (Array.isArray(target) && target.length === 1) {
      target = target[0]
    }

    // If it's an array, map over the target values.
    if (Array.isArray(target)) {
      relationships[association] = target.map(function(value) {
        return generated_related_payload(identity, value)
      })
    }
    // Otherwise, adhere to the spec and have a single object.
    else {
      relationships[association] = {
        links: collection.get_links && collection.get_links(target),
        data: generated_related_payload(identity, target)
      }
    }

    // Remove the key from the target.
    delete values.attributes[association]
  }.bind(this))

  // Return the models.
  // Check the relationships holds any values.
  if (Object.keys(relationships).length > 0) {
    return relationships
  }
  else {
    return
  }
}

// Export our tools.
module.exports.discover = discover_relationships
module.exports.generated_related_payload = generated_related_payload
