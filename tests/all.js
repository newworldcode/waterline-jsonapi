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
        JSONAPIModel.new_from_values(payloads[key], ontology.collections.user)
      }, "Does not throw when creating " + key + " payload.")
    })
  })
})
