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
    // Set the values. If it's an instance
    // of Error, don't clone as clone isn't
    // a deep clone.
    this.values = values instanceof Error ? values : utils.clone(values)

    // And a collection.
    if (!collection) {
      throw new ReferenceError("Waterline_JSONAPI cannot generate without knowing what collection to use.")
    }

    // Set the defaults.
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
    // Generate the payload(s).
    if (this.is_array()) {
      return this.values.slice().map(callback, scope)
    }
    else {
      return [callback.call(scope, this.values)]
    }
  }

  /**
   * Fire all the generators in parallel
   * to get the job done faster.
   * @return {Promise} promise.
   */
  generate(promise) {
    // Check we have a collection first.
    if (!this.collection) {
      throw new ReferenceError("No collection to generate on.")
    }

    // Errors require less processing, check that first.
    // If it's a 404 error, ignore this as that's not a
    // real error in the world of JSONAPI.
    if ((this.values instanceof Error || this.values.is_error) && this.values.code !== 404) {
      return this.payload_from_error(this.values)
    }

    // Just getting relationships is also less processing.
    if (this.meta && this.meta.is_relationships) {
      return this.get_relationships_payload(this.meta.relationships_type_filter)
    }

    // The functions to call to create
    // the proper payload.
    const functions = [
      "create_data",
      "create_links",
      "create_includes",
      "create_meta",
      "create_jsonapi"
    ]

    // Create a promise and execute all the generators.
    if (promise) {
      this.promise = new Promise((resolve, reject) => {
        async.parallel(
          // Tasks.
          functions.map(func => done => this[func](done)),
          // Resolution.
          err => err ? reject(err) : resolve(this.toJSON())
        )
      })
    }
    else {
      functions.map(func => this[func]())
      return this.toJSON()
    }

    // And then return it for resolution.
    return this.promise
  }

  /**
   * Return a simple array of the relationships.
   * @return {Promise} promise for resolution.
   */
  get_relationships_payload(type) {
    return new Promise(resolve => {
      // Build all the relationships.
      const data = []

      // Loop over each value.
      this.run(value => {
        // And each association.
        data.push({
          id: value.id,
          type
        })
      })

      if (type) {
        resolve({
          data: data.filter(relationship => relationship.type === type)
        })
      }
      else {
        resolve({ data })
      }
    })
  }

  /**
   * Create a JSONAPI compliant error object.
   * @param  {Object} values to get error details from.
   * @return {Object} JSONAPI compliant error object.
   */
  payload_from_error(values) {
    return new Promise(resolve => {
      // Add all valid keys from the values object.
      const object = {
        id: values.id || require("uuid").v4(),
        detail: values.message,
        source: values.source,
        code: values.code,
        status: values.status,
        meta: values.meta,
        title: values.title,
        links: values.links
      }

      // Remove anything useless.
      Object.keys(object)
        .forEach(key => {
          if (!object[key]) {
            delete object[key]
          }
        })

      // Resolve the promise.
      return resolve({
        errors: object
      })
    })
  }

  create_data(done) {
    // Set and get the data.
    this.response_data = new Data_Generator(this)

    // Tell the async job we're done.
    done && done()
  }

  create_links(done) {
    // Set and get the data.
    this.response_links = new Links_Generator(this)

    // Tell the async job we're done.
    done && done()
  }

  create_includes(done) {
    // Set and get the data.
    this.response_includes = new Includes_Generator(this)

    // Tell the async job we're done.
    done && done()
  }

  create_meta(done) {
    // Set and get the data.
    this.response_meta = new Meta_Generator(this)

    // Tell the async job we're done.
    done && done()
  }

  create_jsonapi(done) {
    // Set and get the data.
    this.response_jsonapi = new JSONAPI_Generator(this)

    // Tell the async job we're done.
    done && done()
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
   * @param  {Object} values to optimise.
   * @return {Object} Object of values without falsey/empty values.
   */
  optimise(values) {
    Object.keys(values)
      .forEach(key => {
        if (
          key !== "data" &&
          (
            // If the value is falsey, remove it.
            !values[key] ||
            // If it's an empty array and it's not the "data" key, remove it.
            (Array.isArray(values[key]) && values[key].length === 0 && key !== "data") ||
            // Otherwise, if it's an empty object. Remove it.
            Object.keys(values[key]).length === 0
          )
        ) {
          delete values[key]
        }
      })

    // Check the length of the data attribute.
    if (Array.isArray(values.data)) {
      if (values.data.length === 1) {
        values.data = values.data[0]
      }
    }

    // Return the updated values.
    return values
  }
}

// Export our tools.
module.exports = Waterline_JSONAPI
