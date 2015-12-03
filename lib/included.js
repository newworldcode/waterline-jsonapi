"use strict"

/**
 * Generate the payload used in the included
 * portion of the main payload.
 * @param  {String} identity of the collection as the type.
 * @param  {Object} from this object.
 * @return {Object} relationships member payload.
 */
function generate_included_payload(from, model, identity, association) {
  // Get the main payload.
  var payload = model.payload(from, identity)

  var links = model.links(from, model.associated_collections[association])

  // Add links to it.
  if (links) {
    payload.links = links
  }

  // Return the payload.
  return payload
}

function is_already_included(value, includes) {
  var deep_equal = require("deep-equal")
  return includes.filter(function(include) {
    return deep_equal(include, value)
  }).length > 0
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
    var generated_include

    if (Array.isArray(model.values)) {
      model.values.forEach(function(value) {
        // Get our target and start the work.
        var target = value[association]

        // If there's no target, do nothing.
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
          includes = includes.concat(target.map(function(value) {
            return generate_included_payload(value, model, identity, association)
          }).filter(function(generated_include) {
            return !is_already_included(generated_include, includes)
          }))
        }
        // Otherwise, adhere to the spec and have a single object.
        else {
          // Generate the value.
          generated_include = generate_included_payload(target, model, identity, association)

          // If it doesn't already exist in the includes, add it.
          if (!is_already_included(generated_include, includes)) {
            includes.push(generated_include)
          }
        }
      })
    }
    else {
      // Get our target and start the work.
      var target = model.values[association]

      // If there's no target, do nothing.
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
        includes = target.map(function(value) {
          return generate_included_payload(value, model, identity, association)
        }).filter(function(generated_include) {
          return !is_already_included(generated_include, includes)
        })
      }
      // Otherwise, adhere to the spec and have a single object.
      else {
        // Generate the value.
        generated_include = generate_included_payload(target, model, identity, association)

        // If it doesn't already exist in the includes, add it.
        if (!is_already_included(generated_include, includes)) {
          includes.push(generated_include)
        }
      }

      return includes
    }
  }.bind(this))

  // Return the models.
  return includes
}

// Export our tools.
module.exports.generate = generate_includes
module.exports.generate_included_payload = generate_included_payload
