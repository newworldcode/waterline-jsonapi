"use strict"

// Get our tools.
var utils = require("./utils")
var relationships = require("./relationships")
var includes = require("./included")

/**
 * Set defaults for this model and begin the work
 * to create valid JSON API payloads.
 * @param {Array|Object} values to make a payload from.
 * @param {Waterline.Collection} collection to base the payload on.
 */
function JSONAPIModel(values, collection) {
  // Check we got an instance.
  if (!(this instanceof JSONAPIModel)) {
    return new JSONAPIModel(collection)
  }

  // Store the values.
  this.values = values

  // If it's an array with one element, normalise as per the spec.
  if (Array.isArray(values) && values.length === 1) {
    this.values = values[0]
  }

  // Store the collection and associations.
  this.collection = collection
  this.associations = utils.get_association_keys(this.collection)
  this.associated_collections = utils.get_associated_collections(this.collection)

  // Start the work.
  this.attributes = this.payload()
  this.included_models = this.included()

  // Exit.
  return this
}

/**
 * Get the collection named by association.
 * @param  {String} association for the collection.
 * @return {Waterline.Collection} associated collection
 */
function get_related_collection(association) {
  return this.collection.waterline.collections[association]
}

/**
 * Generate the main body of values held
 * within the `data` aspect of the payload.
 * @param  {Object} value to generate with.
 * @return {Object} valid jsonapi data payload.
 */
function generate_payload_from_value(value, identity) {
  // Clone the values to prevent modification.
  var vals = utils.clone(value)
  var id = vals.id
  delete vals.id

  // Validate we got what we need in our values.
  if (!value.id) {
    throw new ReferenceError("`id` is a required property for jsonapi compliancy.")
  }

  // Start with the basics.
  var out = {
    id: id.toString(),
    type: identity || this.collection.adapter.identity,
    attributes: vals
  }

  // Discover and apply any related entities.
  this.relatives(out)

  // Return.
  return out
}

/**
 * Create the cruft of the payload.
 * @param  {Array} values to make a payload from.
 * @param  {Waterline.Collection} collection to generate from.
 * @return {Object}
 */
function payload(values, identity) {
  // Clone the values.
  var vals = utils.clone(values || this.values)

  // If it's an array, loop over the values.
  if (Array.isArray(vals)) {
    return vals.map(function(val) {
      this.generate_payload_from_value(val, identity)
    }.bind(this))
  }
  // Otherwise, just go ahead and create.
  else {
    return this.generate_payload_from_value(vals, identity)
  }

  // Return.
  return this
}

function included() {
  return includes.generate(this)
}

function relatives(to) {
  to.relationships = relationships.discover(to, this)
  return to
}

function links() {
  return {
    self: this.collection.get_self_link && this.collection.get_self_link(),
    next: this.collection.get_next_link && this.collection.get_next_link(),
    last: this.collection.get_last_link && this.collection.get_last_link()
  }
}

function toJSON() {
  return {
    links: this.links(),
    data: this.attributes,
    includes: this.included_models
  }
}

// Set the prototype.
JSONAPIModel.prototype = Object.create(null)
JSONAPIModel.prototype.payload = payload
JSONAPIModel.prototype.included = included
JSONAPIModel.prototype.links = links
JSONAPIModel.prototype.relatives = relatives
JSONAPIModel.prototype.toJSON = toJSON
JSONAPIModel.prototype.generate_payload_from_value = generate_payload_from_value
JSONAPIModel.prototype.get_related_collection = get_related_collection

// Export our functions.
module.exports = JSONAPIModel
