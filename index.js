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
  if (values instanceof Error) {
    return new_from_error(values, collection)
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

/**
 * Generate a payload from an error object.
 * @param  {Object} values_object to get payload for.
 * @param  {Waterline.Collection} collection to base this conversion on.
 * @return {Object} JSON API compliant payload with values set.
 */
function new_from_error(values, collection) {
  // For generating an error id.
  var uuid = require("uuid")

  var actual_values = {
    id: values.id || uuid.v4(),
    error: values,
    is_error: true
  }

  // Return the created JSON API compliant resource
  var data = new JSONAPIModel(actual_values, collection)

  // Validate the payload before returning it. This throws hard.
  validator.validate(data.toJSON())

  return data
}

// Export our tools.
module.exports.new_from_values = new_from_values
module.exports.new_from_error = new_from_error
