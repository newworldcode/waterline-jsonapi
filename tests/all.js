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
      tape(`Test "${key}" payload`, test => {
        test.plan(1)
        test.doesNotThrow(() => {
          new Waterline_JSONAPI(payloads[key].payload, ontology.collections[payloads[key].collection])
            .generate()
            .then(generator => validator.validate(generator))
            .catch(err => { throw err })
        }, `Does not throw when creating "${key}" and validating payload.`)
      })

      tape("Throws when missing collection argument", test => {
        test.throws(() => new Waterline_JSONAPI({}), "Throws when not passed a collection.")
        test.doesNotThrow(() => new Waterline_JSONAPI({}, ontology.collections.user, {}), "Does not throw when passed meta data.")
        test.end()
      })

      tape("Test deprecated functions", test => {
        test.doesNotThrow(() => Waterline_JSONAPI.new_from_values({}, ontology.collections.user, {}), "Does not throw using new_from_values")
        test.doesNotThrow(() => Waterline_JSONAPI.new_from_error({}, ontology.collections.user, {}), "Does not throw using new_from_error")
        test.doesNotThrow(() => Waterline_JSONAPI.create({}, ontology.collections.user, {}), "Does not throw using create")
        test.end()
      })
    })
})
