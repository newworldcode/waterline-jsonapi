"use strict"

// Get tools.
const utils = require("./lib/utils")
const Promise = require("promise")
const async = require("async")

// Get our libraries.
const Data_Generator = require("./lib/data")
const Links_Generator = require("./lib/links")
const Includes_Generator = require("./lib/included")
const Meta_Generator = require("./lib/meta")
const JSONAPI_Generator = require("./lib/jsonapi")

class Waterline_JSONAPI {
  /*
    let collection // Waterline.Collection
    let associations // Map
    let associated_collections // Map
    let promise // Promise
    let api_root // String
   */

  /**
   * Set the defaults based on the input values
   * and return a promise that will be resolved
   * once all the parts of the payload have been
   * successfully created or rejected with the error.
   * @param  {Array|Object} values to make JSONAPI compliant.
   * @param  {Waterline.Collection} collection to base payload on.
   * @return {Promise} promise.
   */
  constructor(values, collection) {
    // And a collection.
    if (typeof collection === "undefined") {
      throw new ReferenceError("Waterline_JSONAPI cannot generate without knowing what collection to use.")
    }

    // Set the defaults.
    this.values = utils.clone(values)
    this.collection = collection
    this.associations = utils.get_association_keys(collection)
    this.associated_collections = utils.get_associated_collections(collection)

    // Start the generation.
    return this.generate()
  }

  is_array() {
    if (Array.isArray(this.values) && this.values.length > 1) {
      return true
    }
    else if (Array.isArray(this.values) && this.values.length === 1) {
      this.values = this.values[0]
      return false
    }
    else {
      return false
    }
  }

  run(callback, scope) {
    // Generate the payload(s)
    if (this.is_array()) {
      return this.values.map(callback.bind(scope || this))
    }
    else {
      return callback.call(scope || this, this.values)
    }
  }

  /**
   * Fire all the generators in parallel
   * to get the job done faster.
   * @return {Promise} promise.
   */
  generate() {
    // The functions to call to create
    // the proper payload. They are run
    // in parallel
    const functions = [
      "create_data",
      "create_links",
      "create_includes",
      "create_meta",
      "create_jsonapi"
    ]

    // Create a promise and execute all the generators in parallel.
    this.promise = new Promise((resolve, reject) => {
      async.parallel(
        // Tasks.
        functions.map(func => done => this[func](done)),
        // Resolution.
        err => err ? reject(err) : resolve(this.toJSON())
      )
    })

    // And then return it for resolution.
    return this.promise
  }

  create_data(done) {
    // Set and get the data.
    this.response_data = new Data_Generator(this)

    // Tell the async job we're done.
    done()
  }

  create_links(done) {
    // Set and get the data.
    this.response_links = new Links_Generator(this)

    // Tell the async job we're done.
    done()
  }

  create_includes(done) {
    // Set and get the data.
    this.response_includes = new Includes_Generator(this)

    // Tell the async job we're done.
    done()
  }

  create_meta(done) {
    // Set and get the data.
    this.response_meta = new Meta_Generator(this)

    // Tell the async job we're done.
    done()
  }

  create_jsonapi(done) {
    // Set and get the data.
    this.response_jsonapi = new JSONAPI_Generator(this)

    // Tell the async job we're done.
    done()
  }

  toJSON() {
    const data = this.response_data
    const links = this.response_links
    const includes = this.response_includes
    const meta = this.response_meta
    const jsonapi = this.response_jsonapi

    return {
      links,
      data,
      meta,
      includes,
      jsonapi
    }
  }

  // DEPRECATED FUNCTIONS.
  // Will be removed in the next version.

  /**
   * Get a payload from an object of values.
   * @param  {Object} values_object to get payload for.
   * @param  {Waterline.Collection} collection to base this conversion on.
   * @return {Object} JSON API compliant payload with values set.
   */
  static new_from_values(values, collection) {
    // Show a deprecation notice.
    utils.deprecation_notice("new_from_values")

    // Return a new instance.
    return new Waterline_JSONAPI(values, collection)
  }

  /**
   * Generate a payload from an error object.
   * @param  {Object} values_object to get payload for.
   * @param  {Waterline.Collection} collection to base this conversion on.
   * @return {Object} JSON API compliant payload with values set.
   */
  static new_from_error(values, collection) {
    // Show a deprecation notice.
    utils.deprecation_notice("new_from_error")

    // Return a new instance.
    return new Waterline_JSONAPI(values, collection)
  }

  /**
   * Generate a payload from an object of values.
   * @param  {Object} values_object to get payload for.
   * @param  {Waterline.Collection} collection to base this conversion on.
   * @return {Object} JSON API compliant payload with values set.
   */
  static create(values, collection) {
    // Show a deprecation notice.
    utils.deprecation_notice("create")

    // Return a new instance.
    return new Waterline_JSONAPI(values, collection)
  }
}

// Export our tools.
module.exports = Waterline_JSONAPI
