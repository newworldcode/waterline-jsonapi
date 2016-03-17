"use strict"

// Get our tools.
const tape = require("tape")
const Waterline_JSONAPI = require("../index")
const get_ontology = require("./waterline")

// The test payload.
const payloads = require("./payloads")

get_ontology(function (ontology) {
  const keys = Object.keys(payloads)

  new Waterline_JSONAPI(payloads.multi.payload, ontology.collections.user)
    .then(generator => console.log(JSON.stringify(generator, null, 2)))
    .catch(err => console.log("err", err, err.stack))

  // Test a bunch of different payloads.
  keys.forEach(function(key) {
    tape("Test " + key + " payload", function(test) {
      test.plan(1)
      test.doesNotThrow(() => {
        new Waterline_JSONAPI(payloads[key].payload, ontology.collections[payloads[key].collection])
          .then(generator => generator.toJSON())
      }, "Does not throw when creating " + key + " payload.")
    })
  })
})
