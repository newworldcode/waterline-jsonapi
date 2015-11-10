"use strict"

/**
 * Generate the payload used in the included
 * portion of the main payload.
 * @param  {String} identity of the collection as the type.
 * @param  {Object} from this object.
 * @return {Object} relationships member payload.
 */
function generate_included_payload(from, model, identity) {
  return model.payload(from, identity)
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
function generate_includes(model) {
  var includes = []

  // Loop over the discovered association alias'
  // from the model and create the payloads.
  model.associations.forEach(function associations_map(association) {
    // Get the collection and it's identity.
    var collection = model.associated_collections[association]
    var identity = collection.adapter.identity

    // Get our target and start the work.
    var target = model.values[association]

    // To comply with the spec, if there's only one value
    // it should not be an array.
    if (Array.isArray(target) && target.length === 1) {
      target = target[0]
    }

    // If it's an array, map over the target values.
    if (Array.isArray(target)) {
      includes = target.map(function(value) {
        return generate_included_payload(value, model, identity)
      })
    }
    // Otherwise, adhere to the spec and have a single object.
    else {
      includes.push(generate_included_payload(target, model, identity))
    }
  }.bind(this))

  // Return the models.
  return includes
}

// Export our tools.
module.exports.generate = generate_includes
module.exports.generate_included_payload = generate_included_payload
