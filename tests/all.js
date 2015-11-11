"use strict"

// Get our tools.
var tape = require("tape")
var JSONAPIModel = require("../index")
var get_ontology = require("./waterline")

// The test payload.
var payloads = require("./payloads")

get_ontology(function (ontology) {
  var keys = Object.keys(payloads)

  // Test a bunch of different payloads.
  keys.forEach(function(key) {
    tape("Test " + key + " payload", function(test) {
      test.plan(1)
      test.doesNotThrow(function() {
        JSONAPIModel
          .new_from_values(payloads[key].payload, ontology.collections[payloads[key].collection])
          .toJSON()
      }, "Does not throw when creating " + key + " payload.")
    })
  })

  tape("Test instance as function call", function(test) {
    test.plan(1)
    test.doesNotThrow(function() {
      JSONAPIModel.create(payloads.simple.payload, ontology.collections.user).toJSON()
    }, "Does not throw when calling as function instead of instance.")
  })
})
