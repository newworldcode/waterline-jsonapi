"use strict"

// Get our tools.
const tape = require("tape")
const Waterline_JSONAPI = require("../index")
const get_ontology = require("./waterline")

// The test payload.
const payloads = require("./payloads")

get_ontology(ontology => {
  const keys = Object.keys(payloads)

  const generator = new Waterline_JSONAPI(payloads.model.payload, ontology.collections.pet, { page: 10 })

  generator.api_root = "http://localhost:1811"

  generator.generate()
    .then(generator => console.log(JSON.stringify(generator, null, 2)))
    .catch(err => console.log("err", err, err.stack))

  // Test a bunch of different payloads.
  keys.forEach(key => {
    tape("Test " + key + " payload", test => {
      test.plan(1)
      test.doesNotThrow(() => {
        new Waterline_JSONAPI(payloads[key].payload, ontology.collections[payloads[key].collection])
          .generate()
          .then(generator => (generator))
      }, "Does not throw when creating " + key + " payload.")
    })
  })
})
