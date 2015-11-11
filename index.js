"use strict"

// Get our tools.
var utils = require("./lib/utils")
var JSONAPIModel = require("./lib/data")

var Validator = require("jsonapi-validator").Validator
var validator = new Validator()

/**
 * Get a payload from an object of values.
 * @param  {Object} values_object to get payload for.
 * @param  {Waterline.Collection} collection to base this conversion on.
 * @return {Object} JSON API compliant payload with values set.
 */
function new_from_values(values, collection) {
  // If it's actually a Boom error value
  // then fire the correct function to
  // jsonapi-ise that structure.
  if (values.isBoom) {
    return new_from_boom(values, collection)
  }

  // Were we passed an array of results from Waterline?
  var values_is_array = Array.isArray(values)

  // Validate the values against the collection schema.
  var validation

  // If it's an array of values, validate each value against the collection.
  if (values_is_array === true) {
    // Validate each object.
    values.forEach(function values_verification_foreach(value) {
      validation = utils.validate_against_collection(value, collection)

      // Check for errors and exit if there is
      // an error during validation.
      if (validation.error) {
        throw new TypeError(validation.error)
      }
    })
  } else {
    // Validate the values object.
    validation = utils.validate_against_collection(values, collection)

    // Check for errors and exit if there is
    // an error during validation.
    if (validation.error) {
      throw new TypeError(validation.error)
    }
  }

  // Return the created JSON API compliant resource
  var data = new JSONAPIModel(values, collection)

  // Validate the payload before returning it. This throws hard.
  validator.validate(data.toJSON())

  return data
}

function new_from_boom(values, collection) {

}

// Export our tools.
module.exports.new_from_values = new_from_values
module.exports.new_from_boom = new_from_boom
