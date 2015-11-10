"use strict"

// Get our tools.
var utils = require("./utils")

function get_related_collection(association) {
  return this.collection.waterline.collections[association]
}

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

  // The data for the payload.
  this.attributes = []
  this.included_models = []
  this.related_models = []
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
    this.attributes = this.values.map(this.payload.bind(this))
    return
  }
  else if (this.values.length === 1) {
    this.values = this.values[0]
  }

  // Validate we got what we need in our values.
  if (!this.values.id) {
    throw new ReferenceError("`id` is a required property for jsonapi compliancy.")
  }

  // Start with the basics.
  var out = {
    type: this.collection.adapter.identity,
    id: this.values.id,
    attributes: this.values
  }

  // Sort out the relationships for this entity.
  this.relationships(out)

  if (Array.isArray(this.values)) {
    return out
  }
  else {
    this.attributes = out
    return this.attributes
  }
}

function included() {
  // The values are the data.
  var values = this.attributes

  this.associations.forEach(function associations_map(association) {
    // Is the association a collection of models?
    if (Array.isArray(values[association])) {
      values[association].forEach(function(value) {
        this.included_models.push(this.payload(value))
      }.bind(this))
    }
    else if (values[association]) {
      this.included_models.push(this.payload(values[association]))
    }
  }.bind(this))

  // Return the models.
  this.included_models
}

function relationships(to) {
  if (!to.relationships) {
    to.relationships = {}
  }
  console.log("ASSOC", this.associations)
  this.associations.forEach(function associations_map(association) {
    // Get the collection and it's identity.
    var collection = get_related_collection.bind(this)(association)
    var identity = collection.adapter.identity

    console.log("IDEN", identity)

    // Is the association a collection of models?
    if (Array.isArray(to[association])) {
      to[association].forEach(function(value) {
        to.relationships[identity] = {
          links: {
            self: collection.get_self_link(value),
            related: this.get_self_link(this.attributes)
          },
          data: {
            type: identity
          }
        }
      }.bind(this))
    }
    else if (to[association]) {
      to.relationships.push(this.payload(to[association]))
    }
  }.bind(this))

  // Return the models.
  to.relationships
}

function links() {
  return {}
}

function toJSON() {
  return {
    links: this.links(),
    data: this.payload(),
    includes: this.included()
  }
}

// Set the prototype.
JSONAPIModel.prototype = Object.create(null)
JSONAPIModel.prototype.payload = payload
JSONAPIModel.prototype.included = included
JSONAPIModel.prototype.links = links
JSONAPIModel.prototype.relationships = relationships
JSONAPIModel.prototype.toJSON = toJSON

// Export our functions.
module.exports.JSONAPIModel = JSONAPIModel
