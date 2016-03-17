"use strict"

// Get tools.
const deep_equal = require("deep-equal")

class Includes_Generator {
  constructor(generator) {
    this.generator = generator
    this.includes = []

    // Generate.
    generator.run(this.generate, this)

    return this.includes
  }

  generate(values) {
    // Loop over the known association keys
    // and try to apply the include.
    return this.generator.associations
      .map(association_name => {
        // Check if the values has that association.
        if (values.hasOwnProperty(association_name)) {
          // If it's an array, loop over the values.
          if (Array.isArray(values[association_name])) {
            values[association_name].forEach(val => this.insert(val))
          }
          else {
            // Possibly insert the value into the includes.
            this.insert(values[association_name])
          }

          // Delete the attribute.
          delete values[association_name]
        }
      })
      .filter(include => !!include)
  }

  /**
   * Insert a new include after checking
   * it hasn't already been included.
   *
   * @note: I don't like that this is O(n^n)
   *
   * @param  {Object} value to insert.
   * @return {Includes_Generator} Object for chaining.
   */
  insert(value) {
    // Check if we already included this value.
    const already_included = this.includes.filter(include =>
      deep_equal(include, value)
    ).length > 0

    // If it's not already included, insert it.
    if (!already_included) {
      this.includes.push(value)
    }
    else {
      this.includes.push(false)
    }

    return this
  }
}

// Export our tools.
module.exports = Includes_Generator
