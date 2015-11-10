"use strict"

// Get the helpers.
var helpers = require("./collection-helpers")

/**
 * Create a model that we can generate
 * JSON API compliant payloads from.
 * @param {Object} attributes to use in this model.
 * @return {JSONAPIModel} model to get payloads from.
 */
function JSONAPIModel(collection) {
  // Set some basic properties.
  this.attributes = collection._attributes || {}
  this.type = collection.adapter.identity || "no-type"

  // Set the collection to work from.
  this.collection = collection

  // Exit.
  return this
}

/**
 * Convert this model to the actual payload.
 * @param  {Object} options [description]
 * @return {[type]}         [description]
 */
function to_payload(options) {
  // If there are any transformers, fire them.
  if (Array.isArray(options.transformers)) {
    // Loop over the transformers.
    options.transformers.forEach(function(transformer) {
      // Apply the changes the transformers make to
      // each generated model.
      this.models = this.models.map(transformer)
    })
  }
}

// Create the prototype for the model.
JSONAPIModel.prototype = Object.create(null)
JSONAPIModel.prototype.to_payload = to_payload
JSONAPIModel.prototype.get_last_link = helpers.get_prev_link
JSONAPIModel.prototype.get_next_link = helpers.get_next_link
JSONAPIModel.prototype.get_self_link = helpers.get_self_link

// Export our tools.
module.exports = JSONAPIModel
