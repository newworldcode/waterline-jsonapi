"use strict"

// Get our tools.
const tape = require("tape")
const Waterline_JSONAPI = require("../index")
const get_ontology = require("./waterline")
const validator = new (require("jsonapi-validator").Validator)()

// The test payload.
const payloads = require("./payloads")

get_ontology(ontology => {
  // Test a bunch of different payloads.
  Object.keys(payloads)
    .forEach(key => {
      const payload = payloads[key].payload
      const collection = ontology.collections[payloads[key].collection]

      tape(`Test "${key}" payload`, test => {
        test.plan(2)

        test.doesNotThrow(() => {
          new Waterline_JSONAPI(payload, collection).generate(true)
            .then(payload => validator.validate(payload))
            .catch(err => { throw err })
        }, `Does not throw when creating "${key}" and validating payload with promise.`)

        test.doesNotThrow(() => {
          const value = new Waterline_JSONAPI(payload, collection).generate()
          
          validator.validate(value)
        }, `Does not throw when creating "${key}" and validating payload without promise.`)
      })

      tape("Throws when missing collection argument and does not throw when passed meta.", test => {
        test.throws(() => new Waterline_JSONAPI({}), "Throws when not passed a collection.")
        test.doesNotThrow(() => new Waterline_JSONAPI({}, ontology.collections.user, {
          copyright: "New World Code Ltd 2016",
          is_relationships: true
        }), "Does not throw when passed meta data.")
        test.end()
      })
    })
})
