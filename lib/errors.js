"use strict"

function get_errors(values) {
  // If it isn't an array of errors, make it one.
  if (!Array.isArray(values)) {
    values = [values]
  }

  // return the format specified in the spec.
  return values.map(function(value) {
    return {
      id: value.id,
      detail: value.error.message
    }
  })
}

module.exports.get_errors = get_errors
