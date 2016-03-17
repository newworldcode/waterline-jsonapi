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
    let meta // Any
   */

  /**
   * Set the defaults based on the input values
   * and return a promise that will be resolved
   * once all the parts of the payload have been
   * successfully created or rejected with the error.
   * @param  {Array|Object} values to make JSONAPI compliant.
   * @param  {Waterline.Collection} collection to base payload on.
   * @param  {Any} meta data, extra information passed to collection link functions. [optional]
   * @return {Promise} promise.
   */
  constructor(values, collection, meta) {
    // And a collection.
    if (typeof collection === "undefined") {
      throw new ReferenceError("Waterline_JSONAPI cannot generate without knowing what collection to use.")
    }

    // Set the defaults.
    this.values = utils.clone(values)
    this.meta = meta ? utils.clone(meta) : {}
    this.collection = collection
    this.associations = utils.get_association_keys(collection)
    this.associated_collections = utils.get_associated_collections(collection)

    // Return this instance.
    return this
  }

  /**
   * Return whether or not the values
   * passed in was an array or not.
   * Will normalise single element arrays to an object.
   * @return {Boolean} is array or not.
   */
  is_array() {
    // If it's an array and it's length
    // is more than one, return true.
    if (Array.isArray(this.values) && this.values.length > 1) {
      return true
    }
    // If it's an array and the length is 1,
    // reset to the first element and return false.
    else if (Array.isArray(this.values) && this.values.length === 1) {
      this.values = this.values[0]
      return false
    }
    // Otherwise, it's definitely not an array.
    else {
      return false
    }
  }

  /**
   * Run callback over all the values as a map
   * function and return the value.
   * @param  {Function} callback to run as map
   * @param  {Function|Object} scope to apply to the map function.
   * @return {Object|Array} Array of objects or object.
   */
  run(callback, scope) {
    // Generate the payload(s)
    if (this.is_array()) {
      return this.values.map(callback, scope)
    }
    else {
      return callback.call(scope, this.values)
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

  /**
   * Get all the data and create the
   * body of the payload to send to
   * the promise.
   *
   * @return {Object} JSONAPI compliant payload.
   */
  toJSON() {
    const data = this.response_data
    const links = this.response_links
    const included = this.response_includes
    const meta = this.response_meta
    const jsonapi = this.response_jsonapi

    return this.optimise({
      links,
      data,
      meta,
      included,
      jsonapi
    })
  }

  /**
   * Remove bad keys from an object, these
   * could be empty arrays or empty objects.
   * @param  {[type]} values [description]
   * @return {[type]}        [description]
   */
  optimise(values) {
    Object.keys(values)
      .forEach(key => {
        if (
          // If the value is falsey, remove it.
          !values[key] ||
          // If it's an empty array and it's not the "data" key, remove it.
          (Array.isArray(values[key]) && values[key].length === 0 && key !== "data") ||
          // Otherwise, if it's an empty object. Remove it.
          Object.keys(values[key]).length === 0
        ) {
          delete values[key]
        }
      })

    // Return the updated values.
    return values
  }

  // DEPRECATED FUNCTIONS.
  // Will be removed in the next version.

  /**
   * Get a payload from an object of values.
   * @param  {Object} values_object to get payload for.
   * @param  {Waterline.Collection} collection to base this conversion on.
   * @param  {Any} meta data, extra information passed to collection link functions. [optional]
   * @return {Object} JSON API compliant payload with values set.
   */
  static new_from_values(values, collection, meta) {
    // Show a deprecation notice.
    utils.deprecation_notice("new_from_values")

    // Return a new instance.
    return new Waterline_JSONAPI(values, collection, meta).generate()
  }

  /**
   * Generate a payload from an error object.
   * @param  {Object} values_object to get payload for.
   * @param  {Waterline.Collection} collection to base this conversion on.
   * @param  {Any} meta data, extra information passed to collection link functions. [optional]
   * @return {Object} JSON API compliant payload with values set.
   */
  static new_from_error(values, collection, meta) {
    // Show a deprecation notice.
    utils.deprecation_notice("new_from_error")

    // Return a new instance.
    return new Waterline_JSONAPI(values, collection, meta).generate()
  }

  /**
   * Generate a payload from an object of values.
   * @param  {Object} values_object to get payload for.
   * @param  {Waterline.Collection} collection to base this conversion on.
   * @param  {Any} meta data, extra information passed to collection link functions. [optional]
   * @return {Object} JSON API compliant payload with values set.
   */
  static create(values, collection, meta) {
    // Show a deprecation notice.
    utils.deprecation_notice("create")

    // Return a new instance.
    return new Waterline_JSONAPI(values, collection, meta).generate()
  }
}

// Export our tools.
module.exports = Waterline_JSONAPI
