"use strict"

function get_related_links(target) {
  return {}
}

function generated_related_payload(identity, from) {
  return {
    type: identity,
    id: from.id
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
        links: get_related_links(target),
        data: generated_related_payload(identity, target)
      }
    }
  }.bind(this))

  // Return the models.
  return relationships
}

// Export our tools.
module.exports.discover = discover_relationships
module.exports.generated_related_payload = generated_related_payload
module.exports.get_related_links = get_related_links
