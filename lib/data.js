"use strict"

// Get our tools.
var utils = require("./utils")
var relationships = require("./relationships")

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

  // Store the collection and associations.
  this.collection = collection
  this.associations = utils.get_association_keys(this.collection)
  this.associated_collections = utils.get_associated_collections(this.collection)

  // The data for the payload.
  this.attributes = []
  this.included_models = []
  this.related_models = []

  // Start the work.
  this.payload()

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

function generate_payload_from_value(value) {
  // Validate we got what we need in our values.
  if (!value.id) {
    throw new ReferenceError("`id` is a required property for jsonapi compliancy.")
  }

  // Start with the basics.
  var out = {
    type: this.collection.adapter.identity,
    id: value.id,
    attributes: value
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
function payload() {
  // If it's an array, loop.
  if (Array.isArray(this.values) && this.values.length !== 1) {
    // Set the data.
    this.attributes = this.values.map(this.generate_payload_from_value.bind(this))
    return
  }
  else if (this.values.length === 1) {
    this.values = this.values[0]
  }

  return this.attributes = this.generate_payload_from_value(this.values)
}

function included() {
  // Return the models.
  return this.included_models
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
    includes: this.included()
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
module.exports.JSONAPIModel = JSONAPIModel
